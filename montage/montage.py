import glob, subprocess, sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

REPO = '/home/user/raindrains/src/img'
W, H, FPS = 1080, 1920, 30
PHOTO_S, XFADE_S, CARD_S = 1.9, 0.4, 2.6
NAVY, GREEN, WHITE = (11, 43, 74), (24, 150, 83), (255, 255, 255)
F = '/usr/share/fonts/opentype/inter/'
font = lambda w, s: ImageFont.truetype(F + f'Inter-{w}.otf', s)

logo = Image.open(f'{REPO}/logo-transparent.png').convert('RGBA')

def ease(t):
    return t * t * (3 - 2 * t)

def centered(d, y, text, f, fill):
    w = d.textlength(text, font=f)
    d.text(((W - w) / 2, y), text, font=f, fill=fill)

def card(lines, sub=None):
    img = Image.new('RGB', (W, H), NAVY)
    d = ImageDraw.Draw(img)
    lw = 860
    lg = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    y = 640
    img.paste(lg, ((W - lw) // 2, y), lg)
    y += lg.height + 80
    d.rectangle(((W - 140) // 2, y, (W + 140) // 2, y + 8), fill=GREEN)
    y += 70
    for text, f, fill in lines:
        centered(d, y, text, f, fill)
        y += f.size + 30
    return img

intro = card([('Drainage done right.', font('Bold', 72), WHITE),
              ('Hampton Roads & NE North Carolina', font('Medium', 42), (169, 193, 218))])
outro = card([('Call for a free estimate', font('Medium', 52), (169, 193, 218)),
              ('757-807-0080', font('Black', 110), WHITE),
              ('Lifetime warranty on all drainage systems', font('Medium', 38), (169, 193, 218))])

def prep(path):
    src = Image.open(path).convert('RGB')
    # Cover-fill source at 1.12x so Ken Burns has room to move
    s = max(W / src.width, H / src.height) * 1.12
    if src.width > src.height:
        # Landscape: blurred cover background + full-width photo on top
        bg = src.resize((int(src.width * s * 1.3), int(src.height * s * 1.3)))
        bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2,
                      (bg.width + W) // 2, (bg.height + H) // 2))
        bg = Image.blend(bg.filter(ImageFilter.GaussianBlur(40)), Image.new('RGB', (W, H), NAVY), 0.45)
        fg = src.resize((W, int(src.height * W / src.width)), Image.LANCZOS)
        bg.paste(fg, (0, (H - fg.height) // 2))
        src, s = bg, 1.12
    return src.resize((int(src.width * s), int(src.height * s)), Image.LANCZOS)

def kb(big, t, i):
    # Alternate zoom-in / zoom-out with a slight drift
    z = 1 + 0.10 * (t if i % 2 == 0 else 1 - t)
    # crop window size in big-image pixels so output is W x H
    scale = (big.width / W) if big.width / W < big.height / H else (big.height / H)
    cw, ch = W * scale / z, H * scale / z
    dx = (big.width - cw) * (0.5 + (0.25 if i % 3 == 0 else -0.25 if i % 3 == 1 else 0) * (t - 0.5) * 2)
    dy = (big.height - ch) * (0.5 + (0.2 if i % 2 else -0.2) * (t - 0.5))
    return big.resize((W, H), Image.BILINEAR, box=(dx, dy, dx + cw, dy + ch))

def watermark(frame):
    frame.paste(BAND, (0, 0), BAND)
    frame.paste(WM, ((W - WM.width) // 2, 70), WM)
    return frame

WM = logo.resize((300, int(logo.height * 300 / logo.width)), Image.LANCZOS)
BAND = Image.new('RGBA', (W, 240), (0, 0, 0, 0))
for y in range(240):
    ImageDraw.Draw(BAND).line([(0, y), (W, y)], fill=(0, 0, 0, int(140 * (1 - y / 240))))
if __name__ == '__main__':
    OUT = sys.argv[1]
    photos = sorted(glob.glob(f'{REPO}/gallery/large/*.jpg'))

    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                           '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
                           '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)

    # Each segment is a function t(0..1)->frame plus a duration; adjacent segments crossfade
    segs = [(lambda t: intro, CARD_S)]
    for i, p in enumerate(photos):
        big = prep(p)
        segs.append(((lambda big, i: (lambda t: watermark(kb(big, t, i))))(big, i), PHOTO_S))
    segs.append((lambda t: outro, CARD_S + 1))

    nx = int(XFADE_S * FPS)
    def frames(seg):
        fn, dur = seg
        n = int(dur * FPS)
        return n, (lambda k: fn(k / (n - 1)))

    prev_tail = None
    for si, seg in enumerate(segs):
        n, get = frames(seg)
        start = 0
        if prev_tail is not None:
            for k in range(nx):
                a = ease((k + 1) / (nx + 1))
                ff.stdin.write(Image.blend(prev_tail(k), get(k), a).tobytes())
            start = nx
        end = n - nx if si < len(segs) - 1 else n
        for k in range(start, end):
            f = get(k)
            if si == 0 and k < 12:
                f = Image.blend(Image.new('RGB', (W, H), NAVY), f, k / 12)
            ff.stdin.write(f.tobytes())
        prev_tail = (lambda get, off: (lambda k: get(off + k)))(get, n - nx)
        print(f'segment {si + 1}/{len(segs)}', flush=True)

    ff.stdin.close()
    ff.wait()
