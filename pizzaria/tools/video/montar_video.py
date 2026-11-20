"""Monta o vídeo promocional a partir de cenas.json (clipes Pexels + foto + legendas + cartela + trilha).
Uso: python3 tools/video/montar_video.py --fontes <pasta_clipes> --overlays <pasta_png> --trilha <wav> --saida <pasta>
Gera: promo_16x9_1080p.mp4, promo_9x16_1080x1920.mp4, hero_720p.mp4 (sem som, sem legendas) e hero_poster.webp"""
import argparse, json, pathlib, subprocess, tempfile, shutil
ap = argparse.ArgumentParser()
for a in ("fontes", "overlays", "trilha", "saida"): ap.add_argument("--" + a, required=True)
A = ap.parse_args()
base = pathlib.Path(__file__).resolve().parents[2]
CJ = json.loads((base / "tools/video/cenas.json").read_text()); cenas = CJ["cenas"]
FPS, XF = 30, 0.4
src, ov, out = pathlib.Path(A.fontes), pathlib.Path(A.overlays), pathlib.Path(A.saida); out.mkdir(parents=True, exist_ok=True)
tmp = pathlib.Path(tempfile.mkdtemp())
GRADE = "colorbalance=rs=.03:gs=.01:bs=-.04,eq=contrast=1.05:saturation=1.1"
def run(cmd): subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
def fonte(c, tag):
    fs = sorted(src.glob(f"{c['fonte']}-uhd.mp4")) if tag == "v" else []
    return fs[0] if fs else sorted(src.glob(f"{c['fonte']}-*.mp4"))[0]

def segmento(c, W, H, tag, legenda, k):
    d = c["dur"]; o = tmp / f"{tag}_{k}.mp4"
    if c.get("end"):
        png = ov / f"{tag}_end.png"
        vf = f"scale={W*2}:{H*2},zoompan=z='1.0+0.0006*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={int(d*FPS)}:s={W}x{H}:fps={FPS}"
        run(["ffmpeg", "-y", "-loop", "1", "-i", str(png), "-t", str(d), "-vf", vf + ",format=yuv420p", "-r", str(FPS), "-c:v", "libx264", "-crf", "14", "-preset", "fast", str(o)])
        return o
    cx, cy, cw, ch = c["crop_" + tag]
    zoom = 1.08
    if c.get("foto"):
        img = base / "img" / f"{c['foto']}-1600.webp"
        vf = (f"crop=iw*{cw}:ih*{ch}:iw*{cx}:ih*{cy},scale={int(W*zoom*2)}:{int(H*zoom*2)},"
              f"zoompan=z='1.0+0.0022*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={int(d*FPS)}:s={W}x{H}:fps={FPS},"
              f"eq=brightness='0.035*sin(t*11)+0.02*sin(t*5.3)':saturation=1.12:eval=frame,{GRADE}")
        inp = ["-loop", "1", "-t", str(d), "-i", str(img)]
    else:
        f = fonte(c, tag)
        vf = (f"crop=iw*{cw}:ih*{ch}:iw*{cx}:ih*{cy},scale={int(W*zoom)}:{int(H*zoom)}:flags=lanczos,fps={FPS},"
              f"crop={W}:{H}:x='(iw-{W})*(0.15+0.7*t/{d})':y='(ih-{H})/2',{GRADE}")
        inp = ["-ss", str(c["in"]), "-t", str(d), "-i", str(f)]
    cmd = ["ffmpeg", "-y", *inp]
    if legenda:
        cmd += ["-loop", "1", "-t", str(d), "-i", str(ov / f"{tag}_{c['id']}.png")]
        fc = (f"[0:v]{vf},setsar=1[b];[1:v]format=rgba,fade=in:st=0.35:d=0.45:alpha=1,fade=out:st={d-0.75}:d=0.4:alpha=1[t];"
              f"[b][t]overlay=0:0:format=auto,format=yuv420p[v]")
        cmd += ["-filter_complex", fc, "-map", "[v]"]
    else:
        cmd += ["-vf", vf + ",setsar=1,format=yuv420p"]
    cmd += ["-an", "-t", str(d), "-r", str(FPS), "-c:v", "libx264", "-crf", "14", "-preset", "fast", str(o)]
    run(cmd); return o

def juntar(segs, durs, saida, audio, crf, extra=()):
    cmd = ["ffmpeg", "-y"]
    for s in segs: cmd += ["-i", str(s)]
    if audio: cmd += ["-i", str(audio)]
    fc, last, acc = [], "[0:v]", 0.0
    for i in range(1, len(segs)):
        acc += durs[i - 1] - XF
        trans = "fade" if i < len(segs) - 1 else "fadeblack"
        fc.append(f"{last}[{i}:v]xfade=transition={trans}:duration={XF}:offset={acc:.3f}[x{i}]"); last = f"[x{i}]"
    total = sum(durs) - XF * (len(segs) - 1)
    fc.append(f"{last}fade=in:st=0:d=0.35,fade=out:st={total-0.45:.3f}:d=0.45,format=yuv420p[v]")
    cmd += ["-filter_complex", ";".join(fc), "-map", "[v]"]
    if audio:
        cmd += ["-map", f"{len(segs)}:a", "-c:a", "aac", "-b:a", "192k", "-shortest"]
    else:
        cmd += ["-an"]
    cmd += ["-c:v", "libx264", "-profile:v", "high", "-crf", str(crf), "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", *extra, str(saida)]
    run(cmd); return total

for tag, W, H, nome in (("h", 1920, 1080, "promo_16x9_1080p.mp4"), ("v", 1080, 1920, "promo_9x16_1080x1920.mp4")):
    segs = [segmento(c, W, H, tag, True, k) for k, c in enumerate(cenas)]
    t = juntar(segs, [c["dur"] for c in cenas], out / nome, A.trilha, 20)
    print(nome, round(t, 2), "s")
# Hero do site: sem legendas, sem cartela, sem som, 1280x720 leve
por_id = {c["id"]: c for c in cenas}
hc = [por_id[i] for i in CJ.get("hero_ordem", [])] or [c for c in cenas if not c.get("end")]
segs = [segmento(c, 1280, 720, "h", False, f"hero{k}") for k, c in enumerate(hc)]
t = juntar(segs, [c["dur"] for c in hc], out / "hero_720p.mp4", None, 27, ("-maxrate", "1.6M", "-bufsize", "3M"))
run(["ffmpeg", "-y", "-ss", "0.6", "-i", str(out / "hero_720p.mp4"), "-frames:v", "1", "-c:v", "libwebp", "-quality", "70", str(out / "hero_poster.webp")])
shutil.rmtree(tmp); print("hero", round(t, 2), "s")
