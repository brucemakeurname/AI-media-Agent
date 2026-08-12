import json, re, html, os

W, H, FPS, DURATION = 1080, 1920, 30, 125.668345

ACCENTS = ["#4cc9f0", "#f72585", "#4ade80", "#fb923c", "#a78bfa"]
BG = "#1a1a1a"
TEXT = "#f1f1f1"

# id, startSec, endSec, accentIndex, kicker, title, detail(optional), pos(center|lower), quote(bool)
CARDS = [
    dict(id="card-01", s=0.4, e=8.9, a=1, kicker="THE HYPE", title="LAUNCH THE AI INFLUENCER. GET RICH. RIGHT NOW.", pos="lower"),
    dict(id="card-02", s=8.9, e=16.4, a=1, kicker="NOBODY TELLS YOU", title="99% QUIT IN MONTH ONE.", pos="center", quote=True),
    dict(id="card-03", s=20.4, e=22.75, a=0, kicker=None, title="THE REALITY CHECK", pos="center"),
    dict(id="card-04", s=22.75, e=26.9, a=2, kicker="REASON 01", title="MOST AI INFLUENCERS FAIL", pos="lower"),
    dict(id="card-05", s=26.9, e=37.8, a=2, kicker="REASON 01 · WHY", title="TOOL ≠ BRAND", detail="Market flooded with low-effort, dead-eyed avatars. People confuse using a tool with building a brand.", pos="lower"),
    dict(id="card-06", s=37.8, e=40.9, a=3, kicker=None, title="JUST BECAUSE SHE MOVES DOESN'T MEAN SHE MATTERS.", pos="center", quote=True),
    dict(id="card-07", s=40.9, e=46.7, a=4, kicker="REASON 02", title="CONTENT COMES FAST. AI COMES LATER.", pos="lower"),
    dict(id="card-08", s=46.7, e=60.5, a=4, kicker="REASON 02 · WHY", title="A SCREENSAVER, NOT A CREATOR", detail="Photorealistic skin, zero personality, no struggle, no story — just a digital screensaver.", pos="lower"),
    dict(id="card-09", s=60.5, e=63.5, a=3, kicker=None, title="YOU CANNOT AUTOMATE A SOUL.", pos="center", quote=True),
    dict(id="card-10", s=63.5, e=69.2, a=0, kicker="REASON 03", title="YOUR TASTE IS THE ONLY EDGE", pos="lower"),
    dict(id="card-11", s=69.2, e=76.9, a=0, kicker="SAME TOOLS, EVERYONE", title="MIDJOURNEY · KLING · LUMA · NANO BANANA", pos="lower"),
    dict(id="card-12", s=76.9, e=86.7, a=0, kicker="THE ACTUAL EDGE", title="VIRAL VS. CRINGE BOT", detail="The only thing separating a viral sensation from a cringe bot is your eye for aesthetics, lighting, and fashion.", pos="lower"),
    dict(id="card-13", s=86.7, e=90.9, a=3, kicker=None, title="THE AI IS THE BRUSH. YOU ARE STILL THE ARTIST.", pos="center", quote=True),
    dict(id="card-14", s=90.9, e=99.2, a=1, kicker="REASON 04", title="END CHIP. IT AIN'T CHEAP.", pos="lower"),
    dict(id="card-15", s=99.2, e=111.9, a=1, kicker="REASON 04 · WHY", title="THIS IS CAPITAL INVESTMENT", detail="High-end GPU costs. Multiple subscriptions. Hours spent fixing glitches.", pos="lower"),
    dict(id="card-16", s=111.9, e=115.9, a=3, kicker=None, title="A MEDIA STARTUP, NOT A VIDEO GAME.", pos="center", quote=True),
    dict(id="card-17", s=115.9, e=125.6, a=2, kicker="THE TAKEAWAY", title="STOP THE CHEAT CODE. START THE BUSINESS.", pos="center"),
]

WORK = os.path.dirname(os.path.abspath(__file__))
CARDS_DIR = os.path.join(WORK, "public", "cards")
os.makedirs(CARDS_DIR, exist_ok=True)


def esc(s):
    return html.escape(s, quote=True)


def chars_spans(word):
    out = []
    for ch in word:
        if ch == " ":
            out.append(' <span class="char">&nbsp;</span>')
        else:
            out.append(f'<span class="char">{esc(ch)}</span>')
    return "".join(out)


