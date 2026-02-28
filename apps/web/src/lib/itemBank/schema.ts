export type ItemType =
  | "multiple_choice"
  | "multi_select"
  | "card_sort"
  | "diagram_label"
  | "evidence_pair"
  | "numeric_response";

export type Difficulty = "easy" | "medium" | "hard";

export type Stimulus =
  | { kind: "none" }
  | { kind: "text"; text: string }
  | { kind: "image"; src: string; alt: string }
  | {
      kind: "table";
      table: { headers: string[]; rows: (string | number)[][] };
    };

export type Choice = {
  id: string;
  label: string;
};

export type AnswerLogic =
  | { kind: "single"; choiceId: string }
  | { kind: "multi"; choiceIds: string[] }
  | { kind: "numeric"; value: number; tolerance?: number }
  | {
      kind: "card_sort";
      columns: { id: string; label: string }[];
      cards: { id: string; label: string; correctColId: string }[];
    }
  | {
      kind: "diagram_label";
      options: { id: string; label: string }[];
      blanks: { id: string; correctOptionId: string }[];
    }
  | {
      kind: "evidence_pair";
      partA: { correctChoiceId: string };
      partB: { correctChoiceId: string };
    };

export type Item = {
  id: string;
  title: string;
  teks: string[]; // ex: ["BIO.7B"]
  topic: string; // ex: "Gene Expression"
  gradeBand: "MS" | "HS";
  difficulty: Difficulty;
  staarStyle: boolean;
  itemType: ItemType;

  stimulus: Stimulus;
  prompt: string;

  choices?: Choice[]; // MC, MS, 2-part
  answer: AnswerLogic;

  misconceptionTags?: string[]; // ex: ["location_confusion", "molecule_role_confusion"]
};

export type ItemBank = {
  version: string;
  items: Item[];
};
