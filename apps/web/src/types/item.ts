export type ItemBase = {
  id: string;
  stem: string;
  stem_simplified?: string;
  media?: { img?: string; alt?: string; audioUrl?: string };
  teks: string[]; // e.g., ["BIO.5.A"]
  retryLimit?: number;
  rationale?: string;
  lang?: "en" | "es";
  metadata?: Record<string, unknown>;
};

export type ItemMCQ = ItemBase & {
  kind: "mcq";
  choices: { id: string; text: string }[];
  correctIds: string[]; // multi-select allowed
};

export type ItemDragDrop = ItemBase & {
  kind: "dragDrop";
  prompt?: string;
  attempts?: number;
  zones: { id: string; label: string; accepts?: string[] }[];
  cards: { id: string; text: string }[];
  correct?: Record<string, string>; // cardId -> zoneId
};

export type ItemCardSort = ItemBase & {
  kind: "cardSort";
  columns: { id: string; label: string }[];
  cards: { id: string; text: string; columnId?: string }[];
  correct: Record<string, string>; // cardId -> columnId
};

export type ItemHotspot = ItemBase & {
  kind: "hotspot";
  image: string;
  regions: {
    id: string;
    shape: "rect" | "circle" | "polygon";
    coords: number[];
    label?: string;
  }[];
  correct: string[]; // region ids
  multi?: boolean;
};

export type ItemShort = ItemBase & {
  kind: "short";
  rubric: { points: number; criteria: string[] };
  exemplars?: string[];
};

export type Item =
  | ItemMCQ
  | ItemDragDrop
  | ItemCardSort
  | ItemHotspot
  | ItemShort;
