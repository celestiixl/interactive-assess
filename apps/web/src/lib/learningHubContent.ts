export type LessonType = "Reading" | "Lecture" | "Notes";

export type LessonSection = {
  heading: string;
  body: string[];
};

export type LearningLesson = {
  id: string;
  slug: string;
  title: string;
  minutes: number;
  type: LessonType;
  summary: string;
  sections: LessonSection[];
  keyTerms: string[];
};

export type LearningUnit = {
  id: string;
  title: string;
  teks: string[];
  objective: string;
  lessons: LearningLesson[];
};

export const LEARNING_UNITS: LearningUnit[] = [
  {
    id: "cell-structure-function",
    title: "Cell Structure & Function",
    teks: ["BIO.5A", "BIO.5B", "BIO.5C"],
    objective:
      "Explain how cell structures work together and how transport supports homeostasis.",
    lessons: [
      {
        id: "u1-l1",
        slug: "cell-organelles",
        title: "Cell Organelles: What Each Part Does",
        minutes: 12,
        type: "Reading",
        summary:
          "A textbook-style walkthrough of nucleus, mitochondria, ribosomes, and membranes with real-world analogies.",
        sections: [
          {
            heading: "Big Idea",
            body: [
              "Cells are organized systems. Each organelle has a role, but the roles only make sense when seen together.",
              "You can think of a cell like a city: the nucleus stores instructions, ribosomes build products, and mitochondria power the system.",
            ],
          },
          {
            heading: "How Organelles Coordinate",
            body: [
              "DNA in the nucleus provides directions for proteins. Ribosomes read those directions and build proteins.",
              "The endoplasmic reticulum and Golgi apparatus modify and transport those proteins to where they are needed.",
            ],
          },
          {
            heading: "Why It Matters",
            body: [
              "When one organelle fails, the whole system can be affected. That is why diseases often involve multiple cell functions, not just one part.",
            ],
          },
        ],
        keyTerms: ["organelle", "nucleus", "ribosome", "mitochondria"],
      },
      {
        id: "u1-l2",
        slug: "membrane-transport",
        title: "Membrane Transport Mini Lecture",
        minutes: 8,
        type: "Lecture",
        summary:
          "Diffusion, osmosis, and active transport explained with annotated diagrams and examples.",
        sections: [
          {
            heading: "Passive vs Active",
            body: [
              "Passive transport moves substances down a concentration gradient without energy input.",
              "Active transport moves substances against the gradient and requires ATP.",
            ],
          },
          {
            heading: "Osmosis in Context",
            body: [
              "Water movement across membranes affects cell shape and function.",
              "In biology labs, tonicity scenarios help predict whether cells swell, shrink, or stay stable.",
            ],
          },
        ],
        keyTerms: ["diffusion", "osmosis", "active transport", "ATP"],
      },
      {
        id: "u1-l3",
        slug: "guided-notes-cell-systems",
        title: "Guided Notes: Cell Systems",
        minutes: 10,
        type: "Notes",
        summary:
          "Complete scaffolded notes and key terms to prepare for class discussion and quick checks.",
        sections: [
          {
            heading: "Complete the Pattern",
            body: [
              "Structure supports function: membrane structure controls what enters and exits.",
              "Energy demand affects organelle activity: high-demand cells often contain more mitochondria.",
            ],
          },
          {
            heading: "Self-Check",
            body: [
              "Can you explain how protein synthesis depends on both nucleus and ribosomes?",
              "Can you compare one passive and one active transport example?",
            ],
          },
        ],
        keyTerms: [
          "homeostasis",
          "selective permeability",
          "protein synthesis",
        ],
      },
    ],
  },
  {
    id: "genetics-inheritance",
    title: "Genetics & Inheritance",
    teks: ["BIO.7A", "BIO.7B", "BIO.8A"],
    objective:
      "Connect DNA structure to inheritance patterns and predict outcomes from genetic data.",
    lessons: [
      {
        id: "u2-l1",
        slug: "dna-to-trait",
        title: "DNA to Trait: Core Reading",
        minutes: 14,
        type: "Reading",
        summary:
          "Textbook-style explanation of DNA, genes, proteins, and how traits are expressed.",
        sections: [
          {
            heading: "Information Flow",
            body: [
              "Genetic information moves from DNA to RNA to protein. Proteins create most visible traits.",
              "Changes in DNA sequence can alter proteins and therefore alter observable traits.",
            ],
          },
          {
            heading: "Genes and Variation",
            body: [
              "Different versions of a gene are alleles. Allele combinations influence phenotype.",
              "Variation in populations provides the raw material for inheritance patterns and evolution.",
            ],
          },
        ],
        keyTerms: ["gene", "allele", "phenotype", "transcription"],
      },
      {
        id: "u2-l2",
        slug: "punnett-squares",
        title: "Punnett Squares in 10 Minutes",
        minutes: 10,
        type: "Lecture",
        summary:
          "A concise lecture on dominant/recessive traits and probability with worked examples.",
        sections: [
          {
            heading: "Modeling Outcomes",
            body: [
              "Punnett squares show all possible allele combinations for offspring.",
              "Use probability language carefully: predictions describe likelihood, not guarantees.",
            ],
          },
          {
            heading: "Interpreting Ratios",
            body: [
              "Genotypic ratios track allele combinations, while phenotypic ratios track visible traits.",
              "Some traits are not simple dominant-recessive; always check the trait model before predicting.",
            ],
          },
        ],
        keyTerms: ["dominant", "recessive", "genotype", "probability"],
      },
      {
        id: "u2-l3",
        slug: "genetics-vocabulary-notes",
        title: "Vocabulary + Concept Notes",
        minutes: 9,
        type: "Notes",
        summary:
          "Practice-ready notes for genotype, phenotype, allele, and mutation with checkpoints.",
        sections: [
          {
            heading: "Vocabulary Anchors",
            body: [
              "Genotype = genetic code combination. Phenotype = observable trait.",
              "Mutation = DNA sequence change; effects range from neutral to significant.",
            ],
          },
          {
            heading: "Checkpoint Prompts",
            body: [
              "Explain one way mutations can affect proteins.",
              "Give one example where genotype and phenotype are not the same word-for-word.",
            ],
          },
        ],
        keyTerms: ["mutation", "trait", "homozygous", "heterozygous"],
      },
    ],
  },
  {
    id: "evolution-ecology",
    title: "Evolution & Ecology",
    teks: ["BIO.9A", "BIO.10A", "BIO.13A"],
    objective:
      "Use evidence to explain natural selection and ecosystem interactions over time.",
    lessons: [
      {
        id: "u3-l1",
        slug: "natural-selection-reading",
        title: "Natural Selection Reading",
        minutes: 11,
        type: "Reading",
        summary:
          "Textbook chapter excerpt on variation, selection pressures, and adaptation.",
        sections: [
          {
            heading: "Variation and Fitness",
            body: [
              "Individuals in a population vary. Some variations improve survival in specific environments.",
              "Those individuals are more likely to reproduce and pass those traits forward.",
            ],
          },
          {
            heading: "Evidence",
            body: [
              "Fossils, DNA, and observed population changes all provide evidence for evolutionary processes.",
            ],
          },
        ],
        keyTerms: ["adaptation", "selection pressure", "fitness", "evidence"],
      },
      {
        id: "u3-l2",
        slug: "food-webs-energy-flow",
        title: "Food Webs and Energy Flow Lecture",
        minutes: 9,
        type: "Lecture",
        summary:
          "Visual lecture connecting trophic levels, energy transfer, and ecosystem balance.",
        sections: [
          {
            heading: "Energy Transfer",
            body: [
              "Energy decreases as it moves up trophic levels; only a fraction is transferred each step.",
              "That constraint shapes population sizes and ecosystem structure.",
            ],
          },
          {
            heading: "Stability",
            body: [
              "More diverse food webs are often more resilient to disruption.",
              "Removing one species can ripple across many relationships.",
            ],
          },
        ],
        keyTerms: ["trophic level", "producer", "consumer", "resilience"],
      },
      {
        id: "u3-l3",
        slug: "unit-wrap-up-notes",
        title: "Unit Wrap-Up Notes",
        minutes: 7,
        type: "Notes",
        summary:
          "Quick-reference notes and review prompts for class exit tickets and assessments.",
        sections: [
          {
            heading: "Review Prompts",
            body: [
              "Describe one adaptation and explain why it helps in a specific environment.",
              "Trace one example of energy flow through a simple food chain.",
            ],
          },
          {
            heading: "Exam Readiness",
            body: [
              "Focus on cause-and-effect language and evidence-based explanations.",
            ],
          },
        ],
        keyTerms: ["biodiversity", "ecosystem", "energy flow", "adaptation"],
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
