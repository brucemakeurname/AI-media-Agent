---
name: gemini-text-gen
description: Rewrite an existing Vietnamese-language draft (caption/script) into natural, native-quality prose via Vertex AI Gemini text models. Used as the mandatory final pass after Claude produces a draft — Claude's raw Vietnamese output reads stiff/awkward and is not publish-quality.
---

# gemini-text-gen

Vertex AI Gemini text-generation skill. This skill does not draft from scratch — it takes a
Claude-authored draft and rewrites it into natural spoken/written Vietnamese, preserving every
fact, name, number, and CTA from the source.

## When to call this directly (API path) vs. the nested CLI path

Per `INHOUSE TEAMS/2. Production/Social Media/TOOL-ROUTING-CLI-VS-API.md`:

- **Batch** (this run needs more than one piece of text rewritten — e.g. several tickets, or
  several articles queued together) → call this skill directly, once per piece. No CLI spawn
  overhead per item.
- **Single** (this ticket produces exactly one caption or one script) → prefer the nested `agy`
  CLI path instead (see `content-executive.md`'s Vietnamese quality pass step). Only fall back to
  this skill for a single item if `agy` isn't available.

## Step 1: Build the Rewrite Request

Do not ask Gemini to "write a caption" from nothing — that reintroduces the stiffness problem
this skill exists to fix. Always pass:

- the full Claude draft (verbatim)
- the brand voice reference (`voice-style.md` / `hashtags.md`) so tone stays on-brand
- an explicit instruction to preserve every fact/number/name/CTA and only change phrasing,
  rhythm, and word choice to read as natural native Vietnamese — never add new claims

## Step 2: Call the Client

Same Vertex AI project/auth as `nano-banana-image-gen` — reuse its credentials, just a
text-only model and no image config:

```javascript
import { GoogleAuth } from 'google-auth-library';

async function rewriteText(draft, { voiceGuide, model = 'gemini-3-pro' }) {
  const auth = new GoogleAuth({
    keyFile: 'D:/1. SOLOFLOWS/INHOUSE TEAMS/2. Production/_archive-media-hubs/4. Design Hub/solo-flows-free-gen-v1-15896bb3db79.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  // Same global-endpoint requirement as the image skill — regional locations can silently
  // degrade output. Keep `global` for consistency.
  const url = `https://aiplatform.googleapis.com/v1beta1/projects/solo-flows-free-gen-v1/locations/global/publishers/google/models/${model}:generateContent`;

  const prompt = `Bạn là biên tập viên tiếng Việt bản ngữ. Viết lại đoạn nháp dưới đây sao cho tự nhiên, đúng văn phong thương hiệu, KHÔNG thêm bớt sự kiện/số liệu/tên riêng/CTA:\n\nVăn phong thương hiệu:\n${voiceGuide}\n\nBản nháp:\n${draft}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT'] }
    })
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.map(p => p.text).filter(Boolean).join('\n').trim();
}
```

**Runnable client:** none yet — mirror `nano-banana-image-gen/example_generate.py`'s
Python/`google-auth`+`requests` shape when a standalone script is needed; this skill has not
had one built yet.

## Step 3: Verify Before Accepting

Read the rewritten output back against the original draft:

- every number, name, and CTA still present
- no new claims introduced
- reads as native Vietnamese, not translated-feeling

If a fact is missing or altered, re-run with a stricter instruction — never silently accept a
rewrite that dropped or changed a fact.

## Hard Rules

- **NEVER use the free Gemini API** (`generativelanguage.googleapis.com`) — same policy as
  `nano-banana-image-gen`. Always Vertex AI.
- **MUST use `locations/global`** and `v1beta1` — same endpoint requirements as the image skill.
- **Rewrite only — never draft from a blank prompt.** The source draft always comes from
  Claude (content-executive's own reasoning); this skill's only job is prose quality.
- Model default: `gemini-3-pro` (favor quality over speed for publish-facing copy). A faster
  `gemini-3.1-flash` variant may be used for lower-stakes internal drafts if latency matters
  more than polish.

## Graph

**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Consumer:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/content-executive|content-executive role]]
**Pattern source:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/nano-banana-image-gen/SKILL|nano-banana-image-gen]] (shared Vertex AI auth/endpoint pattern)
**Routing policy:** [[INHOUSE TEAMS/2. Production/Social Media/TOOL-ROUTING-CLI-VS-API|Tool Routing: CLI vs API]]
