const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const input = path.join(root, "data", "fairs.csv");
const output = path.join(root, "fairs.generated.js");
const regionCodes = {
  "서울": "seoul",
  "경기": "gyeonggi",
  "인천": "incheon",
  "부산": "busan",
  "충청": "chungcheong",
  "전라": "jeolla",
  "강원": "gangwon",
  "경상": "gyeongsang",
  "제주": "jeju",
};

const hasDetailPage = (fair) =>
  fair.status === "active" &&
  !fair.id.includes("NATIONAL") &&
  fair.date !== "상시 확인" &&
  fair.venue !== "전국 웨딩박람회 제휴 랜딩";

const detailSlug = (id) =>
  id
    .toLowerCase()
    .replace(/^ra-wedding-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
};

const rows = parseCsv(fs.readFileSync(input, "utf8").replace(/^\uFEFF/, ""));
const [headers, ...records] = rows;
const required = ["id", "region", "title", "venue", "date", "tags", "summary", "badge", "affiliateUrl", "status"];

for (const field of required) {
  if (!headers.includes(field)) {
    throw new Error(`Missing required CSV column: ${field}`);
  }
}

const fairs = records
  .map((record) => Object.fromEntries(headers.map((header, index) => [header, (record[index] || "").trim()])))
  .filter((fair) => fair.status === "active")
  .map((fair) => ({
    id: fair.id,
    region: fair.region,
    title: fair.title,
    venue: fair.venue,
    date: fair.date,
    tags: fair.tags.split("|").map((tag) => tag.trim()).filter(Boolean),
    summary: fair.summary,
    badge: fair.badge || fair.region,
    affiliateUrl: fair.affiliateUrl,
    regionPath: regionCodes[fair.region] ? `regions/${regionCodes[fair.region]}.html` : "",
    detailPath: hasDetailPage(fair) ? `fairs/${detailSlug(fair.id)}.html` : "",
  }));

const js = `window.WEDDING_FAIRS = ${JSON.stringify(fairs, null, 2)};\n`;
fs.writeFileSync(output, js, "utf8");
console.log(`Generated ${path.relative(root, output)} with ${fairs.length} fairs.`);
