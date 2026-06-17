# WeddingFairPass Plan

Last updated: 2026-06-17

## Strategy

This is an existing SEO/affiliate project, so the plan is preservation-first. Claude Code should reverse-check the current baseline, then make small maintainability improvements without changing public behavior. The work must proceed one task at a time.

## Current Architecture

1. Static site shell:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data.js`
   - `campaign-links.js`
   - `assets/`

2. Data source:
   - `data/fairs.csv`
   - Optional fetched API cache: `data/replyalba-wedding-api.json`
   - Historical backups: `data/fairs.before-api-*.csv`

3. Generated outputs:
   - `fairs.generated.js`
   - `regions/*.html`
   - `fairs/*.html`
   - `sitemap.xml`
   - `rss.xml`
   - `robots.txt`

4. Tooling:
   - `tools/validate-fairs.js`
   - `tools/build-fairs.js`
   - `tools/build-pages.js`
   - `tools/fetch-replyalba-wedding-api.js`
   - `tools/apply-replyalba-api.js`
   - `tools/submit-indexnow.js`
   - `server.js`

5. Deployment:
   - Netlify publish root: `.`
   - Netlify build command: `npm run build:fairs`
   - Netlify `SITE_URL`: `https://weddingfairpass.com`

## Execution Phases

### Phase 0: Baseline Preservation

- Confirm clean/dirty git status.
- Run baseline commands.
- Record generated counts.
- Capture current public URL assumptions.
- Do not change behavior.

### Phase 1: Safety And Encoding Audit

- Identify files that contain mojibake or suspicious Korean text corruption.
- Determine whether corruption is only terminal rendering or actual source text.
- Do not rewrite text until the audit is explicit.

### Phase 2: Generator Reliability

- Reduce duplicated CSV parsing only after baseline is protected.
- Keep generated output counts stable.
- Keep slug rules and filtering rules stable.

### Phase 3: SEO Surface Hardening

- Verify canonical, sitemap, RSS, robots, JSON-LD, and Netlify redirects.
- Preserve all region and detail URLs.
- Add checks before changing generated HTML.

### Phase 4: Frontend Maintainability

- Improve client-side JS structure only after generator and SEO checks are stable.
- Preserve UI behavior, tracking events, and affiliate URL behavior.

## Implementation Rules

- Do only the active task.
- Do not proceed to the next task in the same Claude Code run.
- Preserve current behavior unless the task explicitly changes it.
- Report files changed, key diff summary, and command results.
- Do not run external network commands unless the task explicitly requires it and the user approves.
- Do not submit IndexNow except on explicit request.

## Baseline Commands

```powershell
npm.cmd run check
npm.cmd run validate:fairs
```

Optional local preview:

```powershell
npm.cmd run start
```

Open:

```text
http://127.0.0.1:4173/
```

## Data Refresh Commands

Only run these when the task explicitly asks for API sync:

```powershell
npm.cmd run fetch:replyalba
npm.cmd run apply:replyalba
npm.cmd run build:fairs
```

Required environment variables for fetch:

- `REPLYALBA_API_ID`
- `REPLYALBA_API_KEY`
- Optional: `REPLYALBA_API_URL`
- Optional: `REPLYALBA_CAMPAIGN_CODE`

