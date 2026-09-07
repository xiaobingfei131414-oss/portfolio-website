from pathlib import Path
from PIL import Image, ImageOps

SOURCE = Path(r"E:\个人资料\作品\产品海报")
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "images" / "posters"
NAMES = [
    *[f"1 ({index}).jpg" for index in range(1, 13)],
    "2 (1).jpg", "2 (2).jpg",
    "3 (1).jpg", "3 (2).jpg", "3 (3).jpg", "3 (4).jpg",
]

OUTPUT.mkdir(parents=True, exist_ok=True)
source_bytes = output_bytes = 0
sizes = []
for index, name in enumerate(NAMES, 1):
    source = SOURCE / name
    target = OUTPUT / f"poster-{index:02}.webp"
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
