"""Render human-readable and CSV copy from the 18 reviewed caption pairs."""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
data = json.loads((HERE / "social-copy.json").read_text())
pins = json.loads((ROOT / "marketing/pinterest/pin-copy.json").read_text())
posts = data["posts"]
assert len(posts) == len(pins) == 18
assert [p["pin_id"] for p in posts] == [p["pin_id"] for p in pins]
assert len({p["pin_id"] for p in posts}) == 18
rows = []
md = [
    "# Little Home Ideas — Facebook & Instagram",
    "",
    "18 obrázkov · 36 samostatných anglických príspevkov · pripravené 15. októbra 2026",
    "",
    "Text pod názvom Facebook alebo Instagram je hotový na kopírovanie vrátane hashtagov. "
    "Obrázky spáruj podľa presného názvu súboru z Pinterest balíka. "
    "Na Instagrame najprv nastav odkaz v profile na https://littlehomeideas.com/ideas/; "
    "všetky instagramové výzvy počítajú s týmto nastavením. "
    "Žiadny príspevok nie je publikovaný ani naplánovaný.",
    "",
    "Pôvodné obrázky 1000 × 1500 px (2:3) zostávajú nezmenené. "
    "Na spoločný feed navrhujeme samostatné 4:5 verzie so skontrolovaným orezom. "
    "Tieto obrazové úpravy nie sú súčasťou textového balíka.",
    "",
]
for number, (post, pin) in enumerate(zip(posts, pins), 1):
    slug = pin["link"].rstrip("/").rsplit("/", 1)[1]
    source = (ROOT / "src/content/articles" / f"{slug}.md").read_text()
    assert "draft: false" in source and "reviewed: true" in source, slug
    title = re.search(r'^title: "(.+)"$', source, re.M).group(1)
    fb_tags = post["facebook_hashtags"]
    ig_tags = post["instagram_hashtags"]
    assert len(fb_tags) == len(set(fb_tags)) == 2
    assert len(ig_tags) == len(set(ig_tags)) == 4
    assert all(re.fullmatch(r"#[A-Za-z][A-Za-z0-9]*", t) for t in fb_tags + ig_tags)
    fb = post["facebook_body"] + "\n\nRead the guide: " + pin["link"] + "\n\n" + " ".join(fb_tags)
    ig = post["instagram_body"] + "\n\nVisit the link in our bio and find “" + title + "”.\n\n" + " ".join(ig_tags)
    assert len(ig) < 2200 and len(fb) < 1500
    assert "https://" not in ig
    rows.append({
        "sequence": number,
        "image_file": pin["image_file"],
        "scene_sk": post["scene_sk"],
        "facebook_post": fb,
        "instagram_post": ig,
        "facebook_hashtags": " ".join(fb_tags),
        "instagram_hashtags": " ".join(ig_tags),
        "article_title": title,
        "article_url": pin["link"],
        "instagram_bio_url": data["instagram_bio_url"],
        "alt_text": pin["alt_text"],
        "status": "DRAFT_NOT_SCHEDULED",
    })
    md += [
        f"## {number:02d}. {pin['image_file']}", "", post["scene_sk"], "",
        "### Facebook", "", fb, "", "### Instagram", "", ig, "",
        "**Alt text:** " + pin["alt_text"], "", "---", "",
    ]
assert len({r["facebook_post"] for r in rows}) == 18
assert len({r["instagram_post"] for r in rows}) == 18
(HERE / "social-copy.md").write_text("\n".join(md), encoding="utf-8")
with (HERE / "social-copy.csv").open("w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0]), lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
print(f"Rendered {len(rows)} image pairs, {len(rows) * 2} unique posts.")
print(f"Longest Instagram post: {max(len(r['instagram_post']) for r in rows)} characters.")
