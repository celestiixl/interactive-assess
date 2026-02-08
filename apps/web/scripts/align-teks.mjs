import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");

const TEKS_CATALOG = {
  "BIO.6A": { unit: 2 },
  "BIO.6B": { unit: 2 },
  "BIO.6C": { unit: 2 },
  "BIO.12A": { unit: 3 },
  "BIO.12B": { unit: 3 },
  "BIO.7A": { unit: 4 },
  "BIO.7B": { unit: 4 },
  "BIO.7C": { unit: 4 },
  "BIO.7D": { unit: 4 },
  "BIO.8A": { unit: 5 },
  "BIO.8B": { unit: 5 },
  "BIO.10C": { unit: 6 },
  "BIO.10D": { unit: 6 },
  "BIO.13C": { unit: 10 },
  "BIO.13D": { unit: 10 },
};

function normalizeTeksId(id) {
  return String(id || "").trim().toUpperCase().replace(/\s+/g, "");
}

function inferRC(teksId) {
  const id = normalizeTeksId(teksId);
  if (id.startsWith("BIO.7") || id.startsWith("BIO.8")) return "RC2";
  if (id.startsWith("BIO.9") || id.startsWith("BIO.10") || id.startsWith("BIO.11")) return "RC3";
  if (id.startsWith("BIO.12") || id.startsWith("BIO.13")) return "RC4";
  if (id.startsWith("BIO.5") || id.startsWith("BIO.6")) return "RC1";
  return "RC4";
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(SRC);
const candidates = files.filter((f) =>
  /item|items|question|bank|seed|content/i.test(path.basename(f))
);

const jsonBanks = candidates.filter((f) => f.endsWith(".json"));
const tsBanks = candidates.filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

const report = {
  scanned: candidates.length,
  jsonBanks,
  tsBanks,
  updated: [],
  missingTeks: [],
  unknownTeks: [],
};

for (const file of jsonBanks) {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    continue;
  }
  if (!Array.isArray(raw)) continue;

  let changed = false;

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;

    const teks = Array.isArray(item.teks) ? item.teks.map(normalizeTeksId) : null;
    if (!teks || teks.length === 0) {
      report.missingTeks.push({ file, id: item.id ?? null });
      continue;
    }

    // normalize teks in place
    if (JSON.stringify(item.teks) !== JSON.stringify(teks)) {
      item.teks = teks;
      changed = true;
    }

    if (!item.rc) {
      item.rc = inferRC(teks[0]);
      changed = true;
    }

    if (item.unit == null) {
      const entry = TEKS_CATALOG[teks[0]];
      if (entry?.unit) {
        item.unit = entry.unit;
        changed = true;
      } else {
        report.unknownTeks.push({ file, id: item.id ?? null, teks: teks[0] });
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, JSON.stringify(raw, null, 2) + "\n", "utf-8");
    report.updated.push(file);
  }
}

fs.mkdirSync(path.join(ROOT, "scripts", "out"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "scripts", "out", "teks-align-report.json"),
  JSON.stringify(report, null, 2) + "\n",
  "utf-8"
);

console.log("Done.");
console.log("Updated JSON banks:", report.updated.length);
console.log("Missing TEKS tags:", report.missingTeks.length);
console.log("Unknown TEKS (not in catalog yet):", report.unknownTeks.length);
console.log("Report saved to scripts/out/teks-align-report.json");

if (report.tsBanks.length) {
  console.log("\nTS/TSX candidates (not auto-edited):");
  for (const f of report.tsBanks.slice(0, 30)) console.log(" -", path.relative(ROOT, f));
  if (report.tsBanks.length > 30) console.log(` ...and ${report.tsBanks.length - 30} more`);
}
