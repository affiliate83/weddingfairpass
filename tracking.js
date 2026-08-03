// ─── TRACKING (static generated pages: regions/*.html, fairs/*.html) ──────────
// Home page (index.html) uses its own equivalent logic in app.js.

(function () {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get("utm_source") || "direct",
    medium: params.get("utm_medium") || "site",
    campaign: params.get("utm_campaign") || "wedding_fair_mvp",
  };

  const pageType = document.body.dataset.pageType || "";

  const resolveDestinationType = (href) => {
    if (!href || href.startsWith("#")) return "internal";
    if (/\/hit(?:$|[?#])/.test(href)) return "national_affiliate";
    if (/replyalba\.(co\.kr|com)/.test(href)) return "individual_affiliate";
    return "internal";
  };

  const resolveRegionCode = (href) => {
    const match = href.match(/\/([a-z]+)\/hit(?:$|[?#])/);
    return match ? match[1] : "";
  };

  const track = (eventName, payload = {}) => {
    const detail = { ...utm, pageType, ...payload };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...detail });
    console.log("[track]", eventName, detail);
  };
  window.track = track;

  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("[data-track]");
    if (!target) return;
    const href = target.getAttribute("href") || "";
    track(target.dataset.track, {
      fairId: target.dataset.fairId || "",
      fairTitle: target.dataset.fairTitle || "",
      region: target.dataset.region || resolveRegionCode(href),
      cta: target.dataset.cta || "",
      destinationType: resolveDestinationType(href),
      href,
    });
  });

  track("page_view", {});
})();
