import subprocess, os

FF = "/Users/matveichercovski/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"
D = "/private/tmp/claude-501/-Applications----------------/57db9b25-97ad-4205-8f20-6ed46db2af15/scratchpad"
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

# shots (filled once Cinema Studio 3.0 renders land): hero storm, real CRM scroll, calm premium
HERO = os.path.join(D, "hero.mp4")   # cinematic storm
CRM  = os.path.join(D, "crm_scroll.mp4")
CALM = os.path.join(D, "calm.mp4")   # cinematic premium calm

def esc(p): return p.replace("\\", "\\\\").replace(":", "\\:")

# (file, text, start, end, fontsize, y_frac)
subs = [
    ("t1.txt", "Ты теряешь клиентов.\nПрямо сейчас.",                     0.4, 4.2, 48, 0.70),
    ("t2.txt", "Одна система ловит каждую заявку.\nОтвечает за 5 секунд. 24/7.", 4.9, 8.7, 42, 0.10),
    ("t3.txt", "Я уволил троих —\nа заявок стало больше.",                 9.2, 11.4, 46, 0.66),
    ("t4.txt", "Напиши СИСТЕМА в директ",                                  11.6, 13.8, 46, 0.62),
    ("brand.txt", "UNIQORE — автоматизация бизнеса",                       11.6, 13.8, 30, 0.75),
]
wmf = os.path.join(D, "wm.txt"); open(wmf, "w").write("UNIQORE")
for fn, txt, *_ in subs: open(os.path.join(D, fn), "w").write(txt)

fontf = esc(FONT)
def dt(fn, s, e, fs, yf):
    return (f"drawtext=fontfile='{fontf}':textfile='{esc(os.path.join(D,fn))}':fontsize={fs}:"
            f"fontcolor=white:line_spacing=12:box=1:boxcolor=black@0.55:boxborderw=24:"
            f"x=(w-text_w)/2:y=h*{yf}-text_h/2:enable='between(t,{s},{e})'")
chain = [dt(fn, s, e, fs, yf) for fn, txt, s, e, fs, yf in subs]
chain.append(f"drawtext=fontfile='{fontf}':textfile='{esc(wmf)}':fontsize=26:fontcolor=white@0.6:"
             f"x=w-text_w-40:y=64:enable='between(t,0,14)'")
# snap flashes at cut points (щелчок): hero->crm (4.5s), crm->calm (9.0s)
chain.append("drawbox=x=0:y=0:w=iw:h=ih:color=white@0.9:t=fill:enable='between(t,4.42,4.50)'")
chain.append("drawbox=x=0:y=0:w=iw:h=ih:color=white@0.9:t=fill:enable='between(t,8.92,9.00)'")
chain.append("fade=t=in:st=0:d=0.4")
chain.append("fade=t=out:st=13.5:d=0.5")

# each shot -> 1080x1920, 24fps; hero 4.5s, crm 4.5s, calm 5s
prep = (
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,trim=0:4.5,setpts=PTS-STARTPTS[v0];"
    "[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,trim=0:4.5,setpts=PTS-STARTPTS[v1];"
    "[2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,trim=0:5,setpts=PTS-STARTPTS[v2];"
    "[v0][v1][v2]concat=n=3:v=1:a=0[cv];"
    "[cv]" + ",".join(chain) + "[outv]"
)

out = os.path.join(D, "creative_v3.mp4")
cmd = [FF, "-y", "-i", HERO, "-i", CRM, "-i", CALM,
       "-filter_complex", prep, "-map", "[outv]", "-an",
       "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-r", "24", out]

missing = [p for p in (HERO, CRM, CALM) if not os.path.exists(p)]
if missing:
    print("WAITING for shots:", missing)
else:
    r = subprocess.run(cmd, capture_output=True, text=True)
    print("RC", r.returncode)
    print(r.stderr[-2000:] if r.returncode else "OK -> " + out)
