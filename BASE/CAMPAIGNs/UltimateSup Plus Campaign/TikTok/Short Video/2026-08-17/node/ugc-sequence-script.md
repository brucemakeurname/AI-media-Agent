# UGC Sequence Script — PVL ISO Gold — Singapore Gym Review

## Production Notes
- Sequence prompt count: N = 6 — 1:1 discrete mapping to TTS timing lock lines
- TTS timing lock: `node/timing/timing-lock.json` (Google Gemini TTS, measured dialogue: 32.288s across 6 lines)
- Duration budget: 4s + 8s + 8s + 8s + 6s + 6s = 40s total duration.
- Aspect ratio: 9:16 vertical (1080x1920)
- Persona / Voice: `voice_1_male` — Singlish Gym Bro
- `voice` contract: exact approved dialogue only; timing and visual pacing stay in `timeline`.

## Sequence count rationale
| Sequence | Render duration | Narrative beat(s) / dialogue | Minimum-count rationale |
|---|---|---|---|
| Sequence 1 | 4s | Beat 1 (Hook: line 01) | 3.558s dialogue fits into 4s Omni block (`abra_r2v_4s`) |
| Sequence 2 | 8s | Beat 2 (Product Reveal: line 02) | 6.561s dialogue fits into 8s Omni block (`abra_r2v_8s`) |
| Sequence 3 | 8s | Beat 3 (Scoop & Mix: line 03) | 6.088s dialogue fits into 8s Omni block (`abra_r2v_8s`) |
| Sequence 4 | 8s | Beat 4 (Taste Reaction: line 04) | 6.328s dialogue fits into 8s Omni block (`abra_r2v_8s`) |
| Sequence 5 | 6s | Beat 5 (Enzymes & Digestion: line 05) | 4.216s dialogue fits into 6s Omni block (`abra_r2v_6s`) |
| Sequence 6 | 6s | Beat 6 (Shopee SG Restock & CTA: line 06) | 5.537s dialogue fits into 6s Omni block (`abra_r2v_6s`) |

---

## PART A — Reference Context

### REF-A · Creator Persona (Character / Face Reference)
- File: `node/elements/ref_a_character.png`

### REF-B · Product Packshot (PVL ISO Gold Whey Isolate)
- File: `node/elements/ref_b_product.png`

### REF-C · Location / Gym Setting Plate
- File: `node/elements/ref_c_gym_setting.png`

---

## PART B — Sequence Prompts

### Sequence 1
**Refs:** `REF-A-character` · `REF-C-gym`
```json
{
  "scene": 1,
  "duration_s": 4,
  "scene_description": "A Singaporean male fitness creator in a dark tank top stands in a modern gym locker room holding a shaker bottle, looking into the smartphone camera with an animated skeptical expression.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 3.6,
      "visual_action": "Creator looks into phone camera with a skeptical expression while holding an empty shaker bottle, talking enthusiastically.",
      "dialogue": "Bro, you still drinking those chalky protein shakes ah? Cannot make it lah!",
      "transition_after": "direct cut to product reveal"
    }
  ],
  "style": "raw handheld UGC smartphone video, authentic TikTok selfie style, natural skin texture",
  "camera_direction": "Handheld smartphone selfie POV at eye-level with subtle organic micro-shake",
  "lighting": "Warm gym ambient overhead lights with soft fill",
  "voice": "Bro, you still drinking those chalky protein shakes ah? Cannot make it lah!",
  "SFX": "Subtle gym ambient room tone",
  "environment": "Lived-in Singapore gym locker area with blurred workout equipment in the background",
  "element": [
    {
      "subject": "28-32 year old Singaporean male gym-goer in dark athletic tank top and sweatband",
      "prop": "Clear shaker bottle"
    }
  ],
  "motion": "Natural head movements, expressive facial gestures",
  "ending": "Smiles and prepares to reveal product",
  "text": "None",
  "keyword": ["UGC selfie", "Singapore gym", "protein shake", "handheld TikTok"]
}
```

