"""16:9 services showcase: crew footage, one chapter per service with job photos, trust stats, CTA.

Usage: python3 montage/showcase.py out.mp4   (run from the repo root)
"""
import subprocess, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

OUT = sys.argv[1]
W, H, FPS = 1920, 1080, 30
XF = 10  # crossfade frames between segments
NAVY, GREEN, WHITE, SKY = (11, 43, 74), (24, 150, 83), (255, 255, 255), (169, 193, 218)
F = '/usr/share/fonts/opentype/inter/'
font = lambda w, s: ImageFont.truetype(F + f'Inter-{w}.otf', s)
ORIG = 'src/img-originals/'
LEFT = 'src/img-originals/service-photo-leftovers/'
FOOTAGE = 'montage/crew-loop.mp4'   # caption-free crew footage, 720x1280

logo = Image.open('montage/logo-hires.png').convert('RGBA')  # clean cutout from make_logo.py

def ease(t):
    t = min(max(t, 0), 1)
    return t * t * (3 - 2 * t)

def scaled_logo(w):
    return logo.resize((w, int(logo.height * w / logo.width)), Image.LANCZOS)

def wrap(d, text, f, width):
    lines, cur = [], ''
    for word in text.split():
        trial = (cur + ' ' + word).strip()
        if d.textlength(trial, font=f) <= width or not cur:
            cur = trial
        else:
            lines.append(cur); cur = word
    return lines + [cur]

def text_layer(items, t, x0, y0, width):
    """items: (text, font, color, gap_after). Each line slides in from the left, staggered."""
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    y, i = y0, 0
    for text, f, color, gap in items:
        for line in wrap(d, text, f, width):
            a = ease((t - i * 0.06) / 0.25)
            d.text((x0 - 50 * (1 - a), y), line, font=f, fill=color + (int(255 * a),))
            y += int(f.size * 1.18); i += 1
        y += gap
    return layer

# ---------- footage ----------
# Clean (non-transition) shot windows inside crew-loop.mp4, in seconds
SHOT = {
    'trailer': (0.17, 2.13), 'loading_pipe': (3.03, 5.00), 'mini_ex': (5.17, 5.93),
    'digging': (6.10, 8.07), 'ditchwitch_lawn': (8.23, 10.20), 'grade_level': (10.37, 11.63),
    'ex_woods': (11.80, 13.60), 'cut_pipe': (13.77, 15.67), 'ditchwitch_land': (15.83, 17.80),
    'level_fence': (17.97, 19.93), 'in_trench': (20.10, 21.63), 'fittings': (21.80, 23.43),
    'ditchwitch_op': (23.60, 24.93), 'check_grade': (25.10, 26.50), 'dump_truck': (26.67, 27.63),
}
TILE_W = W // 3

def load_shot(name, w, h):
    a, b = SHOT[name]
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', str(a), '-t', str(b - a), '-i', FOOTAGE,
                          '-vf', f'scale={w}:-2,crop={w}:{h}', '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)

def triptych(names, n):
    """Three clips side by side, slowed to fill n frames."""
    clips = [load_shot(s, TILE_W, H) for s in names]
    def frame(k):
        row = [c[min(int(k * len(c) / n), len(c) - 1)] for c in clips]
        img = np.concatenate(row, axis=1)
        return Image.fromarray(img)
    return frame

def darken(img, top=0.55, bottom=0.8):
    grad = np.linspace(top, bottom, H, dtype=np.float32)[:, None, None]
    navy = np.array(NAVY, np.float32)
    a = np.asarray(img, np.float32)
    return Image.fromarray((a * (1 - grad) + navy * grad).astype(np.uint8))

