export type LessonType = "Reading" | "Lecture" | "Notes";

export type LessonSection = {
  heading: string;
  body: string[];
};

export type LessonHook = {
  headline: string;
  body: string;
  source?: string;
};

export type LearningLesson = {
  id: string;
  slug: string;
  title: string;
  minutes: number;
  type: LessonType;
  summary: string;
  hook?: LessonHook;
  sections: LessonSection[];
  keyTerms: string[];
};

export type LearningProgression = {
  developing: string;
  progressing: string;
  proficient: string;
  advanced: string;
};

export type LearningUnit = {
  id: string;
  unitNumber: 1 | 2;
  gradingPeriod: 1;
  linkedAssignmentId?: string;
  title: string;
  teks: string[];
  priorityTeks: string[];
  objective: string;
  vocabulary: string[];
  misconceptions: string[];
  successCriteria: string[];
  bigIdeas: string[];
  essentialQuestions: string[];
  learningProgression: LearningProgression;
  contentVersion: string;
  approvalStatus: "draft" | "approved";
  changeLog: { date: string; note: string }[];
  lessons: LearningLesson[];
};

export const LESSON_ASSIGNMENT_MAP: Record<string, string> = {
  "u1-l1": "asgn-u1-core",
  "u1-l2": "asgn-u1-core",
  "u1-l3": "asgn-u1-core",
  "u2-l1": "asgn-u2-core",
  "u2-l2": "asgn-u2-core",
  "u2-l3": "asgn-u2-core",
};

