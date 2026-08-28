// Compares the previous fairs.csv against the current one and appends 301
// redirects to _redirects for detail slugs that disappeared, so indexed URLs
// never 404 after a data refresh. Idempotent: existing lines are not duplicated.
//
// Usage: node tools/update-retired-redirects.js <path-to-previous-fairs.csv>

const fs = require("fs");
const path = require("path");
const { parseCsv } = require("./csv-utils");

const root = path.resolve(__dirname, "..");
const redirectsPath = path.join(root, "_redirects");
const currentCsvPath = path.join(root, "data", "fairs.csv");
const previousCsvPath = process.argv[2];

// Keep in sync with build-pages.js.
const REGION_CODES = {
  서울: "seoul",
  경기: "gyeonggi",
  인천: "incheon",
  부산: "busan",
  충청: "chungcheong",
  전라: "jeolla",
  강원: "gangwon",
  경상: "gyeongsang",
  제주: "jeju",
};

const detailSlug = (id) =>
  id
    .toLowerCase()
    .replace(/^ra-wedding-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const isDetailFair = (fair) =>
  fair.status === "active" &&
  !fair.id.includes("NATIONAL") &&
  fair.date !== "상시 확인" &&
  fair.venue !== "전국 웨딩박람회 제휴 랜딩";

const loadFairs = (csvPath) => {
  const [headers, ...records] = parseCsv(fs.readFileSync(csvPath, "utf8").replace(/^﻿/, ""));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, (record[index] || "").trim()])));
};

if (!previousCsvPath || !fs.existsSync(previousCsvPath)) {
  console.error("Usage: node tools/update-retired-redirects.js <path-to-previous-fairs.csv>");
  process.exit(1);
}

const currentSlugs = new Set(loadFairs(currentCsvPath).filter(isDetailFair).map((fair) => detailSlug(fair.id)));
const existing = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, "utf8") : "";
const existingLines = new Set(existing.split("\n").map((line) => line.trim()).filter(Boolean));

const added = [];
for (const fair of loadFairs(previousCsvPath)) {
  if (!isDetailFair(fair)) continue;
  const slug = detailSlug(fair.id);
  if (currentSlugs.has(slug)) continue;
  const code = REGION_CODES[fair.region];
  const target = code ? `/regions/${code}.html` : "/";
  for (const from of [`/fairs/${slug}.html`, `/fairs/${slug}`]) {
    const line = `${from} ${target} 301`;
    if (!existingLines.has(line)) {
      existingLines.add(line);
      added.push(line);
    }
  }
}

if (added.length) {
  const stamp = new Date().toISOString().slice(0, 10);
  const block = `# 데이터 갱신으로 제거된 박람회 URL (${stamp})\n${added.join("\n")}\n`;
  fs.writeFileSync(redirectsPath, `${existing.replace(/\n*$/, "\n")}${block}`, "utf8");
}
console.log(`Retired redirects: ${added.length} lines added (${added.length / 2} slugs).`);
