import subprocess, os

FF = "/Users/matveichercovski/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"
D = "/private/tmp/claude-501/-Applications----------------/57db9b25-97ad-4205-8f20-6ed46db2af15/scratchpad"
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

# (filename, text, start, end, fontsize, y_fraction)
subs = [
    ("s1.txt",  "Твой бизнес теряет\nклиентов каждую ночь", 0.4, 4.9, 46, 0.70),
    ("s2a.txt", "Заявка пришла в 2 ночи",                    5.2, 7.5, 46, 0.70),
    ("s2b.txt", "Ты ответил в 10 утра.\nКлиент ушёл к конкуренту", 7.6, 9.9, 44, 0.70),
    ("s3a.txt", "Бот отвечает за 5 секунд.\nБез тебя. 24/7",  10.2, 12.6, 46, 0.70),
    ("s3b.txt", "Напиши СИСТЕМА в директ",                    12.75, 14.9, 44, 0.64),
    ("brand.txt", "UNIQORE — автоматизация бизнеса",          12.75, 14.9, 30, 0.78),
]
wm = ("wm.txt", "UNIQORE")

def esc(p):
    return p.replace("\\", "\\\\").replace(":", "\\:")

for fn, txt, *_ in subs:
    with open(os.path.join(D, fn), "w") as f:
        f.write(txt)
with open(os.path.join(D, wm[0]), "w") as f:
    f.write(wm[1])

fontf = esc(FONT)

def dt(fn, s, e, fs, yfrac):
    tf = esc(os.path.join(D, fn))
    return (f"drawtext=fontfile='{fontf}':textfile='{tf}':fontsize={fs}:"
            f"fontcolor=white:line_spacing=12:"
            f"box=1:boxcolor=black@0.55:boxborderw=22:"
            f"x=(w-text_w)/2:y=h*{yfrac}-text_h/2:"
            f"enable='between(t,{s},{e})'")

chain = [dt(fn, s, e, fs, yf) for fn, txt, s, e, fs, yf in subs]
# watermark top-right, subtle, whole video
wmtf = esc(os.path.join(D, wm[0]))
chain.append(f"drawtext=fontfile='{fontf}':textfile='{wmtf}':fontsize=26:"
             f"fontcolor=white@0.55:x=w-text_w-40:y=64:enable='between(t,0,15)'")
# fades
chain.append("fade=t=in:st=0:d=0.4")
chain.append("fade=t=out:st=14.5:d=0.5")

filt = ("[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[cv][ca];"
        "[cv]" + ",".join(chain) + "[outv];"
        "[ca]afade=t=in:st=0:d=0.3,afade=t=out:st=14.5:d=0.5[outa]")

out = os.path.join(D, "creative_v1.mp4")
cmd = [FF, "-y",
       "-i", os.path.join(D, "hook.mp4"),
       "-i", os.path.join(D, "pain.mp4"),
       "-i", os.path.join(D, "v1b.mp4"),
       "-filter_complex", filt,
       "-map", "[outv]", "-map", "[outa]",
       "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "24",
       "-c:a", "aac", "-b:a", "160k",
       out]

r = subprocess.run(cmd, capture_output=True, text=True)
print("RC", r.returncode)
if r.returncode != 0:
    print("STDERR TAIL:\n", r.stderr[-2500:])
else:
    print("OK ->", out)
    print(subprocess.run([FF, "-hide_banner", "-i", out], capture_output=True, text=True).stderr.split("Duration")[1][:120] if os.path.exists(out) else "no file")
