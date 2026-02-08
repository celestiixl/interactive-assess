export * from "./catalog";

import { RC_LABELS, TEKS_CATALOG, type ReportingCategory, type TeksEntry } from "./catalog";

export function normalizeTeksId(id: string): string {
  return (id || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function getTeksEntry(id: string): TeksEntry | null {
  const key = normalizeTeksId(id);
  return TEKS_CATALOG[key] ?? null;
}

export function teksLabel(id: string): string {
  const entry = getTeksEntry(id);
  return entry ? `${entry.id} · ${entry.title}` : normalizeTeksId(id);
}

export function reportingCategoryLabel(rc: ReportingCategory): string {
  return RC_LABELS[rc];
}

// Default RC inference (tweak later if your district mapping differs)
export function inferReportingCategoryFromTeks(teksId: string): ReportingCategory {
  const id = normalizeTeksId(teksId);

  // RC2: genetics cluster
  if (id.startsWith("BIO.7") || id.startsWith("BIO.8")) return "RC2";

  // RC3: evolution cluster
  if (id.startsWith("BIO.9") || id.startsWith("BIO.10") || id.startsWith("BIO.11")) return "RC3";

  // RC4: systems + ecology
  if (id.startsWith("BIO.12") || id.startsWith("BIO.13")) return "RC4";

  // RC1: cell structure/processes (often BIO.5/6)
  if (id.startsWith("BIO.5") || id.startsWith("BIO.6")) return "RC1";

  return "RC4";
}

export function inferUnitFromTeks(teksId: string): number | null {
  const entry = getTeksEntry(teksId);
  return entry ? entry.unit : null;
}
