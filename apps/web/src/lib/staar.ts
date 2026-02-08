import { STAAR_BIO } from "@/data/staar_bio";
import { bio9Items } from "@/data/biology9";

export type RcKey = keyof typeof STAAR_BIO;

/** Return item IDs that belong to a given STAAR category (based on TEKS tags). */
export function itemIdsForCategory(rcLabel: string): string[] {
  const teks = new Set((STAAR_BIO as Record<string, string[]>)[rcLabel] ?? []);
  const ids: string[] = [];
  for (const it of bio9Items) {
    const tags = it.tags ?? [];
    if (tags.some((t) => teks.has(t))) ids.push(it.id);
  }
  return ids;
}

/** Return all unique RC labels. */
export function allRcLabels(): string[] {
  return Object.keys(STAAR_BIO);
}
