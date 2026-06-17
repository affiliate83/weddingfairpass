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

const stringifyCsv = (headers, records) => {
  const escapeCell = (value) => {
    const text = String(value || "");
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [headers, ...records.map((record) => headers.map((header) => record[header] || ""))]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n") + "\n";
};

module.exports = { parseCsv, stringifyCsv };
