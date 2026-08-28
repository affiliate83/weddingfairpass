const fs = require("fs");
const path = require("path");
const { parseCsv } = require("./csv-utils");

const root = path.resolve(__dirname, "..");
const input = path.join(root, "data", "fairs.csv");
const siteUrl = (process.env.SITE_URL || "https://weddingfairpass.com").replace(/\/$/, "");
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

const fairEnded = (fair) => {
  const schedule = parseSchedule(fair.date);
  const last = (schedule.endDate || schedule.startDate || "").slice(0, 10);
  return Boolean(last) && last < today;
};

const statusBadge = (fair) =>
  fairEnded(fair)
    ? '<span class="status-badge is-ended">종료</span>'
    : '<span class="status-badge">진행중</span>';

const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const formatKoreanDate = (isoDate) => {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  const weekday = WEEKDAY_NAMES[new Date(`${isoDate.slice(0, 10)}T00:00:00+09:00`).getDay()];
  return `${year}년 ${month}월 ${day}일(${weekday})`;
};

const scheduleSentence = (fair) => {
  const schedule = parseSchedule(fair.date);
  if (!schedule.startDate) return "";
  const start = formatKoreanDate(schedule.startDate);
  const end = schedule.endDate && schedule.endDate.slice(0, 10) !== schedule.startDate.slice(0, 10)
    ? formatKoreanDate(schedule.endDate)
    : "";
  const range = end ? `${start}부터 ${end}까지` : `${start}에`;
  return fairEnded(fair)
    ? `이 박람회는 ${range} 진행되었습니다.`
    : `이 박람회는 ${range} 진행됩니다.`;
};