def build_card_html(c):
    cid = c["id"]
    kicker = c.get("kicker")
    title = c["title"]
    detail = c.get("detail")
    pos = c["pos"]
    accent = f"var(--accent-{c['a']})"

    vertical = "center" if pos == "center" else "flex-end"
    padding_bottom = "0" if pos == "center" else "180px"

    kicker_html = ""
    if kicker:
        kicker_html = f'''
    <div class="kicker" data-anim="fade-in" data-anim-at="0.05" data-anim-duration="0.35">{esc(kicker)}</div>'''

    title_html = f'''
    <h1 class="title" data-anim="kinetic-chars" data-anim-at="0.15" data-anim-duration="0.45" data-anim-stagger="0.015" data-anim-pattern="pop">{chars_spans(title)}</h1>'''

    rule_html = '''
    <div class="rule" data-anim="grow-x" data-anim-at="0.55" data-anim-duration="0.4" data-anim-target-w="120" style="width:0;"></div>'''

    detail_html = ""
    if detail:
        detail_html = f'''
    <div class="detail" data-anim="fade-in" data-anim-at="0.65" data-anim-duration="0.4">{esc(detail)}</div>'''

    quote_mark = ""
    if c.get("quote"):
        quote_mark = '<div class="quote-mark" data-anim="scale-pop" data-anim-at="0" data-anim-duration="0.3">“</div>'

    return f'''<div class="card" data-card-id="{cid}">
  <style>
    .card[data-card-id="{cid}"] .root {{
      width: 100%; height: 100%;
      display: flex; align-items: {vertical}; justify-content: flex-start;
      padding: 64px 56px {padding_bottom} 56px;
      box-sizing: border-box;
      background: transparent;
    }}
    .card[data-card-id="{cid}"] .panel {{
      position: relative;
      width: 100%;
      background: linear-gradient(135deg, rgba(20,20,22,0.72), rgba(20,20,22,0.42));
      backdrop-filter: blur(14px);
      border-left: 6px solid {accent};
      border-radius: 18px;
      padding: 36px 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.45);
    }}
    .card[data-card-id="{cid}"] .quote-mark {{
      font-family: 'Inter', sans-serif;
      font-size: 96px;
      font-weight: 700;
      color: {accent};
      line-height: 0.6;
      margin-bottom: 8px;
    }}
    .card[data-card-id="{cid}"] .kicker {{
      font-family: 'Inter', sans-serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: {accent};
      margin-bottom: 14px;
    }}
    .card[data-card-id="{cid}"] .title {{
      font-family: 'Inter', sans-serif;
      font-size: 68px;
      font-weight: 700;
      line-height: 1.12;
      color: var(--text);
      margin: 0;
    }}
    .card[data-card-id="{cid}"] .rule {{
      height: 6px; background: {accent}; border-radius: 3px; margin-top: 24px;
    }}
    .card[data-card-id="{cid}"] .detail {{
      font-family: 'Inter', sans-serif;
      font-size: 34px;
      font-weight: 400;
      line-height: 1.4;
      color: var(--text);
      opacity: 0.92;
      margin-top: 24px;
    }}
    .card[data-card-id="{cid}"] .char {{ display: inline-block; }}
  </style>
  <div class="root">
    <div class="panel">
      {quote_mark}{kicker_html}{title_html}{rule_html}{detail_html}
    </div>
  </div>
</div>
'''


storyboard_cards = []
for c in CARDS:
    with open(os.path.join(CARDS_DIR, f"{c['id']}.html"), "w", encoding="utf-8") as f:
        f.write(build_card_html(c))
    storyboard_cards.append({
        "id": c["id"],
        "intent": c["title"],
        "startSec": round(c["s"], 3),
        "endSec": round(min(c["e"], DURATION), 3),
        "accentIndex": c["a"],
        "zone": "video-overlay",
        "contentHints": {k: v for k, v in c.items() if k in ("kicker", "title", "detail")},
    })

storyboard = {
    "schemaVersion": 3,
    "composition": {
        "fps": FPS,
        "width": W,
        "height": H,
        "durationSeconds": DURATION,
        "layout": "portrait",
        "themeId": "noir",
        "seed": 42,
    },
    "videoTrack": {
        "sourcePath": "input-video.mp4",
        "startSec": 0,
        "endSec": DURATION,
        "bounds": {"x": 0, "y": 0, "width": W, "height": H},
    },
    "subtitles": {"enabled": False},
    "cards": storyboard_cards,
}

with open(os.path.join(WORK, "storyboard.json"), "w", encoding="utf-8") as f:
    json.dump(storyboard, f, indent=2, ensure_ascii=False)

print(f"Wrote {len(CARDS)} cards + storyboard.json")
