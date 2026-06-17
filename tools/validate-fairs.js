const fs = require("fs");
const path = require("path");
const { parseCsv } = require("./csv-utils");

const root = path.resolve(__dirname, "..");
const input = path.join(root, "data", "fairs.csv");

const rows = parseCsv(fs.readFileSync(input, "utf8").replace(/^\uFEFF/, ""));
const [headers, ...records] = rows;
const required = ["id", "region", "title", "venue", "date", "tags", "summary", "badge", "affiliateUrl", "status"];
const errors = [];
const seen = new Set();

for (const field of required) {
  if (!headers.includes(field)) errors.push(`Missing required column: ${field}`);
}

records.forEach((record, index) => {
  const rowNumber = index + 2;
  const fair = Object.fromEntries(headers.map((header, cellIndex) => [header, (record[cellIndex] || "").trim()]));
  if (seen.has(fair.id)) errors.push(`Row ${rowNumber}: duplicate id "${fair.id}"`);
  seen.add(fair.id);

  if (fair.status !== "active") return;

  for (const field of required) {
    if (!fair[field]) errors.push(`Row ${rowNumber}: active fair missing ${field}`);
  }
  if (fair.affiliateUrl && !/^https?:\/\//.test(fair.affiliateUrl)) {
    errors.push(`Row ${rowNumber}: affiliateUrl must start with http:// or https://`);
  }
  if (fair.tags && !fair.tags.includes("|")) {
    console.warn(`Warning row ${rowNumber}: tags usually use "|" separator, e.g. 웨딩홀|스드메|혼수`);
  }
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${records.length} fair rows. Active: ${records.filter((record) => record[headers.indexOf("status")] === "active").length}`);
