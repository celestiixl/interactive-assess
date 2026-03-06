/**
 * Demo genome data for the BioSpark Genome Browser.
 * Aligned with FBISD Biology Unit 2 – Nucleic Acids and Protein Synthesis.
 * TEKS: B.7A, B.7C
 */

export type AnnotationType =
  | "gene"
  | "promoter"
  | "tatabox"
  | "exon"
  | "intron"
  | "cds"
  | "utr"
  | "start_codon"
  | "stop_codon"
  | "mutation"
  | "regulatory";

export interface GenomeAnnotation {
  id: string;
  label: string;
  type: AnnotationType;
  /** 1-based, inclusive */
  start: number;
  /** 1-based, inclusive */
  end: number;
  strand: "+" | "-";
  description: string;
  teks: string[];
}

export interface DemoSequence {
  id: string;
  name: string;
  organism: string;
  chromosome: string;
  description: string;
  /** Full nucleotide string (1-indexed via seq[pos-1]) */
  sequence: string;
  annotations: GenomeAnnotation[];
}

// ── Color map by annotation type ─────────────────────────────────────────────

export const ANNOTATION_COLORS: Record<AnnotationType, string> = {
  gene:        "#6366f1", // indigo
  promoter:    "#f59e0b", // amber
  tatabox:     "#f97316", // orange
  exon:        "#10b981", // emerald
  intron:      "#94a3b8", // slate
  cds:         "#22c55e", // green
  utr:         "#a78bfa", // violet
  start_codon: "#14b8a6", // teal
  stop_codon:  "#ef4444", // red
  mutation:    "#ec4899", // pink
  regulatory:  "#f59e0b", // amber
};

export const ANNOTATION_LABEL: Record<AnnotationType, string> = {
  gene:        "Gene",
  promoter:    "Promoter",
  tatabox:     "TATA Box",
  exon:        "Exon",
  intron:      "Intron",
  cds:         "CDS",
  utr:         "UTR",
  start_codon: "Start Codon",
  stop_codon:  "Stop Codon",
  mutation:    "Mutation",
  regulatory:  "Regulatory",
};

// ── Base color map ────────────────────────────────────────────────────────────

export const BASE_COLORS: Record<string, string> = {
  A: "#22c55e", // green
  T: "#ef4444", // red
  C: "#3b82f6", // blue
  G: "#f59e0b", // amber
};

// ── Demo sequence: "BSRK1" (BioSpark Reference Gene 1) ───────────────────────
// A 291 bp educational demo showing classic gene structure:
// Upstream → Promoter (TATA box) → 5'UTR → ATG → Exon1 → Intron1 →
// Exon2 → Intron2 → Exon3 → Stop Codon → 3'UTR
//
// Region breakdown:
//  1– 25  Upstream regulatory region
// 26– 57  Promoter (TATA box at 31–36)
// 58– 74  5' UTR
// 75– 77  Start codon (ATG)
// 78–115  Exon 1
//116–153  Intron 1 (GT…AG splice signals)
//154–191  Exon 2
//192–229  Intron 2 (GT…AG splice signals)
//230–246  Exon 3
//247–249  Stop codon (TAA)
//250–291  3' UTR

const BSRK1_SEQUENCE =
  // 1-25: upstream regulatory
  "GCTAGCTTGACCTTATAAGGCCTGA" +
  // 26-57: promoter (TATA box TATAAA at 31-36)
  "CGAGCTATAAAATGCGGCTTCCGAGGTACCTG" +
  // 58-74: 5' UTR
  "AGTCAGCTTAAGCAGCT" +
  // 75-77: start codon
  "ATG" +
  // 78-115: exon 1 (coding)
  "GCAATCGTAGCATGCAATGCGATCAGCTAGCATGCAAT" +
  // 116-153: intron 1 (GT...AG)
  "GTAAGTCGATCGATCGCTAGCTATCGATCGCTATCAAG" +
  // 154-191: exon 2 (coding)
  "CAGATCGCATGCAATGCTAGCATGCAATGCGATCAGCT" +
  // 192-229: intron 2 (GT...AG)
  "GTCAGTCGATCGATCGCTAGCTATCGATCGCTATCAAG" +
  // 230-246: exon 3 (coding)
  "ATCGCATGCAGCTATCG" +
  // 247-249: stop codon
  "TAA" +
  // 250-291: 3' UTR (contains poly-A signal AATAAA at 272-277)
  "GCTTAAGCATGGTTAACGTTAACCAGTCAGCAATCGCTAAATAATCG";

