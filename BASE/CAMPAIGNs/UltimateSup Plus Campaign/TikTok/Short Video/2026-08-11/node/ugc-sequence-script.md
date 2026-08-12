# UGC Sequence Script — PVL ISO Gold Singlish UGC Test

## Production Notes
- Source input: locked `node/shooting-script.md`.
- Render plan: 10 Omni reference-to-video clips × `duration_s: 10` = 100s; post-production freezes Scene 10's final product hold for 1s to reach the 101s final target.
- Aspect ratio: 9:16 portrait.
- Fixed voice clause: adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy.
- Register guard: raw `UGC`, `handheld`, `selfie`, `authentic`; never TVC, commercial, cinematic, or premium.

## PART A — Reference Context

### REF-A · Singapore Gym Bro (character)
- Purpose: fixed adult Singaporean male identity, black athletic-tank outfit, natural gym UGC context across all character scenes.
- Flowkit media ID: `f4956db0-68b8-4396-8418-13a3988f690d`.
- Local file: `node/elements/singapore-gym-bro-ref.jpg`.

### REF-B · PVL ISO Gold Packshot (product)
- Purpose: approved product packaging/label reference whenever the tub or powder appears.
- Flowkit media ID: `3fddac84-df7a-4483-9d92-744de55204da`.
- Source file: `BASE/BRAND KITs/UltimateSup/Product/PVL ISO GOLD.png`.

## PART B — Scene Prompts

