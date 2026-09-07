from pathlib import Path
from PIL import Image, ImageOps

SOURCE = Path(r"E:\个人资料\作品\产品主图")
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "images" / "main-images"
NAMES = [
    "2 (6).jpg", "4 (4).jpg", "5 (5).png", "5 (6).png", "6 (2).jpg", "6 (3).jpg",
    "6 (4).jpg", "7 (3).jpg", "8 (2).jpg", "8 (3).jpg", "8 (4).jpg", "8 (6).jpg",
    "8 (7).jpg", "9 (3).jpg", "9 (5).jpg", "11 (3).jpg", "11 (4).jpg", "11 (5).jpg",
    "12 (4).jpg", "12 (5).jpg", "14 (2).jpg", "14 (3).jpg", "14 (4).jpg", "14 (6).jpg",
    "15 (3).jpg", "15 (6).jpg", "16 (1).jpg", "16 (4).jpg", "16 (5).jpg", "16 (6).jpg",
    "16 (8).jpg", "17 (1).jpg", "17 (3).jpg", "17 (4).jpg", "17 (5).jpg", "18 (1).jpg",
    "19 (2).jpg", "19 (3).jpg", "19 (4).jpg", "19 (6).jpg", "19 (7).jpg", "20 (2).jpg",
    "20 (3).jpg", "20 (4).jpg", "21 (3).jpg", "21 (5).jpg", "21 (7).jpg", "21 (8).jpg",
]

OUTPUT.mkdir(parents=True, exist_ok=True)
source_bytes = output_bytes = 0
sizes = []
for index, name in enumerate(NAMES, 1):
    source = SOURCE / name
    target = OUTPUT / f"main-image-{index:02}.webp"
    source_bytes += source.stat().st_size
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        save_args = {"format": "WEBP", "quality": 94, "method": 6, "exact": True}
        if opened.info.get("icc_profile"):
            save_args["icc_profile"] = opened.info["icc_profile"]
        image.save(target, **save_args)
        sizes.append(image.size)
    output_bytes += target.stat().st_size

print("sizes=" + repr(sizes))
print(f"source_bytes={source_bytes}")
print(f"output_bytes={output_bytes}")
print(f"saved_percent={(1 - output_bytes / source_bytes) * 100:.1f}")
