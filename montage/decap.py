import cv2, numpy as np, glob
Y0_, Y1_ = 412, 495   # rows holding the burned-in caption (720x900 frame)

def mask_for(img, dy=0):
    Y0, Y1 = Y0_ + dy, Y1_ + dy
    band = img[Y0:Y1]
    hsv = cv2.cvtColor(band, cv2.COLOR_BGR2HSV)
    white = (hsv[..., 2] > 195) & (hsv[..., 1] < 80)
    yellow = (hsv[..., 0] > 18) & (hsv[..., 0] < 38) & (hsv[..., 1] > 110) & (hsv[..., 2] > 180)
    m = ((white | yellow).astype(np.uint8)) * 255
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    # glyphs: modest size, vertically inside the caption line
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if 8 <= h <= 60 and w <= 90 and a >= 15 and y >= 3 and y + h <= Y1 - Y0 - 2:
            keep[lab == i] = 255
    # caption is one centered run of glyphs: keep the cluster around the center
    cols = np.where(keep.any(0))[0]
    if len(cols) == 0:
        return np.zeros(img.shape[:2], np.uint8)
    xs = sorted(set(cols)); groups = [[xs[0], xs[0]]]
    for x in xs[1:]:
        if x - groups[-1][1] <= 30: groups[-1][1] = x
        else: groups.append([x, x])
    cx = img.shape[1] / 2
    g = min(groups, key=lambda g: abs((g[0] + g[1]) / 2 - cx))
    # captions are centered, so mirror the farthest glyph edge to get the full word span,
    # then take every caption-colored pixel inside it (glyphs touching scene whites included)
    d = max(cx - g[0], g[1] - cx) + 4
    keep = m.copy(); keep[:, :max(int(cx - d), 0)] = 0; keep[:, int(cx + d):] = 0
    keep = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    full = np.zeros(img.shape[:2], np.uint8); full[Y0 - 6:Y1 + 6] = cv2.copyMakeBorder(keep, 6, 6, 0, 0, cv2.BORDER_CONSTANT)
    return full

def clean(img, dy=0):
    m = mask_for(img, dy)
    return cv2.inpaint(img, m, 9, cv2.INPAINT_TELEA), m

if __name__ == '__main__':
    rows = []
    for f in sorted(glob.glob('t_*.png')):
        img = cv2.imread(f); out, m = clean(img)
        rows.append(np.hstack([img, cv2.cvtColor(m, cv2.COLOR_GRAY2BGR), out])[360:540])
    cv2.imwrite('decap_test.png', cv2.resize(np.vstack(rows), None, fx=0.6, fy=0.6))