def footage_title(names, secs, items, logo_w=None, center=True):
    n = int(secs * FPS); vid = triptych(names, n)
    lg = scaled_logo(logo_w) if logo_w else None
    def frame(k):
        t = k / n * secs
        img = darken(vid(k)).convert('RGBA')
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        y = H // 2 - (sum(f.size * 1.2 for _, f, _, _ in items) + (lg.height + 60 if lg else 0)) // 2
        if lg:
            a = ease(t / 0.6)
            l2 = lg.copy(); l2.putalpha(l2.getchannel('A').point(lambda v: int(v * a)))
            layer.alpha_composite(l2, ((W - lg.width) // 2, int(y + 30 * (1 - a))))
            y += lg.height + 60
        for i, (text, f, color, delay) in enumerate(items):
            a = ease((t - delay) / 0.5)
            tw = d.textlength(text, font=f)
            d.text(((W - tw) / 2, y + 24 * (1 - a)), text, font=f, fill=color + (int(255 * a),))
            y += int(f.size * 1.2)
        img.alpha_composite(layer)
        return img.convert('RGB')
    return frame, n

def duotone(a, mix=0.3):
    """Grade footage into a navy-to-ice-blue duotone, keeping a little of the original color."""
    lum = (a[..., 0] * 0.3 + a[..., 1] * 0.59 + a[..., 2] * 0.11)[..., None] / 255
    lo, hi = np.array((4, 18, 36), np.float32), np.array((196, 232, 252), np.float32)
    return (lo + (hi - lo) * lum ** 1.1) * (1 - mix) + a * mix

def opener(names, secs, lines, logo_w=1100, logo_cy=.33):
    """Rain over graded sliding panels, logo wipe with a light sweep, then lines that track in.
    lines: (text, font, color, delay, spacing_from, spacing_to, gap_above)"""
    n = int(secs * FPS)
    clips = [load_shot(s, TILE_W, H) for s in names]
    rng = np.random.default_rng(7)
    drops = [(rng.uniform(-200, W), rng.uniform(0, H), rng.uniform(28, 52), rng.uniform(30, 90), rng.uniform(.25, .7))
             for _ in range(260)]   # x, y0, speed px/frame, length, alpha
    ripples = [(rng.uniform(80, W - 80), rng.uniform(H * .72, H - 30), rng.uniform(0, secs)) for _ in range(26)]
    lg = scaled_logo(logo_w)
    la = np.asarray(lg.getchannel('A'), np.float32) / 255
    xs = np.arange(lg.width, dtype=np.float32)[None, :]
    ys = np.arange(lg.height, dtype=np.float32)[:, None]

    def tracked(d, text, f, y, spacing, color):
        widths = [d.textlength(c, font=f) for c in text]
        x = (W - (sum(widths) + spacing * (len(text) - 1))) / 2
        for c, w in zip(text, widths):
            d.text((x, y), c, font=f, fill=color); x += w + spacing

    def frame(k):
        t = k / FPS
        # three graded panels slide in from alternating directions, then slowly push in
        canvas = np.zeros((H, W, 3), np.float32); canvas[:] = (3, 12, 24)
        for i, c in enumerate(clips):
            p = ease((t - i * 0.14) / 0.75)
            if p <= 0:
                continue
            tile = duotone(c[min(int(k * len(c) / n), len(c) - 1)].astype(np.float32), 0.25 + 0.2 * ease((t - 2) / 1.5))
            off = int((1 - p) * H) * (1 if i % 2 == 0 else -1)
            y0, y1 = max(off, 0), min(H + off, H)
            canvas[y0:y1, i * TILE_W + 3:(i + 1) * TILE_W - 3] = tile[y0 - off:y1 - off, 3:TILE_W - 3]
        # vignette, darker behind the title
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        if not hasattr(frame, 'vig'):
            r = np.sqrt(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H / 2) / (H * .62)) ** 2)
            frame.vig = (np.clip(1.15 - r, 0.25, 1) * (1 - 0.35 * np.exp(-((yy - H * .47) / (H * .22)) ** 2)))[..., None]
        canvas *= frame.vig
        z = 1 + 0.05 * k / n
        img = Image.fromarray(canvas.clip(0, 255).astype(np.uint8))
        cw, ch = W / z, H / z
        img = img.resize((W, H), Image.BILINEAR, box=((W - cw) / 2, (H - ch) / 2, (W + cw) / 2, (H + ch) / 2)).convert('RGBA')

        # rain streaks and splash ripples
        rain = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(rain)
        for x, y0, sp, ln, al in drops:
            y = (y0 + sp * k) % (H + ln) - ln
            xo = x + 0.18 * (y + ln)
            d.line((xo, y, xo + 0.18 * ln, y + ln), fill=(210, 236, 255, int(255 * al)), width=2)
        for x, y, t0 in ripples:
            age = t - t0
            if 0 < age < 0.6:
                r = 6 + 70 * age; a = int(170 * (1 - age / 0.6))
                d.ellipse((x - r, y - r * .28, x + r, y + r * .28), outline=(210, 236, 255, a), width=2)
        img.alpha_composite(rain)

        # logo: soft left-to-right wipe, then a light sweep across the letters
        rev = ease((t - 0.9) / 0.9) * (lg.width + 160)
        mask = np.clip((rev - xs) / 160, 0, 1) * np.ones_like(ys)
        glint_x = (t - 1.7) / 0.8 * (lg.width + 600) - 300
        band = np.clip(1 - np.abs(xs + 0.35 * ys - glint_x) / 90, 0, 1)
        logo_rgba = np.asarray(lg, np.float32).copy()
        logo_rgba[..., :3] += band[..., None] * 200
        logo_rgba[..., 3] = la * mask * 255
        ly = int(H * logo_cy - lg.height / 2 + 18 * (1 - ease((t - .9) / 1.0)))
        img.alpha_composite(Image.fromarray(logo_rgba.clip(0, 255).astype(np.uint8)), ((W - lg.width) // 2, ly))

        # green rule grows out from the center, then each line tracks in from wide letterspacing
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        g = ease((t - 1.6) / 0.6) * 260
        y = ly + lg.height + 40
        d.rectangle((W / 2 - g, y, W / 2 + g, y + 5), fill=GREEN + (255,))
        for text, f, color, delay, sp0, sp1, gap in lines:
            a = ease((t - delay) / 0.9)
            y += gap
            tracked(d, text, f, y, sp0 + (sp1 - sp0) * a, color + (int(255 * a),))
            y += f.size
        img.alpha_composite(layer)
        return img.convert('RGB')
    return frame, n

# ---------- service chapters ----------
SERVICES = [
    ('French Drain Installation', 'Custom French drains that redirect groundwater away from your foundation for good.',
     [ORIG + 'french-drain.jpg']),
    ('Residential Drainage', 'Catch basins, buried downspout extensions and condensate lines that stop water before it saturates your lawn.',
     [LEFT + 'residential2.jpg', ORIG + 'residential3.jpg']),
    ('Downspout Extensions', 'Smooth-wall underground downspout systems that carry roof runoff far from your foundation, not just a few inches.',
     [LEFT + 'residential.jpg', ORIG + 'drain1.jpg']),
    ('Commercial Drainage', 'PVC and HDPE stormwater networks for HOAs, multi-family and commercial properties.',
     [ORIG + 'commercial3.jpg', LEFT + 'commercial.jpg']),
    ('Concrete Drains', 'Channel drains and interceptor grates that catch runoff across driveways, patios and parking lots.',
     [ORIG + 'concrete-drain.jpg']),
    ('Grading Services', 'Precision earth-moving and leveling so heavy coastal runoff flows away from your property.',
     [ORIG + 'Leveling.jpg', ORIG + 'grading2.jpg']),
    ('Outdoor Sump Pumps', 'Systems that lift rising groundwater off flat, low-lying properties where gravity alone can’t drain.',
     [ORIG + 'sump-pumps.jpg', LEFT + 'sump2.jpg']),
    ('Culvert Pipe Installation', 'Culverts built to handle heavy coastal runoff and withstand vehicle traffic for decades.',
     [ORIG + 'culvert.jpg', LEFT + 'culvert2.jpg']),
    ('Gravel Driveways', 'Multi-layer stone bases and heavy compaction, so your driveway stays solid instead of rutting or washing out.',
     [ORIG + 'driveway-gravel.jpg', LEFT + 'gravel2.jpg']),
    ('Trenching Service', 'Utility trenching for electrical, water, gas and fiber lines, dug to municipal depth codes.',
     [ORIG + 'Trenching.jpg']),
    ('Landscape Excavation', 'Site clearing and structural dirt work, built to handle both weight and water.',
     [ORIG + 'erosion-rap.jpg', LEFT + 'zoysiasod.jpg']),
    ('Pool Liner Protection', 'Hydrostatic relief systems that stop rising groundwater from floating or tearing your vinyl liner.',
     [ORIG + 'pool-drain.jpg', LEFT + 'pool drain 2.jpg']),
]
PX = 860             # photo panel starts here
PW = W - PX

def load_photo(path, w, h, over=1.1):
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    s = max(w / im.width, h / im.height) * over
    return im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)

def kb_crop(big, w, h, t, seed):
    z = 1 + 0.08 * (t if seed % 2 == 0 else 1 - t)
    sc = min(big.width / w, big.height / h) / z
    cw, ch = w * sc, h * sc
    dx = (big.width - cw) * (0.5 + 0.3 * (t - 0.5) * (1 if seed % 3 else -1))
    dy = (big.height - ch) * 0.5
    return big.resize((w, h), Image.BILINEAR, box=(dx, dy, dx + cw, dy + ch))

def service(idx, name, desc, photos, secs=10.0):
    n = int(secs * FPS)
    bigs = [load_photo(p, PW, H) for p in photos]
    bg = load_photo(photos[0], W, H, 1.0)
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width + W) // 2, (bg.height + H) // 2))
    bg = Image.blend(bg.filter(ImageFilter.GaussianBlur(30)), Image.new('RGB', (W, H), NAVY), 0.72)
    lg = scaled_logo(260)
    items = [('WHAT WE DO', font('Bold', 26), (94, 201, 138), 18),
             (name, font('Black', 76), WHITE, 26),
             (desc, font('Medium', 34), (207, 224, 245), 0)]
    half = n // 2
    def frame(k):
        t = k / n
        img = bg.copy()
        # up to two photos per chapter, dissolving at the midpoint
        a = kb_crop(bigs[0], PW, H, t, idx)
        if len(bigs) > 1 and k > half - 8:
            b = kb_crop(bigs[1], PW, H, t, idx + 1)
            a = Image.blend(a, b, ease((k - (half - 8)) / 16))
        img.paste(a, (PX, 0))
        d = ImageDraw.Draw(img)
        d.rectangle((PX - 8, 0, PX, H), fill=GREEN)
        img = img.convert('RGBA')
        img.alpha_composite(lg, (110, 90))
        img.alpha_composite(text_layer(items, k / FPS, 110, 330, PX - 200))
        bar = int(120 * ease(k / FPS / 0.4))
        ImageDraw.Draw(img).rectangle((110, 300, 110 + bar, 306), fill=GREEN)
        return img.convert('RGB')
    return frame, n

