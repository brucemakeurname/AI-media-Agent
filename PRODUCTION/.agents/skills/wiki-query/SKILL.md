---
name: wiki-query
description: Query the LLM-Wiki knowledge base + brand kits/strategies for a brand's writing style, structure, voice, messaging and prior campaign patterns before writing copy. Keyword retrieval → the session model synthesizes. No API.
---

# wiki-query

Retrieve brand-voice / content-structure knowledge so copy sounds like the brand.
Invoked at Step 1 of every content workflow.

## Knowledge roots (searched by default)

| Root | Holds |
|------|-------|
| `INHOUSE TEAMS/4. Marketing Team/03. LLM_Wiki` | content playbooks, structure guides, market handbook |
| `BASE/BRAND KITs` | per-brand voice, palette, do/don't |
| `BASE/STRATEGIES` | per-influencer/brand strategy + prior campaign patterns |

## Step 1 — Search

```bash
python search.py --query "<brand> <topic> voice tone structure" --top 8
```

Prints the top-ranked files with a matching snippet. Add `--roots <path> ...` to scope
to a specific brand folder when known.

## Step 2 — Read + synthesize

Read the top 2–4 hits in full, then extract for the copywriter:
- **Voice**: tone, person (1st/2nd), sentence rhythm, emoji/hashtag policy
- **Structure**: hook pattern, body framework, CTA convention for the target format
- **Vocabulary**: on-brand terms, banned words, slogan/tagline/headline usage
- **Proof**: reusable stats, testimonials, client names for this brand

Return a short brand-voice brief; the copywriter writes from it in Gemini.

## Notes
- Retrieval is keyword-based (no embeddings). Feed 3–6 meaningful terms, not a full sentence.
- If no hit for a brand, fall back to `BASE/BRAND KITs/<brand>/` files directly, or flag
  that the brand has no wiki entry yet.

## Graph
[[../../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]]
