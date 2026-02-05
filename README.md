# AppEnglish PWA Starter (verbs)

## Requirements
- Node.js 18+ (recommended 20+)

## Install & Run
```bash
npm install
npm run dev
```

## Build (PWA)
```bash
npm run build
npm run preview
```

## Notes about images
If your `verbs.json` contains *page URLs* (e.g. `unsplash.com/photos/...`), the app tries to convert them to `images.unsplash.com` direct links.
For best offline performance, store images locally in `public/images/` and set `"image": "/images/<file>.jpg"`.

