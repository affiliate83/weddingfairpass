const fs = require("fs");
const path = require("path");
const { parseCsv } = require("./csv-utils");

const root = path.resolve(__dirname, "..");

// Update these when a deliberate data change is made (e.g. after CSV sync).
const EXPECTED = {
  csvRows: 130,
  activeRows: 130,
  regionPages: 9,
  detailPages: 112,
  sitemapUrls: 124,
  rssItems: 112,
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
