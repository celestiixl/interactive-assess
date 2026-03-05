export const MOCK_ASSIGNMENTS = [
  // ── Pre-existing teacher assignments ────────────────────────────────────────
  {
    id: "assignment-1",
    title: "Unit 1 Check-In",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "assignment-2",
    title: "Photosynthesis Quiz",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "assignment-3",
    title: "Genetics Practice",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "assignment-4",
    title: "Ecology Final",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ── Curriculum-aligned student assignments ───────────────────────────────────
  {
    id: "asgn-u2-core",
    title: "Unit 2 Check-In: DNA and Protein Synthesis",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "asgn-u1-energy",
    title: "Energy Conversions Quick Check",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "asgn-u2-models",
    title: "Gene Expression Modeling Practice",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "asgn-u1-transport",
    title: "Cell Transport and Homeostasis Quiz",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "asgn-u1-core",
    title: "Unit 1 Biomolecules and Cells Review",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "asgn-u1-enzymes",
    title: "Enzyme Function Mini Check",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_RESPONSES: Record<string, any[]> = {
  "assignment-1": [
    {
      itemId: "bio-1",
      studentId: "stu-1",
      studentName: "Ava",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-2",
      studentId: "stu-1",
      studentName: "Ava",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-1",
      studentId: "stu-2",
      studentName: "Ben",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
  ],
  "assignment-2": [
    {
      itemId: "bio-3",
      studentId: "stu-1",
      studentName: "Ava",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-3",
      studentId: "stu-2",
      studentName: "Ben",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
  ],
  "assignment-3": [
    {
      itemId: "bio-1",
      studentId: "stu-1",
      studentName: "Ava",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-2",
      studentId: "stu-1",
      studentName: "Ava",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-4",
      studentId: "stu-1",
      studentName: "Ava",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-1",
      studentId: "stu-2",
      studentName: "Ben",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-2",
      studentId: "stu-2",
      studentName: "Ben",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-4",
      studentId: "stu-2",
      studentName: "Ben",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-5",
      studentId: "stu-3",
      studentName: "Cara",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-5",
      studentId: "stu-4",
      studentName: "Dylan",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
  ],
  "assignment-4": [
    {
      itemId: "bio-6",
      studentId: "stu-1",
      studentName: "Ava",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-6",
      studentId: "stu-2",
      studentName: "Ben",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-7",
      studentId: "stu-3",
      studentName: "Cara",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-7",
      studentId: "stu-4",
      studentName: "Dylan",
      isCorrect: false,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-8",
      studentId: "stu-5",
      studentName: "Ella",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-9",
      studentId: "stu-5",
      studentName: "Ella",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
    {
      itemId: "bio-10",
      studentId: "stu-5",
      studentName: "Ella",
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    },
  ],
};

// ── Mock responses for curriculum-aligned assignments ──────────────────────

const MOCK_DNA_ITEM_IDS = ["bio-6", "bio-7", "bio-8"];
const MOCK_ENERGY_ITEM_IDS = ["bio-3", "bio-4", "bio-5"];
const MOCK_TRANSPORT_ITEM_IDS = ["bio-1", "bio-2"];
const MOCK_ENZYME_ITEM_IDS = ["bio-9", "bio-10"];

MOCK_RESPONSES["asgn-u2-core"] = [
  {
    itemId: MOCK_DNA_ITEM_IDS[0],
    studentId: "stu-1",
    studentName: "Ava",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_DNA_ITEM_IDS[1],
    studentId: "stu-1",
    studentName: "Ava",
    isCorrect: false,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_DNA_ITEM_IDS[0],
    studentId: "stu-2",
    studentName: "Ben",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
];

MOCK_RESPONSES["asgn-u1-energy"] = [
  {
    itemId: MOCK_ENERGY_ITEM_IDS[0],
    studentId: "stu-1",
    studentName: "Ava",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_ENERGY_ITEM_IDS[1],
    studentId: "stu-2",
    studentName: "Ben",
    isCorrect: false,
    submittedAt: new Date().toISOString(),
  },
];

MOCK_RESPONSES["asgn-u2-models"] = [
  {
    itemId: MOCK_DNA_ITEM_IDS[0],
    studentId: "stu-3",
    studentName: "Cara",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_DNA_ITEM_IDS[2],
    studentId: "stu-3",
    studentName: "Cara",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_DNA_ITEM_IDS[0],
    studentId: "stu-4",
    studentName: "Dylan",
    isCorrect: false,
    submittedAt: new Date().toISOString(),
  },
];

MOCK_RESPONSES["asgn-u1-transport"] = [
  {
    itemId: MOCK_TRANSPORT_ITEM_IDS[0],
    studentId: "stu-1",
    studentName: "Ava",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_TRANSPORT_ITEM_IDS[1],
    studentId: "stu-2",
    studentName: "Ben",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
];

MOCK_RESPONSES["asgn-u1-core"] = [
  {
    itemId: MOCK_TRANSPORT_ITEM_IDS[0],
    studentId: "stu-1",
    studentName: "Ava",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_ENERGY_ITEM_IDS[0],
    studentId: "stu-1",
    studentName: "Ava",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_TRANSPORT_ITEM_IDS[0],
    studentId: "stu-2",
    studentName: "Ben",
    isCorrect: false,
    submittedAt: new Date().toISOString(),
  },
];

MOCK_RESPONSES["asgn-u1-enzymes"] = [
  {
    itemId: MOCK_ENZYME_ITEM_IDS[0],
    studentId: "stu-1",
    studentName: "Ava",
    isCorrect: true,
    submittedAt: new Date().toISOString(),
  },
  {
    itemId: MOCK_ENZYME_ITEM_IDS[1],
    studentId: "stu-2",
    studentName: "Ben",
    isCorrect: false,
    submittedAt: new Date().toISOString(),
  },
];