def stats(names, secs):
    n = int(secs * FPS); vid = triptych(names, n)
    cells = [('5.0 ★', 'Google rating'), ('100+', 'Google reviews'), ('Lifetime', 'warranty on all drainage systems'), ('Fully', 'insured crews')]
    big, small = font('Black', 92), font('Medium', 30)
    def frame(k):
        t = k / FPS
        img = darken(vid(k), 0.72, 0.85).convert('RGBA')
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        a0 = ease(t / 0.4)
        hd = 'WHY HOMEOWNERS CHOOSE RAIN DRAINS'; hf = font('Black', 64)
        hx = (W - d.textlength(hd, font=hf)) / 2
        d.text((hx + 3, 223), hd, font=hf, fill=(0, 0, 0, int(160 * a0)))   # soft shadow for contrast
        d.text((hx, 220), hd, font=hf, fill=WHITE + (int(255 * a0),))
        g = 200 * a0
        d.rectangle((W / 2 - g, 315, W / 2 + g, 321), fill=GREEN + (int(255 * a0),))
        cw = W // 4
        for i, (b, s) in enumerate(cells):
            a = ease((t - 0.25 - i * 0.18) / 0.45)
            cx = cw * i + cw // 2; y = 420 + 30 * (1 - a)
            d.text((cx - d.textlength(b, font=big) / 2, y), b, font=big, fill=WHITE + (int(255 * a),))
            for j, line in enumerate(wrap(d, s, small, cw - 80)):
                d.text((cx - d.textlength(line, font=small) / 2, y + 125 + j * 38), line, font=small, fill=SKY + (int(255 * a),))
        img.alpha_composite(layer)
        return img.convert('RGB')
    return frame, n

