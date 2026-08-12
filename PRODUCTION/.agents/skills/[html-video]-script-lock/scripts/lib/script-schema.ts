import { z } from "zod";

// ── industry-news script.json contract ──────────────────────────────────────
// v2 (2026-08-08, docs/superpowers/specs/2026-08-08-industry-news-script-pipeline-redesign-design.md).
// Replaces the fixed 5-8 scene / single-voiceText-per-scene v1 contract with a variable-length,
// beat-based one: each scene carries 1-2 `beats` (2 only for the hook scene's hook+pullUp pair, or
// the end scene's verdict+loopBack pair — never for a body scene). Scene count is planning-driven
// (`metadata.targetDurationSec`), not a fixed catalog. `blueprintId` is required per beat because,
// by the time this schema validates a script.json (01-init.ts, run only after the video-editor role
// locks the script), the video-editor has already picked every beat's blueprint — see SKILL.md's
// updated Step 0-1.

const BrandSpec = z.object({
  displayName: z.string().min(1),
  handle: z.string().min(1),
  followers: z.string().min(1),
  avatarUrl: z.string().optional(),
  /** ≤3 chars, TikTok-card brand-shell glyph */
  initials: z.string().min(1).max(3),
  /** Absolute path to the VoxCPM reference .wav for this brand/ticket's voice */
  voiceReferenceAudio: z.string().min(1),
});
export type BrandSpecType = z.infer<typeof BrandSpec>;

const SfxSpec = z.object({
  name: z.string().min(1),
  volume: z.number().min(0).max(1).default(0.4),
  startOffsetSec: z.number().default(0),
});
export type SfxSpecType = z.infer<typeof SfxSpec>;

const Beat = z.object({
  voiceText: z.string().min(1),
  /**
   * What this beat should show — the real fact/stat/image subject the visual is built around.
   * The video-editor role reads this (plus the parent scene's `type`) to pick a blueprint by tag
   * from blueprints-index.md; it is NOT a template name.
   */
  visualBrief: z.string().min(1).max(200),
  /** Required — the video-editor role's blueprint choice for this beat, locked before Build runs. */
  blueprintId: z.string().min(1),
  /** Optional image search/generation intent for media-use resolve; omit for text/data-only beats. */
  imageIntent: z.string().max(120).optional(),
  /** Planning-stage estimate (word-count/speech-rate heuristic) — superseded by real voice
   *  duration once Build's voice-synthesis step runs; never used for final subtitle sync. */
  estimatedTimingSec: z.number().positive(),
});
export type BeatType = z.infer<typeof Beat>;

const Scene = z
  .object({
    id: z.string().min(1),
    type: z.enum(["hook", "body", "end"]),
    beats: z.array(Beat).min(1).max(2),
    /** Only meaningful when beats.length === 2 — the transition joining the 2 blueprints, from
     *  hyperframes-animation/transitions/TRANSITION-REGISTRY.md. */
    transitionId: z.string().optional(),
    sfx: SfxSpec.optional(),
  })
  .refine((s) => s.type !== "body" || s.beats.length === 1, {
    message: "body scene phải có đúng 1 beat",
  })
  .refine((s) => s.type !== "hook" || s.beats.length === 2, {
    message: "hook scene phải có 2 beats (hook + pullUp)",
  })
  .refine((s) => !s.transitionId || s.beats.length === 2, {
    message: "transitionId chỉ hợp lệ khi scene có 2 beats",
  });
export type SceneType = z.infer<typeof Scene>;

export const ScriptSchema = z.object({
  version: z.literal("1.0"),
  metadata: z.object({
    title: z.string().min(1),
    source: z.object({
      url: z.string(),
      domain: z.string(),
      image: z.string().url().nullable(),
    }),
    channel: z.string().min(1),
    brand: BrandSpec,
    /** Background music mood hint — pipeline prefers the brand BGM library first. BGM is mixed
     *  once across the whole voice.mp3 (see mix-audio.ts), so this stays video-wide, not per-scene. */
    mood: z.enum(["news", "uplifting", "tense", "cinematic", "corporate"]).default("news"),
    /** Drives content-executive's planning-stage scene count: ceil(targetDurationSec / 3).
     *  Floor of 45s always applies, per brief if the ticket specifies a longer target. */
    targetDurationSec: z.number().min(45),
  }),
  voice: z.object({
    provider: z.literal("voxcpm"),
    voiceId: z.string().min(1),
    speed: z.number().min(0.5).max(2.0),
  }),
  scenes: z
    .array(Scene)
    .min(3)
    .refine((s) => s[0]?.type === "hook", { message: "scenes[0] phải là type=hook" })
    .refine((s) => s[s.length - 1]?.type === "end", { message: "Scene cuối phải là type=end" }),
});

export type Script = z.infer<typeof ScriptSchema>;
