# UGC Sequence Script — Mutant Big Greens Smoothie (Banana & Chestnut)

## Production Notes
- Workflow: `ai-clone-short-video`
- Timing lock source: `node/timing/timing-lock.json` (measured dialogue: 15.42s)
- Sequence duration plan: 10s, 8s (18s total)
- Template retrieval & scoring: Grounded in `BASE/BRAND KITs/5. Video_Prompt_Template/posing/` authentic UGC lifestyle template (Score: 34/40)
- Visual style: authentic handheld UGC phone recording, raw indoor kitchen setting, natural lighting, no TVC studio polish.

## PART A — Reference Context

### REF-A · Singapore Gym Creator (character)
- Description: Athletic Singapore male in clean dark grey fitted gym top, natural hairstyle, friendly expression.

### REF-B · Mutant Big Greens Tub (product)
- Description: Mutant Big Greens tub with green label and clear brand logo.

### REF-C · Modern Kitchen Counter (environment)
- Description: Bright modern apartment kitchen counter with blender jar, banana slices, and chestnuts.

### REF-KF-candidate_01.jpg · Clone keyframe (source composition reference)
- Description: Frontal glass presentation of green smoothie.

### REF-KF-candidate_05.jpg · Clone keyframe (source composition reference)
- Description: Pouring liquid into smoothie glass.

## PART B — Sequence Prompts

### Sequence 1
```json
{
  "scene_description": "Authentic handheld UGC video of a Singapore male lifter in a modern kitchen demonstrating a Mutant Big Greens banana chestnut smoothie.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 5.74,
      "subscene_description": "Medium shot of creator holding a tall green smoothie with banana slice on the glass, taking a sip and smiling warmly.",
      "dialogue": "Believe it or not, this delicious smoothie is packed with Mutant Big Greens, banana, and chestnut.",
      "camera": "Handheld phone vertical framing, slight handheld micro-shake.",
      "action": "Creator sips green smoothie, nods approvingly, and holds glass near camera."
    },
    {
      "start_s": 5.74,
      "end_s": 10.0,
      "subscene_description": "Quick jumpcut to kitchen counter. A hand adds a green scoop of Mutant Big Greens powder into a blender jar beside fresh banana and chestnut.",
      "dialogue": "It is my go-to daily drink to support my routine and active lifestyle.",
      "camera": "Close-up angled POV shot looking down at kitchen counter.",
      "action": "Scoop dropping green powder into blender jar with sliced bananas."
    }
  ],
  "style": "UGC, handheld, smartphone video, natural ambient daylight, raw video quality",
  "camera_direction": "Natural handheld movements, organic jumpcut transition at 5.74s",
  "lighting": "Soft natural indoor window light, realistic kitchen environment",
  "voice": "Believe it or not, this delicious smoothie is packed with Mutant Big Greens, banana, and chestnut. It is my go-to daily drink to support my routine and active lifestyle.",
  "SFX": "Soft blender sound and natural kitchen atmosphere",
  "environment": "Modern clean apartment kitchen in Singapore",
  "element": "Mutant Big Greens tub, green smoothie glass, sliced banana, chestnuts",
  "motion": "Handheld camera tracking creator and ingredient prep",
  "ending": "Clean cut to glass pouring action",
  "text": "Mutant Big Greens Smoothie",
  "keyword": "UGC, handheld, selfie-style, authentic, active lifestyle, no TVC, no commercial studio lighting",
  "duration_s": 10
}
```

### Sequence 2
```json
{
  "scene_description": "UGC video showing smooth green liquid being poured into glass cup, then creator presenting Mutant Big Greens tub with shop link gesture.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 3.44,
      "subscene_description": "Close-up of smooth green liquid pouring smoothly from blender jar into transparent glass cup.",
      "dialogue": "It is light, refreshing, and tastes like a treat.",
      "camera": "Steady handheld close-up shot focused on pouring action.",
      "action": "Pouring green smoothie smoothly without clumps."
    },
    {
      "start_s": 3.44,
      "end_s": 8.0,
      "subscene_description": "Creator holds up Mutant Big Greens tub next to the glass, smiles and points down to the yellow cart icon.",
      "dialogue": "Grab yours now at Ultimate Sup Singapore!",
      "camera": "Medium shot handheld framing on creator holding tub.",
      "action": "Creator holds product tub, smiles, and points down toward CTA area."
    }
  ],
  "style": "UGC, handheld, smartphone video, bright natural kitchen backdrop, authentic lifestyle",
  "camera_direction": "Handheld close-up to medium shot transition, organic movement",
  "lighting": "Natural daylight, authentic home setting",
  "voice": "It is light, refreshing, and tastes like a treat. Grab yours now at Ultimate Sup Singapore!",
  "SFX": "Pouring liquid sound, gentle ambient room tone, cart click pop",
  "environment": "Singapore apartment kitchen, bright counter space",
  "element": "Mutant Big Greens tub, freshly poured green smoothie glass",
  "motion": "Pouring fluid motion, creator holding product tub and gesturing",
  "ending": "Final frame freeze with cart CTA focus",
  "text": "Smooth & Refreshing | Get Yours @ Ultimate Sup SG",
  "keyword": "UGC, handheld, authentic product review, raw footage, no cinematic VFX, no commercial polish",
  "duration_s": 8
}
```

## PART C — Audio
- Spoken voice: Synthesized via Applio using `voice_1_male` (`en-SG-WayneNeural` base + trained RVC model), timing locked via `node/timing/timing-lock.json`.
- Audio mixing: Voice track normalized as primary audio; soft upbeat lo-fi instrumental mixed at -18dB background level during post-production (`[html-video]-audio-mix`).

## Bảng gán REF (≤3/scene)
| Sequence | Nội dung | Ref context | Ref sản phẩm | Ref nhân vật | Ref keyframe clone |
|---|---|---|---|---|---|
| Sequence 1 | Hook & Daily routine prep | REF-C | REF-B | REF-A | REF-KF-candidate_01.jpg |
| Sequence 2 | Pouring taste proof & CTA | REF-C | REF-B | REF-A | REF-KF-candidate_05.jpg |

## Revision Log
- round 1: initial script locked by content-executive with Applio TTS timing

## Gaps Open
None

## Realism Diagnosis (7T Framework Check)
- **Texture:** Real skin pores, natural clothing fabric fold, liquid translucency of smoothie. (Pass)
- **Time:** Real-time handheld movement, 10s and 8s natural pacing. (Pass)
- **Tone:** Natural Singapore daylight, no oversaturated commercial LUTs. (Pass)
- **Tension:** Daily routine nutrition gap reframed as simple smoothie upgrade. (Pass)
- **Topology:** Domestic kitchen layout with realistic blender, glass, bananas, chestnuts. (Pass)
- **Touch:** Physical handling of glass, scoop, and tub. (Pass)
- **Tracking:** Handheld phone camera tracking with natural micro-jitter. (Pass)
- **Score:** 7/7 (Passes realism quality gate).
