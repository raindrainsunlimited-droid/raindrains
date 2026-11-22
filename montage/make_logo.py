"""Cut a clean transparent logo out of the full-size original (white background, 3009px wide).

Only white connected to the image border is removed, so the white ring inside the raindrop stays.
Edge pixels take the navy outline color with alpha from how far they are from white, so there is no white halo.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src = Image.open('src/img-originals/logo-original.jpg').convert('RGB')
a = np.asarray(src).astype(np.float32)
navy = np.array((11, 43, 74), np.float32)

near_white = Image.fromarray(((a.min(2) > 200) * 255).astype(np.uint8)).copy()  # writable copy for floodfill
for corner in [(0, 0), (src.width - 1, 0), (0, src.height - 1), (src.width - 1, src.height - 1)]:
    ImageDraw.floodfill(near_white, corner, 128)
bg = np.asarray(near_white) == 128
edge = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0

alpha = np.ones(bg.shape, np.float32)
band = edge & ~bg
alpha[band] = np.clip((255 - a[band].mean(1)) / (255 - navy.mean()), 0, 1)
alpha[bg] = 0
rgb = a.copy()
rgb[band | bg] = navy
out = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)
img = Image.fromarray(out, 'RGBA')
img.crop(img.getbbox()).save('montage/logo-hires.png')
