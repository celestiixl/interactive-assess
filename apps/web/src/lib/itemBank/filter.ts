import type { Item } from "./schema";

export type BankQuery = {
  teks?: string;
  topic?: string;
  type?: string;
  difficulty?: string;
  staarStyle?: string;
  q?: string;
};

export function filterItems(items: Item[], query: BankQuery): Item[] {
  const teks = query.teks?.trim();
  const topic = query.topic?.trim().toLowerCase();
  const type = query.type?.trim();
  const difficulty = query.difficulty?.trim();
  const staarStyle = query.staarStyle?.trim();
  const q = query.q?.trim().toLowerCase();

  return items.filter((it) => {
    if (teks && !it.teks.some((t) => t.toLowerCase() === teks.toLowerCase()))
      return false;
    if (topic && it.topic.toLowerCase() !== topic) return false;
    if (type && it.itemType !== type) return false;
    if (difficulty && it.difficulty !== difficulty) return false;
    if (staarStyle && String(it.staarStyle) !== staarStyle) return false;

    if (q) {
      const hay = [
        it.title,
        it.prompt,
        it.topic,
        it.teks.join(" "),
        it.itemType,
        it.difficulty,
        ...(it.misconceptionTags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
