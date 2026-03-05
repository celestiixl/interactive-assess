/**
 * Biology icons mapped to FBISD curriculum TEKS topics.
 * Icons sourced from the NIH BioArt collection (https://bioart.niaid.nih.gov),
 * a public-domain repository of scientific illustrations by NIAID.
 * Emoji fallbacks are provided for environments where SVG images are not available.
 *
 * Attribution: NIH BioArt Source, National Institute of Allergy and Infectious Diseases (NIAID).
 * Most images are public domain; see https://bioart.niaid.nih.gov/faqs for license details.
 */

export type BioArtIcon = {
  /** Human-readable label for the biological subject */
  label: string;
  /** Emoji fallback for environments without image support */
  emoji: string;
  /** NIH BioArt illustration ID (e.g. "302" → https://bioart.niaid.nih.gov/bioart/302) */
  bioartId?: string;
  /** TEKS codes this icon is relevant to */
  teks: string[];
  /** Biology category for grouping */
  category:
    | "cell"
    | "biomolecule"
    | "organism"
    | "process"
    | "structure"
    | "genetics";
  /** Keyword fragments used to match segment labels in SpecimenGrid */
  matchKeywords: string[];
};

/**
 * Master icon registry for BioSpark biology specimens.
 * Each entry corresponds to one or more TEKS learning standards.
 */
