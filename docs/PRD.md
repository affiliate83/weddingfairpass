# WeddingFairPass PRD

Last updated: 2026-06-17

## Product Summary

WeddingFairPass is a static Korean affiliate site for wedding fair discovery. It helps couples compare active wedding fair schedules by region, use lightweight planning tools, and move to Replyalba affiliate application pages for free-entry registration.

The project must keep its current SEO footprint intact while improving maintainability and reliability. Existing fair data, region pages, detail pages, sitemap, RSS feed, robots file, and search exposure structure are preservation requirements.

## Goals

1. Preserve the current production-facing site behavior and SEO URL structure.
2. Keep `data/fairs.csv` as the source of truth for fair listings.
3. Keep generated outputs reproducible through npm scripts.
4. Make the project safer for Claude Code to modify one task at a time.
5. Improve confidence through baseline tests, generation checks, and audit notes before feature work.

## Current Baseline

- Brand/site: WeddingFairPass / 웨딩페어패스.
- Production domain: `https://weddingfairpass.com`.
- Fair data source: `data/fairs.csv`.
- Current CSV rows: 130.
- Current active fair rows: 130.
- Current regions: 서울, 경기, 인천, 부산, 충청, 전라, 강원, 경상, 제주.
- Current generated region pages: 9.
- Current generated detail pages: 112.
- Current sitemap URLs: 124.
- Current RSS items: 112.
- Current validation commands passing:
  - `npm.cmd run check`
  - `npm.cmd run validate:fairs`

## Primary Users

- Engaged couples looking for free-entry wedding fair schedules by region.
- Site operator managing Replyalba campaign data and affiliate links.
- Search visitors entering through region/detail pages.
- Future implementation agent, especially Claude Code, modifying the project in small controlled steps.

## Core User Flows

1. Search visitor lands on home page.
2. User filters or searches fair cards by region, venue, title, summary, or tags.
3. User opens a region page such as `/regions/seoul.html`.
4. User opens a detail page such as `/fairs/api-kcp5zpks00.html`.
5. User clicks a Replyalba affiliate CTA for free-entry registration.
6. User uses engagement tools:
   - Couple style quiz.
   - Wedding tarot draw.
   - Couple saju compatibility.
   - Wedding budget calculator.
7. Tracking events are pushed to `window.dataLayer`.

## Preserved Behavior

Do not break or remove these behaviors unless a task explicitly says so:

- `index.html` remains the main landing page.
- `regions/*.html` remains the region SEO page structure.
- `fairs/*.html` remains the generated detail page structure.
- `sitemap.xml`, `rss.xml`, and `robots.txt` are generated from current data.
- `fairs.generated.js` exposes active fair records as `window.WEDDING_FAIRS`.
- `data.js` falls back to built-in fair examples if `window.WEDDING_FAIRS` is missing.
- `campaign-links.js` stores national Replyalba campaign URLs and region codes.
- CTAs using `data-national-link` append the selected/recommended region code and `/hit`.
- Individual fair cards use each fair row's `affiliateUrl`.
- Search and region filtering on the home page stay client-side.
- Existing `data-track` events continue to push to `window.dataLayer`.
- Replyalba `pt` URLs should not receive arbitrary UTM parameters.
- Netlify build command remains `npm run build:fairs`.
- `SITE_URL` defaults to `https://weddingfairpass.com` for generated SEO assets.
- Naver/Google search assets must remain available at root paths.

## Non-Goals For The First Cleanup Pass

- No redesign.
- No new monetization channel.
- No new API provider.
- No removal of existing fair rows.
- No URL structure migration.
- No broad rewrite of the frontend.
- No automatic external submission unless explicitly requested.

## Success Criteria

- Claude Code can read `CLAUDE.md` and execute Task 1 without guessing.
- Each implementation task is narrow, testable, and stops before the next task.
- Baseline validation remains green after each task.
- Current sitemap and generated page counts are intentionally preserved unless a task documents a deliberate data change.
- Any future code changes include a diff summary and command output summary.