### Scene 1
**Ref (1):** `REF-A`
```json
{"scene":1,"duration_s":10,"scene_description":"Gym Bro records a close phone selfie in a Singapore gym locker-room zone and jokes about stomach gulu gulu after whey.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"waist-up selfie, visible phone-hand movement, small natural shake","lighting":"bright realistic gym daylight and overhead light","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. Any bro here, drink whey then stomach go gulu gulu, muscle not yet see but already chiong to toilet? Stop, and watch this video.","SFX":"light gym ambience","environment":"modern Singapore gym locker-room area","element":[{"element_name_1":"Gym Bro","prop_name_1":"phone"}],"motion":"leans toward camera and points to stomach, then directly to lens","ending":"points at viewer for hard cut","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 2
**Ref (1):** `REF-A`
```json
{"scene":2,"duration_s":10,"scene_description":"Same Gym Bro walks through gym with phone in hand and humorously scans toward a toilet sign.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"moving selfie with a quick environment pan","lighting":"realistic gym overhead lighting","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. Before, I also like you, my stomach damn sensitive one, IBS everything also have. Try ON, MyProtein, change left change right, still go gym, scan the toilet first.","SFX":"gym ambience, subtle comic reaction","environment":"Singapore gym weight area","element":[{"element_name_1":"Gym Bro","prop_name_1":"phone"}],"motion":"walks, scans toilet direction, looks back to lens","ending":"hard cut on reaction","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 3
**Ref (1):** `REF-A`
```json
{"scene":3,"duration_s":10,"scene_description":"Gym Bro recounts his Canadian friend's PVL ISO Gold recommendation in a direct one-take selfie.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"medium selfie framing with natural handheld breathing","lighting":"soft gym daylight","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. Until my Canadian friend told me: Oi, why you never try PVL ISO Gold? All the athletes here use this one leh. That’s when I know.","SFX":"light gym ambience","environment":"gym bench area","element":[{"element_name_1":"Gym Bro","prop_name_1":"phone"}],"motion":"nods and imitates friend with a hand gesture","ending":"nods into product reveal","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 4
**Ref (2):** `REF-A` · `REF-B`
```json
{"scene":4,"duration_s":10,"scene_description":"Gym Bro makes the first clear PVL ISO Gold pack reveal and shares a value discovery.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"medium selfie then focus shift toward product","lighting":"realistic gym lighting","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. At first I thought what brand is this, even bring to Anytime Fitness ask bros, nobody knows this. But heng ah nobody know, that’s why the price so solid!","SFX":"soft tub handling tap","environment":"Singapore gym","element":[{"element_name_1":"Gym Bro","prop_name_1":"PVL ISO Gold tub"}],"motion":"turns product toward lens then shrugs playfully","ending":"holds tub in frame","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 5
**Ref (2):** `REF-A` · `REF-B`
```json
{"scene":5,"duration_s":10,"scene_description":"Gym Bro holds product beside his face and explains price and Canada positioning.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"close medium selfie with natural handheld push-in","lighting":"clean gym light","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. Not even 80 bucks for 2lb, 160 bucks for 5lbs. Why I say heng? Because in Canada, this is top-tier athlete grade protein one.","SFX":"small upbeat gesture pop","environment":"gym bench area","element":[{"element_name_1":"Gym Bro","prop_name_1":"PVL ISO Gold tub"}],"motion":"counts price on fingers, taps tub, then gives a confident nod","ending":"raises one finger","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 6
**Ref (2):** `REF-A` · `REF-B`
```json
{"scene":6,"duration_s":10,"scene_description":"Macro scoop of PVL ISO Gold powder enters a shaker, then returns to the Gym Bro with tub visible.","style":"raw handheld UGC product-prep, authentic","camera_direction":"tight macro phone shot transitioning to medium selfie","lighting":"clean bright gym counter light","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. Whey Isolate, 27g protein per scoop, 21% more than regular blend whey. Some more got Informed Choice, clear 285 substances, safe gao gao.","SFX":"powder scoop and shaker rustle","environment":"gym counter","element":[{"element_name_1":"Gym Bro","prop_name_1":"PVL ISO Gold tub and shaker"}],"motion":"one clean deliberate scoop, then points from shaker to tub","ending":"holds shaker toward lens","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 7
**Ref (2):** `REF-A` · `REF-B`
```json
{"scene":7,"duration_s":10,"scene_description":"Gym Bro explains the lactase-enzyme angle while shaking, sipping, and reacting comfortably.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"medium selfie with bottle held in foreground","lighting":"realistic gym light","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. Best part is they put lactase enzyme inside. This combo, even if you lactose intolerant, your stomach always merlion after kopi, also no kick, steady.","SFX":"shaker ball clink and satisfied breath","environment":"gym bench area","element":[{"element_name_1":"Gym Bro","prop_name_1":"shaker and PVL ISO Gold tub"}],"motion":"shakes bottle, takes a sip, nods and pats stomach","ending":"hard cut to powder detail","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 8
**Ref (2):** `REF-A` · `REF-B`
```json
{"scene":8,"duration_s":10,"scene_description":"Macro-to-medium prep beat: fine powder, then Gym Bro mixes a creamy iced shake by the gym window.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"macro product detail transitioning to medium phone view","lighting":"warm window light plus natural gym ambience","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. Look at the powder, so fine, so clean. Filter so many times, of course drink already the stomach feel damn shiok.","SFX":"ice and shaker sounds","environment":"gym window counter","element":[{"element_name_1":"Gym Bro","prop_name_1":"PVL ISO Gold shaker"}],"motion":"shows powder briefly, then mixes shake","ending":"raises drink to camera","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 9
**Ref (2):** `REF-A` · `REF-B`
```json
{"scene":9,"duration_s":10,"scene_description":"Warm gym-café selfie: Gym Bro drinks the iced mocha shake like coffee and raises it to the lens.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"casual medium selfie with cup close to lens","lighting":"warm morning window light","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. Now every morning I drink one cup instead of kopi, because the taste exactly the same. Iced Mocha Cappuccino flavor, smell like real coffee, drink already got 27g protein straight away.","SFX":"satisfied exhale","environment":"gym-café corner","element":[{"element_name_1":"Gym Bro","prop_name_1":"iced mocha protein shake and PVL ISO Gold tub"}],"motion":"takes a slow sip, smiles, and raises product toward camera","ending":"puts tub beside his face","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

### Scene 10
**Ref (2):** `REF-A` · `REF-B`
```json
{"scene":10,"duration_s":10,"scene_description":"Final dynamic selfie: Gym Bro holds PVL ISO Gold tub and gives the direct CTA.","style":"raw handheld UGC, natural phone vlog, authentic","camera_direction":"dynamic close medium selfie with final push-in","lighting":"bright gym lighting","voice":"adult Singaporean male, natural Singlish accent, energetic but conversational gym-bro delivery, handheld selfie-vlog intimacy. So, if you don't want to hold your stomach and chiong around the gym, scared later you bomb the whole place then everyone trauma, better go check out this whey now!","SFX":"final energetic gym ambience","environment":"modern Singapore gym","element":[{"element_name_1":"Gym Bro","prop_name_1":"PVL ISO Gold tub"}],"motion":"big smile, points to lens, then holds product completely still","ending":"one-second post-production freeze-frame CTA card","text":"","keyword":["UGC","handheld","selfie","authentic"]}
```

## PART C — Audio
- BGM needed: no. Preserve scene-native audio through mandatory Flowkit 1080p upscale and Applio voice-sync; add BGM only if a ticket revision requests it.

## REF Assignment (≤3 per scene)
| Scene | Product | Character |
|---|---|---|
| 1–3 | — | REF-A |
| 4–10 | REF-B | REF-A |

## Post-production requirement
- Concatenate the ten upscaled, voice-synced clips in sequence, then freeze Scene 10's final product-hold frame for 1.0s. Final duration: 101s.
