export type LearningLevel =
  | "developing"
  | "progressing"
  | "proficient"
  | "advanced";

export const PRIORITY_TEKS = [
  "B.1B",
  "B.1D",
  "B.3A",
  "B.5A",
  "B.5B",
  "B.11A",
  "B.11B",
  "B.7A",
  "B.7B",
  "B.7C",
  "B.6A",
  "B.6C",
  "B.12B",
] as const;

const PRIORITY_TEKS_SET = new Set<string>(PRIORITY_TEKS);

export function normalizeCanonicalTeks(raw: string): string {
  const cleaned = (raw || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return "";

  // Accept legacy formats like BIO.5.A or BIO5A and convert to B.5A.
  const withoutBioPrefix = cleaned.replace(/^BIO\.?/, "B.");
  const match = withoutBioPrefix.match(/^([A-Z])\.?([0-9]+)\.?([A-Z])$/);
  if (!match) return withoutBioPrefix;

  return `${match[1]}.${match[2]}${match[3]}`;
}

export function isPriorityTeks(teksId: string): boolean {
  const canonical = normalizeCanonicalTeks(teksId);
  return PRIORITY_TEKS_SET.has(canonical);
}

export type InterventionTier = 2 | 3 | null;

export function interventionTierFromCheck(
  score: number | null | undefined,
  attempts: number | null | undefined,
): InterventionTier {
  const safeScore = typeof score === "number" ? score : 100;
  const safeAttempts = typeof attempts === "number" ? attempts : 0;

  if (safeScore < 50 || safeAttempts >= 2) return 3;
  if (safeScore < 70) return 2;
  return null;
}

export function interventionStrategyForTier(tier: InterventionTier): string {
  if (tier === 3) {
    return "Tier 3: one-on-one tutoring scaffold, sentence starter practice, and simplified materials.";
  }
  if (tier === 2) {
    return "Tier 2: use a graphic organizer, concept map, and model-building retry before reassessment.";
  }
  return "No intervention needed.";
}
