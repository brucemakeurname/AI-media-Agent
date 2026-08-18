# UGC Sequence Script — PVL ISO Gold Post-Workout Shake Hack

## Production Notes
- **Sequence prompt count:** N = 6 — 1:1 discrete mapping to TTS timing lock lines
- **TTS timing lock:** `node/timing/timing-lock.json` (Google Gemini TTS, measured dialogue: 29.827s across 6 lines)
- **Duration budget:** 4s + 6s + 6s + 8s + 6s + 6s = 36s total duration.
- **Aspect ratio:** 9:16 vertical (1080x1920)
- **Persona / Voice:** `voice_1_male` — Singlish Gym Bro
- **`voice` contract:** exact approved dialogue only; timing and visual pacing stay in `timeline`.

## Sequence count rationale
| Sequence | Render duration | Narrative beat(s) / dialogue | Minimum-count rationale |
|---|---|---|---|
| Sequence 1 | 4s | Beat 1 (Hook: line 01) | 3.810s dialogue fits into 4s Omni block |
| Sequence 2 | 6s | Beat 2 (Setup: line 02) | 4.880s dialogue fits into 6s Omni block |
| Sequence 3 | 6s | Beat 3 (Mix Demo: line 03) | 4.783s dialogue fits into 6s Omni block |
| Sequence 4 | 8s | Beat 4 (Product Fact: line 04) | 5.970s dialogue fits into 8s Omni block |
| Sequence 5 | 6s | Beat 5 (Taste / Routine: line 05) | 5.152s dialogue fits into 6s Omni block |
| Sequence 6 | 6s | Beat 6 (CTA: line 06) | 5.233s dialogue fits into 6s Omni block |

---

## PART A — Reference Context

### REF-A · Creator Persona (Character / Face Reference)
- File: `node/elements/ref_a_character.png`
- Description: 28-32yo athletic Singaporean male gym-goer, lean muscular physique, black tank top, sweatband/towel.

### REF-B · Product Packshot (PVL ISO Gold Whey Isolate)
- File: `node/elements/ref_b_product.png`
- Description: PVL ISO Gold 6lb container, high contrast gold/black label, verified 27g protein callout.

### REF-C · Location / Gym Setting Plate
- File: `node/elements/ref_c_gym_setting.png`
- Description: Modern Singapore commercial gym interior, weight bench, racks softly visible in warm background.

---

## PART B — Sequence Prompts

### Sequence 1
**Refs:** `REF-A-character` · `REF-C-gym`
```json
{
  "scene": 1,
  "duration_s": 4,
  "scene_description": "A 28-32 year old athletic Singaporean male fitness enthusiast in a dark athletic tank top drops onto a gym bench after a set, breathing naturally, wipes brow with gym towel and speaks directly into his handheld phone camera with a casual, relatable smile.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 3.8,
      "visual_action": "Creator drops onto gym bench, wipes forehead with gym towel, and looks into camera while delivering the opening hook.",
      "dialogue": "Post-workout already tiring — why make your shake another workout?",
      "transition_after": "direct cut to bench setup"
    }
  ],
  "style": "raw handheld UGC smartphone video, authentic TikTok selfie style, natural skin texture, post-workout sweat sheen",
  "camera_direction": "Handheld smartphone selfie POV at eye-level with subtle organic micro-shake",
  "lighting": "Warm gym overhead lights with natural ambient fill",
  "voice": "Post-workout already tiring — why make your shake another workout?",
  "SFX": "Subtle gym ambient room tone, soft breathing exhale",
  "environment": "Modern Singapore fitness club with workout equipment and bench softly visible in background",
  "element": [
    {
      "subject": "28-32 year old Singaporean male gym-goer in dark athletic tank top",
      "prop": "Gym towel draped over shoulder"
    }
  ],
  "motion": "Natural post-workout breathing, relaxed head movements",
  "ending": "Smiles slightly into camera, glances towards bench table",
  "text": "None",
  "keyword": ["UGC selfie", "Singapore gym", "post-workout hook", "handheld TikTok"]
}
```

