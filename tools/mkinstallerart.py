#!/usr/bin/env python3
"""Makes the Inno Setup wizard images and icon for the Go Fish setup.
Usage: mkinstallerart.py   (writes installer/assets/; needs Pillow)"""
import os
from PIL import Image, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = f'{ROOT}/installer/art-src', f'{ROOT}/installer/assets'
os.makedirs(OUT, exist_ok=True)
SCALES = {100: 1, 150: 1.5, 200: 2}
BIG, SMALL = (164, 314), (55, 55)

def bmp(im, path):
    im.convert('RGB').save(path, 'BMP')

def fit(im, w, h):  # cover-crop to w x h
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((l, t, l + w, t + h))

def icon_on(bg, icon, size, cx, cy):
    ic = icon.resize((size, size), Image.LANCZOS)
    a = ic.getchannel('A').point(lambda v: v * .55)
    sh = Image.merge('RGBA', (*Image.new('RGB', ic.size, (0, 0, 0)).split(), a)).filter(ImageFilter.GaussianBlur(size * .03))
    bg.alpha_composite(sh, (cx - size // 2, cy - size // 2 + size // 30))
    bg.alpha_composite(ic, (cx - size // 2, cy - size // 2))

icon = Image.open(f'{ROOT}/icon-1024.png').convert('RGBA')
cover = Image.open(f'{SRC}/cover.jpg').convert('RGBA')
mark = Image.open(f'{SRC}/ironite-mark.png').convert('RGBA')

for pct, k in SCALES.items():
    W, H = round(BIG[0] * k), round(BIG[1] * k)
    sw = round(SMALL[0] * k)
    bg = fit(cover, W, H).filter(ImageFilter.GaussianBlur(3 * k))
    bg = ImageEnhance.Brightness(bg.convert('RGB')).enhance(.62).convert('RGBA')
    icon_on(bg, icon, round(150 * k), W // 2, round(H * .42))
    mw = round(30 * k); m = mark.resize((mw, round(mark.height * mw / mark.width)), Image.LANCZOS)
    bg.alpha_composite(m, ((W - mw) // 2, H - m.height - round(14 * k)))
    bmp(bg, f'{OUT}/wizard-gofish-{pct}.bmp')
    sm = Image.new('RGBA', (sw, sw), (255, 255, 255, 255)); icon_on(sm, icon, round(sw * 1.05), sw // 2, sw // 2)
    bmp(sm, f'{OUT}/small-gofish-{pct}.bmp')

icon.save(f'{OUT}/gofish.ico', sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print('installer art written to', OUT)
