---
id: "[social]_[motion-graphic]"
studio: social-media
visual_type: motion-graphic
format_allow: [brand-story, case-studies, industry-news, tip-of-the-day]
amount: [single, batch]        # studio agent picks engine per ticket volume
engine:
  single: { text: in-session-gemini-3-pro, image: "huashu-design (HTML -> MP4/GIF)" }
  batch:  { text: gemini-api-skill,        image: "huashu-design (HTML -> MP4/GIF)" }
primary_skills: [huashu-design, wiki-query, notion-upload]
inputs: [brand, topic, platform, purpose, campaign, messages, slogan, notion_page_id, database_id, language, deadline]
output_dir: BASE/CAMPAIGNs/{brand}/{date}/{ticket_id}/
done_when: "assets + caption in output_dir + pushed to Notion {notion_page_id} status 'Chờ duyệt' + manifest.json"
status: stub
---

## Summary
Produce a **motion-graphic** in whichever content-format the ticket's `Format` field carries — must be one of `format_allow` above — for a brand social channel.

## Amount paths
- **single** — text in-session Gemini 3 Pro · image: huashu-design (HTML -> MP4/GIF)
- **batch**  — text via Gemini-API skill · image: huashu-design (HTML -> MP4/GIF) (spawn parallel sub-agents)

## Rough flow (refine manually)
1. **Copy** — `wiki-query` brand voice/structure → write copy for the ticket's content-format in Gemini (language from ticket, default Vietnamese).
2. **Design spec** — list images needed, brand refs (testimonial/client/pricing/facility), on-image text, model, ratio, resolution.
3. **Visual** — generate per engine path above (motion-graphic).
4. **Publish** — `notion-upload` → set Notion status "Chờ duyệt" + write manifest.json.

## Skills to develop
huashu-design, wiki-query, notion-upload

> **status: stub** — name-locked scaffold only. Steps + skills to be built manually.
