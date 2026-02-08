import type { MCQItem } from "@/components/items/MCQ";

export const bio9Items: MCQItem[] = [
  {
    id: "bio-1",
    tags: ["BIO.5.B", "BIO.5.A"], // organelles & biomolecules/cell function
    stem: "Which organelle modifies, sorts, and packages proteins for secretion?",
    choices: [
      { id: "a", text: "Nucleus" },
      { id: "b", text: "Mitochondrion" },
      { id: "c", text: "Golgi apparatus" },
      { id: "d", text: "Ribosome" },
    ],
    correctIds: ["c"],
    retryLimit: 2,
    rationale:
      "The Golgi apparatus processes and packages proteins from the ER for transport.",
  },
  {
    id: "bio-2",
    tags: ["BIO.5.A"], // biomolecules & function
    stem: "Which macromolecule pairing is correctly matched with its primary function?",
    choices: [
      { id: "a", text: "Enzymes — proteins" },
      { id: "b", text: "Starch — carbohydrate" },
      { id: "c", text: "DNA — nucleic acid" },
      { id: "d", text: "Phospholipid — lipid" },
    ],
    correctIds: ["a"],
    retryLimit: 2,
    rationale:
      "Enzymes are proteins that catalyze reactions. Starch is a carbohydrate; DNA is a nucleic acid; phospholipids are lipids.",
  },
  {
    id: "bio-3",
    tags: ["BIO.11.A"], // photosynthesis vs respiration
    stem: "Which statement accurately describes photosynthesis and cellular respiration?",
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
      "Photosynthesis captures energy to build glucose; cellular respiration breaks glucose to make ATP.",
  },
  {
    id: "bio-4",
    tags: ["BIO.7.A"], // DNA/RNA components
    stem: "Which component is found in RNA but not in DNA?",
    choices: [
      { id: "a", text: "Thymine" },
      { id: "b", text: "Uracil" },
      { id: "c", text: "Deoxyribose" },
      { id: "d", text: "Double-stranded helix" },
    ],
    correctIds: ["b"],
    retryLimit: 2,
    rationale: "RNA contains uracil instead of thymine and uses ribose sugar.",
  },
  {
    id: "bio-5",
    tags: ["BIO.8.B"], // Punnett outcomes
    stem: "In peas, yellow (Y) is dominant to green (y). What fraction of offspring from Yy × yy are expected to be green?",
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
    id: "bio-6",
    tags: ["BIO.10.A", "BIO.10.B"], // natural selection concepts
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
    id: "bio-7",
    tags: ["BIO.12.A"], // homeostasis via system interactions
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
    id: "bio-8",
    tags: ["BIO.13.A", "BIO.13.B"], // succession & stability
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
    id: "bio-9",
    tags: ["BIO.5.C"], // osmosis—cell transport
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
