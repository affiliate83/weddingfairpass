# WeddingFairPass Decisions

Last updated: 2026-06-17

## Decision 1: Preservation-first handoff

Decision:

- Claude Code will work one task at a time.
- Existing behavior is preserved unless a task explicitly changes it.

Reason:

- The project already has search-facing URLs and generated SEO assets. Broad rewrites risk losing crawlable pages and affiliate flows.

## Decision 2: Keep `data/fairs.csv` as source of truth

Decision:

- Current fair listings remain CSV-driven.
- API sync may update the CSV, but generated site output still comes from CSV.

Reason:

- CSV is inspectable, easy to back up, and already supported by validation/build scripts.

## Decision 3: Keep generated pages committed for now

Decision:

- Keep `regions/*.html`, `fairs/*.html`, `sitemap.xml`, `rss.xml`, `robots.txt`, and `fairs.generated.js` as generated artifacts in the repo for now.

Reason:

- The deployment publishes the repository root.
- Search assets are part of the current operational structure.
- Removing generated files would be a separate deployment architecture change.

## Decision 4: Do not mutate Replyalba `pt` URLs with UTM parameters

Decision:

- Replyalba affiliate URLs should remain as issued.
- Internal attribution should use site-side tracking and inbound UTM capture.

Reason:

- Prior operating notes treat Replyalba-issued URLs as the reliable conversion surface.

## Decision 5: Audit encoding before fixing text

Decision:

- Do not blindly rewrite garbled Korean strings.
- First determine whether corruption is actual source text, generated output, or terminal display.

Reason:

- Windows/PowerShell rendering can be misleading, but some files may contain real mojibake.

## Decision 6: No external submissions without explicit instruction

Decision:

- Do not run live IndexNow submission or API fetch unless the active task asks for it and credentials/approval exist.

Reason:

- External network operations change production/search state or require secrets.

## Decision 7: Add checks before refactors

Decision:

- Baseline and generated count checks should precede generator refactors.

Reason:

- The largest business risk is accidentally dropping pages, sitemap entries, or affiliate links.

