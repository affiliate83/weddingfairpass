const fs = require("fs");
const path = require("path");
const { parseCsv, stringifyCsv } = require("./csv-utils");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "data", "replyalba-wedding-api.json");
const csvPath = path.join(root, "data", "fairs.csv");

const headers = [
  "id",
  "region",
  "title",
  "venue",
  "date",
  "tags",
  "summary",
  "badge",
  "affiliateUrl",
  "status",
  "imageUrl",
  "address",
];

const tags = "웨딩홀|스드메|혼수|예물|예복";


const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const campaignCode = (url) => {
  const match = String(url || "").match(/\/pt\/([^/?#]+)/);
  return match ? match[1] : "";
};

const regionFromSido = (sido) => {
  const value = String(sido || "").trim();
  if (["서울", "경기", "인천", "부산", "강원", "제주"].includes(value)) return value;
  if (["대전", "세종", "충북", "충남", "충청"].includes(value)) return "충청";
  if (["광주", "전북", "전남", "전라"].includes(value)) return "전라";
  if (["대구", "울산", "경북", "경남", "경상"].includes(value)) return "경상";
  return "전국";
};

const formatDate = (value) => {
  const text = String(value || "");
  if (!/^\d{8}$/.test(text)) return "";
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
};

const formatRange = (item) => {
  if (item.is_date === "Y") return "상시 확인";
  const start = formatDate(item.sdate);
  const end = formatDate(item.edate);
  if (start && end && start !== end) return `${start} ~ ${end}`;
  return start || end || "상시 확인";
};

const flattenApiItems = (data) => {
  if (Array.isArray(data.resultList)) return data.resultList;
  return Object.values(data.resultList || {}).flatMap((section) => (Array.isArray(section.list) ? section.list : []));
};

const loadExisting = () => {
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, ""));
  const [existingHeaders, ...records] = rows;
  return records.map((record) =>
    Object.fromEntries(existingHeaders.map((header, index) => [header, (record[index] || "").trim()])),
  );
};

const uniqueId = (base, usedIds) => {
  let id = base;
  let index = 2;
  while (usedIds.has(id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  usedIds.add(id);
  return id;
};

const main = () => {
  const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  if (data.resultYn && data.resultYn !== "Y") {
    throw new Error(`Replyalba API did not return success: ${data.resultMsg || data.resultYn}`);
  }

  const existing = loadExisting();
  const nationalRows = existing.filter((record) => record.id && record.id.includes("NATIONAL"));
  const existingDetailRows = existing.filter((record) => record.id && !record.id.includes("NATIONAL"));
  const byCampaign = new Map(existingDetailRows.map((record) => [campaignCode(record.affiliateUrl), record]).filter(([key]) => key));
  const byTitleAddress = new Map(
    existingDetailRows.map((record) => [`${normalize(record.title)}|${normalize(record.address || record.venue)}`, record]),
  );
  const usedIds = new Set(nationalRows.map((record) => record.id));

  const apiRows = flattenApiItems(data).map((item) => {
    const itemCampaignCode = campaignCode(item.campaign);
    const key = `${normalize(item.name)}|${normalize(item.address)}`;
    const previous = byCampaign.get(itemCampaignCode) || byTitleAddress.get(key);
    const idBase = previous?.id || `RA-WEDDING-API-${itemCampaignCode || slugify(`${item.name}-${item.sdate}`)}`;
    const region = regionFromSido(item.sido);
    const title = item.name || `${region} 웨딩박람회`;
    const address = item.address || "";
    const venue = address || title;
    return {
      id: uniqueId(idBase, usedIds),
      region,
      title,
      venue,
      date: formatRange(item),
      tags,
      summary: `${title} 무료입장 신청 정보를 확인하세요. 실제 일정과 혜택은 신청 페이지에서 최종 확인하세요.`,
      badge: region,
      affiliateUrl: item.campaign || previous?.affiliateUrl || "",
      status: "active",
      imageUrl: item.og_image || item.thum_image || previous?.imageUrl || "assets/wedding-fair-hero.png",
      address,
    };
  });

  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
  const backupPath = path.join(root, "data", `fairs.before-api-${timestamp}.csv`);
  fs.copyFileSync(csvPath, backupPath);
  fs.writeFileSync(csvPath, stringifyCsv(headers, [...nationalRows, ...apiRows]), "utf8");

  console.log(`Applied ${apiRows.length} Replyalba API fairs to ${path.relative(root, csvPath)}.`);
  console.log(`Preserved ${nationalRows.length} national SEO rows.`);
  console.log(`Backup saved to ${path.relative(root, backupPath)}.`);
};

main();
