import type {
  ItemDragDrop,
  ItemCardSort,
  ItemHotspot,
  ItemShort,
  Item,
} from "@/types/item";

export const bioInteractives: Item[] = [
  // Drag & drop — BIO.5.A
  {
    kind: "dragDrop",
    id: "bio5a-dd1",
    attempts: 2,
    teks: ["BIO.5.A"],
    stem: "Drag each molecule to the category that best matches its main role.",
    zones: [
      { id: "energy", label: "Energy/Storage" },
      { id: "enz", label: "Structure/Protein Function" },
      { id: "info", label: "Genetic Information" },
    ],
    cards: [
      { id: "glucose", text: "Glucose" },
      { id: "cellulose", text: "Cellulose" },
      { id: "hemoglobin", text: "Hemoglobin" },
      { id: "dna", text: "DNA" },
    ],
    correct: {
      glucose: "energy",
      cellulose: "enz",
      hemoglobin: "enz",
      dna: "info",
    },
    rationale:
      "Glucose supports quick energy, cellulose is a structural carbohydrate, hemoglobin is a protein, and DNA stores hereditary information.",
  } as ItemDragDrop,

  // Card sort — BIO.7.B
  {
    kind: "cardSort",
    id: "bio7b-cs1",
    attempts: 2,
    teks: ["BIO.7.B"],
    stem: "Sort each process into Transcription or Translation.",
    columns: [
      { id: "tx", label: "Transcription" },
      { id: "tl", label: "Translation" },
    ],
    cards: [
      { id: "rnaPoly", text: "RNA polymerase builds mRNA" },
      { id: "ribosome", text: "Ribosome binds mRNA" },
      { id: "tRNA", text: "tRNAs bring amino acids" },
      { id: "splicing", text: "Introns removed; exons joined" },
    ],
    correct: { rnaPoly: "tx", splicing: "tx", ribosome: "tl", tRNA: "tl" },
  } as ItemCardSort,

  // Hotspot — BIO.5.B
  {
    kind: "hotspot",
    id: "bio5b-hs1",
    attempts: "unlimited",
    teks: ["BIO.5.B"],
    stem: "Click the organelle where most cellular respiration occurs in eukaryotic cells.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Animal_cell_structure_en.svg",
    regions: [
      {
        id: "mito",
        shape: "circle",
        coords: [335, 230, 30],
        label: "Mitochondrion",
      },
      {
        id: "nucleus",
        shape: "circle",
        coords: [240, 170, 45],
        label: "Nucleus",
      },
    ],
    correct: ["mito"],
    rationale:
      "Mitochondria perform most ATP-generating steps of cellular respiration in eukaryotic cells.",
  } as ItemHotspot,

  // Short response — BIO.11.A
  {
    kind: "short",
    id: "bio11a-sh1",
    teks: ["BIO.11.A"],
    stem: "Explain how matter and energy are transformed during photosynthesis.",
    rubric: {
      points: 3,
      criteria: [
        "Mentions CO2 + H2O → glucose + O2",
        "Energy from light captured by chlorophyll",
        "Matter conserved (atoms rearranged)",
      ],
    },
    exemplars: [
      "Plants use light to turn CO2 and H2O into glucose and oxygen; atoms are rearranged, energy is stored in glucose.",
    ],
  } as ItemShort,
];
