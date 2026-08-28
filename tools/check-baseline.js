const fs = require("fs");
const path = require("path");
const { parseCsv } = require("./csv-utils");

const root = path.resolve(__dirname, "..");

// Update these when a deliberate data change is made (e.g. after CSV sync).
const EXPECTED = {
  csvRows: 135,
  activeRows: 135,
  regionPages: 9,
  detailPages: 114,
  sitemapUrls: 126,
  rssItems: 114,
};

const countHtmlFiles = (dir) => {
  const target = path.join(root, dir);
  if (!fs.existsSync(target)) return 0;
  return fs.readdirSync(target).filter((f) => f.endsWith(".html")).length;
};

const countPattern = (text, pattern) => (text.match(new RegExp(pattern, "g")) || []).length;

const checks = [];

const csvText = fs.readFileSync(path.join(root, "data", "fairs.csv"), "utf8").replace(/^﻿/, "");
const [headers, ...records] = parseCsv(csvText);
const statusIndex = headers.indexOf("status");
if (statusIndex === -1) {
  console.error("FAIL: 'status' column not found in fairs.csv");
  process.exit(1);
}
const activeRecords = records.filter((r) => (r[statusIndex] || "").trim() === "active");

checks.push({ name: "CSV rows",     actual: records.length,       expected: EXPECTED.csvRows });
checks.push({ name: "Active rows",  actual: activeRecords.length, expected: EXPECTED.activeRows });
checks.push({ name: "Region pages", actual: countHtmlFiles("regions"), expected: EXPECTED.regionPages });
checks.push({ name: "Detail pages", actual: countHtmlFiles("fairs"),   expected: EXPECTED.detailPages });

const sitemapPath = path.join(root, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  console.error("FAIL: sitemap.xml not found — run npm run build:fairs first");
  process.exit(1);
}
checks.push({ name: "Sitemap URLs", actual: countPattern(fs.readFileSync(sitemapPath, "utf8"), "<loc>"), expected: EXPECTED.sitemapUrls });

const rssPath = path.join(root, "rss.xml");
if (!fs.existsSync(rssPath)) {
  console.error("FAIL: rss.xml not found — run npm run build:fairs first");
  process.exit(1);
}
checks.push({ name: "RSS items", actual: countPattern(fs.readFileSync(rssPath, "utf8"), "<item>"), expected: EXPECTED.rssItems });

// --write: 의도된 데이터 변경(예: 자동 갱신) 후 실측값으로 기준선을 다시 쓴다.
// EXPECTED 블록과 CLAUDE.md의 Current Baseline 숫자를 함께 갱신한다.
if (process.argv.includes("--write")) {
  const actuals = {
    csvRows: checks[0].actual,
    activeRows: checks[1].actual,
    regionPages: checks[2].actual,
    detailPages: checks[3].actual,
    sitemapUrls: checks[4].actual,
    rssItems: checks[5].actual,
  };
  const selfPath = path.join(root, "tools", "check-baseline.js");
  let self = fs.readFileSync(selfPath, "utf8");
  for (const [key, value] of Object.entries(actuals)) {
    self = self.replace(new RegExp(`(${key}:\\s*)\\d+`), `$1${value}`);
  }
  fs.writeFileSync(selfPath, self, "utf8");
  const claudeMdPath = path.join(root, "CLAUDE.md");
  if (fs.existsSync(claudeMdPath)) {
    let claudeMd = fs.readFileSync(claudeMdPath, "utf8");
    claudeMd = claudeMd
      .replace(/(- CSV rows: )\d+/, `$1${actuals.csvRows}`)
      .replace(/(- Active fair rows: )\d+/, `$1${actuals.activeRows}`)
      .replace(/(- Region pages: )\d+/, `$1${actuals.regionPages}`)
      .replace(/(- Detail pages: )\d+/, `$1${actuals.detailPages}`)
      .replace(/(- Sitemap URLs: )\d+/, `$1${actuals.sitemapUrls}`)
      .replace(/(- RSS items: )\d+/, `$1${actuals.rssItems}`);
    fs.writeFileSync(claudeMdPath, claudeMd, "utf8");
  }
  console.log("Baseline rewritten to actual counts:", JSON.stringify(actuals));
  process.exit(0);
}

let failed = false;
for (const { name, actual, expected } of checks) {
  if (actual === expected) {
    console.log(`  OK  ${name}: ${actual}`);
  } else {
    console.error(`  FAIL ${name}: expected ${expected}, got ${actual}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nBaseline check failed. If counts changed intentionally, update EXPECTED in tools/check-baseline.js.");
  process.exit(1);
} else {
  console.log("\nAll baseline counts match.");
}
