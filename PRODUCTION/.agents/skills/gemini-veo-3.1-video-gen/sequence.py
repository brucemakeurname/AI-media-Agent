"""SequencePlanner — orchestrate multi-clip Veo3 generation + ffmpeg stitching.

Usage:
    from sequence import SequencePlanner, Scene, Transition
    from client import VeoVertexClient

    async def main():
        scenes = [
            Scene(prompt="Aerial shot of Saigon river at golden hour", duration_seconds=8),
            Scene(prompt="Camera descends into busy street market", duration_seconds=8,
                  transition=Transition.CROSSFADE, transition_ms=600),
        ]
        async with VeoVertexClient() as client:
            planner = SequencePlanner(client, output_dir="output/seq_001")
            result = await planner.plan_and_render(scenes)
            print(f"Final: {result.final_path}")

    asyncio.run(main())
"""

from __future__ import annotations

import asyncio
import json
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any

from client import VeoVertexClient, VeoVertexError
from stitcher import Stitcher, StitchError, Transition, StitchOptions

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------


class Transition(Enum):
    """Stitch transition between clips."""

    HARD_CUT = "hard_cut"
    CROSSFADE = "crossfade"
    KEN_BURNS = "ken_burns"


# ---------------------------------------------------------------------------
# Scene
# ---------------------------------------------------------------------------


@dataclass
class Scene:
    """A single scene in a video sequence."""

    prompt: str
    duration_seconds: int = 8  # Veo supports 4 / 6 / 8
    aspect_ratio: str = "9:16"
    resolution: str = "720p"
    model: str = "3.0"
    first_frame: str | Path | None = None
    last_frame: str | Path | None = None
    negative_prompt: str | None = None
    seed: int | None = None
    transition: Transition = Transition.HARD_CUT
    transition_ms: int = 500
    generate_audio: bool = True
    person_generation: str = "allow_adult"


# ---------------------------------------------------------------------------
# SequenceResult
# ---------------------------------------------------------------------------


@dataclass
class SequenceResult:
    """Return value from SequencePlanner.plan_and_render()."""

    sequence_id: str
    manifest_path: Path
    clip_paths: list[Path]
    final_path: Path
    total_duration_s: float
    total_generation_time_s: float
    failed_clips: list[int]  # empty = all OK


# ---------------------------------------------------------------------------
# SequenceError
# ---------------------------------------------------------------------------


class SequenceError(Exception):
    """Unrecoverable error in the sequence pipeline."""

    pass


# ---------------------------------------------------------------------------
# SequencePlanner
# ---------------------------------------------------------------------------


