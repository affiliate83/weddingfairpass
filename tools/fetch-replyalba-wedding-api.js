const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "data", "replyalba-wedding-api.json");
const endpoint = process.env.REPLYALBA_API_URL || "https://replyalba.com/api/partner_wedding_list.php";
const apiId = process.env.REPLYALBA_API_ID;
const apiKey = process.env.REPLYALBA_API_KEY;
const campaignCode = process.env.REPLYALBA_CAMPAIGN_CODE || "QguXBOoowJ";

const requireEnv = (name, value) => {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
};

const main = async () => {
  requireEnv("REPLYALBA_API_ID", apiId);
  requireEnv("REPLYALBA_API_KEY", apiKey);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "AUTH-API-ID": apiId,
      "AUTH-API-KEY": apiKey,
    },
    body: JSON.stringify({ code: campaignCode }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Replyalba API failed: ${response.status} ${response.statusText}\n${text}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Replyalba API did not return JSON: ${error.message}\n${text.slice(0, 500)}`);
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  const count = Array.isArray(data.resultList)
    ? data.resultList.length
    : Object.values(data.resultList || {}).reduce(
        (total, section) => total + (Array.isArray(section.list) ? section.list.length : 0),
        0,
      );
  console.log(`Saved Replyalba API response with ${count} items to ${path.relative(root, output)}.`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
