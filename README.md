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
3. Enable Google OAuth in Authentication > Providers.  See https://github.com/fernandoviton/explore-supabase for more details.
4. For local dev with real backend: copy `config.js` to `config.local.js` and fill in your keys
5. For deployment: add repo secrets `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` — the deploy workflow generates `config.js` from these.  See 'Deployment' below.

## Architecture

- **No build step** — vanilla JS, IIFEs, script tags
- **Single table per app** — see `sql/setup.sql` for schema, isolated by `container` column
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

Push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. The deploy workflow generates `config.js` from `config.js`, replacing the Supabase placeholders with repo secrets. `APP_TITLE` and `APP_CONTAINER` are set in `config.js` (by `install.sh` or manually).

### Set up repo secrets

1. Go to your repo on GitHub → Settings → Secrets and variables → Actions
2. Under **Secrets**, click "New repository secret" and add:
   - `SUPABASE_URL` — your project URL (e.g. `https://xyz.supabase.co`)
   - `SUPABASE_PUBLISHABLE_KEY` — your anon/public key from Supabase → Settings → API

Or via CLI:

```bash
gh secret set SUPABASE_URL --body "https://xyz.supabase.co"
gh secret set SUPABASE_PUBLISHABLE_KEY --body "eyJ..."
```

## What's Replaceable

| File | Purpose | Replace? |
|------|---------|----------|
| `app.js` | App logic (table editor) | Yes — this is your app |
| `app.css` | App styles | Yes |
| `shared/` | Infrastructure | No — shared across apps |
| `index.html` | Entry point | Minor edits (title, extra scripts) |
| `sql/setup.sql` | Database schema | Extend for your app |
