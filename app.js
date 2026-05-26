const params = new URLSearchParams(window.location.search);
const utm = {
  source: params.get("utm_source") || "direct",
  medium: params.get("utm_medium") || "site",
  campaign: params.get("utm_campaign") || "wedding_fair_mvp",
};

const track = (eventName, payload = {}) => {
  const detail = { ...utm, ...payload };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...detail });
  console.log("[track]", eventName, detail);
};

const buildAffiliateUrl = (content) => {
  const fair = fairs.find((item) => item.id === content);
  const rawUrl = fair?.affiliateUrl || AFFILIATE_CONFIG.affiliateUrl;
  if (rawUrl.includes("replyalba.co.kr/pt/")) return rawUrl;
  const url = new URL(rawUrl);
  url.searchParams.set("utm_source", utm.source);
  url.searchParams.set("utm_medium", utm.medium);
  url.searchParams.set("utm_campaign", utm.campaign);
  url.searchParams.set("utm_content", content);
  return url.toString();
};

const buildNationalUrl = (baseUrl, region = "서울") => {
  const regionCode = REGION_CODES[region] || "seoul";
  return `${baseUrl.replace(/\/+$/, "")}/${regionCode}/hit`;
};

const getRecommendedRegion = () => {
  if (selectedRegion && selectedRegion !== "전체") return selectedRegion;
  return "서울";
};

const getNationalBaseByType = (type) => {
  if (type === "approval") return CAMPAIGN_LINKS.nationalApproval;
  if (type === "random") return CAMPAIGN_LINKS.nationalRandom;
  if (type === "alpha") return CAMPAIGN_LINKS.nationalAlpha;
  return CAMPAIGN_LINKS.nationalPopular;
};

const updateNationalLinks = () => {
  const region = getRecommendedRegion();
  document.querySelectorAll("[data-national-link]").forEach((link) => {
    link.href = buildNationalUrl(getNationalBaseByType(link.dataset.nationalLink), region);
  });
};

const fairList = document.querySelector("[data-fair-list]");
const fairSearch = document.querySelector("[data-fair-search]");
const fairCount = document.querySelector("[data-fair-count]");
let selectedRegion = "전체";
let searchTerm = "";

const renderFairs = (region = "전체") => {
  selectedRegion = region;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visible = fairs.filter((fair) => {
    if (!fair.detailPath) return false;
    const regionMatch = selectedRegion === "전체" || fair.region === selectedRegion;
    const searchMatch =
      !normalizedSearch ||
      [fair.title, fair.region, fair.venue, fair.summary, ...(fair.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    return regionMatch && searchMatch;
  });
  fairCount.textContent = `총 ${visible.length}개`;
  fairList.innerHTML = visible
    .map(
      (fair) => `
        <article class="fair-card">
          <a class="fair-media" href="${fair.detailPath || buildAffiliateUrl(fair.id)}" aria-label="${fair.title}">
            <img src="${fair.imageUrl || "assets/wedding-fair-hero.png"}" alt="${fair.title}">
            <div class="fair-media-badges">
              <span class="status-badge">진행중</span>
              <span class="light-badge">무료입장</span>
            </div>
          </a>
          <div class="fair-top">
            <span class="badge">${fair.badge}</span>
            <span class="badge">${fair.region}</span>
          </div>
          <h3>${fair.title}</h3>
          <div class="fair-meta">
            <span>${fair.date}</span>
            <span>${fair.venue}</span>
          </div>
          <p>${fair.summary}</p>
          <div class="tag-row">${fair.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
          <div class="card-actions">
            ${fair.detailPath ? `<a class="secondary-action" href="${fair.detailPath}">상세 보기</a>` : ""}
            <a class="fair-cta" href="${buildAffiliateUrl(fair.id)}" data-track="fair_apply" data-fair-id="${fair.id}">무료입장 신청</a>
          </div>
        </article>
      `
    )
    .join("") || `<div class="empty-state">조건에 맞는 박람회가 없습니다. 다른 지역이나 검색어를 확인해보세요.</div>`;
};

const renderFaqs = () => {
  const faqList = document.querySelector("[data-faq-list]");
  if (!faqList) return;
  faqList.innerHTML = faqs
    .map(
      (faq) => `
        <details class="faq-item">
          <summary>${faq.question}</summary>
          <p>${faq.answer}</p>
        </details>
      `
    )
    .join("");
};

const appendJsonLd = (id, data) => {
  const previous = document.getElementById(id);
  if (previous) previous.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

const renderStructuredData = () => {
  appendJsonLd("faq-jsonld", {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  });

  appendJsonLd("event-jsonld", {
    "@context": "https://schema.org",
    "@graph": fairs.map((fair) => ({
      "@type": "Event",
      name: fair.title,
      description: fair.summary,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: fair.venue,
        address: fair.region,
      },
      organizer: {
        "@type": "Organization",
        name: "웨딩페어패스",
      },
      offers: {
        "@type": "Offer",
        url: buildAffiliateUrl(fair.id),
        price: "0",
        priceCurrency: "KRW",
        availability: "https://schema.org/InStock",
      },
    })),
  });
};

document.querySelectorAll("[data-region]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-region]").forEach((tab) => tab.classList.remove("is-active"));
    button.classList.add("is-active");
    renderFairs(button.dataset.region);
    updateNationalLinks();
    track("region_filter", { region: button.dataset.region });
  });
});

