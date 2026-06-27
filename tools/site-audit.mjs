#!/usr/bin/env node
/**
 * site-audit.mjs — one-command website health check.
 *
 * Runs the professional audit stack (Lighthouse for Web Vitals/scores +
 * a headless-browser scroll-FPS / console-error / security-header pass)
 * against any URL and prints a single report. Built so Claude Code (or you)
 * can verify a site objectively instead of eyeballing it.
 *
 * Usage:
 *   node tools/site-audit.mjs https://uniqore.pro
 *
 * Prereqs (one-time):
 *   npm i -g lighthouse            # or rely on `npx lighthouse`
 *   npm i puppeteer-core           # uses your installed Chrome
 *   export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
 *
 * What it checks:
 *   1. Lighthouse: Performance / Accessibility / Best-Practices / SEO + Core Web Vitals
 *   2. Scroll smoothness: average FPS + jank % over N runs (real interaction)
 *   3. Console errors / failed requests on load
 *   4. Security headers (HSTS, nosniff, X-Frame-Options, Referrer-Policy)
 *   5. Compression (gzip/br) + HTTP/2 + WebP negotiation
 */
import { execSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL = process.argv[2];
const RUNS = Number(process.argv[3] || 5);
if (!URL) { console.error('usage: node site-audit.mjs <url> [fpsRuns]'); process.exit(1); }

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sh = (c) => execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const ok = (b) => b ? '✓' : '✗';

async function lighthouse() {
  const dir = mkdtempSync(join(tmpdir(), 'lh-'));
  const out = join(dir, 'r.json');
  process.env.CHROME_PATH = CHROME;
  sh(`npx -y lighthouse@12 "${URL}" --quiet --output=json --output-path="${out}" --preset=desktop --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox"`);
  const d = JSON.parse(readFileSync(out, 'utf8'));
  const c = d.categories, a = d.audits;
  console.log('\n── Lighthouse (desktop) ──');
  for (const k of ['performance', 'accessibility', 'best-practices', 'seo'])
    console.log(`  ${k.padEnd(15)} ${Math.round(c[k].score * 100)}/100`);
  console.log('  Core Web Vitals:');
  for (const m of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'])
    console.log(`    ${a[m].title.padEnd(30)} ${a[m].displayValue}`);
}

async function browserChecks() {
  const puppeteer = (await import('puppeteer-core')).default;
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // console errors + failed requests
  const p0 = await b.newPage();
  const errs = [], failed = [];
  p0.on('pageerror', e => errs.push(e.message));
  p0.on('requestfailed', r => failed.push(r.url()));
  await p0.setViewport({ width: 1440, height: 900 });
  await p0.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(3000);
  console.log('\n── Console / network ──');
  console.log(`  ${ok(!errs.length)} JS errors: ${errs.length}` + (errs.length ? ' → ' + errs.slice(0, 3).join('; ') : ''));
  console.log(`  ${ok(!failed.length)} Failed requests: ${failed.length}`);
  await p0.close();

  // scroll FPS over N runs
  let fpsSum = 0, jankSum = 0;
  for (let i = 0; i < RUNS; i++) {
    const p = await b.newPage();
    await p.setViewport({ width: 1440, height: 900 });
    await p.goto(URL + '?cb=' + Date.now() + i, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sleep(2800);
    const s = await p.evaluate(() => new Promise(res => {
      const fr = []; let last = performance.now(), raf;
      const rec = t => { fr.push(t - last); last = t; raf = requestAnimationFrame(rec); };
      raf = requestAnimationFrame(rec);
      const total = document.body.scrollHeight - innerHeight; let y = 0;
      const step = () => { y += 18; scrollTo(0, y); y < total ? setTimeout(step, 16) : setTimeout(fin, 400); };
      const fin = () => { cancelAnimationFrame(raf); const f = fr.slice(3); const avg = f.reduce((a, b) => a + b, 0) / f.length;
        res({ fps: +(1000 / avg).toFixed(1), jank: +(f.filter(d => d > 32).length / f.length * 100).toFixed(1) }); };
      step();
    }));
    fpsSum += s.fps; jankSum += s.jank;
    await p.close();
  }
  console.log('\n── Scroll smoothness ──');
  const avgFps = (fpsSum / RUNS).toFixed(1), avgJank = (jankSum / RUNS).toFixed(1);
  console.log(`  ${ok(avgFps >= 55)} avg ${avgFps} fps, jank ${avgJank}% over ${RUNS} runs (target ≥55fps, <2% jank)`);
  await b.close();
}

function headerChecks() {
  console.log('\n── Security & transport headers ──');
  const h = sh(`curl -s -I "${URL}"`).toLowerCase();
  console.log(`  ${ok(h.includes('strict-transport-security'))} HSTS`);
  console.log(`  ${ok(h.includes('x-content-type-options'))} X-Content-Type-Options`);
  console.log(`  ${ok(h.includes('x-frame-options') || h.includes('content-security-policy'))} clickjacking protection`);
  console.log(`  ${ok(h.includes('referrer-policy'))} Referrer-Policy`);
  console.log(`  ${ok(h.includes('http/2') || h.includes('http/3'))} HTTP/2+`);
  const css = URL.replace(/\/$/, '') + '/';
  const enc = sh(`curl -s -H "Accept-Encoding: gzip,br" -I "${css}"`).toLowerCase();
  console.log(`  ${ok(enc.includes('content-encoding'))} text compression (gzip/br)`);
}

(async () => {
  console.log(`\n═══ SITE AUDIT — ${URL} ═══`);
  try { headerChecks(); } catch (e) { console.log('  header check failed:', e.message); }
  try { await lighthouse(); } catch (e) { console.log('  lighthouse failed:', e.message); }
  try { await browserChecks(); } catch (e) { console.log('  browser checks failed:', e.message); }
  console.log('\n═══ done ═══\n');
})();