export const LEARNING_UNITS: LearningUnit[] = [
  {
    id: "unit-1",
    unitNumber: 1,
    gradingPeriod: 1,
    linkedAssignmentId: "asgn-u1-core",
    title: "Biomolecules and Cells",
    teks: ["B.1B", "B.1D", "B.3A", "B.5A", "B.5B", "B.5C", "B.11A", "B.11B"],
    priorityTeks: ["B.1B", "B.1D", "B.3A", "B.5A", "B.5B", "B.11A", "B.11B"],
    objective:
      "Explain how biomolecules, cells, transport, and enzyme-driven energy processes support life and homeostasis.",
    vocabulary: [
      "amino acid",
      "carbohydrate",
      "lipid",
      "nucleic acid",
      "enzyme",
      "homeostasis",
      "photosynthesis",
      "cellular respiration",
    ],
    misconceptions: [
      "All fats are unhealthy",
      "DNA is only in the nucleus",
      "All molecules pass freely through the cell membrane",
      "ATP is stored long-term in cells",
    ],
    successCriteria: [
      "Students can compare biomolecule functions in cells.",
      "Students can model cellular transport and homeostasis.",
      "Students can explain matter and energy transfer in photosynthesis and respiration.",
    ],
    bigIdeas: [
      "Structure and function are linked in biomolecules and organelles.",
      "Cells regulate internal balance through selective transport and enzyme action.",
    ],
    essentialQuestions: [
      "How do biomolecule functions determine their roles in cells?",
      "How do cells maintain balance while transferring matter and energy?",
    ],
    learningProgression: {
      developing:
        "Recognizes key biomolecules and names major organelles and transport terms.",
      progressing:
        "Describes biomolecule roles and explains basic transport patterns with examples.",
      proficient:
        "Compares cell structures and uses evidence/equations for energy conversions.",
      advanced:
        "Analyzes disruptions to transport/enzyme systems and evaluates biological data.",
    },
    contentVersion: "v2.0",
    approvalStatus: "approved",
    changeLog: [
      { date: "2026-03-05", note: "Aligned to FBISD Unit 1 TEKS scope." },
    ],
    lessons: [
      {
        id: "u1-l1",
        slug: "biomolecules-and-cell-structure",
        title: "Biomolecules and Cell Structure",
        minutes: 14,
        type: "Reading",
        summary:
          "Relates carbohydrate, lipid, protein, and nucleic acid functions to cell structures and processes.",
        hook: {
          headline: "The protein that decides if a cell lives or dies",
          body: "Cystic fibrosis is caused by a single misfolded protein. One wrong amino acid changes the shape of a channel protein in lung cells, causing thick mucus to build up and making every breath a struggle. That's how much rides on a molecule doing its job correctly — not vaguely, but at the atomic level.",
          source: "Cystic Fibrosis Foundation, 2023",
        },
        sections: [
          {
            heading: "Biomolecule Roles",
            body: [
              "Carbohydrates provide short-term energy and structural support in some organisms.",
              "Lipids support long-term energy storage and membrane structure.",
              "Proteins and nucleic acids support cellular function and information flow.",
            ],
          },
          {
            heading: "Cell Structure Connections",
            body: [
              "Organelles depend on biomolecule structure for specific functions.",
              "Changes in molecule structure can disrupt normal cellular behavior.",
            ],
          },
        ],
        keyTerms: ["carbohydrate", "lipid", "protein", "nucleic acid"],
      },
      {
        id: "u1-l2",
        slug: "cell-transport-and-homeostasis",
        title: "Cell Transport and Homeostasis",
        minutes: 11,
        type: "Lecture",
        summary:
          "Compares passive and active transport and investigates how transport supports cellular homeostasis.",
        hook: {
          headline: "Why dialysis patients visit a clinic three times a week",
          body: "Healthy kidneys use selective transport to filter more than 200 liters of blood every day, letting waste cross cell membranes while keeping proteins inside. When kidney cells stop regulating that traffic, patients need dialysis machines to do it artificially. The entire procedure is an engineering replica of what your cell membranes do without you noticing.",
          source: "National Kidney Foundation, 2023",
        },
        sections: [
          {
            heading: "Transport Types",
            body: [
              "Passive transport moves substances down concentration gradients without ATP.",
              "Active transport moves substances against gradients using ATP.",
            ],
          },
          {
            heading: "Homeostasis",
            body: [
              "Transport mechanisms stabilize internal cell conditions.",
              "Osmosis scenarios help predict changes in cell volume and function.",
            ],
          },
        ],
        keyTerms: ["homeostasis", "osmosis", "active transport", "diffusion"],
      },
      {
        id: "u1-l3",
        slug: "enzymes-photosynthesis-respiration",
        title: "Enzymes, Photosynthesis, and Respiration",
        minutes: 12,
        type: "Notes",
        summary:
          "Explains enzyme roles and models conservation of matter and energy transfer in photosynthesis and cellular respiration.",
        hook: {
          headline: "Every calorie on a nutrition label traces back to a leaf",
          body: "The number on a nutrition label measures how much chemical energy got locked into glucose bonds during photosynthesis — energy your cells will spend one ATP at a time through cellular respiration. A single enzyme can accelerate a reaction by a factor of a million; without that catalytic speed, neither process would sustain life.",
          source: "NIH National Institute of General Medical Sciences, 2022",
        },
        sections: [
          {
            heading: "Enzymes in Cell Processes",
            body: [
              "Enzymes lower activation energy and increase reaction efficiency.",
              "Enzyme shape and environmental conditions affect reaction rate.",
            ],
          },
          {
            heading: "Energy Conversion Models",
            body: [
              "Photosynthesis stores energy in glucose through chemical reactions.",
              "Cellular respiration releases usable energy from glucose for ATP production.",
            ],
          },
        ],
        keyTerms: ["enzyme", "photosynthesis", "cellular respiration", "ATP"],
      },
    ],
  },
  {
    id: "unit-2",
    unitNumber: 2,
    gradingPeriod: 1,
    linkedAssignmentId: "asgn-u2-core",
    title: "Nucleic Acids and Protein Synthesis",
    teks: ["B.7A", "B.7B", "B.7C"],
    priorityTeks: ["B.7A", "B.7B", "B.7C"],
    objective:
      "Model how DNA structure and sequence drive gene expression and protein synthesis, and evaluate mutation significance.",
    vocabulary: [
      "transcription",
      "translation",
      "codon",
      "anticodon",
      "base pairs",
      "mRNA",
      "mutation",
      "frameshift mutation",
    ],
    misconceptions: [
      "DNA is only composed of nucleotides (missing sugar-phosphate backbone)",
      "Nitrogenous bases are interchangeable",
      "RNA and DNA are identical molecules",
      "A change in DNA always causes a visible trait change",
    ],
    successCriteria: [
      "Students can identify DNA/RNA components and base-pairing rules.",
      "Students can explain transcription and translation using models.",
      "Students can illustrate point and frameshift mutations and predict likely impacts.",
    ],
    bigIdeas: [
      "Genetic information flows from DNA to RNA to protein.",
      "Changes in sequence can alter gene expression and protein outcomes.",
    ],
    essentialQuestions: [
      "How does DNA sequence specify traits through protein synthesis?",
      "When are mutation changes biologically significant?",
    ],
    learningProgression: {
      developing:
        "Recognizes DNA/RNA terms and identifies basic mutation vocabulary.",
      progressing:
        "Illustrates transcription/translation steps and simple mutation effects.",
      proficient:
        "Predicts impacts of sequence changes on protein outcomes with models.",
      advanced:
        "Evaluates mutation significance with evidence from biological scenarios.",
    },
    contentVersion: "v2.0",
    approvalStatus: "approved",
    changeLog: [
      { date: "2026-03-05", note: "Aligned to FBISD Unit 2 TEKS scope." },
    ],
    lessons: [
      {
        id: "u2-l1",
        slug: "dna-structure-and-replication",
        title: "DNA Structure and Replication",
        minutes: 12,
        type: "Reading",
        summary:
          "Identifies DNA components, base pairing, and replication fundamentals.",
        hook: {
          headline: "Your DNA is copied 37 trillion times — and gets it right almost every time",
          body: "Every time a cell divides, your body copies roughly 3 billion base pairs of DNA. DNA polymerase makes about one error per billion bases copied — but a built-in proofreading mechanism catches most mistakes before they become permanent. When that proofreading system fails, unrepaired errors accumulate and can trigger cancer.",
          source: "National Human Genome Research Institute, 2023",
        },
        sections: [
          {
            heading: "DNA Components",
            body: [
              "DNA includes a sugar-phosphate backbone and nitrogenous bases.",
              "Base-pairing specificity supports accurate information storage.",
            ],
          },
          {
            heading: "Replication Basics",
            body: [
              "Replication copies DNA before cell division using enzyme systems.",
              "Accurate copying is essential for trait continuity.",
            ],
          },
        ],
        keyTerms: ["double helix", "base pairs", "DNA polymerase", "helicase"],
      },
      {
        id: "u2-l2",
        slug: "transcription-and-translation",
        title: "Transcription and Translation",
        minutes: 11,
        type: "Lecture",
        summary:
          "Describes gene expression and explains protein synthesis using DNA/RNA models.",
        hook: {
          headline: "The COVID-19 vaccine is just a messenger",
          body: "The Moderna and Pfizer COVID-19 vaccines deliver a small strand of mRNA — the same kind your cells produce during transcription. Once inside, your ribosomes translate that mRNA into the spike protein, triggering an immune response without any viral DNA ever entering the picture. It's the central dogma of molecular biology, deployed at mass scale in 2021.",
          source: "CDC, 2021",
        },
        sections: [
          {
            heading: "Transcription",
            body: [
              "RNA polymerase builds mRNA using DNA as a template.",
              "mRNA carries codon information for protein assembly.",
            ],
          },
          {
            heading: "Translation",
            body: [
              "Ribosomes and tRNA decode codons into amino acid chains.",
              "Codon changes can alter resulting proteins.",
            ],
          },
        ],
        keyTerms: ["transcription", "translation", "mRNA", "codon"],
      },
      {
        id: "u2-l3",
        slug: "mutations-and-significance",
        title: "Mutations and Their Significance",
        minutes: 10,
        type: "Notes",
        summary:
          "Illustrates point and frameshift mutations and evaluates likely effects on proteins and traits.",
        hook: {
          headline: "A repair gene, not a cancer gene",
          body: "The BRCA1 mutation doesn't cause cancer directly — it disables a DNA repair mechanism, so other mutations accumulate unchecked over time. Angelina Jolie's 2013 op-ed in the New York Times brought this concept to mainstream attention after she chose preventive surgery based on her genetic test results. Her story changed how millions of people talk about genetic risk and personal medical decisions.",
          source: "New York Times / NEJM, 2013",
        },
        sections: [
          {
            heading: "Mutation Types",
            body: [
              "Point mutations affect individual bases and may be silent, missense, or nonsense.",
              "Frameshift mutations can alter many downstream codons.",
            ],
          },
          {
            heading: "Significance",
            body: [
              "Not all mutations cause visible phenotype changes.",
              "Impact depends on where and how the sequence changes.",
            ],
          },
        ],
        keyTerms: [
          "mutation",
          "point mutation",
          "frameshift mutation",
          "gene expression",
        ],
      },
    ],
  },
];

export function getUnitById(unitId: string): LearningUnit | undefined {
  return LEARNING_UNITS.find((unit) => unit.id === unitId);
}

export function getLessonBySlug(
  unit: LearningUnit,
  lessonSlug: string,
): LearningLesson | undefined {
  return unit.lessons.find((lesson) => lesson.slug === lessonSlug);
}

export function getLessonById(
  lessonId: string,
): { unit: LearningUnit; lesson: LearningLesson } | undefined {
  for (const unit of LEARNING_UNITS) {
    const lesson = unit.lessons.find((row) => row.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return undefined;
}

export function getUnitsByGradingPeriod(
  gradingPeriod: 1 | 2 | 3 | 4,
): LearningUnit[] {
  return LEARNING_UNITS.filter((unit) => unit.gradingPeriod === gradingPeriod);
}