fairSearch.addEventListener("input", () => {
  searchTerm = fairSearch.value;
  renderFairs(selectedRegion);
  track("fair_search", { query: searchTerm });
});

const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

document.body.addEventListener("click", (event) => {
  const target = event.target.closest("[data-track]");
  if (!target) return;
  track(target.dataset.track, {
    fairId: target.dataset.fairId || "",
    href: target.getAttribute("href") || "",
  });
});

let quizIndex = 0;
const quizAnswers = [];
const quizTitle = document.querySelector("[data-quiz-title]");
const quizOptions = document.querySelector("[data-quiz-options]");
const quizStep = document.querySelector("[data-quiz-step]");
const quizResult = document.querySelector("[data-quiz-result]");
const resultTitle = document.querySelector("[data-result-title]");
const resultBody = document.querySelector("[data-result-body]");
const resultCta = document.querySelector("[data-result-cta]");

const renderQuiz = () => {
  const question = quizQuestions[quizIndex];
  quizStep.textContent = String(quizIndex + 1);
  quizTitle.textContent = question.title;
  quizOptions.innerHTML = question.options
    .map((option) => `<button class="option-button" type="button" data-answer="${option.type}">${option.label}</button>`)
    .join("");
};

quizOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-answer]");
  if (!button) return;
  quizAnswers.push(button.dataset.answer);
  track("quiz_answer", { step: quizIndex + 1, answer: button.dataset.answer });
  quizIndex += 1;

  if (quizIndex < quizQuestions.length) {
    renderQuiz();
    return;
  }

  const score = quizAnswers.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const resultType = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
  const copy = resultCopy[resultType];

  quizOptions.classList.add("is-hidden");
  quizTitle.classList.add("is-hidden");
  quizResult.classList.remove("is-hidden");
  resultTitle.textContent = copy.title;
  resultBody.textContent = copy.body;
  resultCta.textContent = copy.cta;
  resultCta.href = buildNationalUrl(CAMPAIGN_LINKS.nationalApproval, getRecommendedRegion());
  track("test_complete", { result: resultType });
});

const budgetForm = document.querySelector("[data-budget-form]");
const budgetTotal = document.querySelector("[data-budget-total]");
const updateBudget = () => {
  const formData = new FormData(budgetForm);
  const total = [...formData.values()].reduce((sum, value) => sum + Number(value || 0), 0);
  budgetTotal.textContent = `${total.toLocaleString("ko-KR")}만원`;
};

budgetForm.addEventListener("input", () => {
  updateBudget();
  track("budget_change");
});

