export type LessonType = "Reading" | "Lecture" | "Notes";

export type VocabularyTiers = {
  everyday: string[];
  academic: string[];
  contentSpecific: string[];
};

export type QuickCheck = {
  id: string;
  teks: string;
  learningLevel: "developing" | "progressing" | "proficient" | "advanced";
  conceptId: string;
  misconceptionTarget?: boolean;
  misconceptionDescription?: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

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
  conceptId?: string;
  minutes: number;
  type: LessonType;
  summary: string;
  hook?: LessonHook;
  teks?: string[];
  isPriorityTEKS?: boolean;
  vocabularyTiers?: VocabularyTiers;
  sections: LessonSection[];
  keyTerms: string[];
  quickChecks?: QuickCheck[];
};

export type LearningProgression = {
  developing: string | string[];
  progressing: string | string[];
  proficient: string | string[];
  advanced: string | string[];
};

export type LearningUnit = {
  id: string;
  unitNumber: 1 | 2 | 3;
  gradingPeriod: 1 | 2 | 3 | 4;
  instructionalDays?: number;
  dateRange?: string;
  concepts?: number;
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
  "u3-l1": "asgn-u3-core",
  "u3-l2": "asgn-u3-core",
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
          body: "Cystic fibrosis is caused by a single misfolded protein. One wrong amino acid changes the shape of a channel protein in lung cells, and the consequences are life-long. That's how much rides on a molecule doing its job correctly.",
          source: "NIH, 2023",
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
          headline: "Why IV fluids can save — or end — a life",
          body: "When paramedics give IV saline to a dehydrated patient, they're betting on osmosis. Too concentrated, and water rushes out of cells, causing them to shrink. Too dilute, and cells swell until they burst. Getting the concentration exactly right is what keeps cells alive — that's homeostasis enforced molecule by molecule.",
          source: "NEJM, 2018",
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
          headline: "Your breakfast was solar energy, chemically stored",
          body: "Every calorie on a nutrition label traces back to a plant capturing sunlight. The number on that label is a measure of how much chemical energy got locked into glucose bonds — energy your cells will spend one ATP at a time.",
          source: "USDA, 2022",
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
          headline: "A molecule with a four-letter alphabet that defines every living thing",
          body: "In 1953, Watson and Crick published a two-page paper describing a structure that would reshape all of biology — the DNA double helix. The base-pairing rules they described are why your cells can copy three billion letters of genetic code in under eight hours with an error rate of roughly one mistake per billion bases.",
          source: "Watson & Crick, Nature, 1953",
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
          headline: "mRNA vaccines rewrote what we thought was possible in medicine",
          body: "The COVID-19 mRNA vaccines developed in 2020 delivered genetic instructions directly into your cells, telling ribosomes to build a harmless piece of coronavirus protein. Your immune system learned from it — all using the same transcription and translation machinery your cells use every single day. What you're learning in this lesson is the mechanism behind one of the fastest vaccine developments in history.",
          source: "Moderna / BioNTech, 2020",
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
          headline: "One gene, a repair failure, and a decision that changed public conversation",
          body: "The BRCA1 gene mutation doesn't cause cancer directly — it disables a repair mechanism, so other mutations accumulate unchecked. Angelina Jolie's 2013 op-ed in the New York Times brought this concept to mainstream attention and changed how people talk about genetic risk.",
          source: "Jolie, New York Times, 2013",
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
  {
    id: "unit-3",
    unitNumber: 3,
    gradingPeriod: 2,
    instructionalDays: 19,
    dateRange: "October 21 – November 17",
    concepts: 2,
    title: "Cell Cycle",
    teks: ["B.5D", "B.6A", "B.6B", "B.6C", "B.7C", "B.8A"],
    priorityTeks: ["B.6A", "B.6C"],
    objective:
      "Explain how the cell cycle supports growth and specialization, and how disruptions including mutations and viral interactions can lead to disease.",
    vocabulary: [
      "cell cycle",
      "mitosis",
      "cytokinesis",
      "DNA replication",
      "differentiation",
      "virus",
      "cancer",
      "meiosis",
      "crossing-over",
      "independent assortment",
    ],
    misconceptions: [
      "DNA replication occurs only during mitosis.",
      "All cells divide at the same rate.",
      "Cancer is caused by a single mutation.",
      "Viruses are living cells that reproduce independently.",
      "Sexually reproducing diversity is unrelated to meiosis events.",
    ],
    successCriteria: [
      "Use models to identify stages of the cell cycle and DNA replication timing.",
      "Explain how differentiation and gene expression create specialized cell types.",
      "Construct explanations linking disrupted cell cycle regulation to cancer.",
      "Compare structures of viruses and cells using scientific terminology.",
      "Analyze how chromosome reduction, crossing-over, and independent assortment increase genetic diversity.",
    ],
    bigIdeas: [
      "Cell cycle regulation is essential for growth, repair, and stability.",
      "Disruptions to DNA/cell-cycle regulation can cause disease.",
      "Meiosis mechanisms generate diversity in sexually reproducing populations.",
    ],
    essentialQuestions: [
      "Why is accurate cell cycle timing essential for multicellular organisms?",
      "How do disruptions in division and replication contribute to disease?",
      "How does meiosis increase diversity in populations?",
    ],
    learningProgression: {
      developing: [
        "States that the cell cycle allows organisms to grow and replace cells",
        "Identifies basic stages (interphase and mitosis) without detail",
        "Recognizes that DNA must be copied before a cell divides",
        "Recognizes that uncontrolled cell division can be harmful",
        "States that meiosis reduces chromosome number by half",
      ],
      progressing: [
        "Describes the cycle as growth (interphase), division (mitosis), and cytokinesis",
        "Lists and orders G1, S, G2, M, and cytokinesis",
        "Explains that DNA replication occurs in S phase before mitosis",
        "Describes structural differences between viruses and cells",
        "Describes the role of chromosome reduction, independent assortment, and crossing-over",
      ],
      proficient: [
        "Explains how the cycle supports growth, development, and repair",
        "Uses labeled diagrams to describe semi-conservative DNA replication",
        "Explains how disruptions in division control can lead to cancer",
        "Compares virus structure to prokaryotic and eukaryotic cells",
        "Analyzes how meiosis mechanisms increase variation",
      ],
      advanced: [
        "Evaluates impacts of replication/cell-cycle errors including mutations and cancer",
        "Analyzes evidence for regulation mechanisms and consequences of disruption",
        "Evaluates environmental and genetic contributors to cell-cycle disruption",
        "Evaluates the evolutionary significance of meiosis in populations",
      ],
    },
    contentVersion: "v1.0",
    approvalStatus: "draft",
    changeLog: [
      {
        date: "2026-03-06",
        note: "Added Unit 3 Cell Cycle full placeholder curriculum with concept-aligned quick checks.",
      },
    ],
    lessons: [
      {
        id: "u3-l1",
        slug: "cell-growth",
        title: "Cell Growth",
        conceptId: "concept-3-cell-growth",
        teks: ["B.6A", "B.6B"],
        isPriorityTEKS: true,
        minutes: 10,
        type: "Reading",
        summary:
          "Investigate why the cell cycle is essential for growth and how differentiation creates specialized cells.",
        vocabularyTiers: {
          everyday: [
            "Material",
            "Analysis",
            "Experiment",
            "Lab notebook",
            "Feature(s)",
            "Instructions",
            "Complementary",
          ],
          academic: [
            "Chromosome",
            "Centriole",
            "DNA",
            "Chromatid",
            "Nucleus",
            "Organelle",
            "Centromere",
          ],
          contentSpecific: [
            "Cell cycle",
            "Mitosis",
            "Interphase",
            "Cell Division",
            "Cytokinesis",
            "Apoptosis",
            "Cyclin",
            "Growth Phase",
            "Synthesis Phase",
            "G1 phase",
            "G2 phase",
            "Prophase",
            "Metaphase",
            "Anaphase",
            "Telophase",
          ],
        },
        sections: [
          {
            heading: "Why the Cell Cycle Matters",
            body: [
              "The cell cycle is essential for organism growth, repair, and replacement of damaged cells.",
              "DNA replication occurs during S phase of interphase before mitosis begins.",
              "Tier 1 focus: overview of cycle stages and replication models, not detailed differentiation among mitosis phases.",
            ],
          },
          {
            heading: "Differentiation and Specialization",
            body: [
              "Cells in one organism contain the same DNA but express different genes.",
              "Environmental factors and cell signaling influence differentiation and specialization.",
            ],
          },
        ],
        keyTerms: [
          "cell cycle",
          "interphase",
          "DNA replication",
          "mitosis",
          "cytokinesis",
          "differentiation",
        ],
        quickChecks: [
          {
            id: "qc-u3c1-cell-cycle-stages-developing",
            teks: "B.6A",
            learningLevel: "developing",
            conceptId: "concept-3-cell-growth",
            question: "What is the main purpose of the cell cycle?",
            options: [
              "To allow cells to make food",
              "To allow organisms to grow and replace cells",
              "To help cells communicate with each other",
              "To break down old proteins",
            ],
            correctAnswer: "To allow organisms to grow and replace cells",
          },
          {
            id: "qc-u3c1-cell-cycle-stages-progressing",
            teks: "B.6A",
            learningLevel: "progressing",
            conceptId: "concept-3-cell-growth",
            misconceptionTarget: true,
            misconceptionDescription:
              "Students often think DNA replication happens during mitosis. It actually occurs during the S phase of interphase, before mitosis begins.",
            question:
              "During which phase of the cell cycle does DNA replication occur?",
            options: ["G1 phase", "S phase", "G2 phase", "M phase (Mitosis)"],
            correctAnswer: "S phase",
          },
          {
            id: "qc-u3c1-dna-replication-proficient",
            teks: "B.6A",
            learningLevel: "proficient",
            conceptId: "concept-3-cell-growth",
            misconceptionTarget: true,
            misconceptionDescription:
              "Students may think DNA replication creates two entirely new molecules. The semi-conservative model means each new DNA molecule keeps one original strand paired with one newly made strand.",
            question:
              "A student says: 'After DNA replication, both new DNA molecules are completely brand new.' Is this correct? Explain.",
            options: [
              "Yes — the cell makes two entirely new DNA copies",
              "No — each new molecule has one original strand and one new strand (semi-conservative)",
              "No — both new molecules keep the original strands and discard the copies",
              "Yes — DNA replication always produces identical new molecules from scratch",
            ],
            correctAnswer:
              "No — each new molecule has one original strand and one new strand (semi-conservative)",
          },
          {
            id: "qc-u3c1-differentiation-advanced",
            teks: "B.6B",
            learningLevel: "advanced",
            conceptId: "concept-3-cell-growth",
            question:
              "A muscle cell and a nerve cell in the same organism contain identical DNA, yet they look and function very differently. What best explains this?",
            options: [
              "Muscle cells have more DNA than nerve cells",
              "Different genes are turned on or off in each cell type due to gene expression patterns",
              "Nerve cells replicate DNA more frequently than muscle cells",
              "Environmental factors permanently deleted certain genes in each cell type",
            ],
            correctAnswer:
              "Different genes are turned on or off in each cell type due to gene expression patterns",
          },
        ],
      },
      {
        id: "u3-l2",
        slug: "disruptions-cell-cycle",
        title: "Meiosis and Disruptions to the Cell Cycle",
        conceptId: "concept-3-disruptions",
        teks: ["B.5D", "B.6C", "B.7C", "B.8A"],
        isPriorityTEKS: true,
        minutes: 9,
        type: "Lecture",
        summary:
          "Relate disruptions in cycle regulation to disease, compare viruses to cells, and analyze how meiosis increases diversity.",
        vocabularyTiers: {
          everyday: [
            "Material",
            "Analysis",
            "Experiment",
            "Lab notebook",
            "Feature(s)",
            "Instructions",
            "Complementary",
            "Mechanism",
          ],
          academic: [
            "DNA",
            "Chromosome",
            "Virus",
            "Cell Cycle",
            "Mutation",
            "Replication",
            "Cancer",
          ],
          contentSpecific: [
            "Lysis",
            "Apoptosis",
            "Cancer",
            "Oncogene",
            "Checkpoint",
            "Capsid",
            "Envelope",
            "Lytic Cycle",
            "Lysogenic Cycle",
            "Antigen",
            "Vaccine",
            "Immune Response",
            "Viroid",
            "Bacteriophage",
            "Host Cell",
          ],
        },
        sections: [
          {
            heading: "Viruses vs Cells",
            body: [
              "Viruses are acellular and depend on host cells to reproduce.",
              "Tier 1 focus compares structure and disease impact without requiring specific viral replication methods.",
            ],
          },
          {
            heading: "Cell-Cycle Disruptions and Disease",
            body: [
              "Mutations and environmental factors can disrupt cycle regulation and contribute to cancer.",
              "Tier 1 focus explains disruptions and outcomes without naming specific checkpoints.",
            ],
          },
          {
            heading: "Meiosis and Diversity",
            body: [
              "Chromosome reduction, independent assortment, and crossing-over increase variation in gametes.",
              "Tier 1 focus for B.7C excludes chromosomal mutation detail while still evaluating DNA change significance.",
            ],
          },
        ],
        keyTerms: [
          "virus",
          "capsid",
          "mutation",
          "cancer",
          "meiosis",
          "crossing-over",
          "independent assortment",
        ],
        quickChecks: [
          {
            id: "qc-u3c2-virus-vs-cell-developing",
            teks: "B.5D",
            learningLevel: "developing",
            conceptId: "concept-3-disruptions",
            misconceptionTarget: true,
            misconceptionDescription:
              "Students often think viruses are living organisms like bacteria. Viruses are non-living — they cannot grow, metabolize, or reproduce on their own.",
            question:
              "Which statement best describes a key difference between a virus and a cell?",
            options: [
              "Viruses are larger than most cells",
              "Viruses can reproduce on their own, but cells cannot",
              "Viruses are non-living and need a host cell to reproduce",
              "Viruses have a nucleus, but cells do not",
            ],
            correctAnswer:
              "Viruses are non-living and need a host cell to reproduce",
          },
          {
            id: "qc-u3c2-cancer-disruption-progressing",
            teks: "B.6C",
            learningLevel: "progressing",
            conceptId: "concept-3-disruptions",
            misconceptionTarget: true,
            misconceptionDescription:
              "Students commonly think cancer comes from a single mutation. Cancer typically results from multiple accumulated mutations in genes that regulate cell division.",
            question:
              "A cell's regulatory genes are damaged by UV radiation, causing it to divide without stopping. This scenario best describes:",
            options: [
              "Normal cell differentiation",
              "Meiosis producing gametes",
              "A disruption to the cell cycle that can lead to cancer",
              "DNA replication during S phase",
            ],
            correctAnswer:
              "A disruption to the cell cycle that can lead to cancer",
          },
          {
            id: "qc-u3c2-cancer-mutations-proficient",
            teks: "B.6C",
            learningLevel: "proficient",
            conceptId: "concept-3-disruptions",
            question:
              "Which combination of factors is most likely to cause cancer?",
            options: [
              "Normal checkpoint activity combined with high cell division rates",
              "Mutations in tumor suppressor genes AND exposure to environmental carcinogens",
              "Increased DNA replication speed during S phase only",
              "Meiosis producing genetically diverse gametes",
            ],
            correctAnswer:
              "Mutations in tumor suppressor genes AND exposure to environmental carcinogens",
          },
          {
            id: "qc-u3c2-meiosis-diversity-advanced",
            teks: "B.8A",
            learningLevel: "advanced",
            conceptId: "concept-3-disruptions",
            question:
              "Which statement best explains why sexually reproducing populations have greater genetic diversity than asexually reproducing ones?",
            options: [
              "Sexual reproduction produces more offspring per generation",
              "Meiosis causes more DNA replication errors than mitosis",
              "Chromosome reduction, independent assortment, and crossing-over during meiosis create unique gene combinations in every gamete",
              "Sexually reproducing organisms have larger genomes than asexually reproducing ones",
            ],
            correctAnswer:
              "Chromosome reduction, independent assortment, and crossing-over during meiosis create unique gene combinations in every gamete",
          },
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
