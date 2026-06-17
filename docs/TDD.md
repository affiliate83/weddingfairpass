# WeddingFairPass TDD And Verification Plan

Last updated: 2026-06-17

## Testing Philosophy

This project is a static SEO/affiliate site, so tests should protect generated outputs and user-facing flows. Start with baseline checks before refactoring. Add focused tests only where a task touches behavior.

## Always Run

```powershell
npm.cmd run check
npm.cmd run validate:fairs
```

## Baseline Count Check

Current expected values:

- CSV rows: 130.
- Active rows: 130.
- Region pages: 9.
- Detail pages: 112.
- Sitemap URLs: 124.
- RSS items: 112.

Suggested PowerShell check:

```powershell
$fairs = Import-Csv -Path data\fairs.csv
$active = @($fairs | Where-Object { $_.status -eq 'active' })
$regionPages = @(Get-ChildItem regions -Filter *.html)
$detailPages = @(Get-ChildItem fairs -Filter *.html)
$sitemapUrls = ([regex]::Matches((Get-Content sitemap.xml -Raw), '<loc>')).Count
$rssItems = ([regex]::Matches((Get-Content rss.xml -Raw), '<item>')).Count
[pscustomobject]@{
  Rows = $fairs.Count
  Active = $active.Count
  RegionPages = $regionPages.Count
  DetailPages = $detailPages.Count
  SitemapUrls = $sitemapUrls
  RssItems = $rssItems
} | Format-List
```

## Generator Verification

After any generator change:

```powershell
npm.cmd run build:fairs
npm.cmd run check
npm.cmd run validate:fairs
```

Then confirm:

- `fairs.generated.js` exists and contains `window.WEDDING_FAIRS`.
- `regions/*.html` count remains 9.
- `fairs/*.html` count remains expected.
- `sitemap.xml` contains `https://weddingfairpass.com`.
- `robots.txt` points to `https://weddingfairpass.com/sitemap.xml`.
- `rss.xml` has detail-page items.

## Manual Smoke Test

Run:

```powershell
npm.cmd run start
```

Open:

```text
http://127.0.0.1:4173/
```

Check:

- Home page loads.
- Hero CTAs point to Replyalba national links with region code.
- Region tabs filter cards.
- Search field filters cards.
- Region links open generated pages.
- A detail page opens.
- Fair CTA opens the fair row's affiliate URL.
- Couple quiz completes and shows result.
- Budget calculator updates total.
- Tarot draw shows a card and image.
- Saju form completes and shows compatibility result.
- `window.dataLayer` receives events after interactions.

## SEO Smoke Test

Check:

- Home canonical: `https://weddingfairpass.com/`.
- Region canonical paths match `/regions/{code}.html`.
- Detail canonical paths match `/fairs/{slug}.html`.
- JSON-LD scripts parse as JSON.
- `sitemap.xml` URL count matches expected count.
- `rss.xml` item count matches detail page count.
- `robots.txt` allows crawling and references sitemap.

## External Network Tests

Do not run these unless the task explicitly asks and credentials/approval are available:

```powershell
npm.cmd run fetch:replyalba
npm.cmd run submit:indexnow
```

Dry-run is allowed when requested:

```powershell
npm.cmd run submit:indexnow:dry
```

