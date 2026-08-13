---
name: lark-task-handoff
description: Create a complete, secure Lark task handoff package for an AI Media or project task: Architecture.md, HDSD.md, Lark-Message.md, a 9:16 workflow diagram image rendered from HTML, and final test/deliverable evidence. Use when asked to hand off, document, present, or prepare a task for supervisor acceptance in Lark/Feishu.
---

# Lark Task Handoff

Create a reviewer-ready handoff package for a task when Lark only permits **file attachments, images, video, and comments**. The package must let a reviewer understand the architecture, set up the work on another machine where applicable, inspect the workflow, and validate the final evidence.

## Rules

- Start by restating the task deliverable, reviewer, acceptance target, and known evidence.
- Read workspace `AGENTS.md` and the task's governing instruction/workflow before writing. For production workflows, read `PRODUCTION/AGENT.md`, the active goal, and the final artifact's `Ticket.md`/`manifest.json`.
- Use a dedicated task handoff directory under `DOCS/`, named with a concise hyphen-case task slug: `DOCS/<TASK-SLUG>/`.
- Never include secrets in attachments or comments: API keys, `env.local` values, tokens, cookies, SSH keys, private URLs, internal customer data, or model checkpoints. State that access must be issued separately through an approved internal channel.
- Do not claim a module, setup step, feature, or output exists unless verified locally.
- Preserve the project's storage and role rules. Do not move final delivery files merely to make a handoff package.
- If the task has no reproducible setup or no test evidence, state the limitation in the handoff instead of fabricating it.

## Required Handoff Package

Create these five deliverables unless the user explicitly requests a different set:

```text
DOCS/<TASK-SLUG>/
├── Architecture.md
├── HDSD.md
├── Lark-Message.md
└── <TASK-SLUG>-WORKFLOW-DIAGRAM.png

[existing final test / deliverable file at its canonical output location]
```

1. **`Architecture.md`** — how the system/task works and what must exist for it to run.
2. **`HDSD.md`** — setup, execution, verification, recovery, and handoff instructions.
3. **`Lark-Message.md`** — the exact paste-ready handoff comment; attach it for traceability and paste its contents into the Lark task.
4. **`<TASK-SLUG>-WORKFLOW-DIAGRAM.png`** — a readable `9:16`, `1080×1920` visual overview rendered from HTML.
5. **Final evidence** — test video, image, artifact bundle, report, or executable output from its existing canonical location.

For an architecture-only task with no final media, attach the most appropriate verifiable output instead and explain the exception in the Lark comment.

## Workflow

### 1. Inspect and Collect Facts

Collect only verified facts:

- Workspace/repository location and relevant commit/branch, if applicable.
- Governing files, task workflow/goal, roles, skills/modules, inputs, outputs, and canonical storage path.
- Local or third-party modules that are intentionally not fully tracked in the main repository; identify their source repository, required clone location, and setup document.
- Runtime prerequisites: OS constraints, Git, Node, Python, browser/extensions, ffmpeg, model/runtime requirements, service permissions.
- Access requirements: database/workspace permissions, browser profile/service entitlement, local-only credential file. Do **not** read or print secret values.
- When the task uses the UltimateSup Notion database, cite its approved entry link: [https://app.notion.com/p/Mutant-Big-Greens-Smoothy-making-with-banana-and-chestnut-3bb0831f990c80e191a8cea409ccf6aa?source=copy_link](https://app.notion.com/p/Mutant-Big-Greens-Smoothy-making-with-banana-and-chestnut-3bb0831f990c80e191a8cea409ccf6aa?source=copy_link).
- Final evidence artifact path, size/format/manifest or checksum if available.

For AI video workflows, also verify:

- Input contract: database/brief → `Ticket.md` + filled `node/GOAL.md`.
- Script contract: shooting script, timing lock, structured sequence prompt.
- Reference/thumbnail contract: approved assets, character reference when required, thumbnail at canonical root.
- Generation contract: correct model/scene duration/reference IDs, technical upscale before downstream processing where required.
- Post-production contract: voice sync, subtitles, BGM/SFX, thumbnail at frame 0 where required.
- QA contract: final file, traceability artifacts, `manifest.json`, and publication authorization.

### 2. Create `Architecture.md`

Write concise, task-specific architecture. Include:

1. **Purpose and outcome:** what the task converts into what.
2. **Component table:** layer/module, verified responsibility, input/output contract.
3. **Core execution flow:** ordered roles/modules and non-negotiable gates.
4. **Canonical storage:** exact output structure and which files belong at root versus working folder.
5. **New-machine setup:** main repo clone plus separately versioned/missing local modules with source URLs, destination paths, and setup references.
6. **Access/security:** services/permissions needed, local credential policy, and non-shareable materials.
7. **Test evidence:** exact final file location, relevant format/checksum/manifest values, and what it proves.
8. **Acceptance criteria:** minimum conditions to pass the handoff.
9. **Attachment list:** all files that should be uploaded to Lark.

Be precise about repository limits. If runtime dependencies are ignored because of binary size, local authentication, licensing, or separate Git history, explain the reason and provide the exact target directory needed on a new machine.

### 3. Create `HDSD.md`

Write an operator runbook with these sections:

1. **One-time setup:** clone main repo, clone/install separate runtime repositories, configure browser extension/service bridge, prerequisites.
2. **Access setup:** request appropriate service/database permissions; create local-only environment file without showing secrets; confirm it is ignored by Git.
3. **Input preparation:** required brief/database/ticket fields and conditions that require stopping.
4. **Execution sequence:** run roles/modules in dependency order; name inputs, outputs, and verification points.
5. **QA and delivery:** commands or checks for final file, technical properties, first-frame/thumbnail where applicable, claim/brand correctness, manifest/traceability.
6. **Common failures:** symptom, first thing to check, safe recovery action.
7. **Handoff record:** revision/commit, input reference, output folder, final file, manifest, review status/blocker.

Use commands only if they are supported by the project/runtime. Commands must use placeholders for campaign directories, page IDs, or filenames; never copy real credential values into examples.

### 4. Create the 9:16 Diagram

Create an HTML visual source in a temporary location or inside `node/`/`DOCS` only if the user asks to preserve it. Render the final attachment as:

```text
1080 × 1920 PNG (9:16)
```

The diagram must:

- Fit entirely within the 9:16 canvas; do not render an arbitrary full-page scroll capture.
- Use clear stage cards, directional arrows, module/role labels, input/output artifacts, and non-negotiable gates.
- Explain the actual governing workflow, not a generic lifecycle.
- Use readable type at 100% image scale; reduce text before reducing legibility.
- Avoid secrets and private identifiers.
- Use an existing project brand/template when available. Otherwise use a clean neutral visual system.

For a standard AI-video handoff, show:

```text
Input/database → workflow compiler/GOAL → scripting & timing → references/thumbnail
→ generator & required upscale → voice/post-production → QA/manifest/publish gate
```

Before delivery, inspect the rendered image. If it has empty excess canvas, clipped content, illegible text, or wrong aspect ratio, fix and render again.

### 5. Create `Lark-Message.md`

Create `DOCS/<TASK-SLUG>/Lark-Message.md`. It contains the paste-ready, concise comment in Vietnamese unless the task specifies another language. It must:

- Name the task and handoff status.
- List every attached file and one sentence describing what it proves.
- State how to obtain runtime access/credentials safely, without including them.
- Name the primary workflow/goal or governing file.
- Tell the reviewer the expected review action and acceptance focus.
- Mention known limitation/blocker only if present.

Use this pattern:

```text
[BÀN GIAO TASK: <TASK NAME>]

Đính kèm:
1. <Architecture.md> — <system architecture and new-machine setup scope>.
2. <HDSD.md> — <operator setup, execution, QA, recovery>.
3. <Workflow diagram PNG> — <visual execution flow based on governing workflow>.
4. <Final test/evidence> — <what was generated/verified and where traceability lives>.

Workflow authority: `<path>`.
Runtime access/credentials are issued separately through the approved internal channel and are not included in Git/Lark attachments.

Nhờ Giám sát kiểm tra: <primary acceptance criteria>. <Known blocker if any>.
```

Attach `Lark-Message.md` with the other handoff files, then paste its fenced comment content into the Lark task.

### 6. Verify Before Handoff

Run proportional checks:

```bash
# All required attachments exist and are non-empty.
test -s 'DOCS/<TASK-SLUG>/Architecture.md'
test -s 'DOCS/<TASK-SLUG>/HDSD.md'
test -s 'DOCS/<TASK-SLUG>/Lark-Message.md'
test -s 'DOCS/<TASK-SLUG>/<TASK-SLUG>-WORKFLOW-DIAGRAM.png'
test -s '<canonical-final-evidence-path>'

# Final visual is exactly 9:16 at 1080×1920.
file 'DOCS/<TASK-SLUG>/<TASK-SLUG>-WORKFLOW-DIAGRAM.png'

# Document changes have no whitespace errors.
git diff --check

# No likely secrets are present in handoff docs.
rg -n -i -e 'ntn_[a-z0-9]' -e 'sk-[a-z0-9]' -e 'api[_-]?key\s*=' \
  -e 'private key' -e 'ssh-rsa' 'DOCS/<TASK-SLUG>' && exit 1 || true
```

Also confirm the diagram visually, the documented paths exist, and any stated test metadata matches the final artifact/manifest. Do not call the handoff complete if a required attachment is missing or the diagram is not 9:16.

## Output to the User

Report:

- Absolute paths of all Lark attachments.
- The `Lark-Message.md` path and its paste-ready comment.
- What was verified and any remaining approval/blocker.
- Do not commit, push, upload to Lark, or publish unless explicitly requested.