const BSRK1_ANNOTATIONS: GenomeAnnotation[] = [
  {
    id: "upstream",
    label: "Upstream Region",
    type: "regulatory",
    start: 1,
    end: 25,
    strand: "+",
    description:
      "Upstream regulatory region that may contain enhancer or silencer elements. These sequences influence how strongly the gene is expressed.",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "promoter",
    label: "Promoter",
    type: "promoter",
    start: 26,
    end: 57,
    strand: "+",
    description:
      "The promoter is a DNA region that initiates transcription of the gene. RNA polymerase binds here to begin making mRNA.",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "tatabox",
    label: "TATA Box",
    type: "tatabox",
    start: 31,
    end: 36,
    strand: "+",
    description:
      'The TATA box (sequence: TATAAA) is a core promoter element. It helps position RNA polymerase and general transcription factors at the transcription start site.',
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "utr5",
    label: "5′ UTR",
    type: "utr",
    start: 58,
    end: 74,
    strand: "+",
    description:
      "The 5′ untranslated region (5′ UTR) is transcribed but not translated into protein. It plays roles in mRNA stability and translation efficiency.",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "start_codon",
    label: "Start Codon (ATG)",
    type: "start_codon",
    start: 75,
    end: 77,
    strand: "+",
    description:
      "ATG is the universal start codon. It signals the ribosome to begin translation, and codes for the amino acid methionine (Met, M).",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "gene",
    label: "BSRK1 Gene",
    type: "gene",
    start: 75,
    end: 249,
    strand: "+",
    description:
      "BioSpark Reference Gene 1 (BSRK1) — a hypothetical gene used to demonstrate genome structure. Contains 3 exons separated by 2 introns.",
    teks: ["B.7A", "B.7B", "B.7C"],
  },
  {
    id: "exon1",
    label: "Exon 1",
    type: "exon",
    start: 75,
    end: 115,
    strand: "+",
    description:
      "Exon 1 — the first coding sequence that is retained in the mature mRNA after splicing. Exons are the protein-coding portions of the gene.",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "intron1",
    label: "Intron 1",
    type: "intron",
    start: 116,
    end: 153,
    strand: "+",
    description:
      "Intron 1 — an intervening sequence that is removed (spliced out) from the pre-mRNA during RNA processing. Notice the GT splice donor at the 5′ end and the AG splice acceptor at the 3′ end.",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "exon2",
    label: "Exon 2",
    type: "exon",
    start: 154,
    end: 191,
    strand: "+",
    description:
      "Exon 2 — the second coding exon. After splicing, Exon 2 is joined directly to Exon 1 in the mature mRNA.",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "intron2",
    label: "Intron 2",
    type: "intron",
    start: 192,
    end: 229,
    strand: "+",
    description:
      "Intron 2 — the second non-coding intervening sequence. Like Intron 1, it begins with GT and ends with AG (GU–AG rule in RNA).",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "exon3",
    label: "Exon 3",
    type: "exon",
    start: 230,
    end: 249,
    strand: "+",
    description:
      "Exon 3 — the final coding exon, containing the last codons of the protein and the stop codon.",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "stop_codon",
    label: "Stop Codon (TAA)",
    type: "stop_codon",
    start: 247,
    end: 249,
    strand: "+",
    description:
      "TAA is one of three stop codons (TAA, TAG, TGA). It signals the ribosome to terminate translation. No amino acid is added for a stop codon.",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "utr3",
    label: "3′ UTR",
    type: "utr",
    start: 250,
    end: 291,
    strand: "+",
    description:
      "The 3′ untranslated region follows the stop codon. It contains signals for mRNA stability and polyadenylation (poly-A tail addition).",
    teks: ["B.7A", "B.7B"],
  },
  {
    id: "mutation1",
    label: "Point Mutation (G→A)",
    type: "mutation",
    start: 135,
    end: 135,
    strand: "+",
    description:
      "A simulated point mutation in Intron 1 — a single nucleotide change from G to A. Intronic mutations can affect splicing if near splice sites. This type of change is called a single nucleotide polymorphism (SNP).",
    teks: ["B.7C"],
  },
  {
    id: "mutation2",
    label: "Missense Mutation (C→T)",
    type: "mutation",
    start: 88,
    end: 88,
    strand: "+",
    description:
      "A simulated missense mutation in Exon 1 — a single nucleotide change that alters the amino acid sequence of the resulting protein. Missense mutations can affect protein structure and function.",
    teks: ["B.7C"],
  },
];

export const DEMO_SEQUENCES: DemoSequence[] = [
  {
    id: "bsrk1",
    name: "BSRK1 Gene Region",
    organism: "Homo sapiens (educational model)",
    chromosome: "Chr 7 (demo)",
    description:
      "A 291 bp educational model of gene structure showing promoter, TATA box, 3 exons, 2 introns, UTRs, start & stop codons, and example mutations. Aligned to TEKS B.7A and B.7C.",
    sequence: BSRK1_SEQUENCE,
    annotations: BSRK1_ANNOTATIONS,
  },
];

export const DEFAULT_SEQUENCE_ID = "bsrk1";