export const BIOART_ICONS: BioArtIcon[] = [
  // ── Cells & Organelles ─────────────────────────────────────────────────────
  {
    label: "Amoeba",
    emoji: "🦠",
    teks: ["BIO.5.A", "BIO.5.B"],
    category: "organism",
    matchKeywords: ["cell", "amoeba", "microbe"],
  },
  {
    label: "E. coli Bacteria",
    emoji: "🧫",
    bioartId: "150",
    teks: ["BIO.5.B"],
    category: "organism",
    matchKeywords: ["bacteria", "prokaryote", "prokaryotic", "bacterium"],
  },
  {
    label: "Animal Cell",
    emoji: "🔵",
    teks: ["BIO.5.A", "BIO.5.B"],
    category: "cell",
    matchKeywords: ["animal cell", "eukaryote", "eukaryotic"],
  },
  {
    label: "Plant Cell",
    emoji: "🌱",
    teks: ["BIO.5.A", "BIO.5.B"],
    category: "cell",
    matchKeywords: ["plant cell", "chloro", "cellulose"],
  },
  {
    label: "Mitochondria",
    emoji: "⚡",
    teks: ["BIO.11.A"],
    category: "structure",
    matchKeywords: ["mitochond", "respiration", "atp", "energy"],
  },
  {
    label: "Chloroplast",
    emoji: "🌿",
    teks: ["BIO.11.A"],
    category: "structure",
    matchKeywords: ["chloro", "photosynthesis", "light-depend"],
  },
  {
    label: "Nucleus",
    emoji: "🔮",
    teks: ["BIO.5.B", "BIO.7.A"],
    category: "structure",
    matchKeywords: ["nucleus", "nuclear"],
  },
  {
    label: "Ribosome",
    emoji: "🔵",
    teks: ["BIO.7.B"],
    category: "structure",
    matchKeywords: ["ribosome", "translation"],
  },
  {
    label: "Cell Membrane",
    emoji: "🫧",
    teks: ["BIO.5.C"],
    category: "structure",
    matchKeywords: ["membrane", "transport", "homeostasis", "osmosis", "diffusion"],
  },

  // ── Biomolecules ────────────────────────────────────────────────────────────
  {
    label: "DNA Double Helix",
    emoji: "🧬",
    teks: ["BIO.7.A", "BIO.7.B", "BIO.7.C"],
    category: "biomolecule",
    matchKeywords: ["dna", "nucleic", "nucleotide", "double helix", "replication"],
  },
  {
    label: "RNA",
    emoji: "🧶",
    teks: ["BIO.7.A", "BIO.7.B"],
    category: "biomolecule",
    matchKeywords: ["rna", "mrna", "trna", "rrna", "transcription"],
  },
  {
    label: "Protein",
    emoji: "🔗",
    teks: ["BIO.5.A", "BIO.7.B"],
    category: "biomolecule",
    matchKeywords: ["protein", "amino acid", "polypeptide", "peptide"],
  },
  {
    label: "Enzyme",
    emoji: "⚗️",
    teks: ["BIO.11.B"],
    category: "biomolecule",
    matchKeywords: ["enzyme", "catalyst", "active site", "substrate"],
  },
  {
    label: "Carbohydrate",
    emoji: "🍬",
    teks: ["BIO.5.A"],
    category: "biomolecule",
    matchKeywords: ["carbohydrate", "glucose", "starch", "glycogen", "sugar", "monosaccharide"],
  },
  {
    label: "Lipid",
    emoji: "💧",
    teks: ["BIO.5.A"],
    category: "biomolecule",
    matchKeywords: ["lipid", "fat", "phospholipid", "fatty acid"],
  },

  // ── Organisms ────────────────────────────────────────────────────────────────
  {
    label: "Bacteriophage Virus",
    emoji: "🦠",
    bioartId: "220",
    teks: ["BIO.5.B"],
    category: "organism",
    matchKeywords: ["virus", "viral", "bacteriophage", "pathogen"],
  },
  {
    label: "Fruit Fly",
    emoji: "🪰",
    teks: ["BIO.7.C"],
    category: "organism",
    matchKeywords: ["genetic", "mutation", "heredity", "drosophila"],
  },
  {
    label: "Darwin's Finch",
    emoji: "🐦",
    teks: ["BIO.4.B"],
    category: "organism",
    matchKeywords: ["selection", "evolution", "adaptation", "finch"],
  },
  {
    label: "Wolf",
    emoji: "🐺",
    teks: [],
    category: "organism",
    matchKeywords: ["ecosystem", "predator", "food web"],
  },
  {
    label: "Zebrafish",
    emoji: "🐟",
    teks: ["BIO.7.C"],
    category: "organism",
    matchKeywords: ["cycle", "zebrafish", "development"],
  },
  {
    label: "Elodea",
    emoji: "🌿",
    teks: ["BIO.11.A"],
    category: "organism",
    matchKeywords: ["elodea", "aquatic plant"],
  },
  {
    label: "Mushroom",
    emoji: "🍄",
    teks: ["BIO.11.A"],
    category: "organism",
    matchKeywords: ["fungi", "decompos", "mushroom"],
  },

  // ── Processes ────────────────────────────────────────────────────────────────
  {
    label: "Photosynthesis",
    emoji: "☀️",
    teks: ["BIO.11.A"],
    category: "process",
    matchKeywords: ["photosynthesis", "light reaction", "carbon fixation"],
  },
  {
    label: "Cellular Respiration",
    emoji: "🌬️",
    teks: ["BIO.11.A"],
    category: "process",
    matchKeywords: ["cellular respiration", "glycolysis", "fermentation"],
  },
  {
    label: "Gene Expression",
    emoji: "📖",
    teks: ["BIO.7.B"],
    category: "genetics",
    matchKeywords: ["gene expression", "protein synthesis", "codon"],
  },
  {
    label: "DNA Mutation",
    emoji: "🔄",
    teks: ["BIO.7.C"],
    category: "genetics",
    matchKeywords: ["mutation", "frameshift", "point mutation", "insertion", "deletion"],
  },
];

/**
 * Look up a BioArt icon entry by matching against a label string.
 * Returns the first matching entry, or undefined if no match found.
 */
export function findBioArtIcon(label: string): BioArtIcon | undefined {
  const lower = label.toLowerCase();
  return BIOART_ICONS.find((icon) =>
    icon.matchKeywords.some((kw) => lower.includes(kw)),
  );
}

/**
 * Get all icons for a given TEKS code.
 */
export function getIconsByTeks(teksCode: string): BioArtIcon[] {
  return BIOART_ICONS.filter((icon) => icon.teks.includes(teksCode));
}

/**
 * Get all icons for a given category.
 */
export function getIconsByCategory(
  category: BioArtIcon["category"],
): BioArtIcon[] {
  return BIOART_ICONS.filter((icon) => icon.category === category);
}