const structuredFairItem = (fair) => {
  if (!isDetailFair(fair) || fairEnded(fair)) {
    return {
      "@type": "WebPage",
      name: fair.title,
      description: fair.summary,
      url: isDetailFair(fair) ? `${siteUrl}/fairs/${detailSlug(fair.id)}.html` : fair.affiliateUrl,
    };
  }
  return {
    "@type": "Event",
    name: fair.title,
    description: fair.summary,
    ...parseSchedule(fair.date),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: fair.venue, address: fair.address || fair.venue || fair.region },
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

const layout = ({ title, description, pathName, body, jsonLd, pageType, imageUrl = `${siteUrl}/assets/og-image.jpg` }) => `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${siteUrl}${pathName}">
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${siteUrl}${pathName}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    <link rel="alternate" type="application/rss+xml" title="웨딩페어패스 웨딩박람회 일정" href="${siteUrl}/rss.xml">
    <link rel="stylesheet" href="../styles.css">
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head>
  <body data-page-type="${pageType || ""}">
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
    <script src="../tracking.js"></script>
  </body>
</html>
`;

const fairCard = (fair) => {
  const detailPath = isDetailFair(fair) ? `../fairs/${detailSlug(fair.id)}.html` : "";
  const imageUrl = fair.imageUrl && fair.imageUrl.startsWith("http") ? fair.imageUrl : "../assets/wedding-fair-hero-800.webp";
  return `<article class="fair-card">
          <a class="fair-media" href="${detailPath || escapeHtml(fair.affiliateUrl)}" aria-label="${escapeHtml(fair.title)}" data-track="region_fair_media_click" data-fair-id="${escapeHtml(fair.id)}" data-fair-title="${escapeHtml(fair.title)}" data-region="${escapeHtml(fair.region)}" data-cta="region_fair_media">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(fair.title)}" loading="lazy" decoding="async">
            <div class="fair-media-badges">
              ${statusBadge(fair)}
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
            <a class="fair-cta" href="${escapeHtml(fair.affiliateUrl)}" data-track="region_fair_apply" data-fair-id="${escapeHtml(fair.id)}" data-fair-title="${escapeHtml(fair.title)}" data-region="${escapeHtml(fair.region)}" data-cta="region_fair_card">무료입장 신청</a>
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

const detailConsultItems = (fair) => {
  const tagSet = new Set(fair.tags);
  const items = [];
  if (tagSet.has("웨딩홀")) items.push("예식장 위치, 식대, 보증 인원, 홀 분위기와 가능한 예식 시간대를 비교해보세요.");
  if (tagSet.has("스드메")) items.push("스튜디오, 드레스, 메이크업 구성과 추가 비용이 생기는 항목을 미리 확인해보세요.");
  if (tagSet.has("혼수")) items.push("가전, 가구, 침구처럼 예산 차이가 큰 혼수 품목은 방문 전 우선순위를 정해두면 좋습니다.");
  if (tagSet.has("예물")) items.push("예물 상담은 디자인, 예산, 제작 기간, 보증 조건을 함께 확인하는 것이 좋습니다.");
  if (tagSet.has("예복")) items.push("예복은 맞춤 여부, 대여 가능 여부, 촬영 일정과 본식 일정에 맞춘 준비 기간을 확인해보세요.");
  return items.length ? items : ["상담 항목과 혜택은 박람회별로 다를 수 있으니 신청 페이지에서 최신 안내를 확인하세요."];
};

const detailFaqItems = (fair, locationText) => [
  {
    q: `${fair.title} 무료입장 신청은 가능한가요?`,
    a: "제휴 신청 페이지를 통해 사전예약하면 무료입장 안내를 받을 수 있습니다. 실제 입장 조건과 혜택은 신청 페이지 및 주최사 안내 기준으로 확인하세요.",
  },
  {
    q: `${fair.title} 방문 전 무엇을 준비하면 좋나요?`,
    a: "희망 예식 지역, 예상 하객 수, 결혼 준비 예산, 비교하고 싶은 항목을 간단히 정리해두면 상담 시간을 더 효율적으로 쓸 수 있습니다.",
  },
  {
    q: `장소는 어디에서 확인하나요?`,
    a: `${locationText} 기준으로 안내하고 있습니다. 방문 전에는 신청 페이지에서 최종 장소와 운영 시간을 다시 확인하는 것이 좋습니다.`,
  },
];

const regionGuideItems = (regionName, count) => [
  `${regionName} 지역에서 확인 가능한 웨딩박람회 ${count}개 일정을 한 번에 비교할 수 있습니다.`,
  "방문 전에는 예식 희망 지역, 예상 하객 수, 스드메 상담 여부, 혼수 예산을 먼저 정리해두면 좋습니다.",
  "무료입장 신청 후 실제 장소, 운영 시간, 제공 혜택은 신청 페이지와 주최사 안내를 기준으로 다시 확인하세요.",
];

const regionComparisonItems = [
  "웨딩홀 상담은 위치, 식대, 보증 인원, 예식 가능 시간대를 함께 비교하세요.",
  "스드메 상담은 포함 구성, 원본 비용, 추가 촬영 및 헬퍼 비용을 미리 물어보는 것이 좋습니다.",
  "혼수와 예물은 현장 혜택만 보지 말고 배송 일정, 보증 조건, 계약 취소 기준까지 확인하세요.",
];

const regionUrls = [];
for (const region of regions) {
  const regionFairs = fairs.filter((fair) => fair.region === region.name);
  const listedRegionFairs = regionFairs
    .filter(isDetailFair)
    .sort((a, b) => Number(fairEnded(a)) - Number(fairEnded(b)));
  const title = `${region.name} 웨딩박람회 일정 2026 | 무료입장·혜택 비교`;
  const description = `${region.name} 지역 웨딩박람회 일정과 장소를 확인하고 무료입장 신청, 웨딩홀·스드메 혜택 비교까지 방문 전 확인하세요.`;
  const pathName = `/regions/${region.code}.html`;
  const faqs = faqItems(region.name);
  const guideItems = regionGuideItems(region.name, listedRegionFairs.length);
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
        <a class="primary-action" href="${escapeHtml(heroCtaFair?.affiliateUrl || "../index.html#fairs")}" data-track="region_hero_apply" data-fair-id="${escapeHtml(heroCtaFair?.id || "")}" data-fair-title="${escapeHtml(heroCtaFair?.title || "")}" data-region="${escapeHtml(region.name)}" data-cta="region_hero">무료입장 신청하기</a>
      </section>
      <section class="section">
        <div class="section-head">
          <p class="eyebrow">Planning guide</p>
          <h2>${escapeHtml(region.name)} 웨딩박람회 방문 전 비교 가이드</h2>
          <p>${escapeHtml(region.name)} 지역 웨딩박람회는 같은 날짜라도 장소, 상담 가능 항목, 무료입장 조건이 다를 수 있습니다. 일정표만 보고 바로 신청하기보다 우리 커플에게 필요한 상담 항목을 먼저 정리해두면 방문 만족도가 높아집니다.</p>
        </div>
        <div class="benefit-grid">
          ${guideItems.map((item) => `<article><strong>방문 전 체크</strong><span>${escapeHtml(item)}</span></article>`).join("\n")}
        </div>
      </section>
      <section class="section detail-copy region-guide-copy">
        <p class="eyebrow">Compare</p>
        <h2>상담 항목별 확인 포인트</h2>
        <ul class="plain-list">
          ${regionComparisonItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
        </ul>
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
  fs.writeFileSync(path.join(root, "regions", `${region.code}.html`), layout({ title, description, pathName, body, jsonLd: listJsonLd, pageType: "region" }), "utf8");
  regionUrls.push(pathName);
}

const detailUrls = [];
const detailFairs = fairs.filter(isDetailFair);
const priorityDetailIds = new Set(detailFairs.slice(0, 50).map((fair) => fair.id));
const nationalByRegion = new Map(
  fairs.filter((fair) => fair.id.includes("NATIONAL")).map((fair) => [fair.region, fair.affiliateUrl])
);
const detailFairsByRegion = new Map(
  regions.map((region) => [region.name, detailFairs.filter((fair) => fair.region === region.name)])
);

const hashCode = (value) => {
  let hash = 0;
  for (const char of String(value)) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
};

const pickVariant = (fair, variants) => variants[hashCode(fair.id) % variants.length];

const districtOf = (fair) => {
  const match = (fair.address || "").match(/^([가-힣]+(?:특별시|광역시|도)?)\s+([가-힣]+(?:시|군|구))/);
  return match ? `${match[1]} ${match[2]}` : "";
};

const VISIT_CHECK_VARIANTS = [
  [
    "희망 웨딩홀 지역과 예상 하객 수를 정리하세요.",
    "스드메, 예물, 예복, 혼수 중 비교할 항목을 정하세요.",
    "무료입장 신청 후 실제 일정과 혜택을 다시 확인하세요.",
  ],
  [
    "결혼 예정 시기와 예식 후보 지역을 먼저 좁혀두세요.",
    "항목별 예산 상한선을 정해두면 현장 비교가 빨라집니다.",
    "상담받고 싶은 업체 유형을 미리 적어가면 동선이 짧아집니다.",
  ],
  [
    "두 사람의 우선순위(웨딩홀·스드메·혼수)를 순서대로 정리하세요.",
    "현장 계약 전 포함 항목과 추가 비용, 취소 조건을 확인하세요.",
    "방문 당일 일정과 운영 시간은 신청 페이지에서 다시 확인하세요.",
  ],
];

const BENEFIT_COPY_VARIANTS = [
  {
    apply: "사전예약 페이지에서 방문 정보를 남기고 입장 가능 여부와 안내 연락을 확인하세요.",
    compare: "관련 상담 포인트를 한 번에 비교하기 좋습니다.",
    confirm: "실제 일정, 운영 시간, 제공 혜택은 신청 페이지와 주최사 안내 기준으로 확인하세요.",
  },
  {
    apply: "무료입장 신청을 먼저 해두면 현장 접수 대기 없이 상담 안내를 받을 수 있습니다.",
    compare: "항목별 상담 부스를 돌며 조건을 나란히 비교해볼 수 있습니다.",
    confirm: "제공 혜택과 사은품 조건은 주최사 사정에 따라 바뀔 수 있으니 방문 전 다시 확인하세요.",
  },
  {
    apply: "신청 페이지에 방문 예정일을 남기면 입장 절차와 상담 예약 안내를 받게 됩니다.",
    compare: "여러 업체의 견적과 구성을 같은 자리에서 비교할 수 있는 것이 박람회의 장점입니다.",
    confirm: "일정 변경이나 조기 마감 가능성이 있으므로 출발 전 신청 페이지 공지를 확인하세요.",
  },
];

const relatedFairs = (fair) => {
  const siblings = detailFairsByRegion.get(fair.region) || [];
  if (siblings.length < 2) return [];
  const index = siblings.findIndex((item) => item.id === fair.id);
  const picks = [];
  for (let offset = 1; offset <= 3 && picks.length < Math.min(3, siblings.length - 1); offset += 1) {
    picks.push(siblings[(index + offset) % siblings.length]);
  }
  return picks;
};

for (const fair of detailFairs) {
  const slug = detailSlug(fair.id);
  const pathName = `/fairs/${slug}.html`;
  const ended = fairEnded(fair);
  const title = ended
    ? `${fair.title} 종료 안내·${fair.region} 다음 일정 | 웨딩페어패스`
    : `${fair.title} 일정·무료입장 | 웨딩페어패스`;
  const locationText = fair.address || fair.venue;
  const isPriorityDetail = priorityDetailIds.has(fair.id);
  const consultItems = detailConsultItems(fair);
  const detailFaqs = detailFaqItems(fair, locationText);
  const description = ended
    ? `${fair.title}(${locationText})는 종료되었습니다. ${fair.region} 지역에서 확인 가능한 다른 웨딩박람회 일정과 무료입장 신청 정보를 확인하세요.`
    : `${locationText}에서 열리는 ${fair.title} 일정과 무료입장 신청, 혜택 비교 정보를 확인하세요.`;
  const regionCode = regions.find((region) => region.name === fair.region)?.code || "";
  const imageUrl = fair.imageUrl && fair.imageUrl.startsWith("http") ? fair.imageUrl : `${siteUrl}/assets/og-image.jpg`;
  const primaryCtaUrl = ended ? nationalByRegion.get(fair.region) || fair.affiliateUrl : fair.affiliateUrl;
  const primaryCtaLabel = ended ? `진행 중인 ${fair.region} 박람회 신청` : "사전예약 신청";
  const related = relatedFairs(fair);
  const benefitCopy = pickVariant(fair, BENEFIT_COPY_VARIANTS);
  const visitCheckItems = pickVariant(fair, VISIT_CHECK_VARIANTS);
  const district = districtOf(fair);
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
      ...(ended
        ? [
            {
              "@type": "WebPage",
              name: title,
              description,
              url: `${siteUrl}${pathName}`,
            },
          ]
        : [
            {
              "@type": "Event",
              name: fair.title,
              description: fair.summary,
              ...parseSchedule(fair.date),
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              eventStatus: "https://schema.org/EventScheduled",
              location: { "@type": "Place", name: fair.venue, address: locationText || fair.region },
              organizer: { "@type": "Organization", name: "웨딩페어패스" },
              offers: { "@type": "Offer", url: fair.affiliateUrl, price: "0", priceCurrency: "KRW", availability: "https://schema.org/InStock" },
            },
          ]),
      ...(isPriorityDetail
        ? [
            {
              "@type": "FAQPage",
              mainEntity: detailFaqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            },
          ]
        : []),
    ],
  };
  const scheduleText = scheduleSentence(fair);
  const seoSection = `      <section class="section detail-copy detail-seo-copy">
        <p class="eyebrow">Planning guide</p>
        <h2>${escapeHtml(fair.title)} 방문 전 체크포인트</h2>
        <p>이 페이지에서는 ${escapeHtml(fair.region)} 지역의 ${escapeHtml(fair.title)} 일정과 방문 전 체크할 내용을 정리했습니다.${scheduleText ? ` ${escapeHtml(scheduleText)}` : ""}${district ? ` 행사장은 ${escapeHtml(district)}에 있어 ${escapeHtml(district.split(" ").pop())} 인근에서 예식장이나 스드메 업체를 알아보는 커플에게 특히 동선이 편리합니다.` : ""} 웨딩홀, 스드메, 혼수, 예물, 예복 정보를 한 번에 비교하려는 예비부부라면 원하는 예식 지역과 예상 하객 수, 상담받고 싶은 항목을 미리 적어두면 현장에서 비교가 쉬워집니다.</p>
        <p>${ended ? "안내되었던" : "현재 안내된"} 장소는 ${escapeHtml(locationText)}입니다. 실제 운영 시간, 제공 혜택, 상담 가능 브랜드는 신청 페이지와 주최사 안내에 따라 달라질 수 있으므로 ${ended ? "다른 일정을 알아볼 때도 신청 페이지 기준으로 최종 확인을 권장합니다" : "방문 전 최종 확인을 권장합니다"}.</p>
        <h3>상담 전에 확인하면 좋은 항목</h3>
        <ul class="plain-list">
          ${consultItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
        </ul>
        <h3>예약 전 자주 묻는 질문</h3>
        <div class="faq-list compact-faq">
          ${detailFaqs.map((faq) => `<details><summary>${escapeHtml(faq.q)}</summary><p>${escapeHtml(faq.a)}</p></details>`).join("\n")}
        </div>
      </section>`;
  const relatedSection = related.length
    ? `      <section class="section detail-copy related-fairs">
        <p class="eyebrow">More fairs</p>
        <h2>${escapeHtml(fair.region)} 지역의 다른 웨딩박람회</h2>
        <ul class="plain-list">
          ${related
            .map(
              (item) =>
                `<li><a href="../fairs/${detailSlug(item.id)}.html">${escapeHtml(item.title)}</a> — ${escapeHtml(item.date)}${fairEnded(item) ? " (종료)" : ""}</li>`
            )
            .join("\n")}
        </ul>
        <p><a href="../regions/${escapeHtml(regionCode)}.html">${escapeHtml(fair.region)} 웨딩박람회 전체 일정 보기</a></p>
      </section>`
    : "";
  const endedNotice = ended
    ? `      <section class="section ended-notice" role="note">
        <strong>이 박람회는 종료되었습니다.</strong>
        <p>${escapeHtml(scheduleText)} 아래에서 ${escapeHtml(fair.region)} 지역에서 확인 가능한 다른 웨딩박람회 일정을 확인하거나, 진행 중인 박람회 무료입장을 신청하세요.</p>
        <a class="secondary-action" href="../regions/${escapeHtml(regionCode)}.html">${escapeHtml(fair.region)} 웨딩박람회 일정 보기</a>
      </section>
`
    : "";
  const body = `      <section class="detail-breadcrumb" aria-label="현재 위치">
        <a href="../index.html">홈</a>
        <span>/</span>
        <a href="../regions/${escapeHtml(regionCode)}.html">${escapeHtml(fair.region)} 웨딩박람회</a>
        <span>/</span>
        <strong>${escapeHtml(fair.title)}</strong>
      </section>
${endedNotice}      <section class="section detail-showcase">
        <div class="detail-main-column">
          <div class="detail-image-panel">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(fair.title)}" loading="lazy" decoding="async">
            <div class="fair-media-badges">
              ${statusBadge(fair)}
              <span class="light-badge">무료입장</span>
            </div>
          </div>
          <article class="detail-title-block">
            <h1>${escapeHtml(fair.title)}</h1>
            <p>${escapeHtml(fair.summary)}</p>
          </article>
        </div>
        <aside class="detail-info-card">
          <p class="eyebrow">Fair info</p>
          <h2>박람회 정보</h2>
          <dl>
            <div><dt>일정</dt><dd>${escapeHtml(fair.date)}</dd></div>
            <div><dt>장소</dt><dd>${escapeHtml(locationText)}</dd></div>
            <div><dt>지역</dt><dd>${escapeHtml(fair.region)}</dd></div>
          </dl>
          <a class="fair-cta full" href="${escapeHtml(primaryCtaUrl)}" data-track="detail_fair_apply" data-fair-id="${escapeHtml(fair.id)}" data-fair-title="${escapeHtml(fair.title)}" data-region="${escapeHtml(fair.region)}" data-cta="detail_primary_cta">${escapeHtml(primaryCtaLabel)}</a>
          <a class="secondary-action full" href="../regions/${escapeHtml(regionCode)}.html">${escapeHtml(fair.region)} 웨딩박람회 더보기</a>
        </aside>
      </section>
      <section class="section detail-content-grid">
        <article class="detail-copy">
          <div class="section-head">
            <p class="eyebrow">Venue</p>
            <h2>장소와 혜택</h2>
            <p>해당 박람회는 ${escapeHtml(locationText)}에서 확인할 수 있습니다. 방문 전 무료입장 신청을 해두면 현장 안내와 상담 절차를 더 빠르게 확인할 수 있습니다.</p>
          </div>
          <div class="benefit-grid">
            <article>
              <strong>무료입장 신청</strong>
              <span>${escapeHtml(benefitCopy.apply)}</span>
            </article>
            <article>
              <strong>결혼 준비 항목 비교</strong>
              <span>${fair.tags.map((tag) => escapeHtml(tag)).join(", ")} ${escapeHtml(benefitCopy.compare)}</span>
            </article>
            <article>
              <strong>방문 전 최종 확인</strong>
              <span>${escapeHtml(benefitCopy.confirm)}</span>
            </article>
          </div>
          <div class="tag-row">${fair.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        </article>
        <article class="tool-surface">
          <h3>방문 전 체크</h3>
          <ul class="plain-list">
            ${visitCheckItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
          </ul>
          <a class="fair-cta" href="${escapeHtml(primaryCtaUrl)}" data-track="detail_secondary_apply" data-fair-id="${escapeHtml(fair.id)}" data-fair-title="${escapeHtml(fair.title)}" data-region="${escapeHtml(fair.region)}" data-cta="detail_secondary_cta">${ended ? "진행 중인 박람회 보기" : "신청 페이지로 이동"}</a>
        </article>
      </section>
      <section class="section detail-copy detail-note">
        <p class="eyebrow">Guide</p>
        <h2>${escapeHtml(fair.title)} 신청 안내</h2>
        <p>${escapeHtml(fair.region)} 지역에서 웨딩홀, 스드메, 혼수, 예물, 예복을 함께 비교하려는 예비부부라면 방문 전에 희망 예식 시기와 예산 범위를 정리해두는 것이 좋습니다. 신청 후에는 리플알바 제휴 신청 페이지에서 제공하는 안내를 기준으로 실제 방문 가능 일정과 혜택을 확인하세요.</p>
      </section>
${seoSection}
${relatedSection}`;
  fs.writeFileSync(path.join(root, "fairs", `${slug}.html`), layout({ title, description, pathName, body, jsonLd, imageUrl, pageType: "detail" }), "utf8");
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

const rssItems = fairs
  .filter(isDetailFair)
  .map((fair) => {
    const slug = detailSlug(fair.id);
    const url = `${siteUrl}/fairs/${slug}.html`;
    const locationText = fair.address || fair.venue || fair.region;
    return `    <item>
      <title>${escapeHtml(fair.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeHtml(`${locationText}에서 열리는 ${fair.title} 일정과 무료입장 신청 정보를 확인하세요.`)}</description>
      <category>${escapeHtml(fair.region)}</category>
      <pubDate>${new Date(today).toUTCString()}</pubDate>
    </item>`;
  })
  .join("\n");
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>웨딩페어패스 웨딩박람회 일정</title>
    <link>${siteUrl}/</link>
    <description>전국 웨딩박람회 일정과 무료입장 신청 정보를 정리한 RSS 피드입니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date(today).toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(root, "rss.xml"), rss, "utf8");

fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`, "utf8");

console.log(`Generated ${regionUrls.length} region pages, ${detailUrls.length} detail pages, sitemap.xml, rss.xml, and robots.txt.`);
