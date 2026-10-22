import subprocess, sys, numpy as np, cv2

from decap import clean

OUT = sys.argv[1]
W, H, FPS = 720, 1280, 30  # web size; the 720x900 sources don't hold more detail than this
SW, SH = 720, 900          # source frame after rotation
CW = round(SH * W / H)     # 9:16 crop width from a 720x900 frame
MAX_S, CUT_X = 2.3, 5
CAPTION_DY = {4: -34}  # clip 4 has its captions set higher

# (clip, start, end) — crew-at-work and equipment shots only; loops seamlessly for the homepage
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
        out.append(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))
    return out

def ease(t):
    return t * t * (3 - 2 * t)

def blend(a, b, t):
    return (a.astype(np.float32) * (1 - t) + b.astype(np.float32) * t).astype(np.uint8)

ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                       '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'veryslow',
                       '-crf', '27', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT],
                      stdin=subprocess.PIPE)

# Start with the tail of the last shot dissolving into the first, and stop before that tail,
# so the end of the file flows straight back into its start when the video loops.
prev = shot_frames(*SHOTS[-1])[-CUT_X:]
last = None
for i, shot in enumerate(SHOTS):
    cur = shot_frames(*shot)
    for k in range(CUT_X):
        ff.stdin.write(blend(prev[k], cur[k], ease((k + 1) / (CUT_X + 1))).tobytes())
    for f in cur[CUT_X:len(cur) - CUT_X]:
        ff.stdin.write(f.tobytes())
    prev = cur[-CUT_X:]
    if i == 0:
        cv2.imwrite(OUT.rsplit('.', 1)[0] + '-poster.jpg', cv2.cvtColor(cur[CUT_X], cv2.COLOR_RGB2BGR),
                    [cv2.IMWRITE_JPEG_QUALITY, 80])
    print(f'shot {i + 1}/{len(SHOTS)}', flush=True)

ff.stdin.close()
ff.wait()
