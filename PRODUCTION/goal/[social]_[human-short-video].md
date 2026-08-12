---
id: "[social]_[human-short-video]"
studio: social-media
visual_type: human-short-video
format_allow: [ask-a-question, ask-me-anything, before-after, brand-story, case-studies, free-trials, fun-facts, industry-news, interviews, introduce-team, lifestyle-content, podcast, process-post, product-demos, quote, seasonal, sneak-peeks, special-offers, testimonials, tip-of-the-day, tutorials]
amount: [single, batch]        # studio agent picks engine per ticket volume
engine:
  single: { text: in-session-gemini-3-pro, image: "talking-head-editing" }
  batch:  { text: gemini-api-skill,        image: "talking-head-editing" }
primary_skills: [talking-head-editing, wiki-query, notion-upload]
inputs: [brand, topic, platform, purpose, campaign, messages, slogan, notion_page_id, database_id, language, deadline]
output_dir: BASE/CAMPAIGNs/{brand}/{date}/{ticket_id}/
done_when: "assets + caption in output_dir + pushed to Notion {notion_page_id} status 'Chờ duyệt' + manifest.json"
status: stub
---

## Summary
Produce a **human-short-video** in whichever content-format the ticket's `Format` field carries — must be one of `format_allow` above — for a brand social channel.

## Amount paths
- **single** — text in-session Gemini 3 Pro · image: talking-head-editing
- **batch**  — text via Gemini-API skill · image: talking-head-editing (spawn parallel sub-agents)

## Rough flow (refine manually)
1. **Copy** — `wiki-query` brand voice/structure → write copy for the ticket's content-format in Gemini (language from ticket, default Vietnamese).
2. **Design spec** — list images needed, brand refs (testimonial/client/pricing/facility), on-image text, model, ratio, resolution.
3. **Visual** — generate per engine path above (human-short-video).
4. **Publish** — `notion-upload` → set Notion status "Chờ duyệt" + write manifest.json.

## Skills to develop
talking-head-editing, wiki-query, notion-upload

> **status: stub** — name-locked scaffold only. Steps + skills to be built manually.
