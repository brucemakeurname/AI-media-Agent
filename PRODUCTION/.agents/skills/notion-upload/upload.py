"""Upload content + properties into a Notion database page.

Env: NOTION_TOKEN. Usage:
    python upload.py --database-id ID --title "T" --status "Chờ duyệt" \
        --body body.md [--props props.json] [--cover-url URL]

Prints the created page URL.
"""
import argparse
import json
import os
import re
import sys
import urllib.request

API = "https://api.notion.com/v1"
VER = "2022-06-28"


def _headers():
    tok = os.environ.get("NOTION_TOKEN")
    if not tok:
        sys.exit("NOTION_TOKEN not set")
    return {
        "Authorization": f"Bearer {tok}",
        "Notion-Version": VER,
        "Content-Type": "application/json",
    }


def _post(url, payload):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(), headers=_headers(), method="POST"
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def _rt(content):
    return [{"type": "text", "text": {"content": content[:2000]}}]


def md_to_blocks(md):
    blocks = []
    for line in md.splitlines():
        s = line.rstrip()
        if not s.strip():
            continue
        img = re.match(r"^!\[.*?\]\((https?://\S+)\)", s)
        head = re.match(r"^(#{1,3})\s+(.*)", s)
        if img:
            blocks.append(
                {"type": "image", "image": {"type": "external", "external": {"url": img.group(1)}}}
            )
        elif head:
            t = f"heading_{len(head.group(1))}"
            blocks.append({"type": t, t: {"rich_text": _rt(head.group(2))}})
        elif s.lstrip().startswith(("- ", "* ")):
            blocks.append(
                {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": _rt(s.lstrip()[2:])}}
            )
        else:
            blocks.append({"type": "paragraph", "paragraph": {"rich_text": _rt(s)}})
    return blocks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--database-id", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--title-prop", default="Name")
    ap.add_argument("--status", default=None)
    ap.add_argument("--status-prop", default="Status")
    ap.add_argument("--props", default=None, help="JSON file of extra Notion properties")
    ap.add_argument("--body", default=None, help="markdown file for page body")
    ap.add_argument("--cover-url", default=None)
    ap.add_argument("--video-url", default=None,
                     help="external video URL (e.g. R2) — appended as a Notion video block; "
                          "use for files too large for a Notion file property (>5MB)")
    a = ap.parse_args()

    props = {a.title_prop: {"title": _rt(a.title)}}
    if a.status:
        props[a.status_prop] = {"select": {"name": a.status}}
    if a.props:
        with open(a.props, encoding="utf-8") as f:
            props.update(json.load(f))

    payload = {"parent": {"database_id": a.database_id}, "properties": props}
    if a.cover_url:
        payload["cover"] = {"type": "external", "external": {"url": a.cover_url}}
    if a.body:
        with open(a.body, encoding="utf-8") as f:
            payload["children"] = md_to_blocks(f.read())[:100]
    if a.video_url:
        payload.setdefault("children", []).append(
            {"type": "video", "video": {"type": "external", "external": {"url": a.video_url}}}
        )

    res = _post(f"{API}/pages", payload)
    print(res.get("url") or res.get("id"))


if __name__ == "__main__":
    main()