### Sequence 2
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 2,
  "duration_s": 6,
  "scene_description": "Creator places the PVL ISO Gold tub firmly on the gym bench beside a clear shaker bottle, twists the shaker open, pours water, and clearly presents the front product label to the camera.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 4.9,
      "visual_action": "Creator sets the PVL ISO Gold tub down, removes shaker lid, pours water, and points proudly at the tub label.",
      "dialogue": "I keep PVL ISO Gold simple: add water, add one serving, shake and go.",
      "transition_after": "direct cut to mixing demo"
    }
  ],
  "style": "raw handheld UGC smartphone video, authentic TikTok angle, natural indoor gym lighting",
  "camera_direction": "Medium close-up handheld angle tilted slightly down towards the gym bench",
  "lighting": "Warm gym lighting highlighting the PVL ISO Gold container and clear shaker",
  "voice": "I keep PVL ISO Gold simple: add water, add one serving, shake and go.",
  "SFX": "Solid tub tap on bench, shaker cap twist, crisp water pouring sound",
  "environment": "Gym bench area with gym bag and workout floor in background",
  "element": [
    {
      "subject": "Singaporean male creator with athletic arms and tank top",
      "prop": "PVL ISO Gold tub and clear protein shaker"
    }
  ],
  "motion": "Careful, deliberate hands setting up the protein shake routine",
  "ending": "Hands secure the shaker lid and prepare to shake",
  "text": "None",
  "keyword": ["protein setup", "PVL ISO Gold", "shaker bottle", "gym routine"]
}
```

### Sequence 3
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 3,
  "duration_s": 6,
  "scene_description": "Close-up handheld shot of the creator shaking the clear shaker vigorously for a few seconds, then holding up the perfectly smooth, lump-free whey isolate shake against gym light.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 4.8,
      "visual_action": "Creator shakes bottle with energetic rhythmic motions, stops, and holds up the clear bottle showing completely smooth mixed protein shake.",
      "dialogue": "It mixes smooth, so it fits the routine when I’m rushing from gym to the rest of the day.",
      "transition_after": "cut to product macro callout"
    }
  ],
  "style": "raw handheld UGC smartphone video, dynamic close-up texture, crisp liquid motion",
  "camera_direction": "Close-up tracking the shaker bottle with slight natural handheld movement",
  "lighting": "Clear overhead lighting catching the smooth liquid texture inside the bottle",
  "voice": "It mixes smooth, so it fits the routine when I’m rushing from gym to the rest of the day.",
  "SFX": "Rhythmic shaker ball clatter and liquid swishing sound",
  "environment": "Modern gym setting softly blurred behind shaker",
  "element": [
    {
      "subject": "Creator's muscular hands and athletic forearm",
      "prop": "Clear shaker bottle filled with freshly mixed smooth protein shake"
    }
  ],
  "motion": "Quick energetic shaking motion settling into a steady hold",
  "ending": "Holds shaker still, showing clean dissolved protein drink",
  "text": "None",
  "keyword": ["smooth mix", "no clumps", "instant dissolve", "clear shaker"]
}
```

### Sequence 4
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 4,
  "duration_s": 8,
  "scene_description": "Creator holds the PVL ISO Gold tub close to camera at chest height, pointing with his index finger directly to the 27g protein per serving and enzyme callouts on the label while explaining clearly.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 6.0,
      "visual_action": "Creator gestures with finger across the nutrition label of PVL ISO Gold, smiling confidently at camera.",
      "dialogue": "Each serving gives 27g protein from whey protein isolate, plus added enzymes.",
      "transition_after": "cut to drinking reaction"
    }
  ],
  "style": "raw handheld UGC smartphone video, authentic creator product breakdown, natural focus on packaging",
  "camera_direction": "Medium selfie POV with subtle push-in towards product callout",
  "lighting": "Even warm illumination on creator's face and product label text",
  "voice": "Each serving gives 27g protein from whey protein isolate, plus added enzymes.",
  "SFX": "Subtle plastic tap on tub label, warm gym ambience",
  "environment": "Locker room bench area with soft background depth of field",
  "element": [
    {
      "subject": "28-32 year old Singaporean male creator",
      "prop": "PVL ISO Gold whey isolate tub"
    }
  ],
  "motion": "Gesturing hand pointing to label details, expressive nodding",
  "ending": "Lowers tub slightly and picks up shaker bottle",
  "text": "None",
  "keyword": ["27g protein", "whey isolate", "digestive enzymes", "label proof"]
}
```

### Sequence 5
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 5,
  "duration_s": 6,
  "scene_description": "Creator flips open the shaker cap, takes a refreshing sip of the shake, gives an appreciative nod of genuine satisfaction, wipes mouth with towel, and slides the shaker into his gym duffel bag.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 5.2,
      "visual_action": "Takes a satisfying gulp from shaker, gives a genuine approving head nod, wipes mouth with towel, and packs up gear.",
      "dialogue": "Quick sip, pack up, done. That’s the kind of post-workout routine I can tahan.",
      "transition_after": "cut to final CTA"
    }
  ],
  "style": "raw handheld UGC smartphone video, authentic spontaneous reaction, believable gym life",
  "camera_direction": "Slightly wider medium shot following creator packing up",
  "lighting": "Locker room ambient lighting, authentic shadows",
  "voice": "Quick sip, pack up, done. That’s the kind of post-workout routine I can tahan.",
  "SFX": "Satisfied swallow sound, shaker cap snap, gym bag zipper zipping",
  "environment": "Gym bench and locker row area",
  "element": [
    {
      "subject": "Athletic Singaporean creator",
      "prop": "Shaker bottle and dark sports duffel bag"
    }
  ],
  "motion": "Drinking gesture, nodding head, zipping bag and swinging strap",
  "ending": "Looks back up at camera with an energetic smile",
  "text": "None",
  "keyword": ["taste reaction", "pack up", "gym duffel", "satisfying routine"]
}
```