# ---------- timeline ----------
def timeline():
    yield opener(['digging', 'ditchwitch_lawn', 'loading_pipe'], 5.0, [
        ('DRAINAGE DONE RIGHT.', font('Black', 54), WHITE, 1.9, 70, 12, 40),
        ('HAMPTON ROADS  ·  NORTHEAST NORTH CAROLINA', font('Bold', 24), SKY, 2.5, 9, 9, 31)])
    yield footage_title(['ex_woods', 'cut_pipe', 'level_fence'], 3.0, [
        ('COMPLETE DRAINAGE & EXCAVATION SOLUTIONS', font('Black', 58), WHITE, 0.1),
        ('Residential · Commercial · HOA', font('Medium', 40), SKY, 0.4)])
    groups = [(0, 4), (4, 8), (8, len(SERVICES))]
    breaks = [(['ditchwitch_op', 'in_trench', 'check_grade'], 'OUR CREW. OUR EQUIPMENT. DONE RIGHT.'),
              (['trailer', 'ditchwitch_land', 'fittings'], 'FROM SITE SURVEY TO FINAL RESTORATION')]
    for g, (a, b) in enumerate(groups):
        for i in range(a, b):
            yield service(i + 1, *SERVICES[i])
        if g < len(breaks):
            names, line = breaks[g]
            yield footage_title(names, 2.6, [(line, font('Black', 58), WHITE, 0.15)])
    yield stats(['grade_level', 'mini_ex', 'dump_truck'], 4.0)
    yield opener(['ex_woods', 'ditchwitch_land', 'check_grade'], 6.5, [
        ('CALL TODAY FOR A FREE ESTIMATE', font('Bold', 34), SKY, 1.8, 30, 8, 40),
        ('757-807-0080', font('Black', 124), WHITE, 2.1, 60, 6, 22),
        ('RAINDRAINSVA.COM', font('Black', 40), (94, 201, 138), 2.6, 34, 10, 26),
        ('HAMPTON ROADS  ·  NORTHEAST NORTH CAROLINA', font('Bold', 24), SKY, 3.0, 9, 9, 30)],
        logo_w=900, logo_cy=.22)

ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                       '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23',
                       '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
NSEG = 2 + len(SERVICES) + 2 + 2  # openers, chapters, crew breaks, stats + outro
prev_tail = None
for si, (fn, n) in enumerate(timeline()):  # lazy, so only one segment's footage is in memory
    start = 0
    if prev_tail is not None:
        for k in range(XF):
            ff.stdin.write(Image.blend(prev_tail[k], fn(k), ease((k + 1) / (XF + 1))).tobytes())
        start = XF
    end = n - XF if si < NSEG - 1 else n
    for k in range(start, end):
        f = fn(k)
        if si == 0 and k < 15:
            f = Image.blend(Image.new('RGB', (W, H), (0, 0, 0)), f, k / 15)
        if si == NSEG - 1 and k > n - 15:
            f = Image.blend(f, Image.new('RGB', (W, H), NAVY), (k - (n - 15)) / 15)
        ff.stdin.write(f.tobytes())
    prev_tail = [fn(k) for k in range(n - XF, n)]
    print(f'segment {si + 1}/{NSEG}', flush=True)
ff.stdin.close(); ff.wait()
