export function normalizeDisplayName(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function compactScanString(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");
}

const BLOCKED_TERMS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "porn",
  "sex",
  "nigga",
  "nigger",
  "faggot",
  "retard",
  "whore",
  "slut",
  "cunt",
  "kkk",
  "nazi",
] as const;

const BLOCKED_FIGURES = [
  "adolfhitler",
  "hitler",
  "osamabinladen",
  "saddamhussein",
  "josephstalin",
  "charlesmanson",
  "jeffreyepstein",
] as const;

export function validateStudentName(input: string): {
  valid: boolean;
  reason?: string;
  normalizedName?: string;
} {
  const name = normalizeDisplayName(input);

  if (name.length < 2 || name.length > 24) {
    return { valid: false, reason: "Name must be 2–24 characters." };
  }

  if (!/^[\p{L}][\p{L}\p{N} .'-]{1,23}$/u.test(name)) {
    return {
      valid: false,
      reason: "Use letters/numbers with spaces, apostrophes, periods, or hyphens.",
    };
  }

  const compact = compactScanString(name);

  if (BLOCKED_TERMS.some((term) => compact.includes(term))) {
    return { valid: false, reason: "Name contains blocked language." };
  }

  if (BLOCKED_FIGURES.some((person) => compact.includes(person))) {
    return { valid: false, reason: "Name references a blocked public figure." };
  }

  return { valid: true, normalizedName: name };
}
