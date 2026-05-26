const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const input = path.join(root, "data", "fairs.csv");
const siteUrl = (process.env.SITE_URL || "https://example.com").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const regions = [
  { name: "서울", code: "seoul" },
  { name: "경기", code: "gyeonggi" },
  { name: "인천", code: "incheon" },
  { name: "부산", code: "busan" },
  { name: "충청", code: "chungcheong" },
  { name: "전라", code: "jeolla" },
  { name: "강원", code: "gangwon" },
  { name: "경상", code: "gyeongsang" },
  { name: "제주", code: "jeju" },
];

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

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

const parseSchedule = (dateText) => {
  const isoRange = dateText.match(/(20\d{2})-(\d{2})-(\d{2})(?:\s*~\s*(20\d{2})-(\d{2})-(\d{2}))?/);
  if (isoRange) {
    const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = isoRange;
    const schedule = {
      startDate: `${startYear}-${startMonth}-${startDay}`,
    };
    if (endYear && endMonth && endDay) schedule.endDate = `${endYear}-${endMonth}-${endDay}`;
    return schedule;
  }
  const match = dateText.match(/(\d{1,2})월\s*(\d{1,2})일\s*(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  if (!match) return {};
  const [, month, day, startHour, startMinute, endHour, endMinute] = match;
  const date = `2026-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  return {
    startDate: `${date}T${startHour.padStart(2, "0")}:${startMinute}:00+09:00`,
    endDate: `${date}T${endHour.padStart(2, "0")}:${endMinute}:00+09:00`,
  };
};

const structuredFairItem = (fair) => {
  if (!isDetailFair(fair)) {
    return {
      "@type": "WebPage",
      name: fair.title,
      description: fair.summary,
      url: fair.affiliateUrl,
    };
  }
  return {
    "@type": "Event",
    name: fair.title,
    description: fair.summary,
    ...parseSchedule(fair.date),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: fair.venue, address: fair.region },
    offers: { "@type": "Offer", url: fair.affiliateUrl, price: "0", priceCurrency: "KRW" },
  };
};

const rows = parseCsv(fs.readFileSync(input, "utf8").replace(/^\uFEFF/, ""));
const [headers, ...records] = rows;
const fairs = records
  .map((record) => Object.fromEntries(headers.map((header, index) => [header, (record[index] || "").trim()])))
  .filter((fair) => fair.status === "active")
  .map((fair) => ({
    ...fair,
    tags: fair.tags.split("|").map((tag) => tag.trim()).filter(Boolean),
  }));

const ensureDir = (dir) => fs.mkdirSync(path.join(root, dir), { recursive: true });
const cleanGeneratedHtml = (dir) => {
  const target = path.join(root, dir);
  ensureDir(dir);
  for (const file of fs.readdirSync(target)) {
    if (file.endsWith(".html")) fs.unlinkSync(path.join(target, file));
  }
};

ensureDir("regions");
ensureDir("fairs");
cleanGeneratedHtml("regions");
cleanGeneratedHtml("fairs");

const layout = ({ title, description, pathName, body, jsonLd, imageUrl = `${siteUrl}/assets/wedding-fair-hero.png` }) => `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${siteUrl}${pathName}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <link rel="stylesheet" href="../styles.css">
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../index.html" aria-label="웨딩페어패스 홈">
        <span class="brand-mark">W</span>
        <span>웨딩페어패스</span>
      </a>
      <nav class="nav" aria-label="주요 메뉴">
        <a href="../index.html#fairs">박람회</a>
        <a href="../index.html#quiz">성향 테스트</a>
        <a href="../index.html#fortune">무료 운세</a>
        <a href="../index.html#budget">예산 계산</a>
      </nav>
    </header>
    <main>
${body}
    </main>
    <footer class="footer">
      <p>웨딩페어패스는 웨딩박람회 정보를 정리하는 제휴 안내 사이트입니다. 실제 일정과 혜택은 신청 페이지 및 주최사 안내를 기준으로 확인하세요.</p>
      <div>
        <a href="../privacy.html">개인정보처리방침</a>
        <a href="../contact.html">문의</a>
      </div>
    </footer>
  </body>
</html>
`;

const fairCard = (fair) => {
  const detailPath = isDetailFair(fair) ? `../fairs/${detailSlug(fair.id)}.html` : "";
  const imageUrl = fair.imageUrl || "../assets/wedding-fair-hero.png";
  return `<article class="fair-card">
          <a class="fair-media" href="${detailPath || escapeHtml(fair.affiliateUrl)}" aria-label="${escapeHtml(fair.title)}">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(fair.title)}">
            <div class="fair-media-badges">
              <span class="status-badge">진행중</span>
              <span class="light-badge">무료입장</span>
            </div>
          </a>
          <div class="fair-top">
            <span class="badge">${escapeHtml(fair.badge || fair.region)}</span>
            <span class="badge">${escapeHtml(fair.region)}</span>
          </div>
          <h3>${escapeHtml(fair.title)}</h3>
          <div class="fair-meta">
            <span>${escapeHtml(fair.date)}</span>
            <span>${escapeHtml(fair.venue)}</span>
          </div>
          <p>${escapeHtml(fair.summary)}</p>
          <div class="tag-row">${fair.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="card-actions">
            ${detailPath ? `<a class="secondary-action" href="${detailPath}">상세 보기</a>` : ""}
            <a class="fair-cta" href="${escapeHtml(fair.affiliateUrl)}" data-track="region_fair_apply">무료입장 신청</a>
          </div>
        </article>`;
};

const faqItems = (regionName) => [
  {
    q: `${regionName} 웨딩박람회 무료입장은 정말 무료인가요?`,
    a: "대부분 사전 신청자는 무료입장 혜택을 받을 수 있습니다. 단, 실제 혜택과 조건은 신청 페이지와 주최사 안내를 기준으로 확인해야 합니다.",
  },
  {
    q: "신청 후에는 어떤 연락을 받나요?",
    a: "무료입장 신청 뒤에는 박람회 일정, 방문 안내, 상담 확인을 위한 연락을 받을 수 있습니다.",
  },
  {
    q: "웨딩박람회에서는 무엇을 비교하면 좋나요?",
    a: "웨딩홀, 스드메, 예물, 예복, 혼수 혜택과 계약 조건을 함께 비교하는 것이 좋습니다.",
  },
  {
    q: "방문 전에 준비할 것은 무엇인가요?",
    a: "예상 예산, 희망 지역, 결혼 예정 시기, 상담받고 싶은 항목을 미리 정리하면 상담 시간을 줄일 수 있습니다.",
  },
];

const regionUrls = [];
for (const region of regions) {
  const regionFairs = fairs.filter((fair) => fair.region === region.name);
  const listedRegionFairs = regionFairs.filter(isDetailFair);
  const title = `${region.name} 웨딩박람회 일정 2026 | 무료입장 신청`;
  const description = `${region.name} 지역 웨딩박람회 일정, 장소, 무료입장 신청 정보를 한 번에 확인하세요.`;
  const pathName = `/regions/${region.code}.html`;
  const faqs = faqItems(region.name);
  const heroCtaFair = regionFairs.find((fair) => fair.id.includes("NATIONAL")) || regionFairs[0];
  const listJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: `${region.name} 웨딩박람회`, item: `${siteUrl}${pathName}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `${region.name} 웨딩박람회 일정`,
        itemListElement: listedRegionFairs.map((fair, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: structuredFairItem(fair),
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };
  const body = `      <section class="page-hero">
        <p class="eyebrow">Regional wedding fair</p>
        <h1>${escapeHtml(region.name)} 웨딩박람회 일정 무료입장 신청</h1>
        <p>${escapeHtml(description)}</p>
        <a class="primary-action" href="${escapeHtml(heroCtaFair?.affiliateUrl || "../index.html#fairs")}">무료입장 신청하기</a>
      </section>
      <section class="section">
        <div class="section-head">
          <p class="eyebrow">Schedule</p>
          <h2>${escapeHtml(region.name)} 지역 확인 가능한 일정</h2>
          <p>일정과 장소는 신청 페이지 및 주최사 안내를 기준으로 최종 확인하세요.</p>
        </div>
        <div class="fair-grid">
          ${listedRegionFairs.map(fairCard).join("\n") || `<div class="empty-state">현재 노출 중인 ${escapeHtml(region.name)} 지역 일정이 없습니다.</div>`}
        </div>
      </section>
      <section class="section">
        <div class="section-head">
          <p class="eyebrow">FAQ</p>
          <h2>${escapeHtml(region.name)} 웨딩박람회 자주 묻는 질문</h2>
        </div>
        <div class="faq-list">
          ${faqs.map((faq) => `<details><summary>${escapeHtml(faq.q)}</summary><p>${escapeHtml(faq.a)}</p></details>`).join("\n")}
        </div>
      </section>`;
  fs.writeFileSync(path.join(root, "regions", `${region.code}.html`), layout({ title, description, pathName, body, jsonLd: listJsonLd }), "utf8");
  regionUrls.push(pathName);
}

const detailUrls = [];
for (const fair of fairs.filter(isDetailFair)) {
  const slug = detailSlug(fair.id);
  const pathName = `/fairs/${slug}.html`;
  const title = `${fair.title} 일정 | 무료입장 신청`;
  const description = `${fair.venue}에서 열리는 ${fair.title} 일정과 무료입장 신청 정보를 확인하세요.`;
  const regionCode = regions.find((region) => region.name === fair.region)?.code || "";
  const imageUrl = fair.imageUrl || `${siteUrl}/assets/wedding-fair-hero.png`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: `${fair.region} 웨딩박람회`, item: `${siteUrl}/regions/${regionCode}.html` },
          { "@type": "ListItem", position: 3, name: fair.title, item: `${siteUrl}${pathName}` },
        ],
      },
      {
        "@type": "Event",
        name: fair.title,
        description: fair.summary,
        ...parseSchedule(fair.date),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: { "@type": "Place", name: fair.venue, address: fair.region },
        organizer: { "@type": "Organization", name: "웨딩페어패스" },
        offers: { "@type": "Offer", url: fair.affiliateUrl, price: "0", priceCurrency: "KRW", availability: "https://schema.org/InStock" },
      },
    ],
  };
  const body = `      <section class="page-hero">
        <p class="eyebrow">${escapeHtml(fair.region)} wedding fair</p>
        <h1>${escapeHtml(fair.title)}</h1>
        <p>${escapeHtml(fair.summary)}</p>
        <a class="primary-action" href="${escapeHtml(fair.affiliateUrl)}" data-track="detail_fair_apply">무료입장 신청하기</a>
      </section>
      <section class="section detail-showcase">
        <div class="detail-image-panel">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(fair.title)}">
          <div class="fair-media-badges">
            <span class="status-badge">진행중</span>
            <span class="light-badge">무료입장</span>
          </div>
        </div>
        <aside class="detail-info-card">
          <p class="eyebrow">Fair info</p>
          <h2>박람회 정보</h2>
          <dl>
            <div><dt>일정</dt><dd>${escapeHtml(fair.date)}</dd></div>
            <div><dt>장소</dt><dd>${escapeHtml(fair.venue)}</dd></div>
            <div><dt>지역</dt><dd>${escapeHtml(fair.region)}</dd></div>
          </dl>
          <a class="fair-cta full" href="${escapeHtml(fair.affiliateUrl)}" data-track="detail_fair_apply">사전예약 신청</a>
        </aside>
      </section>
      <section class="quick-panel detail-panel" aria-label="박람회 요약">
        <div>
          <strong>${escapeHtml(fair.region)}</strong>
          <span>지역</span>
        </div>
        <div>
          <strong>${escapeHtml(fair.date)}</strong>
          <span>일정</span>
        </div>
        <div>
          <strong>${escapeHtml(fair.badge || fair.region)}</strong>
          <span>구분</span>
        </div>
      </section>
      <section class="section split-section alt">
        <div>
          <div class="section-head">
            <p class="eyebrow">Venue</p>
            <h2>장소와 혜택</h2>
            <p>${escapeHtml(fair.venue)}</p>
          </div>
          <div class="tag-row">${fair.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        </div>
        <article class="tool-surface">
          <h3>방문 전 체크</h3>
          <ul class="plain-list">
            <li>희망 웨딩홀 지역과 예상 하객 수를 정리하세요.</li>
            <li>스드메, 예물, 예복, 혼수 중 비교할 항목을 정하세요.</li>
            <li>무료입장 신청 후 실제 일정과 혜택을 다시 확인하세요.</li>
          </ul>
          <a class="fair-cta" href="${escapeHtml(fair.affiliateUrl)}">신청 페이지로 이동</a>
        </article>
      </section>`;
  fs.writeFileSync(path.join(root, "fairs", `${slug}.html`), layout({ title, description, pathName, body, jsonLd, imageUrl }), "utf8");
  detailUrls.push(pathName);
}

const sitemapUrls = ["/", "/privacy.html", "/contact.html", ...regionUrls, ...detailUrls];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map((url) => `  <url>
    <loc>${siteUrl}${url}</loc>
    <lastmod>${today}</lastmod>
    <priority>${url === "/" ? "1.0" : url.startsWith("/regions/") ? "0.8" : url.startsWith("/fairs/") ? "0.7" : "0.3"}</priority>
  </url>`)
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`, "utf8");

console.log(`Generated ${regionUrls.length} region pages, ${detailUrls.length} detail pages, sitemap.xml, and robots.txt.`);
