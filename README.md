# listlet-shared

A starter kit for building collaborative web apps with Supabase. Ships as a fully working table viewer/editor that doubles as a template.

## Quick Start (Local Dev)

```bash
git clone <this-repo>
cd listlet-shared
npm install
python -m http.server 8000
```

Open http://localhost:8000 — mock mode activates automatically (localStorage, no auth).

## Creating a New App

```bash
./install.sh ~/src/my-app myapp "My App Title"
cd ~/src/my-app
npm install
python -m http.server 8000
```

Then replace `app.js` and `app.css` with your own logic. Everything in `shared/` stays.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `sql/setup.sql` in the SQL Editor
3. Enable Google OAuth in Authentication > Providers
4. Copy `config.example.js` to `config.js` (for production) or `config.local.js` (for local dev with real backend)
5. Fill in `SUPABASE_URL` and `SUPABASE_KEY`

## Architecture

- **No build step** — vanilla JS, IIFEs, script tags
- **Single `lists` table** — all apps share it, isolated by `container` column
- **Mock mode** — localStorage on localhost, no backend needed
- **Auth** — Google OAuth via Supabase, auto-bypassed in mock mode
- **Realtime** — Supabase Realtime subscriptions + polling fallback

## Testing

```bash
npm test          # Jest unit tests
npm run test:e2e  # Playwright E2E tests
npm run test:all  # Both
```

## Deployment

Push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. Ensure `config.js` exists at the root with your Supabase credentials.

## What's Replaceable

| File | Purpose | Replace? |
|------|---------|----------|
| `app.js` | App logic (table editor) | Yes — this is your app |
| `app.css` | App styles | Yes |
| `shared/` | Infrastructure | No — shared across apps |
| `index.html` | Entry point | Minor edits (title, extra scripts) |
| `sql/setup.sql` | Database schema | Extend for your app |
