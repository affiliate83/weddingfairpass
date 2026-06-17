# Claude Code Handoff: WeddingFairPass

Last updated: 2026-06-17

You are working on an existing static SEO/affiliate site. Be conservative. This project already has generated search pages and affiliate conversion paths.

## Mandatory First Step

Read these files before editing:

- `docs/PRD.md`
- `docs/PLAN.md`
- `docs/SPEC.md`
- `docs/TASKS.md`
- `docs/TDD.md`
- `docs/AUDIT.md`
- `docs/DECISION.md`

Then execute only the task the user requested.

## Hard Rules

- Do not proceed beyond the requested task.
- Preserve existing behavior unless the task explicitly changes it.
- Do not redesign the site unless a task explicitly asks.
- Do not remove fair rows, region pages, detail pages, sitemap entries, RSS items, or affiliate URLs unless the task explicitly asks.
- Do not change public URL structure without a redirect plan.
- Do not run live external submissions such as IndexNow unless explicitly requested.
- Do not run Replyalba API fetch unless credentials are available and the task explicitly asks.
- Show diff and test results before stopping.

## Current Baseline

- CSV rows: 130.
- Active fair rows: 130.
- Region pages: 9.
- Detail pages: 112.
- Sitemap URLs: 124.
- RSS items: 112.
- Baseline commands currently pass:
  - `npm.cmd run check`
  - `npm.cmd run validate:fairs`
  - `npm.cmd run check:baseline`

## Standard Commands

```powershell
npm.cmd run check                # 구문 검사
npm.cmd run validate:fairs       # 박람회 데이터 필수값 검사
npm.cmd run check:baseline       # 생성 파일 카운트 기준선 확인
```

Build/generate only when the task calls for it:

```powershell
npm.cmd run build:fairs
```

Data refresh (API credentials required):

```powershell
npm.cmd run fetch:replyalba
npm.cmd run apply:replyalba
npm.cmd run build:fairs
npm.cmd run check
npm.cmd run validate:fairs
npm.cmd run check:baseline
```

IndexNow (dry-run only unless task explicitly requests live submit):

```powershell
npm.cmd run submit:indexnow:dry
```

Local preview:

```powershell
npm.cmd run start
```

URL:

```text
http://127.0.0.1:4173/
```

Note: `docs/` and `PROJECT_HANDOFF_*.md` are in `.gitignore` and only exist locally.

## Task Execution Pattern

When the user asks for Task N:

1. Read all handoff docs.
2. Confirm the requested task scope.
3. Inspect relevant files.
4. Make only the required changes.
5. Run the relevant tests from `docs/TDD.md`.
6. Report:
   - Files changed.
   - Behavior preserved.
   - Test command results.
   - Any remaining risks.
7. Stop.

Do not start Task N+1.

## Preferred User Prompt

```text
Read CLAUDE.md and docs/. Proceed with Task 1 only. Do not proceed to Task 2. Keep existing behavior unless the task explicitly changes it. Show diff and test results.
```

