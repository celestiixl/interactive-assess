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
    stem: "Drag each biomolecule to its primary function.",
  zones: [
      { id: "energy", label: "Energy" },
      { id: "enz", label: "Enzymes/Structure" },
      { id: "info", label: "Genetic Info" },
    ],
  cards: [
      { id: "glucose", text: "Glucose" },
      { id: "cellulose", text: "Cellulose" },
      { id: "hemoglobin", text: "Hemoglobin" },
      { id: "dna", text: "DNA" },
    ],
    correct: {
      glucose: "energy",
      cellulose: "energy",
      hemoglobin: "enz",
      dna: "info",
    },
    rationale:
      "Carbs → energy/structure; proteins → enzymes/structure; nucleic acids → information.",
  } as ItemDragDrop,

  // Card sort — BIO.7.B
  {
    kind: "cardSort",
    id: "bio7b-cs1",
      attempts: 2,
    teks: ["BIO.7.B"],
    stem: "Sort each step into Transcription vs Translation.",
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
    stem: "Click the organelle where cellular respiration mainly occurs.",
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
    rationale: "Mitochondria are the site of most ATP production.",
  } as ItemHotspot,

  // Short response — BIO.11.A
  {
    kind: "short",
    id: "bio11a-sh1",
    teks: ["BIO.11.A"],
    stem: "Explain how matter and energy change during photosynthesis.",
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
