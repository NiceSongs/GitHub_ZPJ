from PIL import Image, ImageFilter, ImageEnhance
from pathlib import Path
import sys

if len(sys.argv) < 3:
    print("Usage: python scripts/portrait_edit.py <input> <output>")
    raise SystemExit(1)

input_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
output_path.parent.mkdir(parents=True, exist_ok=True)

img = Image.open(input_path).convert("RGBA")

# Crop to a centered portrait framing.
W, H = img.size
side = min(W, H)
crop_top = int(H * 0.02)
crop_bottom = int(H * 0.98)
crop_left = max(0, (W - side) // 2)
crop_right = min(W, crop_left + side)
img = img.crop((crop_left, crop_top, crop_right, crop_bottom))

# Resize to a proper resume-photo canvas.
canvas_w, canvas_h = 1200, 1500
img = img.resize((930, 1162), Image.LANCZOS)

canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 255))
canvas.alpha_composite(img, (135, 110))

# Soft vignette to keep attention on face.
overlay = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
pix = overlay.load()
cx, cy = canvas_w / 2, canvas_h * 0.40
for y in range(canvas_h):
    for x in range(canvas_w):
        dx = (x - cx) / (canvas_w * 0.52)
        dy = (y - cy) / (canvas_h * 0.48)
        d = dx * dx + dy * dy
        if d > 1.0:
            a = min(110, int((d - 1.0) * 70))
            pix[x, y] = (0, 0, 0, a)
canvas = Image.alpha_composite(canvas, overlay)

# Brighten shirt region into a white-T impression.
shirt = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
sp = shirt.load()
for y in range(1000, canvas_h):
    t = (y - 1000) / max(1, canvas_h - 1000)
    alpha = int(240 * (1 - abs(t - 0.35)))
    alpha = max(0, min(180, alpha))
    for x in range(260, 940):
        dist = abs(x - 600) / 340
        if dist < 1:
            sp[x, y] = (245, 245, 245, int(alpha * (1 - dist * 0.88)))
shirt = shirt.filter(ImageFilter.GaussianBlur(12))
canvas = Image.alpha_composite(canvas, shirt)

# Reduce lens highlights with faint dark glazes.
glare = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
gp = glare.load()
for box in [(290, 620, 470, 805), (730, 620, 910, 805)]:
    l, t, r, b = box
    for y in range(t, b):
        for x in range(l, r):
            dx = (x - (l + r) / 2) / ((r - l) / 2)
            dy = (y - (t + b) / 2) / ((b - t) / 2)
            d = dx * dx + dy * dy
            if d < 1:
                gp[x, y] = (18, 18, 18, int(55 * (1 - d)))
glare = glare.filter(ImageFilter.GaussianBlur(10))
canvas = Image.alpha_composite(canvas, glare)

canvas = ImageEnhance.Brightness(canvas).enhance(1.02)
canvas = ImageEnhance.Contrast(canvas).enhance(1.03)
canvas = ImageEnhance.Color(canvas).enhance(0.96)

canvas.convert("RGB").save(output_path, quality=95)
print(output_path)
