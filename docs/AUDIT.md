# WeddingFairPass Audit

Last updated: 2026-06-17

## Verified In This Planning Pass

- `npm.cmd run check` passes.
- `npm.cmd run validate:fairs` passes.
- `data/fairs.csv` contains 130 rows.
- All 130 fair rows are active.
- Current region pages: 9.
- Current detail pages: 112.
- Current sitemap URLs: 124.
- Current RSS items: 112.
- Home page SEO tags use `https://weddingfairpass.com`.
- Netlify environment sets `SITE_URL=https://weddingfairpass.com`.

## High Priority Risks

### 1. Possible mojibake in source and generated files

Several files display garbled Korean text in PowerShell output, including older docs and some JS/tool files. Some of this may be terminal rendering, but some appears to be actual source text in generated templates and fallback data.

Risk:

- User-facing generated region/detail pages may contain corrupted Korean copy.
- Region mappings can become fragile if code contains corrupted string literals.
- Future edits may accidentally preserve or worsen corrupted text.

Recommended next step:

- Task 2 should audit actual file bytes and browser-rendered output before rewriting text.

### 2. `/fairs/*` Netlify redirect needs careful verification

`netlify.toml` defines a redirect from `/fairs/*` to `/#fairs`, while the project also generates real detail pages under `/fairs/*.html`.

Risk:

- Depending on Netlify shadowing behavior and file existence, some detail URLs could redirect instead of serving SEO pages.

Recommended next step:

- Audit deployed behavior before changing this redirect.

### 3. Generated output has no automated count regression check

Current scripts validate CSV shape and JS syntax, but do not fail if sitemap/detail/region counts unexpectedly change.

Risk:

- A generator refactor can silently drop SEO pages.

Recommended next step:

- Task 3 should add or document a count check.

## Medium Priority Risks

### 4. CSV parsing is duplicated

Multiple tools implement custom CSV parsing.

Risk:

- Bug fixes may be applied inconsistently.
- Quoting and newline edge cases can drift.

Recommended next step:

- Task 4 can extract a shared helper after baseline checks exist.

### 5. Region mapping is duplicated

Region names and codes appear in HTML, campaign links, build scripts, and generated pages.

Risk:

- One file can drift from another.

Recommended next step:

- Keep mappings documented first; consolidate only in a scoped task.

### 6. API sync overwrites fair CSV from national rows plus API rows

`tools/apply-replyalba-api.js` preserves national rows and rewrites API-derived rows.

Risk:

- Manual edits to non-national rows can be overwritten.
- Backups are created, but restore procedure is not documented enough.

Recommended next step:

- Add operator docs before frequent sync work.

## Lower Priority Risks

### 7. Analytics integration is internal only

Events are pushed to `window.dataLayer`, but GA4/Meta Pixel IDs are blank in `data.js`.

Risk:

- Site interactions may not reach external analytics unless tags are installed elsewhere.

Recommended next step:

- Decide later whether analytics should be managed in site code or tag manager.

### 8. Older documentation is stale or garbled

README and handoff docs contain useful history but appear partially garbled in console output and include older script names.

Risk:

- Future agents may follow stale commands.

Recommended next step:

- Task 8 should replace operator guidance with clean current docs.

## Preserve During Fixes

- 130 active fair rows unless a data-refresh task changes them.
- 9 region pages.
- 112 detail pages.
- 124 sitemap URLs.
- Existing region URL paths.
- Existing detail slug rule.
- Existing Replyalba affiliate URLs.
- Existing home interactions and tracking event names.

