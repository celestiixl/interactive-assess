export type TeksCategory = "RC1" | "RC2" | "RC3" | "RC4" | "RC5" | "RC6";

export const TEKS_CATEGORY_COLORS: Record<TeksCategory, string> = {
  RC1: "var(--teks-rc1)",
  RC2: "var(--teks-rc2)",
  RC3: "var(--teks-rc3)",
  RC4: "var(--teks-rc4)",
  RC5: "var(--teks-rc5)",
  RC6: "var(--teks-rc6)",
};

export const TEKS_CATEGORY_DESCRIPTIONS: Record<TeksCategory, string> = {
  RC1: "Reporting Category 1: Cell structure and function",
  RC2: "Reporting Category 2: Mechanisms of genetics",
  RC3: "Reporting Category 3: Biological evolution and classification",
  RC4: "Reporting Category 4: Biological processes and systems",
  RC5: "Reporting Category 5: Interdependence within environmental systems",
  RC6: "Reporting Category 6: Scientific and engineering practices",
};

export function normalizeTeksCategory(input: string): TeksCategory | null {
  const value = input.trim().toUpperCase();
  if (value in TEKS_CATEGORY_COLORS) return value as TeksCategory;

  const rcMatch = value.match(/RC\s*([1-6])/);
  if (rcMatch) return `RC${rcMatch[1]}` as TeksCategory;

  return null;
}

export function teksCategoryColor(input: string): string {
  const category = normalizeTeksCategory(input);
  return category ? TEKS_CATEGORY_COLORS[category] : "var(--teks-rc2)";
}

export function teksCategoryDescription(input: string): string {
  const category = normalizeTeksCategory(input);
  if (!category) return input;
  return TEKS_CATEGORY_DESCRIPTIONS[category];
}