### Sequence 2
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 2,
  "duration_s": 8,
  "scene_description": "Creator raises the PVL ISO Gold tub clearly into frame, tapping the front label with his index finger while nodding and explaining the clean macros.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 6.6,
      "visual_action": "Brings the PVL ISO Gold tub into frame with his other hand, tapping the front label with his index finger while nodding.",
      "dialogue": "Check out this PVL ISO Gold — 27g pure whey isolate per scoop, super clean macros.",
      "transition_after": "cut to macro mix"
    }
  ],
  "style": "raw handheld UGC smartphone video, clear product visibility",
  "camera_direction": "Handheld medium close-up POV",
  "lighting": "Warm gym ambient overhead lights",
  "voice": "Check out this PVL ISO Gold — 27g pure whey isolate per scoop, super clean macros.",
  "SFX": "Finger tap on tub label, subtle gym background",
  "environment": "Singapore gym lounge corner",
  "element": [
    {
      "subject": "Singaporean male gym creator",
      "prop": "PVL ISO Gold black and gold tub"
    }
  ],
  "motion": "Holding tub proudly, pointing to 27g protein text",
  "ending": "Holds tub steady",
  "text": "None",
  "keyword": ["PVL ISO Gold", "whey isolate", "27g protein", "clean macros"]
}
```

### Sequence 3
**Refs:** `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 3,
  "duration_s": 8,
  "scene_description": "Top-down handheld macro shot of a scoop of ultra-fine PVL ISO Gold powder being dropped into a clear shaker with cold water, followed by a rapid 5-second shake that completely dissolves the powder with zero clumps.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 6.1,
      "visual_action": "Scoop dumping fine powder into clear water, followed by rapid 5-second vigorous shake; powder dissolves completely into a smooth liquid.",
      "dialogue": "Mix with cold water, five seconds only, straightaway dissolve! Zero clumping, damn smooth.",
      "transition_after": "cut to taste test"
    }
  ],
  "style": "macro UGC smartphone close-up, sharp liquid and powder details",
  "camera_direction": "Angled downward 45-degree macro POV",
  "lighting": "Clear overhead gym prep counter light",
  "voice": "Mix with cold water, five seconds only, straightaway dissolve! Zero clumping, damn smooth.",
  "SFX": "Powder scoop whoosh, water splash, vigorous shaker rattle",
  "environment": "Clean gym smoothie counter surface with shaker bottle",
  "element": [
    {
      "subject": "Athletic hands scooping and shaking bottle",
      "prop": "Clear shaker bottle and PVL ISO Gold scoop"
    }
  ],
  "motion": "Scooping powder, shaking bottle vigorously",
  "ending": "Shows perfectly dissolved shake with zero lumps",
  "text": "None",
  "keyword": ["macro mixing", "zero clumping", "rapid dissolve", "shaker bottle"]
}
```

### Sequence 4
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 4,
  "duration_s": 8,
  "scene_description": "Creator takes a big gulp from the shaker, his eyes widen in genuine pleasant surprise, and he nods vigorously at the camera with a big smile.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 6.4,
      "visual_action": "Takes a large sip from shaker, pauses, eyes widen with delight, nods enthusiastically at the lens.",
      "dialogue": "Taste test: wah lau, confirm plus chop, tastes like legit dessert milkshake sia. No weird aftertaste!",
      "transition_after": "cut to enzyme highlights"
    }
  ],
  "style": "authentic UGC reaction, natural facial expressions",
  "camera_direction": "Medium close-up selfie POV",
  "lighting": "Warm gym interior lighting",
  "voice": "Taste test: wah lau, confirm plus chop, tastes like legit dessert milkshake sia. No weird aftertaste!",
  "SFX": "Shaker sip sound, satisfied exhale",
  "environment": "Singapore gym lounge corner",
  "element": [
    {
      "subject": "Singaporean male creator with expressive facial reaction",
      "prop": "Clear shaker bottle filled with rich protein shake"
    }
  ],
  "motion": "Sipping from shaker, quick widening of eyes, enthusiastic head nod",
  "ending": "Holds shaker with thumbs-up smile",
  "text": "None",
  "keyword": ["taste test", "milkshake taste", "Singlish reaction", "genuine surprise"]
}
```

### Sequence 5
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 5,
  "duration_s": 6,
  "scene_description": "Creator holds the PVL ISO Gold tub close to the phone camera, pointing with his index finger to the enzyme callout, then taps his stomach comfortably.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 4.3,
      "visual_action": "Points finger at digestive enzymes on the label, then pats flat stomach lightly with a relaxed, happy expression.",
      "dialogue": "Plus got added enzymes, so post-workout confirm no bloated stomach.",
      "transition_after": "cut to CTA"
    }
  ],
  "style": "raw UGC product breakdown, handheld smartphone POV",
  "camera_direction": "Medium close-up POV",
  "lighting": "Direct soft light on product tub label",
  "voice": "Plus got added enzymes, so post-workout confirm no bloated stomach.",
  "SFX": "Finger tap on tub label",
  "environment": "Lived-in gym setting",
  "element": [
    {
      "subject": "Creator gesturing clearly to product label",
      "prop": "PVL ISO Gold tub"
    }
  ],
  "motion": "Finger tapping label, light hand pat on stomach",
  "ending": "Smiles and prepares to point to CTA",
  "text": "None",
  "keyword": ["digestive enzymes", "easy digestion", "clean protein"]
}
```

### Sequence 6
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 6,
  "duration_s": 6,
  "scene_description": "Creator stands energetically holding the tub, looking straight into the lens, pointing downwards toward the TikTok yellow basket / Shopee SG icon area with a confident grin and wink.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 5.6,
      "visual_action": "Smiles energetically, speaking directly into the phone lens while pointing downwards towards the bottom-left screen area with a wink.",
      "dialogue": "Ultimate Sup Singapore just restocked on Shopee SG! Tap the yellow basket below to grab yours now ah!",
      "transition_after": "hold frame for CTA"
    }
  ],
  "style": "high-energy UGC TikTok conversion hook, friendly selfie framing",
  "camera_direction": "Handheld selfie POV",
  "lighting": "Bright gym entrance / locker lighting",
  "voice": "Ultimate Sup Singapore just restocked on Shopee SG! Tap the yellow basket below to grab yours now ah!",
  "SFX": "Subtle positive chime on downward point",
  "environment": "Gym reception / entrance area",
  "element": [
    {
      "subject": "Creator smiling with direct eye-contact",
      "prop": "PVL ISO Gold tub held proudly"
    }
  ],
  "motion": "Direct eye contact, downward finger point, friendly wink",
  "ending": "Freeze frame smiling pointing at bottom-left corner",
  "text": "None",
  "keyword": ["yellow basket CTA", "Shopee SG restock", "Ultimate Sup Singapore"]
}
```

---

## PART C — Audio / BGM Specification
- Voice tracks: `node/timing/line_01_rvc.wav` to `node/timing/line_06_rvc.wav`
- Applio RVC Brand Voice: `applio-brand-voice-v2-10m` (F0 ~130.8 Hz)
- Subtitles: Burned ASS subtitles (`SUB_Y_RATIO=0.75`) in lower safe area.