class SequencePlanner:
    """Orchestrates multi-clip Veo3 generation + ffmpeg stitching.

    Workflow:
        1. plan_and_render()  — generate all clips + stitch to final.mp4
        2. render_clips_only() — generate clips without stitching (preview / partial workflow)
        3. stitch_clips()      — stitch pre-rendered clips into final.mp4
        4. replace_and_stitch() — replace a failed clip and re-stitch

    Idempotency: if final.mp4 exists and all clips are complete, skip stitch step.
    """

    def __init__(
        self,
        client: VeoVertexClient,
        output_dir: Path | str,
        sequence_id: str | None = None,
        max_concurrent: int = 1,
        retry_attempts: int = 2,
        stitch_options: StitchOptions | None = None,
    ) -> None:
        self.client = client
        self.output_dir = Path(output_dir)
        self.sequence_id = sequence_id or f"seq_{uuid.uuid4().hex[:8]}"
        self.max_concurrent = max_concurrent
        self.retry_attempts = retry_attempts
        self.stitcher = Stitcher(stitch_options)

        # Ensure output dir exists
        self.output_dir.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # Public: generate + stitch in one call
    # ------------------------------------------------------------------

    async def plan_and_render(self, scenes: list[Scene]) -> SequenceResult:
        """Generate all clips and stitch into final video.

        Args:
            scenes: ordered list of Scene objects.

        Returns:
            SequenceResult with paths and timing info.

        Raises:
            SequenceError: unrecoverable failure after all retries.
        """
        manifest = self._init_manifest(scenes)
        manifest_path = self.output_dir / "manifest.json"
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))

        # Phase 1: render clips
        clip_paths = await self._render_clips(scenes, manifest, manifest_path)

        # Check for failures
        failed = [i for i, p in enumerate(clip_paths) if p is None]
        if failed:
            print(f"[SequencePlanner] Failed clips: {failed}")
            # Don't abort — allow partial result so caller can inspect

        # Phase 2: stitch
        final_path = self.output_dir / "final.mp4"
        total_gen_time = sum(
            manifest["scenes"][i].get("render_time_ms", 0) for i in range(len(scenes))
        ) / 1000.0

        if all(p is not None for p in clip_paths) and not final_path.exists():
            valid_clips = [p for p in clip_paths if p is not None]
            transitions = [s.transition for s in scenes]
            try:
                self.stitcher.stitch(valid_clips, transitions, final_path)
                manifest["stitch"] = {
                    "status": "complete",
                    "output_path": "final.mp4",
                }
            except StitchError as e:
                manifest["stitch"] = {"status": "failed", "error": str(e)}
                manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
                raise SequenceError(f"Stitch failed: {e}") from e
        elif final_path.exists():
            print("[SequencePlanner] final.mp4 already exists — skipping stitch (idempotent)")
            manifest["stitch"] = {"status": "skipped_already_exists", "output_path": "final.mp4"}
        else:
            manifest["stitch"] = {"status": "skipped_due_to_failures"}

        manifest["failed_clips"] = failed
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))

        total_duration = sum(s.duration_seconds for s in scenes) - (
            sum(s.transition_ms for s in scenes) / 1000.0 if scenes else 0
        )

        return SequenceResult(
            sequence_id=self.sequence_id,
            manifest_path=manifest_path,
            clip_paths=[p for p in clip_paths if p is not None],
            final_path=final_path,
            total_duration_s=total_duration,
            total_generation_time_s=total_gen_time,
            failed_clips=failed,
        )

    # ------------------------------------------------------------------
    # Public: generate clips only (no stitch)
    # ------------------------------------------------------------------

    async def render_clips_only(self, scenes: list[Scene]) -> list[Path | None]:
        """Generate all clips without stitching.

        Returns:
            List of clip paths (None = failed clip at that index).
        """
        manifest = self._init_manifest(scenes)
        manifest_path = self.output_dir / "manifest.json"
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
        paths = await self._render_clips(scenes, manifest, manifest_path)
        return paths

    # ------------------------------------------------------------------
    # Public: stitch pre-rendered clips
    # ------------------------------------------------------------------

    def stitch_clips(
        self,
        clip_paths: list[Path],
        transitions: list[Transition],
        output_path: Path | None = None,
    ) -> Path:
        """Stitch pre-rendered clips into final video.

        Args:
            clip_paths: ordered list of clip file paths.
            transitions: transition for each clip boundary.
            output_path: output file path (default: output_dir/final.mp4).

        Returns:
            Path to the stitched output file.
        """
        out = output_path or (self.output_dir / "final.mp4")
        return self.stitcher.stitch(clip_paths, transitions, out)

    # ------------------------------------------------------------------
    # Public: replace failed clip + re-stitch
    # ------------------------------------------------------------------

    async def replace_and_stitch(
        self,
        clip_index: int,
        new_scene: Scene,
    ) -> SequenceResult:
        """Replace a failed clip at clip_index and re-stitch.

        Reads existing manifest, re-renders only the specified clip,
        updates manifest, then re-stitches.

        Args:
            clip_index: which clip to replace (0-based).
            new_scene: new Scene for the replacement clip.

        Returns:
            Updated SequenceResult.

        Raises:
            SequenceError: if manifest is missing or clip_index out of range.
        """
        manifest_path = self.output_dir / "manifest.json"
        if not manifest_path.exists():
            raise SequenceError(f"No manifest found at {manifest_path}")

        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        scenes = self._manifest_to_scenes(manifest)

        if clip_index < 0 or clip_index >= len(scenes):
            raise SequenceError(
                f"clip_index {clip_index} out of range (0-{len(scenes) - 1})"
            )

        # Replace scene
        scenes[clip_index] = new_scene

        # Re-render just this clip
        clip_path = await self._render_single(clip_index, new_scene, manifest, manifest_path)
        if clip_path is None:
            raise SequenceError(f"Replacement clip {clip_index} failed after {self.retry_attempts} retries")

        # Re-stitch
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["scenes"][clip_index]["render_status"] = "complete"
        manifest["failed_clips"] = [i for i in manifest.get("failed_clips", []) if i != clip_index]

        clip_paths = [
            (self.output_dir / manifest["scenes"][i]["clip_path"])
            if manifest["scenes"][i].get("render_status") == "complete"
            else None
            for i in range(len(manifest["scenes"]))
        ]

        final_path = self.output_dir / "final.mp4"
        transitions = [Transition(s.transition) if isinstance(s.transition, str) else s.transition
                        for s in scenes]

        if all(p is not None for p in clip_paths):
            self.stitcher.stitch(clip_paths, transitions, final_path)
            manifest["stitch"] = {"status": "complete", "output_path": "final.mp4"}
        else:
            manifest["stitch"] = {"status": "skipped_due_to_failures"}

        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))

        return SequenceResult(
            sequence_id=self.sequence_id,
            manifest_path=manifest_path,
            clip_paths=[p for p in clip_paths if p is not None],
            final_path=final_path,
            total_duration_s=sum(s.duration_seconds for s in scenes),
            total_generation_time_s=sum(
                manifest["scenes"][i].get("render_time_ms", 0) for i in range(len(scenes))
            ) / 1000.0,
            failed_clips=manifest.get("failed_clips", []),
        )

    # ------------------------------------------------------------------
    # Internal: manifest helpers
    # ------------------------------------------------------------------

    def _init_manifest(self, scenes: list[Scene]) -> dict[str, Any]:
        return {
            "version": "1.0",
            "sequence_id": self.sequence_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "model": scenes[0].model if scenes else "3.0",
            "aspect_ratio": scenes[0].aspect_ratio if scenes else "9:16",
            "resolution": scenes[0].resolution if scenes else "720p",
            "scenes": [
                {
                    "index": i,
                    "prompt": s.prompt,
                    "duration_seconds": s.duration_seconds,
                    "aspect_ratio": s.aspect_ratio,
                    "resolution": s.resolution,
                    "first_frame": str(s.first_frame) if s.first_frame else None,
                    "last_frame": str(s.last_frame) if s.last_frame else None,
                    "negative_prompt": s.negative_prompt,
                    "transition": s.transition.value,
                    "transition_ms": s.transition_ms,
                    "model": s.model,
                    "clip_path": f"clip_{i:03d}.mp4",
                    "render_status": "pending",
                    "render_time_ms": 0,
                }
                for i, s in enumerate(scenes)
            ],
            "stitch": {"status": "pending"},
            "failed_clips": [],
        }

    def _manifest_to_scenes(self, manifest: dict[str, Any]) -> list[Scene]:
        return [
            Scene(
                prompt=sc["prompt"],
                duration_seconds=sc.get("duration_seconds", 8),
                aspect_ratio=sc.get("aspect_ratio", "9:16"),
                resolution=sc.get("resolution", "720p"),
                model=sc.get("model", "3.0"),
                first_frame=sc.get("first_frame"),
                last_frame=sc.get("last_frame"),
                negative_prompt=sc.get("negative_prompt"),
                seed=sc.get("seed"),
                transition=Transition(sc["transition"]) if isinstance(sc.get("transition"), str) else sc.get("transition", Transition.HARD_CUT),
                transition_ms=sc.get("transition_ms", 500),
                generate_audio=True,
                person_generation=sc.get("person_generation", "allow_adult"),
            )
            for sc in manifest["scenes"]
        ]

    def _update_manifest_clip(
        self,
        manifest: dict[str, Any],
        manifest_path: Path,
        index: int,
        status: str,
        clip_path: Path | None = None,
        render_time_ms: int = 0,
        error: str | None = None,
    ) -> None:
        manifest["scenes"][index]["render_status"] = status
        if clip_path:
            manifest["scenes"][index]["clip_path"] = clip_path.name
        if render_time_ms:
            manifest["scenes"][index]["render_time_ms"] = render_time_ms
        if error:
            manifest["scenes"][index]["render_error"] = error
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))

    # ------------------------------------------------------------------
    # Internal: render logic
    # ------------------------------------------------------------------

    async def _render_clips(
        self,
        scenes: list[Scene],
        manifest: dict[str, Any],
        manifest_path: Path,
    ) -> list[Path | None]:
        """Render all clips sequentially or in limited concurrency."""

        if self.max_concurrent == 1:
            # Sequential
            paths: list[Path | None] = []
            for i, scene in enumerate(scenes):
                path = await self._render_single(i, scene, manifest, manifest_path)
                paths.append(path)
            return paths
        else:
            # Limited concurrency via semaphore
            semaphore = asyncio.Semaphore(self.max_concurrent)

            async def render_one(i: int, scene: Scene) -> tuple[int, Path | None]:
                async with semaphore:
                    p = await self._render_single(i, scene, manifest, manifest_path)
                    return (i, p)

            tasks = [render_one(i, s) for i, s in enumerate(scenes)]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Collect in order
            ordered: list[Path | None] = [None] * len(scenes)
            for result in results:
                if isinstance(result, Exception):
                    continue
                i, p = result
                ordered[i] = p
            return ordered

    async def _render_single(
        self,
        index: int,
        scene: Scene,
        manifest: dict[str, Any],
        manifest_path: Path,
    ) -> Path | None:
        """Render one clip with retry."""

        clip_path = self.output_dir / f"clip_{index:03d}.mp4"

        # Idempotency: if clip already exists and is valid, skip
        if clip_path.exists() and clip_path.stat().st_size > 0:
            print(f"[SequencePlanner] clip_{index:03d}.mp4 already exists — skipping render (idempotent)")
            self._update_manifest_clip(manifest, manifest_path, index, "complete", clip_path)
            return clip_path

        for attempt in range(self.retry_attempts + 1):
            try:
                print(f"[SequencePlanner] Rendering clip {index:03d} (attempt {attempt + 1})...")
                t0 = asyncio.get_event_loop().time()

                result = await self.client.generate_video(
                    prompt=scene.prompt,
                    model=scene.model,
                    duration_seconds=scene.duration_seconds,
                    aspect_ratio=scene.aspect_ratio,
                    resolution=scene.resolution,
                    generate_audio=scene.generate_audio,
                    person_generation=scene.person_generation,
                    first_frame=scene.first_frame,
                    last_frame=scene.last_frame,
                    negative_prompt=scene.negative_prompt,
                    seed=scene.seed,
                )

                elapsed_ms = int((asyncio.get_event_loop().time() - t0) * 1000)
                await self.client.save_video(result, clip_path)

                self._update_manifest_clip(
                    manifest, manifest_path, index, "complete", clip_path, elapsed_ms
                )
                print(f"[SequencePlanner] clip_{index:03d}.mp4 saved ({clip_path.stat().st_size / 1024:.0f} KB)")
                return clip_path

            except VeoVertexError as e:
                print(f"[SequencePlanner] clip_{index:03d} attempt {attempt + 1} failed: {e}")
                self._update_manifest_clip(
                    manifest, manifest_path, index, "failed", error=str(e)
                )
                if attempt == self.retry_attempts:
                    return None

        return None
