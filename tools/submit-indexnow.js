const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const siteUrl = (process.env.SITE_URL || "https://weddingfairpass.com").replace(/\/$/, "");
const host = new URL(siteUrl).host;
const key = process.env.INDEXNOW_KEY || "4f79e7f4c7d74e3b9b0b0d22d0ecce44";
const keyLocation = `${siteUrl}/indexnow-${key}.txt`;
const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const sitemapPath = path.join(root, "sitemap.xml");
const isDryRun = process.argv.includes("--dry-run");

const extractUrls = (xml) =>
  [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1].trim())
    .filter((url) => url.startsWith(siteUrl));

const main = async () => {
  if (!fs.existsSync(sitemapPath)) {
    throw new Error("sitemap.xml not found. Run npm run build:fairs first.");
  }

  const urlList = extractUrls(fs.readFileSync(sitemapPath, "utf8"));
  if (!urlList.length) {
    throw new Error("No URLs found in sitemap.xml.");
  }

  const payload = { host, key, keyLocation, urlList };
  if (isDryRun) {
    console.log(JSON.stringify({ endpoint, ...payload, urlList: `${urlList.length} URLs` }, null, 2));
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`IndexNow submission failed: ${response.status} ${response.statusText}\n${body}`);
  }

  console.log(`Submitted ${urlList.length} URLs to IndexNow. Status: ${response.status}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
