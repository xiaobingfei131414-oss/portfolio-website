from pathlib import Path
from PIL import Image, ImageOps

SOURCE = Path(r"E:\个人资料\作品\产品详情")
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "images" / "detail-pages"
NAMES = [
    "01.jpg", "02.jpg", "04.jpg", "05.jpg", "06.jpg", "09.jpg", "10.jpg", "12.jpg", "13.jpg", "15.jpg",
    "17.jpg", "18.jpg", "19.jpg", "21.jpg", "22.jpg", "23.jpg", "24.jpg", "25.jpg", "26.jpg", "27.jpg",
    "28.jpg", "30.jpg", "31.jpg", "32.jpg", "33.jpg", "34.jpg", "35.jpg", "37.jpg", "38.jpg", "41.jpg",
    "43.jpg", "45.jpg", "46.jpg", "48.jpg", "49.jpg", "50.jpg", "51.jpg", "52.jpg", "53.jpg", "54.jpg",
    "55.jpg", "56.jpg", "57.jpg",
]

OUTPUT.mkdir(parents=True, exist_ok=True)
source_bytes = output_bytes = 0
sizes = []
for index, name in enumerate(NAMES, 1):
    source = SOURCE / name
    target = OUTPUT / f"detail-{index:02}.webp"
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