### Sequence 6
**Refs:** `REF-A-character` · `REF-B-product` · `REF-C-gym`
```json
{
  "scene": 6,
  "duration_s": 6,
  "scene_description": "Creator holds the PVL ISO Gold tub in one hand, smiling warmly, and uses his other hand to point directly down toward the bottom left of the vertical screen where the Shopee SG yellow basket is located.",
  "timeline": [
    {
      "start_s": 0.0,
      "end_s": 5.2,
      "visual_action": "Creator smiles, delivers call to action, repeatedly pointing downwards towards the TikTok yellow basket area.",
      "dialogue": "Check the current PVL ISO Gold listing on Shopee SG — tap the yellow basket below ah.",
      "transition_after": "outro freeze / end of clip"
    }
  ],
  "style": "raw handheld UGC smartphone video, high energy TikTok creator CTA, clean safe-area framing",
  "camera_direction": "Medium close-up selfie POV framed slightly above bottom UI safe area",
  "lighting": "Bright, inviting gym lighting",
  "voice": "Check the current PVL ISO Gold listing on Shopee SG — tap the yellow basket below ah.",
  "SFX": "Subtle UI chime / notification pop",
  "environment": "Gym background with warm lighting and clean ambience",
  "element": [
    {
      "subject": "Energetic Singaporean male creator",
      "prop": "PVL ISO Gold tub"
    }
  ],
  "motion": "Downward pointing gesture, inviting facial expressions",
  "ending": "Friendly concluding smile and slight nod",
  "text": "None",
  "keyword": ["Shopee SG CTA", "yellow basket", "PVL ISO Gold", "TikTok UGC outro"]
}
```

---

## PART C — Audio & BGM Specification

- **Dialogue track:** Locked from `node/timing/timing-lock.json` (voice: Puck / `voice_1_male` converted).
- **Background Music:** Energetic lo-fi / phonk gym beat at -18dB relative to vocal track.
- **Mix strategy:** Ducking -3dB during active dialogue windows.

## PART D — Post-Production Handoff Plans

### B-roll Cutaway Manifest Plan (b-roll: true)
| B-roll ID | Window (start–end) | Beat / Visual Focus | Audio Remux Source | Product Ref |
|---|---|---|---|---|
| BROLL-01 | 0:00–0:04 (4s) | Post-set breath & gym ambient cooldown | `scene_1.mp4` / `line_01.wav` | None |
| BROLL-02 | 0:04–0:10 (6s) | Product setup: tub on bench, water poured | `scene_2.mp4` / `line_02.wav` | `REF-B-PVL-ISOGOLD` |
| BROLL-03 | 0:10–0:16 (6s) | Shaker swirl, smooth mixing detail | `scene_3.mp4` / `line_03.wav` | `REF-B-PVL-ISOGOLD` |
| BROLL-04 | 0:16–0:24 (8s) | Nutrition fact callout: 27g protein & enzymes | `scene_4.mp4` / `line_04.wav` | `REF-B-PVL-ISOGOLD` |
| BROLL-05 | 0:24–0:30 (6s) | Sip close-up, shaker placed down, bag pack-up | `scene_5.mp4` / `line_05.wav` | `REF-B-PVL-ISOGOLD` |
| BROLL-06 | 0:30–0:36 (6s) | Purchase cue: Shopee SG listing & CTA pointer | `scene_6.mp4` / `line_06.wav` | `REF-B-PVL-ISOGOLD` |

### HyperFrames Overlay Plan (overlay: true)
| Overlay ID | Window (start–end) | Graphic Element | Safe Zone | Copy / Data Source |
|---|---|---|---|---|
| OVERLAY-01 | 0:04–0:08 (4.0s) | PVL ISO Gold packshot slide-in ease-out | `x=0.62–0.92, y=0.30–0.60` | `BASE/BRAND KITs/UltimateSup/Product/PVL ISO GOLD.png` |
| OVERLAY-02 | 0:16–0:24 (8.0s) | 27g Protein · Whey Isolate · Added Enzymes Badge | `x=0.55–0.92, y=0.28–0.58` | `Ticket.md: Product Facts` |
| OVERLAY-03 | 0:30–0:36 (6.0s) | Shopee SG Yellow Basket Pointer & CTA Lockup | `x=0.08–0.92, y=0.58–0.70` | `Ticket.md: Shopee SG CTA` |
