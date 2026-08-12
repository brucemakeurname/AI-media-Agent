---
name: tea-ugc-ai-realism
description: >
  Turn any TikTok/UGC script, video idea, storyboard, or AI video prompt into a realistic UGC-style AI video direction. Make sure to use this skill whenever Tea asks to create AI UGC video prompts, make a video look real/natural, convert a script into scene prompts, improve AI video realism, fix fake-looking AI video, add human movement/body language/camera direction, or mentions "UGC như thật", "AI video như người thật", "prompt Veo", "prompt Flow", "Higgsfield", "Seedance", "tạo video AI", "làm vid AI", "chuyển script thành prompt video", or similar. This skill focuses on realism rules: real person + real action + hands touching objects + micro facial expressions + breathable voice + lived-in background + phone camera + negative prompt.
---

# Tea UGC AI Realism Rule

Use this when the user needs **AI-generated UGC that feels like a real TikTok clip**, not a polished ad.

Core rule:

> Do not prompt “a person talking to camera.” Prompt **a real person doing a real thing, in a real place, while talking naturally**.

---

## The 7T Realism Framework

Every scene should satisfy as many of these as possible:

1. **Thật người** — character has human imperfection: skin texture, small asymmetry, natural posture.
2. **Thật việc** — character is doing one concrete everyday action while speaking.
3. **Thật tay** — hands touch/carry/open/point/rest on a real object.
4. **Thật mặt** — facial emotion is described through eyebrows, eyes, mouth, jaw, breath.
5. **Thật giọng** — voice has pauses, emphasis, breath, and imperfect conversational rhythm.
6. **Thật cảnh** — lived-in background, not studio-perfect.
7. **Thật máy** — phone-camera behavior: handheld, selfie, static phone, or one simple movement.

If a scene has fewer than 5/7, improve it before output.

---

## Scene Build Order

For each scene, fill these in before writing the final prompt:

1. **Message** — what this scene says.
2. **Emotion** — what the viewer should feel.
3. **Location** — realistic everyday place.
4. **Action** — one concrete action the character performs while talking.
5. **Hands** — what the hands touch or hold.
6. **Face** — micro-expression using face-muscle language.
7. **Voice** — pacing, pauses, breath, emphasis.
8. **Camera** — one phone-camera setup/movement.
9. **Negative prompt** — AI artifacts and over-produced look to avoid.

Keep each scene simple. AI video breaks when one clip asks for too many actions, camera moves, or emotional shifts.

---

## Action Rules

### Good UGC actions

Use actions that make the character look like they were already living their day:

- opening a supplement tub
- scooping powder into a shaker
- shaking a bottle
- sipping and reacting
- packing a gym bag
- sitting at a kitchen counter
- checking phone after workout
- leaning on a counter
- placing product beside a meal
- pointing to label or nutrition facts
- moving a snack wrapper away

### Avoid

- standing still and reading
- floating hands with no object
- fake presenter gestures
- perfect product hero pose
- too many actions in one clip

---

## Hands Rule

Hands are the fastest realism signal, but also the easiest AI failure point.

For every important claim, assign one hand action:

| Claim type | Hand action |
|---|---|
| Problem / pain | touch affected area, hold phone, glance at wrapper/object |
| Product intro | pick up product, rotate tub, open lid |
| Proof / number | point to label, count on fingers, tap screen/label |
| Demo | scoop, pour, shake, place down |
| Result | relax grip, put snack aside, zip gym bag |

If hands are likely to fail, simplify: use medium shot, hands resting on object, or static product on table.

---

## Face Rule

Do not write generic emotions only. Translate emotion into small physical cues.

| Emotion | Use this language |
|---|---|
| Pain / discomfort | slight frown, jaw gently tightened, eyes narrow a little |
| Embarrassed honesty | small awkward smile, eyes glance down, soft exhale |
| Relief | forehead relaxes, eyes soften, slow breath out |
| Realization | brief pause, eyes widen slightly, lips part a little |
| Genuine enjoyment | cheeks lift slightly, tiny wrinkles near eyes |
| Skeptical → impressed | brow raised at first, then small surprised smile |

