export type ItemBase = {
  id: string;
  stem: string;
  stem_simplified?: string;
  media?: { img?: string; alt?: string; audioUrl?: string };
  tags?: string[]; // optional tags/standards (e.g., ["BIO.5.A"]) - added for assignment summaries
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

export type Evidence = {
  id: string;
  text: string;
  sourceLabel?: string; // e.g., "Data Table", "Graph", "Observation"
  tag?: string; // e.g., "supports", "contradicts", "neutral"
};

export type CerMode = "open" | "claim-given" | "claim-evaluate";

export type ItemCER = ItemBase & {
  kind: "cer";
  mode: CerMode;
  context?: string; // short scenario / phenomenon text
  claim?: { text: string; locked: boolean }; // required when mode != "open"
  evidenceBank: Evidence[];
  correctEvidenceIds?: string[]; // optional, for auto-checking evidence selection
  constraints?: {
    minEvidence: number;
    maxEvidence: number;
    reasoningMinChars?: number;
    allowCustomEvidenceNote?: boolean;
  };
  scaffolds?: {
    sentenceStems?: {
      en?: { claim?: string[]; evidence?: string[]; reasoning?: string[] };
      es?: { claim?: string[]; evidence?: string[]; reasoning?: string[] };
    };
    wordBank?: { en?: string[]; es?: string[] };
  };
  rubric?: {
    evidencePoints: number;
    reasoningPoints: number;
    claimPoints?: number;
  };
};

// Student response types
export type CerResponse = {
  itemId: string;
  studentId?: string;
  claimText?: string; // only for mode open
  claimEvaluation?: "supported" | "not_supported"; // only for claim-evaluate
  selectedEvidenceIds: string[];
  customEvidenceNote?: string;
  reasoningText: string;
  submittedAt: string;
  autoScore?: { evidence?: number; totalAuto?: number; feedback?: string[] };
  teacherScore?: {
    claim?: number;
    evidence?: number;
    reasoning?: number;
    total?: number;
    comments?: string;
  };
};

export type Item =
  | ItemMCQ
  | ItemDragDrop
  | ItemCardSort
  | ItemHotspot
  | ItemShort
  | ItemCER;
