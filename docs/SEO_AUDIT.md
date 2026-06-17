# WeddingFairPass SEO Audit

Performed: 2026-06-17 (Task 5)

## Git Status Note

Before this audit, `sitemap.xml` and `rss.xml` showed uncommitted changes from the Task 4 `build:fairs` run. Those changes are **timestamp-only** (`<lastmod>` and `<pubDate>` updated to 2026-06-17). No SEO content changed. All findings below are based on the current state of the files.

---

## Files Audited

| File / Group | Checked |
|---|---|
| `index.html` | canonical, og:url, og:image, og:title, og:description, description, JSON-LD (JS), search verification |
| `privacy.html`, `contact.html` | canonical, description, OG tags |
| `regions/*.html` (9 files) | canonical, og:url, og:title, og:description, JSON-LD (static), breadcrumb |
| `fairs/*.html` (112 files) | canonical, og:url, og:image, og:title, JSON-LD (static), breadcrumb |
| `sitemap.xml` | URL count, domain alignment, priority, lastmod |
| `rss.xml` | item count, domain alignment, pubDate |
| `robots.txt` | sitemap reference, allow/disallow |
| `netlify.toml` | www redirect, /fairs/* redirect, headers, build config |
| `indexnow-*.txt` | file presence |

---

## Findings By Severity

### MEDIUM-HIGH — /fairs/* Netlify redirect and detail page conflict

**File:** `netlify.toml`

```toml
[[redirects]]
  from = "/fairs/*"
  to = "/#fairs"
  status = 301
```

This rule does **not** have `force = true`.

**Netlify behavior without `force`:** Netlify checks for a matching static file first. If a file exists at the requested path, it is served. If not, the redirect fires.

**Current state:**
- All 112 generated detail pages are at `/fairs/*.html` (with `.html` extension).
- All sitemap `<loc>` entries use `.html` URLs.
- All in-page links (region → detail, breadcrumb, RSS `<link>`) use `.html` URLs.
- Direct requests to `/fairs/api-kcp5zpks00.html` should be served correctly because the file exists.

**Remaining risk:**
- A request to `/fairs/api-kcp5zpks00` (without `.html`) finds no file and gets a 301 to `/#fairs`. This URL format may appear if:
  - A third party links without `.html`
  - Google normalizes the URL by dropping `.html` and rechecks the bare path
  - Social platforms strip `.html` from shared URLs
- The 301 loses the page context entirely and permanently.

**Assessment:** Cannot be confirmed as safe or broken without deployed live testing. The risk is contained as long as all canonical, sitemap, and link surfaces consistently use `.html`. Any departure from `.html` in internal links or external references would trigger the redirect.

**Recommended action (Task 6):** Two options:
1. **Preferred — add specific rule above the catch-all:**
   ```toml
   [[redirects]]
     from = "/fairs/:slug.html"
     to = "/fairs/:slug.html"
     status = 200
   ```
   This explicitly serves `.html` detail pages before the catch-all fires.
2. **Alternative:** Remove the `/fairs/*` → `/#fairs` redirect entirely, since all detail page links use `.html` and browsers that visit `/fairs/` without a slug would just get a 404 (acceptable).

Do not change the redirect without live deployment verification or explicit instruction.

---

### MEDIUM — Home page `og:image` is a relative URL

**File:** `index.html`, line 15

```html
<meta property="og:image" content="assets/wedding-fair-hero.png">
```

The OG image spec requires absolute URLs. Facebook, Slack, KakaoTalk, and most social parsers will fail to resolve relative paths, so the preview image will be missing when the home URL is shared.

**Fix:** Change to:
```html
<meta property="og:image" content="https://weddingfairpass.com/assets/wedding-fair-hero.png">
```

---

### MEDIUM — All region and detail pages missing `og:url`

**Scope:** 9 region pages + 112 detail pages = 121 generated pages.

Each generated page has a correct `<link rel="canonical">` but no `<meta property="og:url">`. Social parsers (Facebook Open Graph) fall back to the page's actual URL, which may differ from canonical when accessed via redirects or CDN edge paths.

**Fix:** Add `og:url` to the `layout()` template in `tools/build-pages.js`:
```html
<meta property="og:url" content="${siteUrl}${pathName}">
```
This is a single-line addition to the shared layout function and would apply to all 121 generated pages.

---

### MEDIUM — `privacy.html` and `contact.html` missing canonical, description, and OG tags

Both pages are included in `sitemap.xml` (priority 0.3) but have no SEO head tags at all.

| Tag | privacy.html | contact.html |
|---|---|---|
| `<link rel="canonical">` | Missing | Missing |
| `<meta name="description">` | Missing | Missing |
| `<meta property="og:title">` | Missing | Missing |
| `<meta property="og:url">` | Missing | Missing |
| `<meta property="og:image">` | Missing | Missing |

Without canonical, Google may choose a different URL as the canonical and index content differently. Without description, search snippets are auto-generated.

**Fix (Task 6):** Add minimal SEO head tags to each file. These are static files, not generated, so they must be edited directly.

---

### LOW — Home page JSON-LD is JavaScript-rendered only

**File:** `app.js` → `appendJsonLd()` → writes `FAQPage` and `Event` JSON-LD dynamically.

`index.html` contains no static `<script type="application/ld+json">` block. JSON-LD is appended to `<head>` at runtime by `app.js`.

Googlebot renders JavaScript, so in practice this usually works. However:
- It delays crawler access to structured data.
- There is no fallback if JS is blocked or slow.
- Other parsers (schema.org validators, social tools) may miss it.

**Region and detail pages** have static JSON-LD in the `<head>` (generated by `build-pages.js`). The inconsistency is worth noting.

**Recommended action (Task 6):** Low priority. If page performance is acceptable, Google will eventually see the JS JSON-LD. The higher-priority SEO fixes above should come first.

---

### LOW — Sitemap `<lastmod>` and RSS `<pubDate>` are build-date only

All 124 sitemap entries share the same `<lastmod>` (today's build date). All 112 RSS items share the same `<pubDate>`.

This causes crawlers to treat every page as equally fresh on every build, preventing priority-based recrawling. For a site that only updates pages when the CSV changes, this works, but crawlers cannot distinguish new fairs from unchanged ones.

**Recommended action (Task 8 or later):** Add per-fair `startDate` from the CSV to RSS `<pubDate>` where available; keep `<lastmod>` as the build date for sitemap (current behavior is acceptable).

---

### LOW — All detail page OG images are hosted on replyalba.com (external domain)

All 112 detail pages use OG images from `https://replyalba.com/intros/...` — pulled from the Replyalba API `og_image` field. There are 0 detail pages using `weddingfairpass.com`-hosted images.

Risk: If Replyalba removes or changes these images, all OG previews break. No impact on SEO rankings but affects social sharing appearance.

**Recommended action:** No immediate change needed. When `imageUrl` is not provided by the API, detail pages fall back to `assets/wedding-fair-hero.png` (a local asset). Currently all 112 API-sourced fairs have Replyalba images.

---

### OK — Confirmed working correctly

| Item | Status |
|---|---|
| Home canonical | `https://weddingfairpass.com/` ✓ |
| Home og:url | `https://weddingfairpass.com/` ✓ |
| Home og:title, og:description | Present ✓ |
| Naver site verification | Present ✓ |
| Google site verification | Present ✓ |
| All region canonicals | 9/9 point to `https://weddingfairpass.com/regions/{code}.html` ✓ |
| All detail canonicals | 112/112 point to `https://weddingfairpass.com/fairs/{slug}.html` ✓ |
| JSON-LD syntax | Valid on all sampled region and detail pages ✓ |
| Breadcrumb depth | 3 levels (홈 → 지역 → 상세) on detail pages ✓ |
| sitemap.xml domain | All 124 URLs use `https://weddingfairpass.com` ✓ |
| sitemap.xml count | 124 (1 home + 2 utility + 9 regions + 112 details) ✓ |
| sitemap priority | 1.0 home, 0.8 regions, 0.7 details, 0.3 utility ✓ |
| rss.xml domain | All 112 items use `https://weddingfairpass.com` ✓ |
| rss.xml count | 112 ✓ |
| robots.txt | `Allow: /` + correct sitemap URL ✓ |
| www redirect | 301 force=true → non-www ✓ |
| Security headers | X-Frame-Options, X-Content-Type-Options, Referrer-Policy ✓ |
| IndexNow key file | `indexnow-4f79e7f4c7d74e3b9b0b0d22d0ecce44.txt` present ✓ |
| HTML lang attribute | `lang="ko"` on all generated pages ✓ |
| RSS/sitemap alternate link | Present in all generated page `<head>` ✓ |
| SITE_URL in netlify.toml | `https://weddingfairpass.com` ✓ |
| Build command in netlify.toml | `npm run build:fairs` ✓ |

---

## /fairs/* Redirect: Confirmed Risk vs Needs Verification

**Status: Cannot confirm without live deployment testing.**

The redirect does not have `force = true`, which means Netlify should serve static files before redirecting. But whether Netlify's file-shadowing behavior protects `.html` detail pages under the `/fairs/*` catch-all depends on the deployed CDN configuration — not just the `netlify.toml` spec.

All current internal references (sitemap, canonical, in-page links, RSS) consistently use `.html` URLs, which minimizes the risk. The risk becomes real if:
- Any external site links to `/fairs/{slug}` (no `.html`)
- Google crawls a bare-slug URL
- The redirect rule is misread as `force = true` in a future edit

**Preservation requirement:** Do not remove the `.html` extension from any canonical, sitemap, or in-page link before this redirect is resolved. Do not add `force = true` to the redirect without removing or replacing it.

---

## URL Preservation Requirements

These must not change without a redirect plan:

- `/` — home
- `/regions/{code}.html` — 9 region pages
- `/fairs/{slug}.html` — 112 detail pages
- `/sitemap.xml`, `/rss.xml`, `/robots.txt` — SEO assets
- `/indexnow-4f79e7f4c7d74e3b9b0b0d22d0ecce44.txt` — IndexNow key
- `/privacy.html`, `/contact.html` — utility pages

Slug derivation rule must not change without redirects: lowercase ID → strip `ra-wedding-` prefix → replace non-alphanumeric runs with `-` → trim `-`.

---

## Recommended Fixes For Task 6

In priority order:

| # | Fix | File(s) | Risk |
|---|---|---|---|
| 1 | Fix `og:image` relative URL on home page | `index.html` line 15 | Low — single attribute |
| 2 | Add `og:url` to generated page layout | `tools/build-pages.js` layout() | Low — single line in template, rebuild required |
| 3 | Add canonical + description to `privacy.html` and `contact.html` | `privacy.html`, `contact.html` | Low — static files, no generation |
| 4 | Audit `/fairs/*` redirect live behavior, then decide: add explicit passthrough or remove catch-all | `netlify.toml` | Medium — requires live deploy verification first |

Do not apply fix #4 without deployed verification or explicit instruction.

---

## Test Results

| Command | Result |
|---|---|
| `npm.cmd run check` | **PASS** |
| `npm.cmd run validate:fairs` | **PASS** — "Validated 130 fair rows. Active: 130" |
| `npm.cmd run check:baseline` | **PASS** — all 6 counts match |

No files were changed during this audit.
