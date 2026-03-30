export type ReportingCategory = "RC1" | "RC2" | "RC3" | "RC4";

export type TeksEntry = {
  id: string; // e.g., "B.5A"
  unit: 1 | 2 | 3 | 7;
  strand: string;
  title: string;
  description: string;
  teaPriority: "SEP" | "SEP (Priority)" | "Content" | "Priority Content";
};

export const RC_LABELS: Record<ReportingCategory, string> = {
  RC1: "Biomolecules and Cells",
  RC2: "Cellular Processes and Energy",
  RC3: "DNA, RNA, and Protein Synthesis",
  RC4: "Gene Expression and Mutation",
};

// FBISD-aligned starter catalog (Units 1-3)
export const TEKS_CATALOG: Record<string, TeksEntry> = {
  "B.1A": {
    id: "B.1A",
    unit: 1,
    strand: "Scientific and engineering practices",
    title: "Ask questions and define problems",
    description: "Ask questions and define problems based on observations.",
    teaPriority: "SEP",
  },
  "B.1B": {
    id: "B.1B",
    unit: 1,
    strand: "Scientific and engineering practices",
    title: "Plan and conduct investigations",
    description:
      "Plan and conduct descriptive, comparative, and experimental investigations.",
    teaPriority: "SEP (Priority)",
  },
  "B.1D": {
    id: "B.1D",
    unit: 1,
    strand: "Scientific and engineering practices",
    title: "Use appropriate lab tools",
    description:
      "Use appropriate tools including microscopes, gel electrophoresis, and PCR instrumentation.",
    teaPriority: "SEP (Priority)",
  },
  "B.1G": {
    id: "B.1G",
    unit: 1,
    strand: "Scientific and engineering practices",
    title: "Develop and use models",
    description: "Develop and use models to represent biological systems.",
    teaPriority: "SEP",
  },
  "B.2A": {
    id: "B.2A",
    unit: 1,
    strand: "Scientific and engineering practices",
    title: "Model advantages and limitations",
    description: "Identify model advantages and limitations.",
    teaPriority: "SEP",
  },
  "B.3A": {
    id: "B.3A",
    unit: 1,
    strand: "Scientific and engineering practices",
    title: "Develop explanations from data",
    description: "Develop explanations supported by data and models.",
    teaPriority: "SEP (Priority)",
  },
  "B.3B": {
    id: "B.3B",
    unit: 1,
    strand: "Scientific and engineering practices",
    title: "Communicate explanations",
    description: "Communicate scientific explanations clearly and accurately.",
    teaPriority: "SEP",
  },
  "B.5A": {
    id: "B.5A",
    unit: 1,
    strand: "Biomolecules",
    title: "Biomolecule function and structure",
    description:
      "Relate the functions of carbohydrates, lipids, proteins, and nucleic acids to cell structure and function.",
    teaPriority: "Priority Content",
  },
  "B.5B": {
    id: "B.5B",
    unit: 1,
    strand: "Cells",
    title: "Prokaryotic and eukaryotic cells",
    description:
      "Compare and contrast prokaryotic and eukaryotic cells and scientific explanations for cellular complexity.",
    teaPriority: "Priority Content",
  },
  "B.5C": {
    id: "B.5C",
    unit: 1,
    strand: "Cell transport",
    title: "Homeostasis through transport",
    description:
      "Investigate homeostasis through cellular transport of molecules.",
    teaPriority: "Content",
  },
  "B.11A": {
    id: "B.11A",
    unit: 1,
    strand: "Energy conversions",
    title: "Photosynthesis and respiration models",
    description:
      "Explain conservation of matter and energy transfer during photosynthesis and cellular respiration using models and equations.",
    teaPriority: "Priority Content",
  },
  "B.11B": {
    id: "B.11B",
    unit: 1,
    strand: "Enzymes",
    title: "Role of enzymes",
    description:
      "Investigate and explain the role of enzymes in facilitating cellular processes.",
    teaPriority: "Priority Content",
  },
  "B.7A": {
    id: "B.7A",
    unit: 2,
    strand: "DNA structure",
    title: "DNA components and traits",
    description:
      "Identify DNA components and explain how nucleotide sequence specifies traits.",
    teaPriority: "Content",
  },
  "B.7B": {
    id: "B.7B",
    unit: 2,
    strand: "Gene expression",
    title: "Protein synthesis models",
    description:
      "Describe gene expression significance and explain protein synthesis using DNA/RNA models.",
    teaPriority: "Priority Content",
  },
  "B.7C": {
    id: "B.7C",
    unit: 2,
    strand: "Mutations",
    title: "DNA changes and significance",
    description:
      "Identify and illustrate changes in DNA and evaluate significance of those changes.",
    teaPriority: "Priority Content",
  },
  "B.5D": {
    id: "B.5D",
    unit: 3,
    strand: "Viruses and cells",
    title: "Compare virus and cell structures",
    description:
      "Compare structures of viruses to cells and explain how viruses spread and cause disease.",
    teaPriority: "Content",
  },
  "B.6A": {
    id: "B.6A",
    unit: 3,
    strand: "Cell cycle",
    title: "Cell cycle importance and models",
    description:
      "Explain the importance of the cell cycle to organism growth and model the overview of stages and DNA replication.",
    teaPriority: "Priority Content",
  },
  "B.6B": {
    id: "B.6B",
    unit: 3,
    strand: "Differentiation",
    title: "Cell specialization",
    description:
      "Explain cell specialization through differentiation including the role of environmental factors.",
    teaPriority: "Content",
  },
  "B.6C": {
    id: "B.6C",
    unit: 3,
    strand: "Cell cycle disruptions",
    title: "Disruptions and disease",
    description:
      "Relate disruptions of the cell cycle to the development of diseases such as cancer.",
    teaPriority: "Priority Content",
  },
  "B.8A": {
    id: "B.8A",
    unit: 3,
    strand: "Meiosis and diversity",
    title: "Meiosis and genetic diversity",
    description:
      "Analyze the significance of chromosome reduction, independent assortment, and crossing-over during meiosis in increasing diversity in sexually reproducing populations.",
    teaPriority: "Content",
  },
  "B.12B": {
    id: "B.12B",
    unit: 7,
    strand: "Processes in Plants",
    title: "Plant system interactions facilitated by structures",
    description:
      "Explain how the interactions that occur among systems that perform the functions of transport, reproduction, and response in plants are facilitated by their structures.",
    teaPriority: "Priority Content",
  },
};
