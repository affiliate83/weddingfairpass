# WeddingFairPass Claude Code Tasks

Last updated: 2026-06-17

## Global Instruction

Claude Code must read `CLAUDE.md` and all docs in this folder before editing. Execute only the requested task. Do not proceed to the next task. Preserve existing behavior unless the task explicitly changes it. Show diff and test results.

## Task 1: Baseline Audit And Snapshot

Goal: Create a verified baseline before code changes.

Scope:

- Inspect current git status.
- Run baseline commands:
  - `npm.cmd run check`
  - `npm.cmd run validate:fairs`
- Count current CSV rows, active rows, region pages, detail pages, sitemap URLs, and RSS items.
- Inspect generated URL structure without modifying outputs.
- Create or update a baseline note under `docs/` if useful.

Acceptance criteria:

- No source behavior changed.
- Baseline command results are recorded.
- Expected counts are confirmed or discrepancy is explained.
- Claude Code stops after Task 1.

Suggested prompt:

```text
Read CLAUDE.md and docs/. Proceed with Task 1 only. Do not proceed to Task 2. Keep existing behavior unchanged. Show diff and test results.
```

## Task 2: Korean Text And Encoding Audit

Goal: Determine which mojibake-looking Korean strings are actual file corruption versus terminal rendering.

Scope:

- Audit these files first:
  - `campaign-links.js`
  - `data.js`
  - `tools/build-fairs.js`
  - `tools/build-pages.js`
  - existing generated `regions/*.html`
  - existing generated `fairs/*.html`
  - older markdown docs with garbled text
- Use file-based validation or browser rendering instead of trusting PowerShell console output alone.
- Do not rewrite copy broadly unless exact intended Korean text can be recovered from reliable sources.
- Document findings and recommended fixes.

Acceptance criteria:

- Audit lists affected files and user-facing impact.
- No public URL structure changed.
- Baseline commands still pass.
- Claude Code stops after Task 2.

Suggested prompt:

```text
Read CLAUDE.md and docs/. Proceed with Task 2 only. Do not proceed to Task 3. Keep existing behavior unless this task explicitly documents a text-only audit change. Show diff and test results.
```

## Task 3: Add Generation Baseline Checks

Goal: Make future generator edits safer.

Scope:

- Add a lightweight check script or documented command that verifies:
  - active CSV count,
  - region page count,
  - detail page count,
  - sitemap URL count,
  - RSS item count.
- Keep expected counts configurable or clearly documented.
- Do not change generated page content.

Acceptance criteria:

- Existing `npm.cmd run check` still passes.
- New check passes against current baseline.
- No generated output churn unless intentionally explained.
- Claude Code stops after Task 3.

## Task 4: De-Duplicate CSV Parsing Safely

Goal: Reduce maintenance risk from repeated custom CSV parsing.

Scope:

- Identify duplicated CSV parser implementations in tools.
- Extract a shared helper only if output remains byte-stable or differences are fully explained.
- Preserve current validation behavior and generated counts.

Acceptance criteria:

- `npm.cmd run check` passes.
- `npm.cmd run validate:fairs` passes.
- `npm.cmd run build:fairs` produces expected counts.
- Diff does not include unrelated copy/design changes.
- Claude Code stops after Task 4.

## Task 5: SEO Asset Audit

Goal: Verify search exposure structure is stable.

Scope:

- Audit home, region, detail, sitemap, RSS, robots, canonical, OG, JSON-LD, and Netlify redirects.
- Pay special attention to the `/fairs/*` Netlify redirect while detail pages exist.
- Do not change redirects until the audit explains live behavior and risk.

Acceptance criteria:

- Audit lists issues by severity.
- Current URL preservation requirements are explicit.
- Baseline commands pass.
- Claude Code stops after Task 5.

## Task 6: Minimal SEO Fixes

Goal: Apply only fixes approved by the Task 5 audit.

Scope:

- Fix high-confidence SEO issues.
- Preserve all current generated URLs or add explicit redirects.
- Avoid broad page copy rewrites.

Acceptance criteria:

- Baseline commands pass.
- Generated counts are preserved unless explicitly approved.
- Sitemap and robots still use `https://weddingfairpass.com`.
- Claude Code stops after Task 6.

## Task 7: Frontend JS Maintainability

Goal: Improve `app.js` readability without changing UX.

Scope:

- Organize frontend logic into small sections or helpers.
- Preserve all current interactions and tracking events.
- Do not redesign UI.

Acceptance criteria:

- `npm.cmd run check` passes.
- Manual local smoke test covers filter, search, quiz, budget, tarot, saju, and CTA link generation.
- Claude Code stops after Task 7.

## Task 8: Documentation Refresh

Goal: Replace stale/garbled handoff notes with current accurate docs.

Scope:

- Update README or add a clean operator guide.
- Preserve historical docs unless intentionally superseded.
- Include current commands and data refresh process.

Acceptance criteria:

- Operator can refresh data, build, validate, preview, and submit IndexNow dry-run from docs.
- No code behavior changed.
- Claude Code stops after Task 8.

