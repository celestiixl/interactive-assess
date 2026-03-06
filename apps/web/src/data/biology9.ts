import type { ItemMCQ } from "@/types/item";

export const bio9Items: ItemMCQ[] = [
  {
    kind: "mcq",
    id: "bio-1",
    tags: ["BIO.5.B", "BIO.5.A"],
    teks: ["BIO.5.B", "BIO.5.A"],
    stem: "A secretory cell makes large amounts of digestive enzymes. Which organelle is most directly responsible for modifying, sorting, and packaging these proteins before release?",
    choices: [
      { id: "a", text: "Ribosome" },
      { id: "b", text: "Golgi apparatus" },
      { id: "c", text: "Rough endoplasmic reticulum" },
      { id: "d", text: "Lysosome" },
    ],
    correctIds: ["b"],
    retryLimit: 2,
    rationale:
      "Ribosomes build proteins, but the Golgi apparatus modifies, sorts, and packages them into vesicles for transport or secretion.",
  },
  {
    kind: "mcq",
    id: "bio-2",
    tags: ["BIO.5.A"],
    teks: ["BIO.5.A"],
    stem: "Which biomolecule-to-function match is most accurate?",
    choices: [
      {
        id: "a",
        text: "Nucleic acids: store and transmit genetic information",
      },
      { id: "b", text: "Lipids: form peptide bonds between amino acids" },
      { id: "c", text: "Carbohydrates: directly code for proteins" },
      {
        id: "d",
        text: "Proteins: long-term storage of hereditary information",
      },
    ],
    correctIds: ["a"],
    retryLimit: 2,
    rationale:
      "Nucleic acids (DNA and RNA) store and transmit genetic information. Lipids, carbohydrates, and proteins have other primary roles.",
  },
  {
    kind: "mcq",
    id: "bio-3",
    tags: ["BIO.11.A"],
    teks: ["BIO.11.A"],
    stem: "Which statement best compares photosynthesis and cellular respiration?",
    choices: [
      {
        id: "a",
        text: "Photosynthesis releases energy from glucose; respiration stores energy in glucose.",
      },
      { id: "b", text: "Both processes occur only in animal cells." },
      {
        id: "c",
        text: "Photosynthesis stores energy in glucose; respiration releases energy from glucose.",
      },
      { id: "d", text: "Neither process involves ATP." },
    ],
    correctIds: ["c"],
    retryLimit: 2,
    rationale:
      "Photosynthesis captures light energy and stores it in glucose. Cellular respiration releases that stored chemical energy to produce ATP.",
  },
  {
    kind: "mcq",
    id: "bio-4",
    tags: ["BIO.7.A"],
    teks: ["BIO.7.A"],
    stem: "Which feature is found in RNA but not in DNA?",
    choices: [
      { id: "a", text: "Thymine" },
      { id: "b", text: "Uracil" },
      { id: "c", text: "Deoxyribose" },
      { id: "d", text: "Double-stranded helix" },
    ],
    correctIds: ["b"],
    retryLimit: 2,
    rationale:
      "RNA contains uracil (U) and uses ribose sugar, while DNA contains thymine (T) and deoxyribose.",
  },
  {
    kind: "mcq",
    id: "bio-5",
    tags: ["BIO.8.B"],
    teks: ["BIO.8.B"],
    stem: "In pea plants, yellow seed color (Y) is dominant to green (y). What fraction of offspring from Yy × yy are expected to be green?",
    choices: [
      { id: "a", text: "0" },
      { id: "b", text: "1/4" },
      { id: "c", text: "1/2" },
      { id: "d", text: "3/4" },
    ],
    correctIds: ["c"],
    retryLimit: 2,
    rationale: "Yy × yy → 50% Yy (yellow) and 50% yy (green).",
  },
  {
    kind: "mcq",
    id: "bio-6",
    tags: ["BIO.10.A", "BIO.10.B"],
    teks: ["BIO.10.A", "BIO.10.B"],
    stem: "Which situation best demonstrates natural selection?",
    choices: [
      { id: "a", text: "Plants grow faster when watered daily." },
      {
        id: "b",
        text: "Bacteria with a mutation survive antibiotics and reproduce.",
      },
      { id: "c", text: "A student practices piano and improves." },
      { id: "d", text: "A rock is weathered into smaller pieces." },
    ],
    correctIds: ["b"],
    retryLimit: 2,
    rationale:
      "Antibiotics select for resistant bacteria; survivors reproduce, changing the population.",
  },
  {
    kind: "mcq",
    id: "bio-7",
    tags: ["BIO.12.A"],
    teks: ["BIO.12.A"],
    stem: "Which is an example of negative feedback maintaining homeostasis in humans?",
    choices: [
      { id: "a", text: "A wound forms a scar" },
      { id: "b", text: "Insulin lowers high blood glucose" },
      { id: "c", text: "A fever rises uncontrollably" },
      { id: "d", text: "Blood clotting accelerates after a cut" },
    ],
    correctIds: ["b"],
    retryLimit: 2,
    rationale:
      "When blood glucose rises, insulin reduces it toward the set point (negative feedback).",
  },
  {
    kind: "mcq",
    id: "bio-8",
    tags: ["BIO.13.A", "BIO.13.B"],
    teks: ["BIO.13.A", "BIO.13.B"],
    stem: "Primary succession most likely occurs in which situation?",
    choices: [
      { id: "a", text: "After a forest fire leaves soil intact" },
      { id: "b", text: "On newly formed volcanic rock" },
      { id: "c", text: "After seasonal leaf fall" },
      { id: "d", text: "After mowing a lawn" },
    ],
    correctIds: ["b"],
    retryLimit: 2,
    rationale:
      "Primary succession starts where no soil exists, such as new lava flows or glacial retreats.",
  },
  {
    kind: "mcq",
    id: "bio-9",
    tags: ["BIO.5.C"],
    teks: ["BIO.5.C"],
    stem: "Water moving across a semipermeable membrane from high water concentration to low water concentration is called—",
    choices: [
      { id: "a", text: "Active transport" },
      { id: "b", text: "Diffusion" },
      { id: "c", text: "Osmosis" },
      { id: "d", text: "Endocytosis" },
    ],
    correctIds: ["c"],
    retryLimit: 2,
    rationale:
      "Osmosis is the diffusion of water across a semipermeable membrane.",
  },
];
