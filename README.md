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
4. In Supabase Authentication → URL Configuration:
   - Set **Site URL** to your deployed app URL (e.g. `https://<user>.github.io/<repo>/`)
   - Add **both** `https://<user>.github.io/<repo>` and `https://<user>.github.io/<repo>/` (with and without trailing slash) to **Redirect URLs** — Supabase requires both
5. In Google Cloud Console, add `https://<your-project>.supabase.co/auth/v1/callback` to your OAuth client's **Authorized redirect URIs** - this is only needed once per supabase project (not per listlet repo)
6. For local dev with real backend: copy `config.js` to `config.local.js` and fill in your keys
7. For deployment: add repo **variables** `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` — the deploy workflow generates `config.js` from these.  See 'Deployment' below. (These are public values that ship in `config.js`, so they're Actions *variables*, not secrets.)

## Architecture

- **No build step** — vanilla JS, IIFEs, script tags
- **Single table per app** — see `sql/setup.sql` for schema
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

Push to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. The deploy workflow replaces the empty Supabase placeholders in `config.js` with repo **variables**, then fails the build if either value is still empty (so a misconfigured deploy errors loudly instead of silently shipping mock mode). `APP_TITLE` and `DB_TABLE` are set in `config.js` (by `install.sh` or manually).

### Enable GitHub Pages

1. Go to your repo → Settings → Pages
2. Under **Source**, select **GitHub Actions**

Or via CLI: `gh api repos/<owner>/<repo>/pages -X POST -f build_type=workflow`

### Set up Actions variables

The Supabase URL and publishable (anon) key are **public** — they get baked into
`config.js` and shipped to the browser — so store them as Actions **variables**, not secrets.

1. Go to your repo on GitHub → Settings → Secrets and variables → Actions
2. Under the **Variables** tab, click "New repository variable" and add:
   - `SUPABASE_URL` — your project URL (e.g. `https://xyz.supabase.co`)
   - `SUPABASE_PUBLISHABLE_KEY` — your anon/public key from Supabase → Settings → API

Or via CLI:

```bash
gh variable set SUPABASE_URL --body "https://xyz.supabase.co"
gh variable set SUPABASE_PUBLISHABLE_KEY --body "eyJ..."
```

Your app will be live at `https://<username>.github.io/<repo-name>/`. You can also find the URL in the repo's Settings → Pages, or in the "Environments" section on the repo sidebar.

### Troubleshooting: deployed site is stuck in mock mode

Mock mode = `config.js` has an empty `SUPABASE_URL` (see `shared/api.js`: `isMock = !CONFIG.SUPABASE_URL`).
If the deployed site uses localStorage instead of Supabase, the deploy guard should have failed the
build — but check, in order:

1. **Variables on the wrong repo.** Actions variables are per-repo. Adding them to a *different* repo's
   `github-pages` environment does nothing for this one. Confirm they're on **this** repo.
2. **Stored as secrets, not variables.** The workflow reads `vars.*`. Values added under the **Secrets**
   tab won't be seen — move them to the **Variables** tab.
3. **Pages source is still "Deploy from a branch."** Then GitHub's built-in `pages-build-deployment`
   serves the raw committed branch (empty `config.js`) and ignores this workflow's artifact entirely.
   Set Settings → Pages → Source → **GitHub Actions**. (If you see *both* a `Deploy to GitHub Pages` run
   and a `pages-build-deployment` run in the Actions tab, the source is still on a branch.)

Verify the live file directly: open `https://<username>.github.io/<repo-name>/config.js` and confirm
`SUPABASE_URL` is non-empty.

## What's Replaceable

| File | Purpose | Replace? |
|------|---------|----------|
| `app.js` | App logic (table editor) | Yes — this is your app |
| `app.css` | App styles | Yes |
| `shared/` | Infrastructure | No — shared across apps |
| `index.html` | Entry point | Minor edits (title, extra scripts) |
| `sql/setup.sql` | Database schema | Extend for your app |
