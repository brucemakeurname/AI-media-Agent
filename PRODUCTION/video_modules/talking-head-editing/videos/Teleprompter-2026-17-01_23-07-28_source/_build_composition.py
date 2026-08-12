import json, os

WORK = os.path.dirname(os.path.abspath(__file__))
sb = json.load(open(os.path.join(WORK, "storyboard.json"), encoding="utf-8"))
comp = sb["composition"]
W, H, FPS, DUR = comp["width"], comp["height"], comp["fps"], comp["durationSeconds"]

# reconstruct per-card anim flags from the CARDS list used in _build.py (mirrored here minimally)
QUOTE_IDS = {"card-02", "card-06", "card-09", "card-13", "card-16"}
NO_KICKER_IDS = {"card-03", "card-06", "card-09", "card-13", "card-16"}

def q(t):
    return round(t * FPS) / FPS

lines = []
lines.append('          const tl = window.gsap.timeline({ paused: true });')
lines.append('')

card_hosts = []
for c in sb["cards"]:
    cid = c["id"]
    s = c["startSec"]
    e = c["endSec"]
    dur = round(e - s, 4)
    card_hosts.append(
        f'      <div class="card-host clip" data-card-id="{cid}" data-start="{s:.4f}" '
        f'data-duration="{dur:.4f}" data-track-index="2" '
        f'style="left:0;top:0;width:{W}px;height:{H}px;visibility:hidden;opacity:0;">\n'
        f'        <!-- {cid} injected below by build script -->\n'
        f'      </div>'
    )

    sel_host = f'.card-host[data-card-id="{cid}"]'
    lines.append(f'          // ── {cid} [{s}, {e}] ──')
    lines.append(f'          tl.set(\'{sel_host}\', {{ visibility: "visible" }}, {q(s)});')
    lines.append(f'          tl.fromTo(\'{sel_host}\', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4, ease: "power2.out" }}, {q(s)});')

    base = f'.card[data-card-id="{cid}"]'
    if cid not in NO_KICKER_IDS:
        lines.append(f'          tl.fromTo(\'{base} .kicker\', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.35, ease: "power2.out" }}, {q(s + 0.05)});')
    if cid in QUOTE_IDS:
        lines.append(f'          tl.fromTo(\'{base} .quote-mark\', {{ opacity: 0, scale: 0.6 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)" }}, {q(s)});')
    lines.append(f'          tl.from(\'{base} .title .char\', {{ opacity: 0, y: 8, scale: 0.8, duration: 0.45, ease: "power2.out", stagger: 0.015 }}, {q(s + 0.15)});')
    lines.append(f'          tl.fromTo(\'{base} .rule\', {{ width: 0 }}, {{ width: 120, duration: 0.4, ease: "power2.out" }}, {q(s + 0.55)});')
    if c.get("contentHints", {}).get("detail"):
        lines.append(f'          tl.fromTo(\'{base} .detail\', {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4, ease: "power2.out" }}, {q(s + 0.65)});')

    exit_start = round(e - 0.35, 4)
    lines.append(f'          tl.to(\'{sel_host}\', {{ opacity: 0, duration: 0.35, ease: "power2.in" }}, {q(exit_start)});')
    lines.append(f'          tl.set(\'{sel_host}\', {{ visibility: "hidden" }}, {q(e)});')
    lines.append('')

timeline_js = "\n".join(lines)
card_hosts_html = "\n".join(card_hosts)

TEMPLATE = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {{ font-family: "Inter"; src: url("fonts/Inter-400-latin.woff2") format("woff2"); font-weight: 400; font-display: block; }}
      @font-face {{ font-family: "Inter"; src: url("fonts/Inter-700-latin.woff2") format("woff2"); font-weight: 700; font-display: block; }}

      :root {{
        --bg: #1a1a1a;
        --text: #f1f1f1;
        --accent-0: #4cc9f0;
        --accent-1: #f72585;
        --accent-2: #4ade80;
        --accent-3: #fb923c;
        --accent-4: #a78bfa;
      }}
      * {{ box-sizing: border-box; }}
      html, body {{
        margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
        background: #000;
        font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
      }}
      #stage {{ position: relative; width: 100%; height: 100%; overflow: hidden; }}

      .video-wrapper {{
        position: absolute; left: 0; top: 0; width: {W}px; height: {H}px;
        overflow: hidden; border-radius: 0; box-shadow: none;
      }}
      .video-wrapper video {{ width: 100%; height: 100%; object-fit: cover; }}

      .card-host {{ position: absolute; pointer-events: none; overflow: hidden; }}
      .card-host .card {{ position: relative; width: 100%; height: 100%; overflow: hidden; }}
      .card-host .char {{ display: inline-block; visibility: visible; }}
    </style>
  </head>
  <body>
    <div id="stage" data-composition-id="talking-head-recut" data-start="0" data-duration="{DUR}" data-fps="{FPS}" data-width="{W}" data-height="{H}">
      <div class="video-wrapper" id="video-wrap">
        <video id="bg-video" src="input-video.mp4" muted playsinline data-start="0" data-duration="{DUR}" data-track-index="1"></video>
      </div>
      <audio id="source-audio" src="input-video.mp4" data-start="0" data-duration="{DUR}" data-track-index="10" data-volume="1"></audio>

{card_hosts_html}

      <script src="vendor/gsap.min.js"></script>
      <script>
        (function () {{
{timeline_js}
          window.__timelines = window.__timelines || {{}};
          window.__timelines["talking-head-recut"] = tl;
        }})();
      </script>
    </div>
  </body>
</html>
'''

with open(os.path.join(WORK, "public", "index.html"), "w", encoding="utf-8") as f:
    f.write(TEMPLATE)

print("Wrote public/index.html")
