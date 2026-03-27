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

/** Default section — heading + paragraphs */
export type ExplanationSection = {
  type?: "explanation";
  heading: string;
  body: string[];
};

/** Step-by-step worked example */
export type WorkedExampleSection = {
  type: "worked-example";
  heading: string;
  scenario: string;
  steps: string[];
  conclusion?: string;
};

/** Addresses a common misconception */
export type MisconceptionSpotlightSection = {
  type: "misconception-spotlight";
  misconception: string;
  correction: string;
  teks?: string;
};

/** Labelled diagram described in text */
export type VisualDiagramSection = {
  type: "visual-diagram";
  heading: string;
  description: string;
  elements: { label: string; detail: string }[];
};

/** Vocabulary in focus for the section */
export type VocabularySpotlightSection = {
  type: "vocabulary-spotlight";
  terms: { term: string; definition: string; example?: string }[];
};

/** Short writing / discussion prompt */
export type ActivitySection = {
  type: "activity";
  heading: string;
  prompt: string;
  sentenceFrames?: string[];
};

export type LessonSection =
  | ExplanationSection
  | WorkedExampleSection
  | MisconceptionSpotlightSection
  | VisualDiagramSection
  | VocabularySpotlightSection
  | ActivitySection;

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
  learningIntentions?: string[];
  lessonMisconceptions?: string[];
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
  unitNumber: number;
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
          headline:
            "A molecule with a four-letter alphabet that defines every living thing",
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
          headline:
            "mRNA vaccines rewrote what we thought was possible in medicine",
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
          headline:
            "One gene, a repair failure, and a decision that changed public conversation",
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

  // ─── Unit 7: Processes in Plants ───────────────────────────────────────────
  {
    id: "unit-7",
    unitNumber: 7,
    gradingPeriod: 2,
    instructionalDays: 9,
    title: "Processes in Plants",
    teks: ["B.12B"],
    priorityTeks: ["B.12B"],
    objective:
      "Explain how the interactions that occur among systems that perform functions of transport, reproduction, and response in plants are facilitated by their structures.",
    vocabulary: [
      "xylem", "phloem", "transpiration", "stomata", "cuticle",
      "pollination", "fertilization", "seed dispersal", "auxin",
      "gibberellins", "phototropism", "gravitropism", "thigmotropism",
    ],
    misconceptions: [
      "Water and nutrients are transported through plants only by the roots",
      "Plants only use one type of tissue for transport",
      "Pollination and fertilization are the same process",
      "Plant responses to stimuli are solely physical changes",
      "Transpiration is wasteful",
    ],
    successCriteria: [
      "Identify and describe the major plant systems involved in transport, reproduction, and response",
      "Explain how xylem and phloem function in transporting water, nutrients, and sugars",
      "Describe the structures of flowers and how they facilitate reproduction",
      "Explain how plant hormones regulate growth and responses to environmental stimuli",
      "Analyze the role of tropisms in plant responses to environmental changes",
      "Illustrate and explain how transport, reproductive, and response systems work together",
    ],
    bigIdeas: [
      "Plant Systems Are Interdependent — transport, reproductive, and response systems rely on each other for survival.",
      "Structural Adaptations Facilitate Function — xylem, phloem, stomata, and guard cells enable efficient function.",
      "Environmental Interactions Drive Internal Plant Responses — light, gravity, and touch trigger hormonal responses.",
    ],
    essentialQuestions: [
      "How do the structures of plant systems work together to support the overall survival and growth of a plant?",
      "In what ways do plant structures enable adaptation to environmental changes and successful reproduction?",
      "How do disruptions in one plant system affect other systems?",
    ],
    learningProgression: {
      developing: "Identify major plant structures; recognize plants have systems performing essential functions.",
      progressing: "Describe basic structures in transport, reproduction, and response; describe basic plant reproduction.",
      proficient:
        "Explain how the vascular system facilitates transport; connect how reproductive structures rely on transport and response; articulate system interactions.",
      advanced:
        "Explain transpiration, cohesion-tension, pressure-flow; analyze alternation of generations; explain signal transduction pathways and hormone regulation.",
    },
    contentVersion: "1.0.0",
    approvalStatus: "approved",
    changeLog: [{ date: "2026-03-27", note: "Initial Unit 7 release" }],
    lessons: [
      // ── Lesson 1: Vascular Transport ────────────────────────────────────────
      {
        id: "u7-l1",
        slug: "plant-transport-and-vascular-systems",
        title: "Plant Transport and the Vascular System",
        conceptId: "unit7-concept1-transport",
        minutes: 45,
        type: "Reading",
        teks: ["B.12B"],
        isPriorityTEKS: true,
        summary:
          "Explore how xylem and phloem form a dual-highway system that moves water, minerals, and sugars throughout a plant — and why this matters for every other plant system.",
        hook: {
          headline: "Why a 350-foot redwood can defy gravity every single day",
          body: "The tallest trees on Earth pull water from their roots to their crown — over 100 meters high — without a pump. The cohesion-tension mechanism in xylem vessels makes this possible. Understanding it unlocks every other process in plant biology.",
          source: "USDA Forest Service",
        },
        learningIntentions: [
          "Understand how xylem transports water and dissolved minerals from roots to leaves",
          "Understand how phloem transports sugars from leaves (sources) to roots, fruits, and growing tips (sinks)",
          "Connect transpiration to the driving force of water movement",
        ],
        lessonMisconceptions: [
          "Water and nutrients are transported only by roots — xylem carries water UP from roots to leaves",
          "Plants only use one type of tissue for transport — both xylem (water/minerals) AND phloem (sugars) are required",
          "Transpiration is wasteful — it is essential for water/nutrient transport and temperature regulation",
        ],
        vocabularyTiers: {
          everyday: ["water", "sugar", "pipe", "flow", "pull", "push"],
          academic: ["tissue", "vascular bundle", "root", "stem", "leaf", "membrane"],
          contentSpecific: [
            "xylem", "phloem", "transpiration", "cohesion-tension", "pressure-flow hypothesis",
            "source", "sink", "guard cells", "stomata", "turgor pressure",
          ],
        },
        sections: [
          {
            heading: "The Two Highways: Xylem and Phloem",
            body: [
              "Vascular plants have two dedicated transport tissues bundled together in vascular bundles that run from root to leaf tip. Xylem carries water and dissolved mineral ions upward from the soil, while phloem carries dissolved sugars (primarily sucrose) both upward and downward — wherever the plant needs energy.",
              "Xylem cells are dead at maturity. Their walls are reinforced with lignin, forming hollow, rigid tubes that resist collapse under tension. Phloem cells (sieve-tube members) are alive, connected end-to-end by perforated sieve plates, and supported by companion cells that help load and unload sugars.",
            ],
          },
          {
            type: "visual-diagram",
            heading: "Vascular Bundle Cross-Section",
            description: "A cross-section of a stem vascular bundle showing the arrangement of xylem (inner) and phloem (outer) tissues.",
            elements: [
              { label: "Xylem vessels", detail: "Dead, lignified, hollow tubes — carry water + minerals upward" },
              { label: "Phloem sieve tubes", detail: "Living cells with sieve plates — carry sucrose bidirectionally" },
              { label: "Companion cells", detail: "Support phloem sieve tubes; actively load/unload sucrose" },
              { label: "Vascular cambium", detail: "Meristematic layer between xylem and phloem; produces new vascular tissue" },
              { label: "Bundle sheath", detail: "Parenchyma cells surrounding the bundle; connects to mesophyll" },
            ],
          },
          {
            heading: "Cohesion-Tension: How Water Climbs a Tree",
            body: [
              "Water moves through xylem by cohesion-tension. As water evaporates from leaf cells through stomata (transpiration), it creates tension — like a slight vacuum — that pulls the water column upward from the roots. This works because water molecules are strongly attracted to each other (cohesion) and to xylem walls (adhesion).",
              "The process is entirely passive — no energy is spent moving water up the xylem. The driving force is the difference in water potential between the soil (high) and the atmosphere (low).",
            ],
          },
          {
            heading: "Pressure-Flow: How Sugar Travels in Phloem",
            body: [
              "Sugar movement in phloem follows the pressure-flow hypothesis. In source tissues (leaves, where photosynthesis produces sucrose), companion cells actively load sucrose into sieve tubes. Water follows by osmosis, increasing turgor pressure.",
              "In sink tissues (roots, fruits, growing tips — where sucrose is used or stored), sucrose is unloaded, water leaves, and turgor pressure falls. The resulting pressure gradient pushes phloem sap from source to sink — like squeezing one end of a toothpaste tube.",
            ],
          },
          {
            type: "worked-example",
            heading: "Tracing a Mineral Ion from Soil to Leaf",
            scenario: "A potassium ion (K⁺) enters a root hair cell from the soil. Trace its journey to a mesophyll cell in a leaf.",
            steps: [
              "K⁺ enters root hair cell via active transport (energy required — moving against concentration gradient).",
              "K⁺ moves through root cortex cells via the symplast (through plasmodesmata) or apoplast (through cell walls) toward the stele.",
              "K⁺ is loaded into xylem vessels in the stele.",
              "Cohesion-tension pulls the water column (and dissolved K⁺) upward through stem xylem.",
              "K⁺ reaches leaf xylem, exits into mesophyll tissue, and is used in cellular processes.",
            ],
            conclusion: "The entire journey of K⁺ is passive in the xylem — only the initial loading step requires active transport energy.",
          },
          {
            type: "misconception-spotlight",
            misconception: "Transpiration is a waste of water.",
            correction: "Transpiration is essential. It creates the tension that pulls water up to every leaf cell. Without transpiration, the xylem water column would stall — the plant could not transport minerals, cool its leaves, or maintain turgor pressure in mesophyll cells.",
            teks: "B.12B",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Xylem", definition: "Vascular tissue that transports water and dissolved minerals upward from roots to leaves.", example: "Dead lignified xylem vessel cells form the 'wood' of a tree trunk." },
              { term: "Phloem", definition: "Vascular tissue that transports dissolved sugars bidirectionally between source and sink tissues.", example: "The inner bark of a tree contains phloem — stripping a ring of bark (girdling) kills the tree." },
              { term: "Transpiration", definition: "Evaporation of water from leaf surfaces through stomata, which drives water movement up the xylem.", example: "A single corn plant transpires about 200 liters of water during its growing season." },
              { term: "Stomata", definition: "Pores in leaf epidermis, flanked by guard cells, that open and close to regulate gas exchange and water loss.", example: "Stomata open in daylight (for CO₂ intake) and close at night or during drought." },
            ],
          },
        ],
        keyTerms: ["xylem", "phloem", "transpiration", "cohesion-tension", "pressure-flow", "stomata", "source", "sink"],
        quickChecks: [
          {
            id: "qc-u7l1-transport-developing",
            teks: "B.12B",
            learningLevel: "developing",
            conceptId: "unit7-concept1-transport",
            question: "Which plant tissue carries water and dissolved minerals upward from roots to leaves?",
            options: ["Phloem", "Xylem", "Epidermis", "Cortex"],
            correctAnswer: "Xylem",
          },
          {
            id: "qc-u7l1-transport-progressing",
            teks: "B.12B",
            learningLevel: "progressing",
            conceptId: "unit7-concept1-transport",
            question: "Sucrose produced in leaves by photosynthesis is transported to roots through the _____. This is driven by the _____ hypothesis.",
            options: [
              "xylem; cohesion-tension",
              "phloem; pressure-flow",
              "xylem; pressure-flow",
              "phloem; cohesion-tension",
            ],
            correctAnswer: "phloem; pressure-flow",
          },
          {
            id: "qc-u7l1-transport-proficient",
            teks: "B.12B",
            learningLevel: "proficient",
            conceptId: "unit7-concept1-transport",
            question: "A student wraps a ring of tape tightly around a stem, blocking only phloem but not xylem. After two weeks the leaves above the tape remain green. What would most likely happen BELOW the tape?",
            options: [
              "Root cells starve because sucrose cannot be transported down from leaves",
              "Root cells are unaffected because xylem still delivers minerals",
              "Roots grow faster because more water pressure builds up",
              "Nothing changes — phloem is not important for roots",
            ],
            correctAnswer: "Root cells starve because sucrose cannot be transported down from leaves",
          },
          {
            id: "qc-u7l1-transport-advanced",
            teks: "B.12B",
            learningLevel: "advanced",
            conceptId: "unit7-concept1-transport",
            misconceptionTarget: true,
            misconceptionDescription: "Transpiration is wasteful",
            question: "During a Texas drought, a post oak tree closes its stomata during the day. Which of the following best explains the trade-off the tree faces by doing this?",
            options: [
              "Closing stomata stops CO₂ uptake needed for photosynthesis but reduces water loss that would otherwise collapse turgor pressure",
              "Closing stomata forces the tree to switch from xylem to phloem for water transport",
              "Closing stomata increases transpiration because guard cells pump out extra water",
              "Closing stomata has no cost because trees do not need CO₂ during drought",
            ],
            correctAnswer: "Closing stomata stops CO₂ uptake needed for photosynthesis but reduces water loss that would otherwise collapse turgor pressure",
          },
        ],
      },
      // ── Lesson 2: Plant Reproduction ────────────────────────────────────────
      {
        id: "u7-l2",
        slug: "plant-reproduction",
        title: "Plant Reproduction: Pollination, Fertilization, and Seed Dispersal",
        conceptId: "unit7-concept2-reproduction",
        minutes: 45,
        type: "Reading",
        teks: ["B.12B"],
        isPriorityTEKS: true,
        summary:
          "Discover how flowering plants use specialized structures to achieve pollination and fertilization, and how seeds are equipped with dispersal mechanisms that rely on the plant's transport and response systems.",
        hook: {
          headline: "Bluebonnets, bees, and the Texas Hill Country — a pollinator contract written in UV",
          body: "Texas bluebonnets have nectar guides visible only in ultraviolet light — invisible to human eyes but a landing strip for bees. Every flower structure is optimized to attract the right pollinator and ensure fertilization. This is billions of years of coevolution on display every spring in the Hill Country.",
          source: "Lady Bird Johnson Wildflower Center",
        },
        learningIntentions: [
          "Distinguish between pollination (pollen transfer) and fertilization (gamete fusion)",
          "Identify flower structures and their reproductive functions",
          "Explain double fertilization in angiosperms",
          "Describe seed dispersal mechanisms and how they depend on other plant systems",
        ],
        lessonMisconceptions: [
          "Pollination and fertilization are the same process — pollination is pollen TRANSFER; fertilization is gamete FUSION",
          "Flowers are necessary for all plant reproduction — asexual reproduction (vegetative propagation) does not require flowers",
          "Seeds only disperse by wind",
        ],
        vocabularyTiers: {
          everyday: ["flower", "seed", "fruit", "pollen", "bee", "wind"],
          academic: ["reproduction", "fertilization", "gamete", "embryo", "ovule"],
          contentSpecific: [
            "stamen", "anther", "filament", "carpel", "stigma", "style", "ovary",
            "pollen grain", "pollination", "double fertilization", "endosperm",
            "seed coat", "seed dispersal",
          ],
        },
        sections: [
          {
            heading: "Flower Anatomy: The Reproductive Toolkit",
            body: [
              "Flowers are the reproductive organs of angiosperms (flowering plants). The male reproductive structure is the stamen, consisting of the anther (where pollen is made) and the filament (stalk). The female reproductive structure is the carpel (also called pistil), consisting of the stigma (sticky pollen-catching surface), style (stalk), and ovary (contains ovules where eggs develop).",
              "Many flowers have both stamens and carpels (perfect flowers); some species have separate male and female flowers (imperfect flowers). Petals and sepals attract pollinators and protect the inner reproductive parts.",
            ],
          },
          {
            type: "visual-diagram",
            heading: "Complete Flower Anatomy",
            description: "Labeled diagram of a perfect (bisexual) flower showing all reproductive and accessory parts.",
            elements: [
              { label: "Anther", detail: "Part of stamen; produces pollen grains containing male gametophytes" },
              { label: "Filament", detail: "Stalk supporting the anther; part of stamen" },
              { label: "Stigma", detail: "Sticky tip of carpel; catches pollen grains" },
              { label: "Style", detail: "Tube through which pollen tube grows toward ovary" },
              { label: "Ovary", detail: "Contains one or more ovules; becomes the fruit after fertilization" },
              { label: "Ovule", detail: "Contains the egg cell; becomes the seed after fertilization" },
              { label: "Petals", detail: "Modified leaves; attract pollinators with color, scent, nectar" },
              { label: "Sepals", detail: "Protect the flower bud before opening" },
            ],
          },
          {
            heading: "Pollination vs. Fertilization",
            body: [
              "Pollination is the transfer of pollen from an anther to a stigma. Fertilization is the fusion of male and female gametes inside the ovule. These are two separate events — pollination must happen before fertilization can occur, but pollination alone does not guarantee fertilization.",
              "Pollinators (bees, butterflies, birds, bats, wind) transfer pollen. Texas is home to over 700 native bee species — each with different flower preferences shaped by coevolution.",
            ],
          },
          {
            type: "worked-example",
            heading: "Tracing Pollen from Anther to Fertilization",
            scenario: "A honeybee visits a bluebonnet flower. Trace the journey of a pollen grain to fertilization.",
            steps: [
              "Bee brushes against the anther, picking up pollen grains on its fuzzy body.",
              "Bee visits another bluebonnet; pollen grains are deposited on the sticky stigma — POLLINATION complete.",
              "Pollen grain germinates: it grows a pollen tube down through the style toward the ovary.",
              "Pollen tube delivers two sperm nuclei into the ovule.",
              "One sperm nucleus fuses with the egg cell → zygote (2n) → will become embryo.",
              "Second sperm nucleus fuses with two polar nuclei → endosperm nucleus (3n) → will become food storage tissue for seed.",
              "This two-fusion event is called DOUBLE FERTILIZATION — unique to angiosperms.",
            ],
            conclusion: "Double fertilization produces both the embryo and endosperm simultaneously, making angiosperms highly efficient reproducers.",
          },
          {
            heading: "Seed Dispersal and the Role of Other Plant Systems",
            body: [
              "After fertilization, the ovary wall develops into a fruit, and the ovule develops into a seed. The fruit structure is shaped by the dispersal mechanism: fleshy fruits attract animals (berry, drupe), dry fruits with hooks catch fur (bur), winged fruits ride wind (maple samara), and explosive fruits fling seeds mechanically (touch-me-not).",
              "Seed dispersal depends on the plant's transport system (sugars from phloem fuel fruit development) and response system (hormones like ethylene trigger fruit ripening). The three systems are deeply intertwined.",
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "Pollination and fertilization are the same thing.",
            correction: "Pollination = pollen transferred from anther to stigma. Fertilization = sperm nucleus fuses with egg nucleus inside the ovule. A plant can be pollinated but not fertilized (e.g., if the pollen tube fails to grow, or pollen is from an incompatible species).",
            teks: "B.12B",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Stamen", definition: "Male reproductive organ of a flower, consisting of the anther and filament.", example: "A lily stamen produces thousands of pollen grains covered in yellow powder." },
              { term: "Carpel (Pistil)", definition: "Female reproductive organ of a flower, consisting of stigma, style, and ovary.", example: "The swollen base of a strawberry flower is the ovary — it becomes the fruit." },
              { term: "Double fertilization", definition: "Unique to angiosperms: one sperm fuses with the egg (→ embryo), another fuses with polar nuclei (→ endosperm).", example: "The corn kernel's starchy endosperm is the product of double fertilization." },
              { term: "Seed dispersal", definition: "Movement of seeds away from the parent plant to reduce competition and colonize new areas.", example: "Dandelion seeds have feathery structures (pappus) that act as parachutes for wind dispersal." },
            ],
          },
        ],
        keyTerms: ["stamen", "carpel", "pollination", "fertilization", "double fertilization", "endosperm", "seed dispersal"],
        quickChecks: [
          {
            id: "qc-u7l2-repro-developing",
            teks: "B.12B",
            learningLevel: "developing",
            conceptId: "unit7-concept2-reproduction",
            question: "Which part of the flower produces pollen?",
            options: ["Stigma", "Ovary", "Anther", "Style"],
            correctAnswer: "Anther",
          },
          {
            id: "qc-u7l2-repro-progressing",
            teks: "B.12B",
            learningLevel: "progressing",
            conceptId: "unit7-concept2-reproduction",
            question: "A pollen grain lands on the stigma of a flower. What must happen NEXT for fertilization to occur?",
            options: [
              "The pollen grain must be blown to another flower by wind",
              "A pollen tube must grow from the pollen grain down through the style to the ovule",
              "The ovary must release an egg cell into the stigma",
              "The pollen grain fuses directly with the stigma cells",
            ],
            correctAnswer: "A pollen tube must grow from the pollen grain down through the style to the ovule",
          },
          {
            id: "qc-u7l2-repro-proficient",
            teks: "B.12B",
            learningLevel: "proficient",
            conceptId: "unit7-concept2-reproduction",
            question: "In double fertilization, one sperm nucleus fuses with the egg to form a zygote. What does the SECOND sperm nucleus fuse with, and what does it become?",
            options: [
              "The ovary wall; it becomes the fruit",
              "The stigma; it becomes the style",
              "Two polar nuclei; it becomes the endosperm (food tissue)",
              "The seed coat; it becomes the testa",
            ],
            correctAnswer: "Two polar nuclei; it becomes the endosperm (food tissue)",
          },
          {
            id: "qc-u7l2-repro-advanced",
            teks: "B.12B",
            learningLevel: "advanced",
            conceptId: "unit7-concept2-reproduction",
            question: "A Texas farmer notices that his peach orchard produces almost no fruit this year, even though the trees flowered abundantly. The petals fell off normally, and the ovaries began swelling. What is the most likely explanation?",
            options: [
              "Pollinators were scarce this season and most flowers were not pollinated",
              "The trees ran out of sucrose because phloem was blocked",
              "The flowers lacked functional stigmas",
              "Wind destroyed all pollen before it could reach the anthers",
            ],
            correctAnswer: "Pollinators were scarce this season and most flowers were not pollinated",
          },
        ],
      },
      // ── Lesson 3: Plant Hormones and Tropisms ───────────────────────────────
      {
        id: "u7-l3",
        slug: "plant-responses-and-hormones",
        title: "Plant Responses: Hormones and Tropisms",
        conceptId: "unit7-concept3-response",
        minutes: 45,
        type: "Reading",
        teks: ["B.12B"],
        isPriorityTEKS: true,
        summary:
          "Plants cannot run from danger or reach for light — but they respond to their environment through hormones and tropisms. Discover the chemical signals that coordinate growth, ripening, and survival.",
        hook: {
          headline: "The hormone that ends hurricanes for Texas farmers — and sells your bananas",
          body: "Every banana in a grocery store was picked green and ripened with ethylene gas in a warehouse. Ethylene is one of five major plant hormones — and it's the same chemical your tomato plants release when damaged by insects, signaling neighboring plants to defend themselves. Understanding plant hormones is plant biology's equivalent of the nervous system.",
          source: "USDA Agricultural Research Service",
        },
        learningIntentions: [
          "Explain how auxin causes phototropism and gravitropism",
          "Describe the role of gibberellins in stem elongation and seed germination",
          "Explain how ethylene triggers fruit ripening and leaf abscission",
          "Distinguish between phototropism, gravitropism, and thigmotropism",
        ],
        lessonMisconceptions: [
          "Plant responses to stimuli are solely physical changes — hormones like auxin regulate internal cell responses",
          "Roots are the only part that responds to gravity — both roots (downward) and stems (upward) exhibit gravitropism",
          "Hormones only influence growth in one direction — auxins regulate both phototropism AND gravitropism; gibberellins regulate germination AND elongation",
        ],
        vocabularyTiers: {
          everyday: ["growth", "light", "gravity", "bend", "ripen", "signal"],
          academic: ["hormone", "stimulus", "response", "growth", "regulate"],
          contentSpecific: [
            "auxin (IAA)", "gibberellins", "ethylene", "abscisic acid (ABA)", "cytokinin",
            "phototropism", "gravitropism", "thigmotropism",
            "apical dominance", "abscission",
          ],
        },
        sections: [
          {
            heading: "What Are Plant Hormones?",
            body: [
              "Plant hormones (phytohormones) are chemical signals produced in small amounts that travel to target cells and alter their growth or activity. Unlike animal hormones, plant hormones are produced in many tissues (not dedicated glands) and can act at the site of production or travel via phloem or xylem.",
              "The five major classes are: auxins (growth regulation), gibberellins (elongation, germination), ethylene (ripening, senescence), abscisic acid — ABA (stress/drought response), and cytokinins (cell division).",
            ],
          },
          {
            heading: "Auxin and Directional Growth (Tropisms)",
            body: [
              "Auxin (indole-3-acetic acid, IAA) is produced in the shoot tip (apical meristem). It promotes cell elongation at low concentrations. When light hits one side of a stem, auxin migrates to the shaded side, causing faster elongation there — the stem bends toward light. This is phototropism.",
              "In roots, the same principle applies for gravity (gravitropism): auxin accumulates on the lower side of a horizontal root. But in root cells, higher auxin concentrations inhibit elongation, so the lower side grows slower — the root bends downward.",
            ],
          },
          {
            type: "visual-diagram",
            heading: "Phototropism — Auxin Redistribution in a Stem",
            description: "Shows how unequal auxin distribution causes a shoot tip to bend toward a light source.",
            elements: [
              { label: "Light source (left)", detail: "Light hits the left side of the shoot tip" },
              { label: "Auxin migration", detail: "Auxin moves from the lit side to the shaded (right) side" },
              { label: "Right side (shaded)", detail: "Higher auxin → faster cell elongation → cells longer here" },
              { label: "Left side (lit)", detail: "Lower auxin → slower cell elongation → cells shorter here" },
              { label: "Net result", detail: "Shoot bends LEFT (toward the light source)" },
            ],
          },
          {
            heading: "Gibberellins, Ethylene, and ABA",
            body: [
              "Gibberellins promote stem elongation and break seed dormancy. Dwarf wheat varieties used in the Green Revolution have a mutation in gibberellin signaling — they stay short even when given extra nutrients, producing more grain without toppling over.",
              "Ethylene is a gas hormone that triggers fruit ripening, leaf and fruit drop (abscission), and wound response. When one apple in a bag ripens and releases ethylene, it accelerates ripening in all surrounding apples — 'one bad apple' has a molecular explanation.",
              "Abscisic acid (ABA) is the stress hormone. During drought, ABA is produced in wilting leaves and travels to guard cells, causing stomata to close and conserving water. ABA also maintains seed dormancy, preventing germination until spring conditions are right.",
            ],
          },
          {
            type: "worked-example",
            heading: "Predicting Tropism Direction",
            scenario: "A potted plant is knocked on its side. Its stem is now horizontal. After 48 hours, what direction will the stem and root grow?",
            steps: [
              "Stem is now horizontal — gravity pulls equally on both sides initially, but starch-filled statoliths in cells settle to the lower side of each cell.",
              "In the STEM: auxin accumulates on the lower side. In shoot tissue, high auxin promotes elongation → lower side grows faster → stem tip curves UPWARD (negative gravitropism).",
              "In the ROOT: auxin also accumulates on the lower side. In root tissue, high auxin inhibits elongation → lower side grows slower → root tip curves DOWNWARD (positive gravitropism).",
            ],
            conclusion: "The stem and root grow in OPPOSITE directions (stem up, root down) even though they use the same hormone (auxin) — because their cells respond to auxin differently.",
          },
          {
            type: "misconception-spotlight",
            misconception: "Only roots respond to gravity in plants.",
            correction: "Both roots AND shoots respond to gravity, but in opposite directions. Shoot tips grow UPWARD (away from gravity — negative gravitropism). Root tips grow DOWNWARD (toward gravity — positive gravitropism). Both responses are mediated by auxin redistribution.",
            teks: "B.12B",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Auxin (IAA)", definition: "Plant hormone produced in shoot tips that promotes cell elongation at low concentrations; drives phototropism and gravitropism.", example: "Pruning a hedge removes shoot tips (auxin source), causing dormant buds below to grow — producing a bushier plant." },
              { term: "Gibberellins", definition: "Plant hormones that promote stem elongation, seed germination, and fruit development.", example: "Seedless grapes are sprayed with gibberellin to grow larger without fertilization." },
              { term: "Ethylene", definition: "Gas plant hormone that triggers fruit ripening, leaf drop, and response to wounding.", example: "Placing a ripe banana next to green tomatoes speeds their ripening via ethylene gas." },
              { term: "Abscisic acid (ABA)", definition: "Stress hormone that closes stomata during drought and maintains seed dormancy.", example: "ABA levels surge in plant leaves during the 2011 Texas drought — the driest year on record." },
              { term: "Phototropism", definition: "Growth of a plant toward (positive) or away from (negative) a light source.", example: "Sunflower stems show pronounced positive phototropism, tracking the sun east to west each day." },
            ],
          },
        ],
        keyTerms: ["auxin", "gibberellin", "ethylene", "ABA", "phototropism", "gravitropism", "thigmotropism", "apical dominance"],
        quickChecks: [
          {
            id: "qc-u7l3-hormones-developing",
            teks: "B.12B",
            learningLevel: "developing",
            conceptId: "unit7-concept3-response",
            question: "A plant grows toward a light source. What is this growth response called?",
            options: ["Gravitropism", "Thigmotropism", "Phototropism", "Hydrotropism"],
            correctAnswer: "Phototropism",
          },
          {
            id: "qc-u7l3-hormones-progressing",
            teks: "B.12B",
            learningLevel: "progressing",
            conceptId: "unit7-concept3-response",
            question: "Which hormone causes stomata to CLOSE during drought conditions, conserving water?",
            options: ["Auxin", "Gibberellin", "Ethylene", "Abscisic acid (ABA)"],
            correctAnswer: "Abscisic acid (ABA)",
          },
          {
            id: "qc-u7l3-hormones-proficient",
            teks: "B.12B",
            learningLevel: "proficient",
            conceptId: "unit7-concept3-response",
            question: "A scientist applies a high concentration of auxin to the upper side of a horizontal stem. Compared to a normal stem, what would most likely happen?",
            options: [
              "The stem would bend downward because the lower side (less auxin) would elongate faster",
              "The stem would bend upward because the lower side (less auxin) would elongate slower",
              "The stem would grow straight up regardless of auxin placement",
              "The stem would stop growing entirely",
            ],
            correctAnswer: "The stem would bend downward because the lower side (less auxin) would elongate faster",
          },
          {
            id: "qc-u7l3-hormones-advanced",
            teks: "B.12B",
            learningLevel: "advanced",
            conceptId: "unit7-concept3-response",
            misconceptionTarget: true,
            misconceptionDescription: "Hormones only influence growth in one direction",
            question: "The same hormone (auxin) causes stems to bend TOWARD light while also causing roots to bend TOWARD gravity (downward). How can one hormone cause two different directional responses?",
            options: [
              "Auxin has different molecular structures in root tissue versus shoot tissue",
              "Shoot cells elongate with high auxin; root cells are inhibited by high auxin — so both tissues accumulate auxin on the same side but respond oppositely",
              "Auxin moves up the stem but down the root, so it affects different sides",
              "Roots and shoots use different transport proteins but the same response mechanism",
            ],
            correctAnswer: "Shoot cells elongate with high auxin; root cells are inhibited by high auxin — so both tissues accumulate auxin on the same side but respond oppositely",
          },
        ],
      },
      // ── Lesson 4: Systems Integration ───────────────────────────────────────
      {
        id: "u7-l4",
        slug: "plant-systems-integration",
        title: "Plant Systems Integration: How Transport, Reproduction, and Response Work Together",
        conceptId: "unit7-concept4-integration",
        minutes: 50,
        type: "Reading",
        teks: ["B.12B"],
        isPriorityTEKS: true,
        summary:
          "The real power of understanding plant biology is seeing how the three systems — transport, reproduction, and response — form an integrated whole. A disruption in one system cascades to the others. This lesson traces those connections and applies them to real-world scenarios.",
        hook: {
          headline: "Hurricane Harvey, 2017 — how plants in Houston survived (and didn't)",
          body: "When Hurricane Harvey dumped 60 inches of rain on Houston in 2017, waterlogged soils cut off oxygen to roots. Without aerobic respiration, roots could not actively transport minerals into xylem. Ethylene surged in flooded stems, triggering adventitious root growth. Meanwhile, pollen release was disrupted — the reproductive system stalled. This is systems integration under stress — every system affected the others.",
          source: "Texas A&M AgriLife Extension",
        },
        learningIntentions: [
          "Trace how transport, reproductive, and response systems interact under normal conditions",
          "Predict cascade effects when one plant system is disrupted",
          "Apply knowledge of all three systems to explain a real-world plant scenario",
        ],
        lessonMisconceptions: [
          "Plant systems work independently of each other",
          "Plants only need one type of response system",
          "Phloem transport is driven solely by plant energy expenditure",
        ],
        vocabularyTiers: {
          everyday: ["system", "connection", "signal", "stress", "survival", "cascade"],
          academic: ["integrate", "interact", "facilitate", "regulate", "transport", "respond"],
          contentSpecific: [
            "systemic signaling", "source-sink relationship", "hormone crosstalk",
            "adventitious roots", "abscission zone", "vascular continuity",
          ],
        },
        sections: [
          {
            heading: "How the Three Systems Normally Work Together",
            body: [
              "Under normal conditions, the three plant systems operate as a coordinated unit. The transport system delivers water and minerals to leaves, fueling photosynthesis. Phloem then moves the resulting sucrose downward to roots, flowers, and fruits — all of which are reproductive or sink tissues. Hormones from the response system regulate when flowers are produced (gibberellins, photoperiodism), when fruit ripens (ethylene), and how much water is lost (ABA and stomata).",
              "For example: a spring day with increasing day length triggers gibberellin release → flower development begins. Xylem supplies water to developing flowers. Phloem carries sucrose to the growing ovaries. Auxin and ethylene coordinate the timing of fruit ripening and eventual seed dispersal.",
            ],
          },
          {
            type: "visual-diagram",
            heading: "Plant Systems Interaction Map",
            description: "Shows the interconnections between the three plant systems and key molecular signals.",
            elements: [
              { label: "Transport → Reproduction", detail: "Xylem delivers water to flowers; phloem delivers sucrose to developing seeds and fruits" },
              { label: "Transport → Response", detail: "ABA and ethylene travel via phloem to coordinate systemic stress responses" },
              { label: "Response → Transport", detail: "ABA closes stomata (reducing water loss); auxin promotes root growth (increasing water uptake)" },
              { label: "Response → Reproduction", detail: "Gibberellins trigger flowering; ethylene triggers fruit ripening and abscission" },
              { label: "Reproduction → Transport", detail: "Developing seeds act as strong sinks, pulling sucrose from phloem across the whole plant" },
              { label: "Reproduction → Response", detail: "Fruit development signals systemic changes in hormone balance" },
            ],
          },
          {
            heading: "Cascade Effects: When One System Fails",
            body: [
              "Because the systems are interdependent, a disruption in one quickly affects the others. During a severe drought, ABA closes stomata (response system). This reduces CO₂ intake, slowing photosynthesis (transport/energy). Less sucrose is produced → less reaches flowers and fruits (reproduction). Fruit development stalls. Fewer seeds are dispersed. Population recovery is impaired.",
              "During flooding (like Hurricane Harvey): root hypoxia blocks active mineral uptake into xylem (transport). Leaves receive fewer minerals, reducing photosynthesis efficiency. Ethylene accumulates in waterlogged stems, suppressing flowering (response affects reproduction). Adventitious roots form above the waterline — a response-system adaptation.",
            ],
          },
          {
            type: "worked-example",
            heading: "Tracing a Cascade Disruption",
            scenario: "A sudden freeze kills a post oak tree's leaves in early spring, before photosynthesis has ramped up for the season. Predict the cascade effects on all three systems.",
            steps: [
              "TRANSPORT: Leaf cells die → stomata can no longer function → transpiration stops → cohesion-tension in xylem collapses → mineral transport to the rest of the plant slows or stops.",
              "RESPONSE: Low sucrose triggers auxin redistribution from shoot tips → dormant axillary buds may activate → plant attempts to regenerate leaves. ABA levels rise as cells desiccate.",
              "REPRODUCTION: If freeze occurs during flowering, pollen tube growth stalls (needs energy from phloem sucrose). Ovule development fails → no fruit or seed set for that season.",
              "LONG-TERM: If the tree survives (using stored starch in roots), it will regenerate leaves in weeks. But one season of lost reproduction reduces offspring contribution.",
            ],
            conclusion: "A single abiotic stressor (freeze) simultaneously disrupts all three plant systems through interconnected molecular pathways.",
          },
          {
            type: "activity",
            heading: "CER: Hurricane Harvey and Plant Systems",
            prompt: "Houston experienced record flooding during Hurricane Harvey (2017). Using your knowledge of plant systems, write a Claim-Evidence-Reasoning (CER) response to this question: How would prolonged flooding affect the reproductive success of a flowering plant in the Houston area?",
            sentenceFrames: [
              "My claim is that prolonged flooding would ___ the reproductive success of flowering plants because ___.",
              "Evidence from the transport system: When roots are flooded, ___ because ___.",
              "Evidence from the response system: Ethylene would ___, which affects reproduction by ___.",
              "My reasoning connects these systems: Because ___ depends on ___, and ___ was disrupted, ___.",
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "Plant systems operate independently — what happens in the transport system has no effect on reproduction.",
            correction: "Every plant system depends on the others. Reproduction requires a continuous supply of water (xylem/transport) and sucrose (phloem/transport) to developing flowers and seeds. It is also regulated by hormones (response system). A failure in any one system cascades to both others.",
            teks: "B.12B",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Systemic signaling", definition: "A chemical signal that travels throughout the whole plant (not just the site of production) to coordinate responses.", example: "Ethylene released by a damaged leaf travels systemically, priming defensive responses in undamaged leaves." },
              { term: "Source-sink relationship", definition: "The flow of sucrose in phloem from photosynthetically active tissues (sources) to actively growing or storing tissues (sinks).", example: "During fruit development, the growing fruit is the dominant sink — it pulls sucrose from all other parts of the plant." },
              { term: "Hormone crosstalk", definition: "Interactions between multiple plant hormones that together fine-tune a response, sometimes opposing and sometimes synergistic.", example: "Auxin and cytokinin together determine whether a callus tissue will form roots or shoots in tissue culture." },
            ],
          },
        ],
        keyTerms: ["systemic signaling", "source-sink", "hormone crosstalk", "adventitious roots", "cascade disruption"],
        quickChecks: [
          {
            id: "qc-u7l4-integration-developing",
            teks: "B.12B",
            learningLevel: "developing",
            conceptId: "unit7-concept4-integration",
            question: "A plant's roots are damaged and can no longer absorb water. Which other system is MOST DIRECTLY affected first?",
            options: ["Reproductive system", "Response system (hormones)", "Transport system (xylem)", "None — roots are only for anchoring"],
            correctAnswer: "Transport system (xylem)",
          },
          {
            id: "qc-u7l4-integration-progressing",
            teks: "B.12B",
            learningLevel: "progressing",
            conceptId: "unit7-concept4-integration",
            question: "A drought causes ABA to close stomata in a plant's leaves. Which of the following is a LIKELY SECONDARY EFFECT on the reproductive system?",
            options: [
              "Increased pollen production because the plant invests energy in reproduction",
              "Reduced fruit development because less CO₂ enters leaves, slowing photosynthesis and sucrose production for developing seeds",
              "Faster seed germination triggered by ABA",
              "No effect on reproduction — the reproductive and transport systems are independent",
            ],
            correctAnswer: "Reduced fruit development because less CO₂ enters leaves, slowing photosynthesis and sucrose production for developing seeds",
          },
          {
            id: "qc-u7l4-integration-proficient",
            teks: "B.12B",
            learningLevel: "proficient",
            conceptId: "unit7-concept4-integration",
            question: "A herbicide specifically destroys phloem tissue throughout a plant. Using your knowledge of all three plant systems, predict TWO effects this would have beyond just sugar transport.",
            options: [
              "Roots would starve (no sucrose delivered by phloem) and systemic hormone signals transported in phloem (like ABA) could not reach stomata",
              "Leaves would wilt immediately and all flowers would drop because xylem also uses phloem pathways",
              "The plant would grow faster because xylem water pressure would increase",
              "Only reproduction would be affected because phloem only connects to ovaries",
            ],
            correctAnswer: "Roots would starve (no sucrose delivered by phloem) and systemic hormone signals transported in phloem (like ABA) could not reach stomata",
          },
          {
            id: "qc-u7l4-integration-advanced",
            teks: "B.12B",
            learningLevel: "advanced",
            conceptId: "unit7-concept4-integration",
            question: "During Hurricane Harvey, a biologist observed that flooded post oak trees formed adventitious roots above the waterline within two weeks. She also noted that flowering was suppressed that season. Using your knowledge of plant systems integration, which explanation BEST accounts for both observations?",
            options: [
              "Flooding caused root hypoxia → ethylene accumulated in waterlogged stems (response system) → ethylene promoted adventitious root formation AND suppressed gibberellin-dependent flowering; transport system mineral uptake stalled, reducing energy for reproduction",
              "Flooding diluted soil minerals, causing photosynthesis to stop, which triggered both root growth and flower suppression by auxin",
              "Water pressure from flooding physically pushed adventitious roots out and mechanically blocked flower development",
              "Adventitious roots grew in search of oxygen; flowering was suppressed because bees could not pollinate in the wet conditions",
            ],
            correctAnswer: "Flooding caused root hypoxia → ethylene accumulated in waterlogged stems (response system) → ethylene promoted adventitious root formation AND suppressed gibberellin-dependent flowering; transport system mineral uptake stalled, reducing energy for reproduction",
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
