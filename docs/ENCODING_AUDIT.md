# WeddingFairPass Encoding Audit

Performed: 2026-06-17 (Task 2)

## Summary

**No actual file-level Korean text corruption found.** All source, generated, and documentation files are valid UTF-8 without BOM. The "garbled Korean text in PowerShell output" referenced in AUDIT.md was a terminal rendering artifact, not file corruption.

---

## Verdict Per File Group

### Source JS files

| File | Encoding | BOM | Korean text | Status |
|---|---|---|---|---|
| `campaign-links.js` | UTF-8 | No BOM | Clean (region map) | OK |
| `data.js` | UTF-8 | No BOM | Clean (fallback fairs, quiz, tarot, saju copy) | OK |
| `app.js` | UTF-8 | No BOM | Clean (UI strings, region constants) | OK |
| `tools/build-fairs.js` | UTF-8 | No BOM | Clean (region codes, filter strings) | OK |
| `tools/build-pages.js` | UTF-8 | No BOM | Clean (HTML templates, FAQ copy, guide copy) | OK |
| `fairs.generated.js` | UTF-8 | No BOM | Clean (generated from CSV) | OK |

### Data

| File | Encoding | BOM | Korean text | Status |
|---|---|---|---|---|
| `data/fairs.csv` | UTF-8 | **No BOM** | Clean | OK for generators — see note below |

**CSV BOM note:** The generators strip BOM with `.replace(/^﻿/, "")` if present, so no-BOM CSV works correctly. However, opening `data/fairs.csv` directly in Excel on Windows will show garbled Korean if Excel auto-detects the encoding as cp949. This is an Excel workflow limitation, not file corruption. Recommend: when editing the CSV in Excel, use "Data → From Text/CSV → UTF-8" import instead of double-clicking.

### Generated HTML

| File | Encoding | Korean text | Status |
|---|---|---|---|
| `regions/seoul.html` | UTF-8 | Clean — title, h1, meta, nav, cards, FAQ all correct | OK |
| `regions/busan.html` | UTF-8 | Clean | OK |
| `fairs/api-kcp5zpks00.html` | UTF-8 | Clean — title, breadcrumb, JSON-LD, detail sections all correct | OK |
| All `regions/*.html` (9 files) | UTF-8 | Spot-checked seoul, busan — consistent with generator | OK |
| All `fairs/*.html` (112 files) | UTF-8 | Consistent with generator — no template corruption | OK |

### Markdown documentation

| File | Status | Notes |
|---|---|---|
| `README.md` | Clean text | Stale commands (see below) |
| `PROJECT_HANDOFF_2026-05-25.md` | Clean text | Stale commands (see below) |
| `affiliate_site_build_reference.md` | Clean text | — |
| `affiliate_project_execution_plan.md` | Clean text | — |
| `docs/ripplealba-integration-checklist.md` | Clean text | — |
| `docs/replyalba-national-wedding-campaign-guide.md` | Clean text | — |
| `docs/weddingmoment-benchmark.md` | Clean text | — |
| `docs/deploy-and-promotion-checklist.md` | Clean text | Stale counts (see below) |
| `docs/threads-30day-calendar.md` | Clean text | — |

---

## Root Cause of the "Garbled" Report in AUDIT.md

The original audit note said: "Several files display garbled Korean text in PowerShell output."

This was a **terminal rendering artifact**, not file-level corruption. Windows PowerShell can default to cp949 (EUC-KR) output encoding in some sessions, making UTF-8 Korean bytes appear as random Latin/symbol characters in the terminal — even though the file bytes are correct UTF-8. In the current environment, `[Console]::OutputEncoding` is UTF-8, so Korean displays correctly.

Evidence: grep for actual mojibake byte patterns (`\x80-\x9F`, double-encoded UTF-8 sequences) found **zero matches** across all JS, HTML, CSS, and MD files.

---

## Stale Documentation Findings (Not Encoding Corruption)

These are content accuracy issues, not text corruption. No fix needed for Task 2.

### 1. `docs/deploy-and-promotion-checklist.md` — stale page counts

Written when the site had fewer pages. Current numbers are higher:

| Metric | Doc says | Actual (Task 1) |
|---|---|---|
| Detail pages | 105 | 112 |
| Sitemap URLs | 117 | 124 |

Recommended action (Task 8): Update the checklist counts and consolidate operator docs.

### 2. `README.md` — references removed script

`README.md` references `npm.cmd run convert:ripplealba` and `data/ripplealba-campaigns-template.csv`.

The `convert:ripplealba` script **does not exist** in the current `package.json`. Current scripts are:

```
validate:fairs, build:fairs, build:data, build:pages,
fetch:replyalba, apply:replyalba, sync:replyalba,
submit:indexnow, submit:indexnow:dry, start, check
```

The README reflects an older workflow before the Replyalba API integration replaced the manual CSV conversion step.

Recommended action (Task 8): Rewrite README to document the current workflow.

### 3. `PROJECT_HANDOFF_2026-05-25.md` — references old tooling

References `tools/convert-ripplealba.js` and `data/ripplealba-campaigns-template.csv`. Both are from the pre-API-integration phase and are no longer part of the current toolchain.

Recommended action (Task 8): This file can be preserved as historical context, but operator guidance should come from updated docs.

---

## User-Facing Impact

No user-facing impact from encoding. All generated region pages, detail pages, sitemap, RSS, and robots.txt contain valid UTF-8 Korean text that will render correctly in all modern browsers.

---

## Recommended Next Fixes

| Priority | Issue | Suggested Task |
|---|---|---|
| Low | `docs/deploy-and-promotion-checklist.md` stale counts | Task 8 (doc refresh) |
| Low | `README.md` stale commands (`convert:ripplealba`) | Task 8 (doc refresh) |
| Low | `data/fairs.csv` no BOM (Excel editing risk) | Operator note only; no code change needed |
| Low | `PROJECT_HANDOFF_2026-05-25.md` stale tooling refs | Task 8 (doc refresh) — preserve as history |

No code, SEO URL structure, fair data, generated counts, affiliate links, sitemap, RSS, or robots changes are needed from this audit.

---

## Test Results

| Command | Result |
|---|---|
| `npm.cmd run check` | **PASS** |
| `npm.cmd run validate:fairs` | **PASS** — "Validated 130 fair rows. Active: 130" |

Baseline counts unchanged: 130 CSV rows, 130 active, 9 region pages, 112 detail pages, 124 sitemap URLs, 112 RSS items.
