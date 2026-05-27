# EMR Elite Navigator — PWA Bundle (v2.4)

Static-site Progressive Web App. Deploy to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3 + CloudFront, etc.). Once installed to the home screen, it works fully offline.

## File layout
```
pwa/
├── index.html                    ← main app
├── manifest.json                 ← PWA manifest
├── sw.js                         ← service worker (offline cache)
└── icons/
    ├── icon.svg                  ← master vector icon
    ├── icon-maskable.svg         ← maskable variant (Android adaptive)
    ├── icon-192.png              ← Android home screen
    ├── icon-512.png              ← splash / store
    ├── icon-maskable-192.png
    ├── icon-maskable-512.png
    ├── icon-120.png / icon-152.png / icon-167.png / icon-180.png
    ├── apple-touch-icon.png      ← iOS home screen (180x180)
    ├── favicon-16.png
    ├── favicon-32.png
    └── favicon.ico
```

## Deploy options

### GitHub Pages (free, easy)
1. Create a new public repo (or branch) and push the contents of `pwa/` to its root
2. Settings → Pages → Source → `main` branch / root → Save
3. Wait ~30 sec, visit `https://<user>.github.io/<repo>/`

### Netlify (drag & drop)
1. Open <https://app.netlify.com/drop>
2. Drag the entire `pwa/` folder onto the page → instant URL

### Cloudflare Pages
1. `npm install -g wrangler` → `wrangler pages deploy pwa/`

### Local test
Run any static server from inside `pwa/`:
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
Service workers require HTTPS (or `localhost`); they will not register from `file://`.

## iPhone / iPad install
1. Open the deployed URL in **Safari** (must be Safari for full PWA support)
2. Tap the **Share** button (square with up arrow)
3. Scroll down → **Add to Home Screen**
4. The icon appears on the home screen
5. Tap to launch — opens **full-screen, no browser chrome**, works offline

## Android install
1. Open the URL in **Chrome**
2. Chrome shows an "Install" banner, or use **⋮ menu → Install app**
3. Launches like a native app

## Updating
When you publish a new build:
1. Replace files in the deployed `pwa/`
2. Bump `CACHE_VERSION` at the top of `sw.js` (e.g. `emr-nav-v2.4-1` → `emr-nav-v2.4-2`)
3. Users will receive the new version on their next launch (service worker self-updates in the background)