One clip = one main emotion or one small emotional transition.

---

## Voice Rule

Voice direction matters even when the visual prompt is the main output.

Include:

- hook starts immediately from frame 1
- casual conversational tone
- one or two emphasized words
- short pause before the key claim
- small breath, soft laugh, or exhale when natural
- short lines; avoid long corporate sentences

Example:

> Natural conversational voice, slight pause before “after every workout,” soft embarrassed laugh, emphasis on “starving.”

---

## Background Rule

UGC should feel lived-in, not polished.

Prefer:

- kitchen counter with a used cup or shaker
- desk with everyday clutter
- bedroom mirror / bathroom shelf
- gym bag on the floor
- sofa / car / locker area
- natural window light, slightly imperfect
- real skin texture, no beauty-filter perfection

Avoid wording that pushes the model toward ads:

- cinematic
- masterpiece
- studio lighting
- perfect skin
- glossy commercial
- luxury commercial set

---

## Camera Rule

One scene should use **one camera behavior only**.

| Scene need | Camera |
|---|---|
| Talking naturally | handheld iPhone selfie, subtle natural movement |
| Emotional confession | slow subtle push-in |
| Product/taste/demo | static phone camera or top-down phone shot |
| Routine | handheld follow, mild natural shake |

Avoid stacking zoom + pan + rotation + dolly in one clip.

---

## Output Format

When the user asks for a prompt or scene-by-scene direction, output this:

```markdown
# UGC AI Realism Brief

## Realism Diagnosis
- Current risk: [why it may look fake]
- Fix: [one-line fix]

## Scene Prompts
| Scene | Message | Real Action | Hands/Object | Face | Voice | Camera | Prompt |
|---|---|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... | ... | ... |

## Negative Prompt
Avoid distorted hands, extra fingers, warped product label, stiff body, frozen face, unnatural eye contact, sliding feet, overacting, perfect studio lighting, cinematic commercial look, glossy ad style.

## 7T Check
- Thật người: ✅/⚠️
- Thật việc: ✅/⚠️
- Thật tay: ✅/⚠️
- Thật mặt: ✅/⚠️
- Thật giọng: ✅/⚠️
- Thật cảnh: ✅/⚠️
- Thật máy: ✅/⚠️
```

If the user only wants a quick fix, return only:

1. **What looks fake**
2. **Better prompt**
3. **Negative prompt**
4. **7T score**

---

## Prompt Template

```text
Create a realistic UGC-style iPhone video.

A real everyday [person/avatar] is in [lived-in location].
They are [one specific action] while talking naturally to the phone camera.
Their hands are [holding/touching/opening/pointing/resting on specific object].
Facial expression: [eyebrows/eyes/mouth/jaw/breath micro-expression].
Voice delivery: [casual tone, pause, breath, emphasis, rhythm].
Camera: [handheld selfie/static phone/top-down/slow push-in], subtle natural movement only.
Lighting: natural available light, slightly imperfect, lived-in background.
Make it feel like a real TikTok UGC clip, not a commercial.
Avoid distorted hands, extra fingers, stiff face, frozen eyes, sliding feet, warped product label, perfect studio lighting, cinematic look, glossy ad style.
```

---

## Example

Bad:

```text
A woman talks to camera about whey protein in a beautiful kitchen, cinematic lighting.
```

Better:

```text
Create a realistic UGC-style iPhone selfie video. A woman in her late 20s stands at a slightly messy kitchen counter after a workout, opening a whey protein tub while talking casually to the phone camera. Her left hand holds the tub steady and her right hand twists the lid open, then rests on the shaker bottle. She gives a small embarrassed smile, glances at a snack wrapper on the counter, and exhales softly before saying the hook. Natural conversational voice, slight pause before “after every workout,” emphasis on “starving.” Handheld iPhone camera with subtle natural movement, warm window light, lived-in background. Avoid distorted hands, extra fingers, stiff face, frozen eyes, sliding feet, warped label, studio lighting, cinematic commercial look.
```
