# WeddingFairPass Baseline Snapshot

Verified: 2026-06-17 (Task 1)

## Command Results

| Command | Result |
|---|---|
| `npm.cmd run check` | PASS (JS syntax clean across all tool and app files) |
| `npm.cmd run validate:fairs` | PASS — "Validated 130 fair rows. Active: 130" |

## Count Verification

| Metric | Expected (docs) | Actual |
|---|---|---|
| CSV rows | 130 | 130 |
| Active rows | 130 | 130 |
| Region pages | 9 | 9 |
| Detail pages | 112 | 112 |
| Sitemap URLs | 124 | 124 |
| RSS items | 112 | 112 |

All counts match documented baseline exactly.

## URL Structure Verified

Region pages (`regions/*.html`):

- busan.html
- chungcheong.html
- gangwon.html
- gyeonggi.html
- gyeongsang.html
- incheon.html
- jeju.html
- jeolla.html
- seoul.html

Sitemap domain: `https://weddingfairpass.com` (confirmed).

robots.txt: allows all, references `https://weddingfairpass.com/sitemap.xml`.

## Key File Status

| File | Status |
|---|---|
| `fairs.generated.js` | EXISTS — contains `window.WEDDING_FAIRS` (2733 lines) |
| `campaign-links.js` | EXISTS |
| `sitemap.xml` | EXISTS |
| `rss.xml` | EXISTS |
| `robots.txt` | EXISTS |

## Git Status

- Branch: `main`, up to date with `origin/main`.
- Only untracked file: `CLAUDE.md` (not yet committed).
- No staged or unstaged modifications to tracked files.

## Open Risks (from AUDIT.md, not addressed in Task 1)

1. Possible mojibake in source/generated files — to be addressed in Task 2.
2. `/fairs/*` Netlify redirect may shadow static detail pages — to be audited in Task 5.
3. No automated count regression check — to be added in Task 3.
