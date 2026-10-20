# Poker Trainer

Static PWA for 6-max no-limit hold'em practice: preflop charts, range quizzes, pot odds, and outs drills. HTML, CSS, and JavaScript only — no build step.

## Run locally

```bash
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/. The service worker needs `http` or `https`; it will not register from a `file://` URL.

## GitHub Pages

Pushes to `main` deploy the repository root with GitHub Actions. The live site is:

https://mrnofriends-fish.github.io/poker-trainer/

Styles, scripts, icons, `manifest.webmanifest` (`start_url` and `scope`), and the service worker (`sw.js`) all use relative URLs, so the app loads correctly from the `/poker-trainer/` subpath.

Pages is published with **Settings → Pages → Build and deployment → Source: GitHub Actions**.
