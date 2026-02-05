import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

CSV_JSON = ROOT / "public" / "verbs.json"      # JSON ya generado
RAW_IMG_DIR = ROOT / "data" / "images_raw"
OUT_IMG_DIR = ROOT / "public" / "images" / "verbs"

OUT_IMG_DIR.mkdir(parents=True, exist_ok=True)

TARGET_WIDTH = 640
WEBP_QUALITY = 65
RAW_EXTS = [".png", ".jpg", ".jpeg", ".webp"]


def find_raw_image(vid: str) -> Path | None:
    for ext in RAW_EXTS:
        p = RAW_IMG_DIR / f"{vid}{ext}"
        if p.exists():
            return p
    return None


def resize_keep_aspect(img: Image.Image, target_w: int) -> Image.Image:
    w, h = img.size
    if w <= target_w:
        return img
    target_h = int(h * target_w / w)
    return img.resize((target_w, target_h), Image.LANCZOS)


def main():
    data = json.loads(CSV_JSON.read_text(encoding="utf-8"))

    missing = []
    processed = 0

    for v in data:
        vid = v["id"]
        raw = find_raw_image(vid)

        if raw is None:
            missing.append(vid)
            continue

        out = OUT_IMG_DIR / f"{vid}.webp"
        img = Image.open(raw).convert("RGB")
        img = resize_keep_aspect(img, TARGET_WIDTH)
        img.save(out, "WEBP", quality=WEBP_QUALITY, method=6)

        v["image"] = f"/images/verbs/{vid}.webp"
        processed += 1

    CSV_JSON.write_text(json.dumps(
        data, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Processed images: {processed}")
    if missing:
        print("Missing images for:")
        for m in missing:
            print(" -", m)


if __name__ == "__main__":
    main()