const tarotButton = document.querySelector("[data-draw-tarot]");
const tarotResult = document.querySelector("[data-tarot-result]");
const tarotName = document.querySelector("[data-tarot-name]");
const tarotLabel = document.querySelector("[data-tarot-label]");
const tarotMessage = document.querySelector("[data-tarot-message]");
const tarotAction = document.querySelector("[data-tarot-action]");
const tarotImage = document.querySelector("[data-tarot-image]");

tarotButton.addEventListener("click", () => {
  const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
  tarotImage.src = card.image;
  tarotImage.alt = `${card.name} - ${card.label}`;
  tarotName.textContent = card.name;
  tarotLabel.textContent = card.label;
  tarotMessage.textContent = card.message;
  tarotAction.textContent = card.action;
  tarotResult.classList.remove("is-hidden");
  tarotButton.textContent = "다시 뽑기";
  track("tarot_complete", { card: card.name });
});

const sajuForm = document.querySelector("[data-saju-form]");
const sajuResult = document.querySelector("[data-saju-result]");
const sajuTitle = document.querySelector("[data-saju-title]");
const sajuBody = document.querySelector("[data-saju-body]");
const sajuCta = document.querySelector("[data-saju-cta]");
const mineElement = document.querySelector("[data-mine-element]");
const partnerElement = document.querySelector("[data-partner-element]");
const mineTrait = document.querySelector("[data-mine-trait]");
const partnerTrait = document.querySelector("[data-partner-trait]");
const weddingAdvice = document.querySelector("[data-wedding-advice]");
const weddingMonths = document.querySelector("[data-wedding-months]");
const weddingMonthReason = document.querySelector("[data-wedding-month-reason]");

const elementKeys = ["wood", "fire", "earth", "metal", "water"];
const harmonyPairs = new Set(["wood-fire", "fire-earth", "earth-metal", "metal-water", "water-wood"]);

const getSajuElement = (dateValue, timeValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const timeScore = timeValue === "unknown" ? 0 : Number(timeValue) / 2;
  const index = Math.abs(year + month * 2 + day + timeScore) % elementKeys.length;
  return elementKeys[index];
};

const getRelation = (mine, partner) => {
  if (mine === partner) return "same";
  if (harmonyPairs.has(`${mine}-${partner}`) || harmonyPairs.has(`${partner}-${mine}`)) return "harmony";
  return "balance";
};

const getWeddingMonthAdvice = (mine, partner, relation) => {
  if (relation === "same") return weddingMonthAdvice[mine];
  if (relation === "harmony") return weddingMonthAdvice[partner];
  return weddingMonthAdvice.earth;
};

sajuForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(sajuForm);
  const mine = getSajuElement(formData.get("mineDate"), formData.get("mineTime"));
  const partner = getSajuElement(formData.get("partnerDate"), formData.get("partnerTime"));
  const relation = getRelation(mine, partner);
  const mineCopy = sajuElements[mine];
  const partnerCopy = sajuElements[partner];
  const result = sajuRelations[relation];
  const monthAdvice = getWeddingMonthAdvice(mine, partner, relation);

  mineElement.textContent = `나: ${mineCopy.name} 기운`;
  partnerElement.textContent = `상대: ${partnerCopy.name} 기운`;
  sajuTitle.textContent = result.title;
  sajuBody.textContent = result.body;
  mineTrait.textContent = `나의 흐름: ${mineCopy.title}. ${mineCopy.trait}`;
  partnerTrait.textContent = `상대의 흐름: ${partnerCopy.title}. ${partnerCopy.trait}`;
  weddingAdvice.textContent = `결혼 준비 조언: ${mineCopy.wedding} ${partnerCopy.wedding}`;
  weddingMonths.textContent = monthAdvice.months;
  weddingMonthReason.textContent = monthAdvice.reason;
  sajuCta.textContent = result.cta;
  sajuCta.href = buildNationalUrl(CAMPAIGN_LINKS.nationalApproval, getRecommendedRegion());
  sajuResult.classList.remove("is-hidden");
  track("saju_complete", { result: relation, mine, partner });
});

renderFairs();
updateNationalLinks();
renderFaqs();
renderStructuredData();
renderQuiz();
updateBudget();
track("page_view", { page: "home" });
