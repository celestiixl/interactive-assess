export type ReportingCategory = "RC1" | "RC2" | "RC3" | "RC4";

export type TeksEntry = {
  id: string; // e.g., "BIO.8B"
  unit: number; // your unit guide number
  strand: string; // short teacher grouping
  title: string; // short student-friendly title
  description: string; // teacher-facing description
};

export const RC_LABELS: Record<ReportingCategory, string> = {
  RC1: "Cell Structure & Function",
  RC2: "Mechanisms of Genetics",
  RC3: "Biological Evolution & Classification",
  RC4: "Biological Processes & Systems",
};

// Starter catalog aligned to your uploaded unit guides (Units 2–10).
// Expand as you add more TEKS.
export const TEKS_CATALOG: Record<string, TeksEntry> = {
  // Unit 2 (Cell Cycle & Differentiation) – BIO.6A–C
  "BIO.6A": {
    id: "BIO.6A",
    unit: 2,
    strand: "Growth & differentiation",
    title: "Cell cycle + DNA replication",
    description:
      "Explain the importance of the cell cycle to organism growth, including stages of the cell cycle and DNA replication models.",
  },
  "BIO.6B": {
    id: "BIO.6B",
    unit: 2,
    strand: "Growth & differentiation",
    title: "Cell differentiation",
    description:
      "Explain the process of cell specialization through cell differentiation, including the role of environmental factors.",
  },
  "BIO.6C": {
    id: "BIO.6C",
    unit: 2,
    strand: "Growth & differentiation",
    title: "Cell cycle disruptions (cancer)",
    description:
      "Relate disruptions of the cell cycle to how they lead to diseases such as cancer.",
  },

  // Unit 3 (From Cells to Organisms) – BIO.12A–B
  "BIO.12A": {
    id: "BIO.12A",
    unit: 3,
    strand: "Systems interactions",
    title: "Animal system interactions",
    description:
      "Analyze interactions among animal systems that perform regulation, nutrient absorption, reproduction, and defense from injury/illness.",
  },
  "BIO.12B": {
    id: "BIO.12B",
    unit: 3,
    strand: "Systems interactions",
    title: "Plant system interactions",
    description:
      "Explain how plant systems that perform transport, reproduction, and response are facilitated by their structures.",
  },

  // Unit 4 (Gene Expression & Regulation) – BIO.7A–D
  "BIO.7A": {
    id: "BIO.7A",
    unit: 4,
    strand: "DNA → traits",
    title: "DNA components + sequence → traits",
    description:
      "Identify components of DNA, explain how nucleotide sequence specifies some traits, and examine scientific explanations for the origin of DNA.",
  },
  "BIO.7B": {
    id: "BIO.7B",
    unit: 4,
    strand: "Gene expression",
    title: "Transcription & translation",
    description:
      "Explain how information flows from DNA to RNA to protein through transcription and translation (gene expression and regulation).",
  },
  "BIO.7C": {
    id: "BIO.7C",
    unit: 4,
    strand: "Mutations",
    title: "DNA changes + significance",
    description:
      "Identify and illustrate changes in DNA and evaluate the significance of these changes.",
  },
  "BIO.7D": {
    id: "BIO.7D",
    unit: 4,
    strand: "Biotech tools",
    title: "PCR, gels, genetic engineering",
    description:
      "Discuss the importance of molecular technologies such as PCR, gel electrophoresis, and genetic engineering used in research/engineering practices.",
  },

  // Unit 5 (Inheritance & Variation) – BIO.8A–B
  "BIO.8A": {
    id: "BIO.8A",
    unit: 5,
    strand: "Meiosis → variation",
    title: "Meiosis increases diversity",
    description:
      "Analyze how chromosome reduction, independent assortment, and crossing over during meiosis increase diversity in sexually reproducing populations.",
  },
  "BIO.8B": {
    id: "BIO.8B",
    unit: 5,
    strand: "Inheritance patterns",
    title: "Predict outcomes (Punnett squares)",
    description:
      "Predict outcomes of genetic combinations using monohybrid/dihybrid crosses, including non-Mendelian traits.",
  },

  // Unit 6 (Mechanisms of Evolution) – BIO.10C–D
  "BIO.10C": {
    id: "BIO.10C",
    unit: 6,
    strand: "Speciation",
    title: "Natural selection → speciation",
    description:
      "Analyze and evaluate how natural selection may lead to speciation.",
  },
  "BIO.10D": {
    id: "BIO.10D",
    unit: 6,
    strand: "Evolution mechanisms",
    title: "Other mechanisms change gene pools",
    description:
      "Analyze evolutionary mechanisms other than natural selection and their effect on a population gene pool.",
  },

  // Unit 10 (Biodiversity & Human Impacts) – BIO.13C–D
  "BIO.13C": {
    id: "BIO.13C",
    unit: 10,
    strand: "Ecosystem stability",
    title: "Carbon & nitrogen cycles",
    description:
      "Explain the significance of the carbon and nitrogen cycles to ecosystem stability and analyze consequences of disrupting these cycles.",
  },
  "BIO.13D": {
    id: "BIO.13D",
    unit: 10,
    strand: "Human impacts",
    title: "Environmental change & biodiversity",
    description:
      "Explain how environmental change (including human activity) affects biodiversity and analyze how biodiversity changes impact ecosystem stability.",
  },
};
