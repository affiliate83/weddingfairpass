# WeddingFairPass Technical Spec

Last updated: 2026-06-17

## Public Routes

- `/`
- `/index.html`
- `/privacy.html`
- `/contact.html`
- `/regions/seoul.html`
- `/regions/gyeonggi.html`
- `/regions/incheon.html`
- `/regions/busan.html`
- `/regions/chungcheong.html`
- `/regions/jeolla.html`
- `/regions/gangwon.html`
- `/regions/gyeongsang.html`
- `/regions/jeju.html`
- `/fairs/*.html`
- `/sitemap.xml`
- `/rss.xml`
- `/robots.txt`
- `/indexnow-4f79e7f4c7d74e3b9b0b0d22d0ecce44.txt`

## CSV Schema

`data/fairs.csv` is the source of truth. Required columns:

- `id`
- `region`
- `title`
- `venue`
- `date`
- `tags`
- `summary`
- `badge`
- `affiliateUrl`
- `status`

Additional columns currently used:

- `imageUrl`
- `address`

Rules:

- Active rows must have all required values.
- `affiliateUrl` must start with `http://` or `https://`.
- Tags are pipe-separated.
- Duplicate IDs are invalid.
- Rows with `status !== active` are not rendered in active outputs.

## Region Model

Supported regions:

- 서울 -> `seoul`
- 경기 -> `gyeonggi`
- 인천 -> `incheon`
- 부산 -> `busan`
- 충청 -> `chungcheong`
- 전라 -> `jeolla`
- 강원 -> `gangwon`
- 경상 -> `gyeongsang`
- 제주 -> `jeju`

These regions must remain aligned across:

- `index.html` region tabs.
- `index.html` region link row.
- `campaign-links.js`.
- `tools/build-fairs.js`.
- `tools/build-pages.js`.
- Generated `regions/*.html`.

## Generation Rules

`npm.cmd run build:fairs` runs:

```powershell
node tools/build-fairs.js
node tools/build-pages.js
```

`tools/build-fairs.js`:

- Reads `data/fairs.csv`.
- Filters active rows.
- Writes `fairs.generated.js`.
- Adds `regionPath` for known regions.
- Adds `detailPath` for rows considered detail-worthy.

`tools/build-pages.js`:

- Reads `data/fairs.csv`.
- Cleans generated HTML in `regions/` and `fairs/`.
- Generates 9 region pages.
- Generates detail pages for active non-national fairs with concrete date and venue.
- Generates `sitemap.xml`.
- Generates `rss.xml`.
- Generates `robots.txt`.

Current expected generated counts:

- Region pages: 9.
- Detail pages: 112.
- Sitemap URLs: 124.
- RSS items: 112.

## Detail Page Slugs

Detail slugs are derived from fair IDs:

- Lowercase the ID.
- Remove leading `ra-wedding-`.
- Replace non-alphanumeric runs with `-`.
- Trim leading/trailing `-`.

Do not change this rule without a redirect plan.

## Affiliate Link Rules

- National campaign bases live in `campaign-links.js`.
- Region-specific national URLs are built as:

```text
{baseUrl}/{regionCode}/hit
```

- Individual fair rows use their own `affiliateUrl`.
- Replyalba `pt` URLs should remain untouched by arbitrary UTM parameters.
- Internal site tracking should use `dataLayer`, not mutation of Replyalba URLs.

## Frontend Behavior

Home page scripts load in this order:

1. `campaign-links.js`
2. `fairs.generated.js`
3. `data.js`
4. `app.js`

`app.js` behavior:

- Parses inbound UTM parameters.
- Pushes events to `window.dataLayer`.
- Updates national CTA links by region.
- Renders fair cards from `fairs`.
- Supports region filter buttons.
- Supports text search.
- Renders FAQ list.
- Appends JSON-LD for home page data.
- Handles mobile nav toggle.
- Handles couple style quiz.
- Handles budget calculator.
- Handles tarot draw.
- Handles saju compatibility.

## Tracking Events

Current events include:

- `page_view`
- `region_filter`
- `fair_search`
- `fair_apply`
- `region_fair_apply`
- `detail_fair_apply`
- `quiz_answer`
- `test_complete`
- `budget_change`
- `budget_cta`
- `tarot_complete`
- `saju_complete`
- `quiz_result_cta`
- `saju_result_cta`
- plus CTA-specific `data-track` values in markup.

## Deployment Spec

Netlify:

- Build command: `npm run build:fairs`.
- Publish directory: repository root.
- `SITE_URL`: `https://weddingfairpass.com`.
- Headers:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- Redirects:
  - `https://www.weddingfairpass.com/*` -> `https://weddingfairpass.com/:splat`
  - `/fairs/*` -> `/#fairs`

The `/fairs/*` redirect must be audited carefully before changing because static detail pages also exist.

