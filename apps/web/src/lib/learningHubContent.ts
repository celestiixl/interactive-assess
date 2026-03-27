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
  "u7-l1": "asgn-u7-core",
  "u7-l2": "asgn-u7-core",
  "u7-l3": "asgn-u7-core",
  "u7-l4": "asgn-u7-core",
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
        minutes: 40,
        type: "Reading",
        teks: ["B.5A", "B.5B"],
        isPriorityTEKS: true,
        summary:
          "Relates carbohydrate, lipid, protein, and nucleic acid functions to cell structures; compares prokaryotic and eukaryotic cells; introduces endosymbiotic theory.",
        hook: {
          headline: "The protein that decides if a cell lives or dies",
          body: "Cystic fibrosis is caused by a single misfolded protein — CFTR. One wrong amino acid (out of 1,480) changes the protein's 3-D shape just enough that it can't open properly as a chloride channel. The result: thick mucus, chronic infections, and shortened life expectancy. This is how much precision matters at the molecular level.",
          source: "NIH Genetics Home Reference, 2023",
        },
        learningIntentions: [
          "Discover the four types of biomolecules and their roles in cell function (B.5A)",
          "Compare and contrast prokaryotic and eukaryotic cell structures (B.5B)",
          "Explain the evidence supporting endosymbiotic theory (B.5B)",
        ],
        lessonMisconceptions: [
          "All fats are unhealthy — unsaturated fats in cell membranes are essential for life",
          "DNA is only in the cell nucleus — mitochondria and chloroplasts also contain DNA",
          "Biomolecules exist independently — they are deeply interconnected (e.g., proteins made from DNA instructions, powered by carbohydrate energy)",
          "All carbohydrates serve only as energy — cellulose is structural; glycoproteins are signaling molecules",
        ],
        vocabularyTiers: {
          everyday: ["sugar", "fat", "protein", "molecule", "cell", "energy", "building block"],
          academic: ["organic", "function", "structure", "model", "synthesis", "permeable", "organelle"],
          contentSpecific: [
            "monomer", "polymer", "carbohydrate", "lipid", "protein", "nucleic acid",
            "amino acid", "fatty acid", "nucleotide", "peptide bond",
            "prokaryote", "eukaryote", "endosymbiotic theory",
          ],
        },
        sections: [
          {
            heading: "The Four Families of Biomolecules",
            body: [
              "All living organisms are built from four classes of carbon-based (organic) molecules called biomolecules: carbohydrates, lipids, proteins, and nucleic acids. Each family has a unique monomer (building block) that polymerizes (links) into larger molecules.",
              "Carbohydrates are made of sugar monomers (monosaccharides). Glucose is the primary energy currency. Starch and glycogen are storage polymers; cellulose is a structural polymer found only in plant cell walls. The body cannot digest cellulose — but it provides dietary fiber.",
              "Lipids are not true polymers but are made of fatty acid chains attached to glycerol. Phospholipids form the bilayer of every cell membrane. Triglycerides store energy. Steroids (like cholesterol and hormones) are signaling lipids.",
              "Proteins are made of amino acid monomers joined by peptide bonds. With 20 different amino acids and chains often hundreds of units long, proteins are the most structurally diverse biomolecule. They serve as enzymes, structural scaffolds (keratin, collagen), transporters (hemoglobin), receptors, and antibodies.",
              "Nucleic acids — DNA and RNA — are made of nucleotide monomers. DNA stores hereditary information; RNA carries that information and helps build proteins. Nucleotides also serve as energy carriers (ATP) and cell signals (cAMP).",
            ],
          },
          {
            type: "visual-diagram",
            heading: "Biomolecule Summary: Monomer → Polymer → Function",
            description: "Table showing each biomolecule family's monomer, polymer, and primary cell function.",
            elements: [
              { label: "Carbohydrate", detail: "Monomer: monosaccharide (e.g., glucose) | Polymers: starch, glycogen, cellulose | Function: energy storage, structural support" },
              { label: "Lipid", detail: "Monomers: fatty acids + glycerol | Not a true polymer | Function: membrane structure, long-term energy, hormones" },
              { label: "Protein", detail: "Monomer: amino acid | Polymer: polypeptide chain | Function: enzymes, structure, transport, defense, signaling" },
              { label: "Nucleic Acid", detail: "Monomer: nucleotide | Polymers: DNA, RNA | Function: genetic information storage, protein synthesis, energy transfer (ATP)" },
            ],
          },
          {
            type: "worked-example",
            heading: "Identifying a Biomolecule from Properties",
            scenario: "A lab student tests a mystery molecule. She finds: it is hydrophobic (repels water), has a very high ratio of carbon and hydrogen atoms, and releases about 9 kcal of energy per gram when burned. Which biomolecule family is it?",
            steps: [
              "Hydrophobic — eliminates proteins (mostly hydrophilic) and nucleic acids (charged backbone).",
              "Very high C:H ratio with few oxygen atoms — consistent with fatty acid chains in lipids.",
              "9 kcal/g — carbohydrates yield ~4 kcal/g; proteins ~4 kcal/g; lipids ~9 kcal/g. ✓",
            ],
            conclusion: "The molecule is a lipid (most likely a triglyceride / fat). Lipids yield more than twice the energy per gram of carbohydrates because their C–H bonds are more reduced.",
          },
          {
            heading: "Prokaryotic vs. Eukaryotic Cells",
            body: [
              "All cells share: a cell membrane, cytoplasm, DNA, and ribosomes. But they divide into two fundamental domains based on cellular organization.",
              "Prokaryotic cells (bacteria and archaea) lack a membrane-bound nucleus. Their DNA floats as a single circular chromosome in the nucleoid region. They are generally smaller (1–5 μm), have no membrane-bound organelles, and reproduce by binary fission.",
              "Eukaryotic cells (animals, plants, fungi, protists) have a true nucleus with a double membrane. They contain membrane-bound organelles: mitochondria, endoplasmic reticulum, Golgi apparatus, lysosomes, and (in plants) chloroplasts and a large central vacuole. They are larger (10–100 μm) and can reproduce sexually.",
              "Plant cells additionally have: a rigid cell wall (cellulose), chloroplasts, and a large central vacuole. Animal cells have: centrioles and flexible membranes.",
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "DNA is only found in the cell nucleus.",
            correction: "While most DNA in eukaryotic cells is in the nucleus, mitochondria and chloroplasts each contain their own small circular DNA — similar to bacterial chromosomes. This is one of the key pieces of evidence for endosymbiotic theory.",
            teks: "B.5B",
          },
          {
            heading: "Endosymbiotic Theory",
            body: [
              "Endosymbiotic theory proposes that mitochondria and chloroplasts were once free-living prokaryotes that were engulfed by a larger host cell approximately 1.5–2 billion years ago. Instead of being digested, they formed a mutualistic relationship — providing ATP (mitochondria) or sugars (chloroplasts) in exchange for shelter and nutrients.",
              "Evidence: (1) Mitochondria and chloroplasts have their own circular DNA and ribosomes that more closely resemble bacteria than eukaryotic organelles. (2) They reproduce by binary fission, independently of the cell cycle. (3) They have double membranes — one from the original prokaryote, one from the host's endocytic vesicle.",
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "All fats are unhealthy.",
            correction: "Unsaturated fats (found in avocados, olive oil, salmon) are essential. Phospholipids — made of fatty acids — form every cell membrane in your body. Without dietary fats, cells cannot build membranes, produce steroid hormones, or absorb fat-soluble vitamins (A, D, E, K). The concern is specifically with trans fats and excess saturated fats.",
            teks: "B.5A",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Monomer", definition: "A single small molecule that can bond with others to form a polymer.", example: "Glucose is the monomer of starch; amino acids are the monomers of proteins." },
              { term: "Polymer", definition: "A large molecule built from repeated monomer units joined by covalent bonds.", example: "Cellulose is a polymer of glucose — the same monomer as starch, but with different bonding angles, making it indigestible." },
              { term: "Phospholipid bilayer", definition: "The double layer of phospholipids that forms the structural basis of all cell membranes, with hydrophilic heads facing outward and hydrophobic tails facing inward.", example: "When you shake oil and water together — the oil droplets have a temporary bilayer at their surface." },
              { term: "Prokaryote", definition: "A single-celled organism lacking a membrane-bound nucleus; DNA is in the nucleoid region.", example: "E. coli bacteria in the human gut are prokaryotes with circular DNA and no nucleus." },
              { term: "Eukaryote", definition: "A cell (or organism) with a true membrane-bound nucleus and membrane-bound organelles.", example: "Every cell in the human body is a eukaryote — from neurons to red blood cells." },
            ],
          },
        ],
        keyTerms: ["monomer", "polymer", "carbohydrate", "lipid", "protein", "nucleic acid", "prokaryote", "eukaryote", "endosymbiotic theory", "phospholipid bilayer"],
        quickChecks: [
          {
            id: "qc-u1l1-biomolecules-developing",
            teks: "B.5A",
            learningLevel: "developing",
            conceptId: "concept-2-biomolecules",
            question: "Which biomolecule family is used as the primary source of quick energy in cells and is made of sugar monomers?",
            options: ["Lipids", "Proteins", "Carbohydrates", "Nucleic acids"],
            correctAnswer: "Carbohydrates",
          },
          {
            id: "qc-u1l1-biomolecules-progressing",
            teks: "B.5A",
            learningLevel: "progressing",
            conceptId: "concept-2-biomolecules",
            question: "A student examines two cells under an electron microscope. Cell A has a membrane-bound nucleus and mitochondria. Cell B has no nucleus and is much smaller. Which statement correctly classifies these cells?",
            options: [
              "Cell A is prokaryotic; Cell B is eukaryotic",
              "Cell A is eukaryotic; Cell B is prokaryotic",
              "Both cells are prokaryotic because both have ribosomes",
              "Cell B is eukaryotic because small cells are more evolved",
            ],
            correctAnswer: "Cell A is eukaryotic; Cell B is prokaryotic",
          },
          {
            id: "qc-u1l1-biomolecules-proficient",
            teks: "B.5B",
            learningLevel: "proficient",
            conceptId: "concept-2-biomolecules",
            question: "Which of the following observations provides the BEST evidence for endosymbiotic theory?",
            options: [
              "Mitochondria produce ATP, which is used throughout the cell",
              "Mitochondria have their own circular DNA and reproduce by binary fission, similar to bacteria",
              "All eukaryotic cells have mitochondria but only plant cells have chloroplasts",
              "Mitochondria are enclosed by a double membrane",
            ],
            correctAnswer: "Mitochondria have their own circular DNA and reproduce by binary fission, similar to bacteria",
          },
          {
            id: "qc-u1l1-biomolecules-advanced",
            teks: "B.5A",
            learningLevel: "advanced",
            conceptId: "concept-2-biomolecules",
            misconceptionTarget: true,
            misconceptionDescription: "Carbohydrates only serve as energy sources",
            question: "A researcher discovers a molecule in plant cell walls that is a polymer of glucose but cannot be broken down by human digestive enzymes. The molecule provides no caloric energy to humans, yet the plant cannot survive without it. What is the most likely function of this molecule in the plant?",
            options: [
              "Energy storage for photosynthesis",
              "Structural support — the glucose monomers are bonded at different angles (β-1,4 linkages) creating rigid, indigestible fibers (cellulose)",
              "Hormone signaling between cells",
              "DNA packaging in the nucleus",
            ],
            correctAnswer: "Structural support — the glucose monomers are bonded at different angles (β-1,4 linkages) creating rigid, indigestible fibers (cellulose)",
          },
        ],
      },
      {
        id: "u1-l2",
        slug: "cell-transport-and-homeostasis",
        title: "Cell Transport and Homeostasis",
        minutes: 40,
        type: "Lecture",
        teks: ["B.5C", "B.11B"],
        isPriorityTEKS: true,
        summary:
          "Compares passive and active transport; explains how cellular transport mechanisms maintain homeostasis; investigates enzyme roles in facilitating cellular processes.",
        hook: {
          headline: "Why IV fluids can save — or end — a life",
          body: "When paramedics give IV saline to a dehydrated patient, they are betting on osmosis. Normal saline is 0.9% NaCl — the same concentration as blood plasma. Too concentrated, water rushes out of blood cells (crenation). Too dilute, cells swell and burst (lysis). Getting the concentration exactly right is homeostasis enforced molecule by molecule.",
          source: "New England Journal of Medicine, 2018",
        },
        learningIntentions: [
          "Distinguish passive transport (diffusion, facilitated diffusion, osmosis) from active transport",
          "Predict cell behavior in hypo-, iso-, and hypertonic solutions",
          "Explain how enzymes facilitate cellular transport and metabolic reactions",
          "Connect transport mechanisms to the concept of homeostasis",
        ],
        lessonMisconceptions: [
          "Osmosis only occurs in plant cells — osmosis occurs in ALL cells (red blood cells crenate in hypertonic saline)",
          "Cells always gain water through osmosis — direction depends on relative solute concentration",
          "Active transport always moves substances from low to high concentration — true, but the energy cost distinguishes it from passive",
          "All molecules pass freely through the cell membrane — the membrane is selectively permeable",
        ],
        vocabularyTiers: {
          everyday: ["water", "concentration", "flow", "pump", "balance", "squeeze"],
          academic: ["membrane", "gradient", "energy", "equilibrium", "solution", "selective"],
          contentSpecific: [
            "diffusion", "facilitated diffusion", "osmosis", "active transport",
            "endocytosis", "exocytosis", "concentration gradient",
            "hypertonic", "hypotonic", "isotonic",
            "selectively permeable", "homeostasis", "enzyme", "substrate", "active site",
          ],
        },
        sections: [
          {
            heading: "The Selectively Permeable Membrane",
            body: [
              "The cell membrane is made of a phospholipid bilayer with embedded proteins. It is selectively permeable — small nonpolar molecules (O₂, CO₂, water) pass freely, but charged ions and large polar molecules require protein channels or carriers.",
              "This selectivity is the foundation of all transport regulation. If everything passed freely, cells could not maintain their internal chemistry.",
            ],
          },
          {
            heading: "Passive Transport: Going with the Flow",
            body: [
              "Passive transport moves substances down their concentration gradient (high → low) without using ATP. Three types:",
              "Simple diffusion: small nonpolar molecules (O₂, CO₂, lipid-soluble drugs) pass directly through the bilayer.",
              "Facilitated diffusion: larger or charged molecules (glucose, ions) pass through specific protein channels or carriers, still down the gradient.",
              "Osmosis: the net movement of WATER across a selectively permeable membrane from a region of lower solute concentration (higher water concentration) to a region of higher solute concentration (lower water concentration).",
            ],
          },
          {
            type: "worked-example",
            heading: "Red Blood Cell in Three Solutions",
            scenario: "Predict what happens to a red blood cell placed in each of these saline solutions: (A) 0.9% NaCl (isotonic), (B) 0.5% NaCl (hypotonic), (C) 3% NaCl (hypertonic).",
            steps: [
              "(A) Isotonic — solute concentration inside cell = outside. No net water movement. Cell maintains normal biconcave shape.",
              "(B) Hypotonic — fewer solutes outside than inside. Water moves INTO the cell by osmosis. Cell swells and may lyse (burst). This is why pure water IVs are never used.",
              "(C) Hypertonic — more solutes outside than inside. Water moves OUT of the cell by osmosis. Cell shrivels (crenation). This is why sea water doesn't hydrate you.",
            ],
            conclusion: "The direction of osmosis always depends on comparing solute concentrations. Water flows toward the side with more solute.",
          },
          {
            heading: "Active Transport and Vesicle-Based Transport",
            body: [
              "Active transport uses ATP to move substances AGAINST the concentration gradient (low → high). Example: the sodium-potassium pump (Na⁺/K⁺-ATPase) moves 3 Na⁺ out and 2 K⁺ in against their gradients to maintain the electrochemical gradient used by nerve and muscle cells.",
              "Bulk transport moves large molecules or particles: endocytosis engulfs material into a vesicle (phagocytosis, pinocytosis); exocytosis fuses vesicles with the membrane to release contents outside the cell (e.g., insulin secretion from pancreatic cells).",
            ],
          },
          {
            type: "visual-diagram",
            heading: "Transport Type Comparison",
            description: "Shows four transport mechanisms across a cell membrane, indicating energy use and direction.",
            elements: [
              { label: "Simple diffusion", detail: "No energy, no protein, high → low concentration (O₂, CO₂)" },
              { label: "Facilitated diffusion", detail: "No energy, uses channel/carrier protein, high → low (glucose, ions)" },
              { label: "Active transport", detail: "Uses ATP, uses pump protein, low → high (Na⁺/K⁺ pump)" },
              { label: "Endocytosis/Exocytosis", detail: "Uses ATP, vesicle-mediated, moves large molecules/particles" },
            ],
          },
          {
            heading: "Homeostasis: Maintaining the Balance",
            body: [
              "Homeostasis is the ability of a cell or organism to maintain a stable internal environment despite external changes. Transport is the primary mechanism: cells adjust channel protein expression, pump activity, and vesicle release to regulate internal ion concentrations, pH, and water balance.",
              "Feedback mechanisms — where the effect of a process feeds back to regulate that process — are central to homeostasis. When blood glucose rises, insulin signals more glucose transporters to move to cell membranes, increasing uptake until levels normalize.",
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "Osmosis only occurs in plant cells.",
            correction: "Osmosis occurs in ALL cells with a selectively permeable membrane — animal cells, plant cells, fungi, bacteria. Red blood cells placed in pure water swell and burst (lysis) due to osmosis. The dramatic visual of plant cells losing turgor pressure (wilting) makes people associate osmosis only with plants, but the mechanism is universal.",
            teks: "B.5C",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Osmosis", definition: "Net movement of water across a selectively permeable membrane from an area of lower solute concentration to an area of higher solute concentration.", example: "When you soak a dried raisin in water, it plumps up — water moves into the raisin's cells by osmosis." },
              { term: "Isotonic", definition: "Solutions with equal solute concentrations on both sides of a membrane; no net water movement.", example: "Normal saline (0.9% NaCl) is isotonic to human blood — safe for IV administration." },
              { term: "Homeostasis", definition: "The maintenance of a stable internal environment by an organism or cell, despite changes in external conditions.", example: "Your body temperature staying near 37°C even when it's 100°F outside in a Houston summer is homeostasis." },
              { term: "Active transport", definition: "Movement of molecules against their concentration gradient, requiring ATP and carrier proteins.", example: "Nerve cells use the Na⁺/K⁺ pump (active transport) to reset after firing an action potential." },
            ],
          },
        ],
        keyTerms: ["diffusion", "facilitated diffusion", "osmosis", "active transport", "endocytosis", "exocytosis", "homeostasis", "hypertonic", "hypotonic", "isotonic"],
        quickChecks: [
          {
            id: "qc-u1l2-transport-developing",
            teks: "B.5C",
            learningLevel: "developing",
            conceptId: "concept-3-cellular-processes",
            question: "Which type of transport requires ATP (energy) to move substances across the cell membrane?",
            options: ["Diffusion", "Osmosis", "Active transport", "Facilitated diffusion"],
            correctAnswer: "Active transport",
          },
          {
            id: "qc-u1l2-transport-progressing",
            teks: "B.5C",
            learningLevel: "progressing",
            conceptId: "concept-3-cellular-processes",
            question: "A student places a wilted celery stalk into a glass of pure water. After 2 hours, the celery becomes firm and crisp again. What best explains this?",
            options: [
              "Water moved from the celery into the water by active transport",
              "Water moved from the glass into the celery cells by osmosis because the celery cells had a higher solute concentration",
              "Salts moved from the glass water into the celery by facilitated diffusion",
              "The celery produced new glucose through photosynthesis, stiffening the cells",
            ],
            correctAnswer: "Water moved from the glass into the celery cells by osmosis because the celery cells had a higher solute concentration",
          },
          {
            id: "qc-u1l2-transport-proficient",
            teks: "B.5C",
            learningLevel: "proficient",
            conceptId: "concept-3-cellular-processes",
            question: "A student compares two transport proteins: Protein A moves glucose from the intestinal lumen (high) into intestinal cells (low) with no ATP required. Protein B moves calcium ions from inside a muscle cell (low) to the bloodstream (high) using ATP. Which classification is correct?",
            options: [
              "Protein A = active transport; Protein B = facilitated diffusion",
              "Protein A = facilitated diffusion; Protein B = active transport",
              "Both proteins perform passive transport because they both use protein channels",
              "Protein A = simple diffusion; Protein B = osmosis",
            ],
            correctAnswer: "Protein A = facilitated diffusion; Protein B = active transport",
          },
          {
            id: "qc-u1l2-transport-advanced",
            teks: "B.5C",
            learningLevel: "advanced",
            conceptId: "concept-3-cellular-processes",
            misconceptionTarget: true,
            misconceptionDescription: "Cells always gain water through osmosis",
            question: "A kidney patient's blood plasma has become hypertonic (too concentrated with solutes) due to dehydration. Which of the following best predicts the effect on red blood cells AND identifies the body's homeostatic response?",
            options: [
              "Red blood cells gain water (swell) because the plasma is more dilute; kidneys excrete excess water to restore balance",
              "Red blood cells lose water (crenate) because the hypertonic plasma draws water out by osmosis; the kidneys retain water and the hypothalamus triggers thirst to restore isotonic balance",
              "Red blood cells are unaffected because plasma proteins buffer osmotic changes; homeostasis does not involve the kidneys",
              "Red blood cells undergo lysis because hypertonic solutions always burst cells; the liver adjusts protein synthesis to compensate",
            ],
            correctAnswer: "Red blood cells lose water (crenate) because the hypertonic plasma draws water out by osmosis; the kidneys retain water and the hypothalamus triggers thirst to restore isotonic balance",
          },
        ],
      },
      {
        id: "u1-l3",
        slug: "enzymes-photosynthesis-respiration",
        title: "Enzymes, Photosynthesis, and Respiration",
        minutes: 45,
        type: "Notes",
        teks: ["B.11A", "B.11B"],
        isPriorityTEKS: true,
        summary:
          "Explains enzyme roles in facilitating cellular reactions; models conservation of matter and energy transfer in photosynthesis and cellular respiration; traces atom movement to demonstrate matter conservation.",
        hook: {
          headline: "Your breakfast was solar energy, chemically stored",
          body: "Every calorie on a nutrition label traces back to a plant capturing sunlight. The glucose in your toast was built from CO₂ molecules pulled from the air by a leaf. Your cells are now spending that chemical energy one ATP molecule at a time. The sun's energy has been converting form — but never disappearing — since the Cretaceous period.",
          source: "USDA Nutritional Data, 2022",
        },
        learningIntentions: [
          "Explain how enzymes lower activation energy and facilitate cellular reactions without being consumed (B.11B)",
          "Write and interpret the balanced equations for photosynthesis and cellular respiration (B.11A)",
          "Trace atom movement in both equations to demonstrate conservation of matter (B.11A)",
          "Compare the roles of chloroplasts and mitochondria in energy conversion",
        ],
        lessonMisconceptions: [
          "Enzymes are used up in reactions — enzymes are catalysts; they are regenerated and can be reused",
          "Plants only photosynthesize and do not respire — plants perform BOTH photosynthesis AND cellular respiration",
          "All energy comes directly from food — food provides the substrates; ATP is what cells actually use",
          "ATP is stored long-term — ATP is made and used almost immediately; cells do not stockpile ATP",
          "More food consumed always means more energy produced — enzymes and oxygen availability are limiting factors",
        ],
        vocabularyTiers: {
          everyday: ["sun", "food", "energy", "breathe", "burn", "release", "store"],
          academic: ["reaction", "catalyst", "substrate", "product", "convert", "chemical"],
          contentSpecific: [
            "enzyme", "substrate", "active site", "activation energy", "denaturation",
            "photosynthesis", "cellular respiration", "ATP", "chloroplast", "mitochondria",
            "reactant", "product", "conservation of matter",
          ],
        },
        sections: [
          {
            heading: "Enzymes: Life's Catalysts",
            body: [
              "An enzyme is a protein that acts as a biological catalyst — it speeds up a chemical reaction without being consumed in the process. Enzymes lower the activation energy (the energy barrier that must be overcome for a reaction to start), allowing cellular reactions to occur fast enough to sustain life at body temperature.",
              "Each enzyme has an active site — a specifically shaped pocket that binds to its substrate (the molecule being acted upon). The fit between enzyme and substrate is called the induced fit model: the active site slightly adjusts shape to grip the substrate tightly, like a hand wrapping around a door handle.",
              "Factors that affect enzyme activity: temperature (increases activity up to optimum, then denatures the enzyme by unfolding it), pH (each enzyme has an optimal pH — stomach pepsin works at pH 2; intestinal enzymes at pH 7–8), and substrate concentration.",
            ],
          },
          {
            type: "worked-example",
            heading: "Salivary Amylase Digesting Starch",
            scenario: "Trace the enzyme-catalyzed breakdown of a starch molecule (a polymer of glucose) by salivary amylase in your mouth.",
            steps: [
              "Starch (polymer of glucose) enters the mouth with chewed food.",
              "Salivary amylase enzyme is secreted by salivary glands. Its active site has the correct shape to bind starch.",
              "Starch binds to the active site of amylase (enzyme-substrate complex forms).",
              "Amylase catalyzes hydrolysis — water molecules break the glycosidic bonds between glucose monomers.",
              "Smaller glucose chains (maltose) are released as products.",
              "Amylase is released unchanged, ready to catalyze the next reaction.",
            ],
            conclusion: "The enzyme (amylase) is NOT consumed. One amylase molecule can break down thousands of starch molecules. This is why enzymes are called catalysts.",
          },
          {
            heading: "Photosynthesis: Storing Solar Energy",
            body: [
              "Photosynthesis occurs in chloroplasts (specifically in the thylakoid membranes and stroma). The overall equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
              "Carbon dioxide from the air + water from the soil + light energy → glucose (sugar) + oxygen gas.",
              "Carbon atoms from CO₂ in the atmosphere are incorporated into organic glucose molecules. The oxygen released is split from water molecules (not CO₂). This is how matter is conserved: the 6 carbon atoms in 6CO₂ appear in C₆H₁₂O₆.",
            ],
          },
          {
            heading: "Cellular Respiration: Releasing Chemical Energy",
            body: [
              "Cellular respiration occurs mainly in mitochondria. The overall equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP energy",
              "Glucose + oxygen → carbon dioxide + water + usable energy (ATP).",
              "This is the reverse of photosynthesis in terms of reactants and products — but it is NOT simply burning. Cellular respiration is a controlled, stepwise process that captures energy in ATP rather than releasing it all as heat.",
              "Note (TEA Tier 1 boundary): students are NOT expected to know the details of glycolysis, the Krebs cycle, or the electron transport chain at this level.",
            ],
          },
          {
            type: "visual-diagram",
            heading: "Photosynthesis and Cellular Respiration: Complementary Cycles",
            description: "Shows how the products of photosynthesis become the reactants of cellular respiration and vice versa, illustrating matter conservation and energy flow.",
            elements: [
              { label: "Photosynthesis inputs", detail: "6CO₂ + 6H₂O + light energy → occurs in chloroplast" },
              { label: "Photosynthesis outputs", detail: "C₆H₁₂O₆ (glucose) + 6O₂ → these become cellular respiration inputs" },
              { label: "Cellular respiration inputs", detail: "C₆H₁₂O₆ + 6O₂ → occurs in mitochondria" },
              { label: "Cellular respiration outputs", detail: "6CO₂ + 6H₂O + ATP → CO₂ and H₂O become photosynthesis inputs" },
              { label: "Matter conservation", detail: "Count atoms: 6C, 12H, 18O on each side of each equation. Atoms are rearranged, not created or destroyed." },
              { label: "Energy flow", detail: "Light energy → chemical bonds in glucose → ATP (usable cell energy) → work (movement, synthesis, transport)" },
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "Plants only photosynthesize and do not perform cellular respiration.",
            correction: "Plants perform BOTH. They photosynthesize only in the light (in chloroplasts) but respire 24 hours a day (in mitochondria) — just like animals. At night, when photosynthesis stops, plants only consume O₂ and release CO₂. During the day, photosynthesis usually produces more O₂ than respiration consumes — resulting in net O₂ release.",
            teks: "B.11A",
          },
          {
            type: "misconception-spotlight",
            misconception: "Enzymes are used up during reactions.",
            correction: "Enzymes are catalysts — they speed up reactions but are NOT consumed or permanently changed. After releasing the products, the active site is free and the enzyme can immediately bind to another substrate. A single enzyme molecule can catalyze millions of reactions during its lifetime.",
            teks: "B.11B",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Enzyme", definition: "A protein that acts as a biological catalyst, lowering activation energy and speeding up chemical reactions without being consumed.", example: "Lactase is the enzyme that breaks down lactose in milk. People with lactose intolerance do not produce enough lactase." },
              { term: "Photosynthesis", definition: "The process by which plants, algae, and some bacteria convert light energy + CO₂ + H₂O into glucose and O₂ in chloroplasts.", example: "The green color of leaves is due to chlorophyll, the photosynthetic pigment in chloroplasts." },
              { term: "Cellular respiration", definition: "The process by which cells break down glucose in the presence of O₂ to release energy stored as ATP; produces CO₂ and H₂O.", example: "The CO₂ you exhale is the product of cellular respiration in every cell of your body." },
              { term: "ATP (adenosine triphosphate)", definition: "The universal energy currency of cells; stores and transfers chemical energy for cellular work.", example: "Muscle contractions, protein synthesis, and active transport all require ATP." },
            ],
          },
        ],
        keyTerms: ["enzyme", "active site", "substrate", "activation energy", "denaturation", "photosynthesis", "cellular respiration", "ATP", "conservation of matter"],
        quickChecks: [
          {
            id: "qc-u1l3-enzymes-developing",
            teks: "B.11B",
            learningLevel: "developing",
            conceptId: "concept-4-energy-conversions",
            question: "What is the role of an enzyme in a chemical reaction?",
            options: [
              "It provides energy to start the reaction",
              "It is permanently changed by the reaction",
              "It lowers the activation energy and speeds up the reaction without being used up",
              "It replaces the substrate in the reaction",
            ],
            correctAnswer: "It lowers the activation energy and speeds up the reaction without being used up",
          },
          {
            id: "qc-u1l3-enzymes-progressing",
            teks: "B.11A",
            learningLevel: "progressing",
            conceptId: "concept-4-energy-conversions",
            question: "The balanced equation for cellular respiration is: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP. How many carbon atoms are on the LEFT side of this equation, and how many are on the RIGHT side?",
            options: [
              "6 carbons on the left; 12 carbons on the right",
              "6 carbons on the left; 6 carbons on the right — matter is conserved",
              "12 carbons on the left; 6 carbons on the right",
              "There are no carbon atoms — glucose is not a carbon compound",
            ],
            correctAnswer: "6 carbons on the left; 6 carbons on the right — matter is conserved",
          },
          {
            id: "qc-u1l3-enzymes-proficient",
            teks: "B.11B",
            learningLevel: "proficient",
            conceptId: "concept-4-energy-conversions",
            question: "A student heats an enzyme solution to 80°C (far above the enzyme's optimal temperature). She then tests it with substrate and observes no reaction. What most likely happened?",
            options: [
              "The enzyme was used up by the high temperature",
              "High temperature denatured the enzyme, changing the shape of its active site so it can no longer bind to the substrate",
              "High temperature increased activation energy, preventing the reaction",
              "The substrate was destroyed by the heat, not the enzyme",
            ],
            correctAnswer: "High temperature denatured the enzyme, changing the shape of its active site so it can no longer bind to the substrate",
          },
          {
            id: "qc-u1l3-enzymes-advanced",
            teks: "B.11A",
            learningLevel: "advanced",
            conceptId: "concept-4-energy-conversions",
            question: "A terrarium contains a sealed glass jar with a plant. Over several weeks, the plant thrives and the oxygen level in the jar stays stable. Which best explains how this is possible?",
            options: [
              "The plant only photosynthesizes, producing O₂ with no net O₂ consumption",
              "During the day, photosynthesis produces more O₂ than the plant consumes in respiration; at night, the plant consumes O₂ through respiration — the net O₂ output of photosynthesis equals the O₂ input of respiration over the full day",
              "The glass jar creates O₂ from water molecules through evaporation",
              "The plant does not respire — only animals need oxygen to produce ATP",
            ],
            correctAnswer: "During the day, photosynthesis produces more O₂ than the plant consumes in respiration; at night, the plant consumes O₂ through respiration — the net O₂ output of photosynthesis equals the O₂ input of respiration over the full day",
          },
        ],
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
        minutes: 40,
        type: "Reading",
        teks: ["B.7A"],
        summary:
          "Identifies DNA nucleotide components; explains base pairing rules; describes the semi-conservative replication process with enzyme roles.",
        hook: {
          headline: "A four-letter alphabet that defines every living thing",
          body: "In 1953, Watson and Crick published a two-page paper describing a structure that would reshape all of biology — the DNA double helix. The base-pairing rules they described are why your cells can copy three billion letters of genetic code in under eight hours with roughly one error per billion bases — a proofreading accuracy that no human-engineered machine can match.",
          source: "Watson & Crick, Nature, 1953",
        },
        learningIntentions: [
          "Identify the three components of a DNA nucleotide (deoxyribose, phosphate, nitrogenous base)",
          "Apply base pairing rules (A-T, C-G) to complete complementary DNA strands",
          "Describe the roles of helicase and DNA polymerase in semi-conservative replication",
        ],
        lessonMisconceptions: [
          "DNA is only made of nucleotides — nucleotides include the sugar-phosphate backbone, not just the bases",
          "Both DNA strands are synthesized identically during replication — one strand (leading) is synthesized continuously; the other (lagging) is synthesized in fragments",
          "The DNA double helix is held together by covalent bonds between bases — hydrogen bonds (weak, breakable) connect the bases; covalent bonds form the sugar-phosphate backbone",
        ],
        vocabularyTiers: {
          everyday: ["ladder", "copy", "code", "pairs", "unzip", "blueprint"],
          academic: ["nucleotide", "polymer", "backbone", "complement", "template", "enzyme"],
          contentSpecific: [
            "deoxyribose", "phosphate group", "nitrogenous base",
            "adenine", "thymine", "guanine", "cytosine",
            "double helix", "antiparallel", "hydrogen bond",
            "helicase", "DNA polymerase", "semi-conservative replication",
          ],
        },
        sections: [
          {
            heading: "The DNA Nucleotide: Three-Part Building Block",
            body: [
              "Each DNA nucleotide has three components: (1) a deoxyribose sugar (5-carbon), (2) a phosphate group attached to the sugar's 5' carbon, and (3) one of four nitrogenous bases: adenine (A), thymine (T), guanine (G), or cytosine (C).",
              "Nucleotides link together via phosphodiester bonds between the 3' carbon of one sugar and the 5' phosphate of the next — forming the sugar-phosphate backbone. The bases extend inward from the backbone.",
            ],
          },
          {
            type: "visual-diagram",
            heading: "DNA Double Helix Anatomy",
            description: "Shows the structural components of the DNA double helix including backbones, base pairs, and directionality.",
            elements: [
              { label: "Sugar-phosphate backbone", detail: "Two outer 'rails' of the DNA ladder; alternating deoxyribose and phosphate groups; held together by covalent (phosphodiester) bonds" },
              { label: "Nitrogenous base pairs", detail: "Inner 'rungs' of the ladder; A pairs with T (2 hydrogen bonds); G pairs with C (3 hydrogen bonds)" },
              { label: "Antiparallel strands", detail: "One strand runs 5'→3' top to bottom; the other runs 3'→5' top to bottom — they are oriented in opposite directions" },
              { label: "Major and minor grooves", detail: "The twisting of the helix creates two grooves; proteins (including transcription factors) bind in these grooves to regulate gene expression" },
            ],
          },
          {
            heading: "Base Pairing Rules",
            body: [
              "The bases pair specifically: adenine (A) always pairs with thymine (T) via 2 hydrogen bonds; guanine (G) always pairs with cytosine (C) via 3 hydrogen bonds. This complementary base pairing is why the two strands are mirror images of each other.",
              "Knowing one strand lets you predict the other: if one strand is 5'-ATGCTTAACG-3', the complementary strand is 3'-TACGAATTGC-5'.",
            ],
          },
          {
            type: "worked-example",
            heading: "Completing a Complementary DNA Strand",
            scenario: "A template DNA strand reads: 3'-TACGGCTATCGA-5'. Write the complementary (new) strand in the correct antiparallel direction.",
            steps: [
              "The new strand is synthesized 5'→3' (antiparallel to the template).",
              "Read the template 3'→5': T-A-C-G-G-C-T-A-T-C-G-A",
              "Apply base pairing (A↔T, G↔C): A-T-G-C-C-G-A-T-A-G-C-T",
              "Write new strand 5'→3': 5'-ATGCCGATAGCT-3'",
            ],
            conclusion: "New strand: 5'-ATGCCGATAGCT-3'. This sequence begins with ATG — the start codon for methionine in protein synthesis.",
          },
          {
            heading: "DNA Replication: Semi-Conservative Copying",
            body: [
              "Before a cell divides, it must copy all its DNA. Replication is semi-conservative — each new DNA molecule contains one original strand and one newly synthesized strand.",
              "Key enzymes: (1) Helicase unwinds and unzips the double helix at the replication fork by breaking hydrogen bonds between base pairs. (2) DNA polymerase reads the template strand and adds complementary nucleotides to the new strand, traveling only 5'→3'.",
              "Primase first adds a short RNA primer to provide a starting point; DNA polymerase then extends from the primer. After replication, the primers are removed and replaced with DNA.",
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "DNA is held together by the same type of bonds as the sugar-phosphate backbone.",
            correction: "The two strands are held together by HYDROGEN BONDS between complementary base pairs — these are relatively weak and CAN be broken (by helicase during replication, or by heat). The sugar-phosphate backbone within each strand is held together by strong COVALENT (phosphodiester) bonds. This is why strands can unzip without falling apart.",
            teks: "B.7A",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Deoxyribose", definition: "The five-carbon sugar in DNA nucleotides; differs from ribose (RNA) by lacking one oxygen atom at the 2' position.", example: "The 'D' in DNA stands for deoxy — meaning 'without oxygen' at position 2' of the sugar." },
              { term: "Antiparallel", definition: "The two DNA strands run in opposite directions: one 5'→3', the other 3'→5'. They point in opposite directions.", example: "Like a two-lane highway — cars in each lane travel opposite directions even though both lanes are parallel." },
              { term: "Helicase", definition: "Enzyme that unwinds and separates the two DNA strands at the replication fork by breaking hydrogen bonds between base pairs.", example: "Think of helicase as a zipper being pulled open — it separates the two DNA strands so replication can begin." },
              { term: "Semi-conservative replication", definition: "DNA replication where each new double-stranded molecule contains one original (parent) strand and one new (daughter) strand.", example: "Proven by the Meselson-Stahl experiment (1958) using heavy and light nitrogen isotopes to track which strands were old and new." },
            ],
          },
        ],
        keyTerms: ["deoxyribose", "phosphate", "nitrogenous base", "double helix", "antiparallel", "base pairing", "helicase", "DNA polymerase", "semi-conservative replication"],
        quickChecks: [
          {
            id: "qc-u2l1-dna-developing",
            teks: "B.7A",
            learningLevel: "developing",
            conceptId: "unit2-concept1-dna",
            question: "Which two nitrogenous bases pair together in DNA?",
            options: [
              "Adenine–Guanine and Thymine–Cytosine",
              "Adenine–Thymine and Guanine–Cytosine",
              "Adenine–Uracil and Guanine–Cytosine",
              "Adenine–Cytosine and Guanine–Thymine",
            ],
            correctAnswer: "Adenine–Thymine and Guanine–Cytosine",
          },
          {
            id: "qc-u2l1-dna-progressing",
            teks: "B.7A",
            learningLevel: "progressing",
            conceptId: "unit2-concept1-dna",
            question: "A segment of one DNA strand reads: 5'-AATTGCCA-3'. What is the sequence of the complementary strand, written 5'→3'?",
            options: [
              "5'-AATTGCCA-3'",
              "5'-TTAACGGT-3'",
              "5'-UUAACGGU-3'",
              "5'-TGGCAATT-3'",
            ],
            correctAnswer: "5'-TGGCAATT-3'",
          },
          {
            id: "qc-u2l1-dna-proficient",
            teks: "B.7A",
            learningLevel: "proficient",
            conceptId: "unit2-concept1-dna",
            question: "A researcher adds a chemical that permanently disables helicase in a cell. What is the MOST DIRECT effect on the cell?",
            options: [
              "The cell cannot transcribe mRNA because helicase is also used in transcription",
              "The cell cannot replicate its DNA because the double helix cannot be unwound at the replication fork",
              "The cell cannot translate proteins because helicase is needed to read codons",
              "The cell's DNA will be cut into small fragments by restriction enzymes",
            ],
            correctAnswer: "The cell cannot replicate its DNA because the double helix cannot be unwound at the replication fork",
          },
          {
            id: "qc-u2l1-dna-advanced",
            teks: "B.7A",
            learningLevel: "advanced",
            conceptId: "unit2-concept1-dna",
            misconceptionTarget: true,
            misconceptionDescription: "DNA is only nucleotides — overlooking backbone role",
            question: "A DNA strand contains 30% guanine. What is the percentage of thymine in this double-stranded molecule, and what underlying rule explains your answer?",
            options: [
              "30% thymine — complementary base pairing means G% = T% in double-stranded DNA",
              "20% thymine — because the remaining 40% is split between thymine and adenine",
              "30% thymine is impossible — G only pairs with C, so T% must equal A%, and since G+C=60%, A+T=40%, meaning thymine = 20%",
              "30% thymine — the percentage of each base must be equal",
            ],
            correctAnswer: "30% thymine is impossible — G only pairs with C, so T% must equal A%, and since G+C=60%, A+T=40%, meaning thymine = 20%",
          },
        ],
      },
      {
        id: "u2-l2",
        slug: "transcription-and-translation",
        title: "Transcription and Translation",
        minutes: 45,
        type: "Lecture",
        teks: ["B.7B"],
        isPriorityTEKS: true,
        summary:
          "Describes the significance of gene expression; explains the two steps of protein synthesis (transcription and translation) using DNA/RNA models; introduces the central dogma.",
        hook: {
          headline: "mRNA vaccines rewrote what we thought was possible in medicine",
          body: "The COVID-19 mRNA vaccines delivered genetic instructions directly into your cells, telling ribosomes to build a harmless piece of coronavirus spike protein. Your immune system learned from it — all using the same transcription and translation machinery your cells use every single day. What you are learning in this lesson is the mechanism behind one of the fastest vaccine developments in history.",
          source: "Moderna / BioNTech, 2020",
        },
        learningIntentions: [
          "Explain the central dogma: DNA → RNA → Protein",
          "Describe transcription: how RNA polymerase builds mRNA from a DNA template",
          "Describe translation: how ribosomes decode mRNA codons into a polypeptide chain",
          "Distinguish between mRNA, tRNA, and rRNA by function",
          "Use a codon chart to predict protein sequence from mRNA",
        ],
        lessonMisconceptions: [
          "DNA directly makes proteins — mRNA is the essential intermediary (central dogma)",
          "RNA and DNA are the same molecule — RNA is single-stranded, uses ribose sugar, and has uracil instead of thymine",
          "Each gene codes for only one protein — alternative splicing allows one gene to produce multiple protein isoforms",
        ],
        vocabularyTiers: {
          everyday: ["copy", "decode", "message", "build", "read", "instruction"],
          academic: ["transcription", "translation", "template", "complement", "synthesize"],
          contentSpecific: [
            "central dogma", "RNA polymerase", "promoter", "mRNA", "tRNA", "rRNA",
            "codon", "anticodon", "start codon (AUG)", "stop codon",
            "ribosome", "polypeptide", "gene expression", "uracil",
          ],
        },
        sections: [
          {
            heading: "The Central Dogma: DNA → RNA → Protein",
            body: [
              "The central dogma describes the flow of genetic information: DNA is transcribed into RNA, which is translated into protein. This one-way flow explains how the genetic code stored in DNA ultimately controls every cell structure and function.",
              "DNA is the master copy — it never leaves the nucleus (in eukaryotes). mRNA is a temporary working copy that travels to the cytoplasm where ribosomes read it to build proteins.",
            ],
          },
          {
            heading: "Step 1 — Transcription: DNA to mRNA",
            body: [
              "Transcription occurs in the nucleus. RNA polymerase binds to a promoter sequence on DNA and unwinds the double helix. It then reads the template strand (3'→5') and assembles a complementary mRNA strand (5'→3').",
              "Key difference from DNA replication: RNA uses uracil (U) instead of thymine (T) to pair with adenine (A). The mRNA strand is single-stranded. When transcription is complete, the mRNA is released and the DNA re-anneals.",
              "The mRNA exits the nucleus through nuclear pores and travels to the cytoplasm (or rough ER).",
            ],
          },
          {
            heading: "Step 2 — Translation: mRNA to Protein",
            body: [
              "Translation occurs at ribosomes (made of rRNA and proteins). The ribosome reads the mRNA in triplets called codons. Each codon specifies one amino acid (or a start/stop signal).",
              "The start codon AUG codes for methionine and signals the ribosome to begin. Transfer RNA (tRNA) molecules carry specific amino acids — each tRNA has an anticodon that base-pairs with a matching mRNA codon.",
              "The ribosome catalyzes peptide bonds between amino acids, building the polypeptide chain. Translation ends when the ribosome reaches a stop codon (UAA, UAG, or UGA), which has no matching tRNA — the ribosome releases the finished protein.",
            ],
          },
          {
            type: "worked-example",
            heading: "From DNA Template to Protein Sequence",
            scenario: "A DNA template strand reads: 3'-TACGGCATAGCT-5'. Transcribe it to mRNA, then translate it using the codon chart.",
            steps: [
              "Transcription: Read DNA template 3'→5' and build mRNA 5'→3' using RNA base pairing (A↔U, T↔A, G↔C, C↔G).",
              "DNA: 3'-T-A-C-G-G-C-A-T-A-G-C-T-5'",
              "mRNA: 5'-A-U-G-C-C-G-U-A-U-C-G-A-3'",
              "Translation: Read mRNA in codons: AUG | CCG | UAU | CGA",
              "AUG = Methionine (start codon) | CCG = Proline | UAU = Tyrosine | CGA = Arginine",
              "Polypeptide: Met-Pro-Tyr-Arg",
            ],
            conclusion: "This four-amino-acid peptide begins with methionine (AUG start codon). In a real gene, this would continue until a stop codon is reached.",
          },
          {
            type: "visual-diagram",
            heading: "Central Dogma Flow: DNA → mRNA → Protein",
            description: "Illustrates the two-step process of gene expression from DNA template to finished polypeptide.",
            elements: [
              { label: "DNA (nucleus)", detail: "Double-stranded; contains the gene sequence; never leaves the nucleus in eukaryotes" },
              { label: "Transcription (nucleus)", detail: "RNA polymerase reads DNA template strand 3'→5'; builds mRNA 5'→3' using ribonucleotides; U replaces T" },
              { label: "mRNA (travels to cytoplasm)", detail: "Single-stranded RNA copy of the gene; carries codons (3-base sequences) to ribosomes" },
              { label: "Translation (ribosome)", detail: "Ribosome reads mRNA codons; tRNA anticodons bring matching amino acids; peptide bonds form between amino acids" },
              { label: "Polypeptide / Protein", detail: "Chain of amino acids folds into final 3-D shape to perform its function (enzyme, structural protein, etc.)" },
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "DNA directly makes proteins without any intermediate steps.",
            correction: "DNA NEVER leaves the nucleus to become protein directly. The process requires two distinct steps: (1) Transcription — RNA polymerase makes an mRNA copy of the gene in the nucleus. (2) Translation — ribosomes in the cytoplasm read the mRNA and build the protein. mRNA is the essential messenger between DNA (stored instructions) and protein (functional product).",
            teks: "B.7B",
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Codon", definition: "A sequence of three mRNA bases that codes for one specific amino acid (or a start or stop signal).", example: "AUG is the universal start codon — it codes for methionine and begins every protein." },
              { term: "Anticodon", definition: "The three-base sequence on a tRNA molecule that is complementary to a specific mRNA codon.", example: "The tRNA carrying methionine has anticodon 3'-UAC-5', which pairs with mRNA codon 5'-AUG-3'." },
              { term: "tRNA (transfer RNA)", definition: "Adapter molecule that brings specific amino acids to the ribosome during translation, matching anticodons to mRNA codons.", example: "There are 61 types of tRNA molecules (one for each coding codon)." },
              { term: "Gene expression", definition: "The process by which the information in a gene is used to build a functional product (usually a protein) — includes transcription and translation.", example: "The gene for insulin is expressed in pancreatic beta cells — they transcribe and translate it to produce insulin protein." },
            ],
          },
        ],
        keyTerms: ["central dogma", "transcription", "translation", "mRNA", "tRNA", "rRNA", "codon", "anticodon", "start codon AUG", "stop codon", "gene expression"],
        quickChecks: [
          {
            id: "qc-u2l2-transcription-developing",
            teks: "B.7B",
            learningLevel: "developing",
            conceptId: "unit2-concept2-protein-synthesis",
            question: "Which molecule carries the genetic code from the nucleus to the ribosome for protein synthesis?",
            options: ["DNA", "tRNA", "mRNA", "rRNA"],
            correctAnswer: "mRNA",
          },
          {
            id: "qc-u2l2-transcription-progressing",
            teks: "B.7B",
            learningLevel: "progressing",
            conceptId: "unit2-concept2-protein-synthesis",
            question: "A DNA template strand reads 3'-ATCGGATCCA-5'. What is the mRNA sequence transcribed from this strand?",
            options: [
              "5'-ATCGGATCCA-3'",
              "5'-UAGCCUAGGU-3'",
              "5'-TAGCCTAGGT-3'",
              "5'-UAGCUAGCCU-3'",
            ],
            correctAnswer: "5'-UAGCCUAGGU-3'",
          },
          {
            id: "qc-u2l2-transcription-proficient",
            teks: "B.7B",
            learningLevel: "proficient",
            conceptId: "unit2-concept2-protein-synthesis",
            question: "An mRNA strand reads: 5'-AUG-CCU-GGU-UAA-3'. Using a codon chart (AUG = Met, CCU = Pro, GGU = Gly, UAA = stop), what polypeptide does this produce?",
            options: [
              "Met-Pro-Gly (three amino acids)",
              "Met-Pro-Gly-Stop (four amino acids including stop)",
              "Pro-Gly (two amino acids — AUG start codon is not translated)",
              "Met-Pro-Gly-Thr (four amino acids)",
            ],
            correctAnswer: "Met-Pro-Gly (three amino acids)",
          },
          {
            id: "qc-u2l2-transcription-advanced",
            teks: "B.7B",
            learningLevel: "advanced",
            conceptId: "unit2-concept2-protein-synthesis",
            question: "A researcher mutates the promoter region of a gene so that RNA polymerase can no longer bind. Which of the following correctly predicts the outcome?",
            options: [
              "Translation will be blocked but transcription will continue normally",
              "Transcription cannot begin — no mRNA is produced — so the gene cannot be expressed and no protein is made",
              "The DNA will be degraded because it is no longer protected by RNA polymerase",
              "tRNA will bind directly to DNA and translate the gene without mRNA",
            ],
            correctAnswer: "Transcription cannot begin — no mRNA is produced — so the gene cannot be expressed and no protein is made",
          },
        ],
      },
      {
        id: "u2-l3",
        slug: "mutations-and-significance",
        title: "Mutations and Their Significance",
        minutes: 40,
        type: "Notes",
        teks: ["B.7C"],
        isPriorityTEKS: true,
        summary:
          "Identifies and illustrates point and frameshift mutations; evaluates the significance of DNA changes on protein structure and organismal phenotype; introduces real-world examples including sickle cell disease and cancer.",
        hook: {
          headline: "One gene, one repair failure, and a decision that changed public conversation",
          body: "The BRCA1 gene does not cause cancer directly — it encodes a DNA repair protein that fixes mistakes before they become dangerous. A BRCA1 mutation disables this repair mechanism, so other mutations accumulate unchecked. Angelina Jolie's 2013 New York Times op-ed about her BRCA1 mutation brought genetic risk to mainstream conversation and led to a measurable increase in genetic counseling referrals — the 'Jolie Effect.'",
          source: "Jolie, New York Times, 2013; NEJM, 2016",
        },
        learningIntentions: [
          "Define mutation and distinguish between mutagens and spontaneous mutations",
          "Distinguish between point mutations (silent, missense, nonsense) and frameshift mutations (insertion, deletion)",
          "Predict the effect of a specific mutation on a protein sequence using the reading frame concept",
          "Evaluate the significance of mutations (some are neutral, some are harmful, some are beneficial)",
        ],
        lessonMisconceptions: [
          "Any DNA change causes a visible phenotype change — silent mutations change the DNA sequence but NOT the amino acid (due to codon redundancy)",
          "All mutations are harmful — many are neutral; some (like antibiotic resistance mutations in bacteria) are beneficial in certain environments",
          "Mutations are always caused by external mutagens — many mutations occur spontaneously during DNA replication errors",
        ],
        vocabularyTiers: {
          everyday: ["change", "error", "copy", "damage", "repair", "code"],
          academic: ["sequence", "mutation", "phenotype", "gene", "protein", "chromosome"],
          contentSpecific: [
            "mutation", "mutagen", "point mutation", "silent mutation", "missense mutation", "nonsense mutation",
            "frameshift mutation", "insertion", "deletion", "reading frame",
            "sickle cell disease", "phenotype", "genotype",
          ],
        },
        sections: [
          {
            heading: "What Is a Mutation?",
            body: [
              "A mutation is any change in the nucleotide sequence of DNA. Mutations can be caused by mutagens (UV radiation, certain chemicals, X-rays, viruses) or can arise spontaneously during errors in DNA replication — even with proofreading enzymes, approximately 1 error per billion base pairs remains.",
              "Mutations can occur in somatic cells (body cells) — affecting only that individual — or in germ cells (sperm/egg) — and can be passed to offspring.",
            ],
          },
          {
            heading: "Point Mutations: One Base Changes",
            body: [
              "A point mutation substitutes one nucleotide for another. There are three possible outcomes:",
              "Silent mutation: the new codon codes for the SAME amino acid (due to the redundancy of the genetic code — multiple codons often specify the same amino acid). No change in protein. Example: GAA → GAG (both code for glutamic acid).",
              "Missense mutation: the new codon codes for a DIFFERENT amino acid. The protein may function differently or not at all. Example: sickle cell disease — GAG → GUG changes glutamic acid to valine in hemoglobin, causing it to crystallize under low oxygen.",
              "Nonsense mutation: the new codon is a STOP codon. Translation terminates early — a truncated (shortened) protein is produced, usually nonfunctional. Example: some BRCA1 mutations create premature stop codons in the repair protein.",
            ],
          },
          {
            type: "worked-example",
            heading: "Frameshift Mutation: One Base Inserted",
            scenario: "Original mRNA (read in codons): 5'-AUG-CAU-GGC-UAA-3' (Met-His-Gly-STOP). An adenine is inserted after the 3rd base (after AUG). Predict the new protein.",
            steps: [
              "Original: AUG | CAU | GGC | UAA → Met-His-Gly-STOP",
              "After insertion of A at position 4: AUG-A-CAU-GGC-UAA",
              "Re-read in triplets from AUG: AUG | ACA | UGG | CUA | A (incomplete codon)",
              "AUG = Met | ACA = Threonine | UGG = Tryptophan | CUA = Leucine",
              "Every codon AFTER the insertion point is shifted — the entire downstream reading frame is corrupted.",
            ],
            conclusion: "Original protein: Met-His-Gly-STOP. Mutant protein: Met-Thr-Trp-Leu-... (reads off into random amino acids until a chance stop codon appears). Frameshifts are typically much more disruptive than point mutations.",
          },
          {
            type: "visual-diagram",
            heading: "Mutation Type Comparison",
            description: "Illustrates the three types of point mutations and both types of frameshift mutations with their effects on the resulting protein.",
            elements: [
              { label: "Silent point mutation", detail: "1 base changes → same amino acid due to codon redundancy → NO change in protein" },
              { label: "Missense point mutation", detail: "1 base changes → different amino acid → protein may malfunction (example: sickle cell — Glu→Val)" },
              { label: "Nonsense point mutation", detail: "1 base changes → premature STOP codon → shortened, usually nonfunctional protein" },
              { label: "Frameshift insertion", detail: "1+ base(s) added → reading frame shifts for all downstream codons → garbled protein sequence" },
              { label: "Frameshift deletion", detail: "1+ base(s) removed → reading frame shifts for all downstream codons → garbled protein sequence" },
            ],
          },
          {
            type: "misconception-spotlight",
            misconception: "All mutations are harmful and cause disease.",
            correction: "The vast majority of mutations are neutral — they occur in non-coding DNA, produce silent amino acid changes, or affect regions that do not alter function. Some mutations are beneficial in specific environments (antibiotic resistance, lactase persistence in adults). Only a minority of mutations cause disease, and even then, most require additional mutations or environmental triggers.",
            teks: "B.7C",
          },
          {
            type: "activity",
            heading: "CER: Sickle Cell Mutation Analysis",
            prompt: "The sickle cell mutation changes one codon in the hemoglobin gene from GAG (glutamic acid — hydrophilic) to GUG (valine — hydrophobic). Under low-oxygen conditions, the mutant hemoglobin polymerizes into rigid rods that deform red blood cells into a sickle shape. Write a CER response: Does this mutation support or contradict the idea that 'protein structure determines protein function'?",
            sentenceFrames: [
              "My claim is that this mutation ___ the idea that protein structure determines function because ___.",
              "The evidence from the mutation is: the change from ___ to ___ altered the amino acid from ___ (hydrophilic/hydrophobic) to ___ (hydrophilic/hydrophobic).",
              "My reasoning is: because the new amino acid is ___, the protein ___, which shows that ___.",
            ],
          },
          {
            type: "vocabulary-spotlight",
            terms: [
              { term: "Silent mutation", definition: "A point mutation that changes a codon but produces the same amino acid, resulting in no change in the protein sequence.", example: "Over 68% of all possible single-base substitutions are silent — this is why the genetic code is called 'degenerate.'" },
              { term: "Missense mutation", definition: "A point mutation that changes a codon to one that codes for a different amino acid, potentially altering protein function.", example: "Sickle cell disease is caused by a missense mutation in the HBB gene: GAG → GUG (Glu → Val)." },
              { term: "Frameshift mutation", definition: "An insertion or deletion of nucleotides (not in multiples of 3) that shifts the reading frame of all downstream codons.", example: "Adding one extra base to a message 'THE CAT SAT' → 'THE XCA TSA T...' — all downstream meaning is lost." },
              { term: "Reading frame", definition: "The specific grouping of nucleotides into triplet codons starting from a fixed point; a frameshift mutation disrupts this grouping for all subsequent codons.", example: "DNA is read like words on a page — shift one letter and every word after it becomes nonsense." },
            ],
          },
        ],
        keyTerms: ["mutation", "mutagen", "point mutation", "silent mutation", "missense mutation", "nonsense mutation", "frameshift mutation", "insertion", "deletion", "reading frame"],
        quickChecks: [
          {
            id: "qc-u2l3-mutations-developing",
            teks: "B.7C",
            learningLevel: "developing",
            conceptId: "unit2-concept3-mutations",
            question: "What type of mutation involves the addition or removal of nucleotides, shifting the way all downstream codons are read?",
            options: ["Silent mutation", "Missense mutation", "Nonsense mutation", "Frameshift mutation"],
            correctAnswer: "Frameshift mutation",
          },
          {
            id: "qc-u2l3-mutations-progressing",
            teks: "B.7C",
            learningLevel: "progressing",
            conceptId: "unit2-concept3-mutations",
            question: "A mutation changes the codon GAG (glutamic acid) to UAG (stop codon). What type of mutation is this, and what is the most likely effect on the protein?",
            options: [
              "Silent mutation — no change in amino acid or protein",
              "Missense mutation — a different amino acid is inserted at this position",
              "Nonsense mutation — translation stops early, producing a shorter, likely nonfunctional protein",
              "Frameshift mutation — all downstream codons are shifted",
            ],
            correctAnswer: "Nonsense mutation — translation stops early, producing a shorter, likely nonfunctional protein",
          },
          {
            id: "qc-u2l3-mutations-proficient",
            teks: "B.7C",
            learningLevel: "proficient",
            conceptId: "unit2-concept3-mutations",
            question: "The original mRNA reads: 5'-AUG-GCA-UCC-UAG-3' (Met-Ala-Ser-STOP). A single cytosine is deleted from after the first AUG. Which result is MOST ACCURATE?",
            options: [
              "Only the second codon (GCA) changes to GCA — no downstream effect",
              "The reading frame shifts after AUG, producing a completely different amino acid sequence downstream: AUG-GAU-CCU-AG (Met-Asp-Pro-incomplete)",
              "The protein gains a new amino acid but otherwise remains the same",
              "Deletion of one cytosine only affects the codon where it was deleted, not downstream codons",
            ],
            correctAnswer: "The reading frame shifts after AUG, producing a completely different amino acid sequence downstream: AUG-GAU-CCU-AG (Met-Asp-Pro-incomplete)",
          },
          {
            id: "qc-u2l3-mutations-advanced",
            teks: "B.7C",
            learningLevel: "advanced",
            conceptId: "unit2-concept3-mutations",
            misconceptionTarget: true,
            misconceptionDescription: "All mutations are harmful",
            question: "A population of bacteria is exposed to an antibiotic. Before exposure, a random mutation arose in one bacterium that altered an enzyme the antibiotic targets, making that bacterium resistant. After antibiotic treatment, only resistant bacteria survive. Which statement BEST evaluates the significance of this mutation?",
            options: [
              "The mutation is harmful because it changed the normal bacterial enzyme",
              "The mutation is neutral — it had no effect in the original environment but became beneficial in the antibiotic environment, illustrating how mutation significance depends on context",
              "The mutation is beneficial in all environments because resistant bacteria always outcompete sensitive ones",
              "The mutation is irrelevant — antibiotic resistance develops because bacteria intentionally mutate to survive",
            ],
            correctAnswer: "The mutation is neutral — it had no effect in the original environment but became beneficial in the antibiotic environment, illustrating how mutation significance depends on context",
          },
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
