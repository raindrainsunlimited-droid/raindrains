import subprocess, sys, numpy as np, cv2
from PIL import Image
sys.path.insert(0, '..')

import montage as M  # reuse brand cards, logo watermark and easing from the photo montage
from decap import clean

OUT = sys.argv[1]
W, H, FPS = M.W, M.H, M.FPS
SW, SH = 720, 900          # source frame after rotation
CW = round(SH * W / H)     # 9:16 crop width from a 720x900 frame
MAX_S, CUT_X, CARD_X = 2.3, 5, 12
CAPTION_DY = {4: -34}  # clip 4 has its captions set higher

# (clip, start, end) — crew-at-work and equipment shots only, in story order
SHOTS = [
    (2, 0.6, 3.1),   # excavator on trailer
    (5, 7.5, 8.6),   # excavator on ramp
    (2, 7.33, 10.07),  # crew loading pipe
    (5, 8.6, 9.9),   # mini excavator on site
    (1, 2.5, 5.77),  # excavator digging trench by catch basin
    (3, 0.0, 3.97),  # Ditch Witch across lawn
    (2, 33.6, 35.4),  # setting grade with a level in the trench
    (2, 22.6, 24.93),  # mini excavator in the woods
    (3, 3.97, 6.4),  # cutting and fitting pipe
    (1, 13.7, 16.33),  # Ditch Witch, landscaping job
    (2, 16.37, 19.17),  # leveling by the fence
    (2, 11.8, 13.87),  # working down in the trench
    (2, 29.33, 31.5),  # crew with fittings
    (2, 5.47, 7.33),  # Ditch Witch with operator
    (4, 14.2, 16.13),  # checking trench grade
    (5, 17.37, 18.87),  # dump truck unloading
]

def shot_frames(c, a, b):
    a, b = a + 0.1, b - 0.1
    b = min(b, a + MAX_S)
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', str(a), '-t', str(b - a), '-i', f'c{c}.mp4',
                          '-an', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True, check=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, SH, SW, 3)
    x0 = (SW - CW) // 2
    out = []
    for f in fr:
        f = clean(f.copy(), CAPTION_DY.get(c, 0))[0][:, x0:x0 + CW]
        f = cv2.resize(f, (W, H), interpolation=cv2.INTER_LANCZOS4)
        out.append(M.watermark(Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))))
    return out

ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                       '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow',
                       '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)

segs = [[M.intro] * int(2.4 * FPS)]
segs += [None] * len(SHOTS)
segs.append([M.outro] * int(3.4 * FPS))

prev = None
for i in range(len(segs)):
    cur = segs[i] if segs[i] is not None else shot_frames(*SHOTS[i - 1])
    nx = CARD_X if i in (1, len(segs) - 1) else CUT_X
    start = 0
    if prev is not None:
        tail = prev[-nx:]
        for k in range(nx):
            ff.stdin.write(Image.blend(tail[k], cur[k], M.ease((k + 1) / (nx + 1))).tobytes())
        start = nx
    nxt = CARD_X if i in (0, len(segs) - 2) else CUT_X
    end = len(cur) - nxt if i < len(segs) - 1 else len(cur)
    for k in range(start, end):
        f = cur[k]
        if i == 0 and k < 12:
            f = Image.blend(Image.new('RGB', (W, H), M.NAVY), f, k / 12)
        ff.stdin.write(f.tobytes())
    prev = cur
    print(f'segment {i + 1}/{len(segs)}', flush=True)

ff.stdin.close()
ff.wait()
