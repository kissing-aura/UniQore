# tools/

Dev/ops utilities (not served — nginx blocks /tools/).

## site-audit.mjs
One-command website health check: Lighthouse (Web Vitals + scores), scroll-FPS
smoothness, console errors, security headers, gzip/HTTP2/WebP.

```
npm i puppeteer-core
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node tools/site-audit.mjs https://uniqore.pro 10
```
