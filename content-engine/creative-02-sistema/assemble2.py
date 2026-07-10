import subprocess, os

FF = "/Users/matveichercovski/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"
D = "/private/tmp/claude-501/-Applications----------------/57db9b25-97ad-4205-8f20-6ed46db2af15/scratchpad"
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

def esc(p):
    return p.replace("\\", "\\\\").replace(":", "\\:")

# (filename, text, start, end, fontsize, y_fraction)
subs = [
    ("b1.txt", "Твой бизнес тонет в заявках.\nИ теряет клиентов каждый день.", 0.4, 4.6, 44, 0.72),
    ("b2.txt", "Одна система ловит каждую.\nОтвечает за 5 секунд. 24/7.",       5.3, 9.7, 44, 0.83),
    ("b3.txt", "Я уволил троих —\nа заявок стало больше.",                    10.2, 12.7, 46, 0.66),
    ("b4.txt", "Напиши СИСТЕМА в директ",                                      12.8, 14.8, 46, 0.62),
    ("brand.txt", "UNIQORE — автоматизация бизнеса",                          12.8, 14.8, 30, 0.76),
]
wmfile = os.path.join(D, "wm.txt")
with open(wmfile, "w") as f: f.write("UNIQORE")
for fn, txt, *_ in subs:
    with open(os.path.join(D, fn), "w") as f: f.write(txt)

fontf = esc(FONT)
def dt(fn, s, e, fs, yf):
    tf = esc(os.path.join(D, fn))
    return (f"drawtext=fontfile='{fontf}':textfile='{tf}':fontsize={fs}:fontcolor=white:"
            f"line_spacing=12:box=1:boxcolor=black@0.58:boxborderw=24:"
            f"x=(w-text_w)/2:y=h*{yf}-text_h/2:enable='between(t,{s},{e})'")

chain = [dt(fn, s, e, fs, yf) for fn, txt, s, e, fs, yf in subs]
chain.append(f"drawtext=fontfile='{fontf}':textfile='{esc(wmfile)}':fontsize=26:"
             f"fontcolor=white@0.6:x=w-text_w-40:y=64:enable='between(t,0,15)'")
chain.append("fade=t=in:st=0:d=0.4")
chain.append("fade=t=out:st=14.5:d=0.5")

# 3 shots -> 1080x1920, 24fps, 5s each
prep = (
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,trim=0:5,setpts=PTS-STARTPTS[v0];"
    "[1:v]scale=1188:2112,zoompan=z='min(zoom+0.0006,1.12)':x='iw/2-(iw/zoom/2)':y='ih*0.30-(ih/zoom/2)+ih*0.20':d=120:s=1080x1920:fps=24,trim=0:5,setpts=PTS-STARTPTS[v1];"
    "[2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=24,trim=0:5,setpts=PTS-STARTPTS[v2];"
    "[v0][v1][v2]concat=n=3:v=1:a=0[cv];"
    "[cv]" + ",".join(chain) + "[outv]"
)

out = os.path.join(D, "creative_v2.mp4")
cmd = [FF, "-y",
       "-i", os.path.join(D, "hook2.mp4"),
       "-loop", "1", "-framerate", "24", "-t", "5", "-i", os.path.join(D, "dash.png"),
       "-i", os.path.join(D, "v1b.mp4"),
       "-filter_complex", prep,
       "-map", "[outv]", "-an",
       "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "24",
       out]

r = subprocess.run(cmd, capture_output=True, text=True)
print("RC", r.returncode)
if r.returncode != 0:
    print("STDERR TAIL:\n", r.stderr[-2600:])
else:
    print("OK ->", out)
    info = subprocess.run([FF, "-hide_banner", "-i", out], capture_output=True, text=True).stderr
    print(info.split("Duration")[1][:90] if "Duration" in info else "")
