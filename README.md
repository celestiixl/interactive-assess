# BioSpark

BioSpark is a Biology learning platform for FBISD high school students. Every lesson, question, and assignment is tagged to a TEKS standard, and mastery is tracked continuously as students work, not just at the unit test. When a student falls behind on a specific standard, the platform surfaces an intervention automatically and flags it for their teacher.

Built with Next.js (App Router), TypeScript, and Tailwind CSS.

---

## Getting Started

Requires Node.js 18+.

```bash
git clone https://github.com/your-org/biospark.git
cd biospark
npm install
npm run dev
```

Open `http://localhost:3000`. Student login routes to `/student/dashboard`, teacher login to `/teacher/dashboard`.

```bash
npm run build
npm start
```

### Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=your_key_here   # scoring and translation
AUTH_SECRET=your_secret_here
```

---

## What it does

### For students

The dashboard shows a mastery ring across all TEKS, color-coded by unit, with focus indicators on weak standards. From there students move through the curriculum unit by unit; the next lesson stays locked until they hit the mastery threshold for the current one, so they can't skip over gaps.

Lessons are broken into sections with quick-check questions throughout. Attempt history, scores, and completion state are all saved locally so nothing is lost on refresh. Students who need language support or read-aloud have those controls available on every lesson.

The standards heatmap at `/student/learn/standards` gives students a personal view of where they stand across all TEKS and surfaces what to review next. If interventions have been triggered, they show up in a queue at `/student/learn/interventions` with the flagged standard, the reason it was flagged, and a next step.

The guardian snapshot at `/student/guardian` is written for parents: completed lessons, average check scores, missing and upcoming assignments, no education jargon.

### For teachers

Learning controls let teachers toggle unit and lesson visibility by class period, set pacing mode, and configure due windows. Analytics shows a funnel view of how many students reached each stage of a lesson or unit, with stuck-point analysis that identifies exactly where students are dropping off and which TEKS have the lowest class-wide mastery.

Curriculum can be imported in bulk via a JSON validator at `/teacher/import-curriculum` with a preview step before committing. Content versioning, approval workflow, and a changelog are available at `/teacher/content-quality`.

---

## Curriculum

BioSpark follows the FBISD Biology curriculum across 8 units. Each unit has concept-level breakdowns with TEKS tags, four-level learning progressions (developing / progressing / proficient / advanced), and three-tier vocabulary (everyday / academic / content-specific).

Units 1 and 2 are fully implemented. Units 3-8 exist as route stubs and will be filled in as curriculum documents are uploaded.

**Unit 1: Biomolecules and Cells** (26 days)
- Lab Safety (B.1D, B.1B, B.3A)
- Biomolecules and Cells (B.5A, B.5B)
- Cellular Processes (B.5C, B.11B)
- Energy Conversions in Cells (B.11A)

**Unit 2: Nucleic Acids and Protein Synthesis** (11 days)
- DNA, RNA, and Protein Synthesis (B.7A, B.7C)
- Gene Expression (B.7B)

The following TEKS are marked priority and gate lesson unlock and unit completion: B.5A, B.5B, B.11A, B.11B, B.7A, B.7B, B.7C.

### TEA Tier 1 boundaries

Some standards have content that is explicitly out of scope for Tier 1 instruction:

- **B.11A**: no aerobic/anaerobic distinction, no Krebs cycle, no electron transport chain
- **B.11B**: no specific enzyme names or reaction mechanisms
- **B.7C**: no chromosomal mutations

---

## Intervention system

| Trigger | Tier | Strategies |
|---------|------|------------|
| Quick-check score below 70% | Tier 2 | Graphic organizers, concept maps, model-building activities |
| Score below 50% or 2+ failed attempts | Tier 3 | Scaffolded materials, sentence starters, simplified content, modified assessments |

---

## Project structure

```
biospark/
├── app/
│   ├── student/
│   │   ├── dashboard/
│   │   ├── learning-hub/
│   │   ├── learn/
│   │   │   ├── [unitId]/[lessonSlug]/
│   │   │   ├── standards/
│   │   │   └── interventions/
│   │   ├── assignments/
│   │   ├── guardian/
│   │   └── profile/
│   ├── teacher/
│   │   ├── dashboard/
│   │   ├── learning-controls/
│   │   ├── learning-analytics/
│   │   ├── import-curriculum/
│   │   └── content-quality/
│   └── api/
│       ├── mastery/
│       ├── assignments/
│       ├── check/
│       ├── attempts/
│       ├── score/cer/
│       ├── score/short/
│       ├── translate/
│       └── health/
├── components/
└── lib/
    ├── curriculum/       # unit and lesson content
    ├── intelligence/     # heatmap, intervention, funnel logic
    ├── persistence/      # localStorage wrappers
    └── teks/             # TEKS reference and utilities
```

---

## API reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mastery` | GET | Student mastery by TEKS |
| `/api/assignments` | GET | Assignment list for current student |
| `/api/assignments/[id]/responses` | GET, POST | Assignment response data |
| `/api/assignments/[id]/summary` | GET | Score summary |
| `/api/check` | POST | Submit a quick-check answer |
| `/api/attempts` | GET, POST | Attempt history |
| `/api/score/cer` | POST | Score a Claim-Evidence-Reasoning response |
| `/api/score/short` | POST | Score a short-answer response |
| `/api/student/validate-name` | POST | Validate student identity on login |
| `/api/translate` | POST | Translate content |
| `/api/health` | GET | Health check |

---

## Data model

```ts
interface Lesson {
  id: string;
  unitId: string;              // "unit-1", "unit-2", etc.
  conceptId: string;
  slug: string;
  title: string;
  teks: string[];              // always "B.5A" format
  isPriorityTEKS: boolean;
  gradingPeriod: number;
  learningIntentions: string[];
  successCriteria: string[];
  vocabulary: {
    everyday: string[];
    academic: string[];
    contentSpecific: string[];
  };
  misconceptions: string[];
  sections: LessonSection[];
  quickChecks: QuickCheck[];
  interventionTier: 2 | 3 | null;
}

interface QuickCheck {
  id: string;
  teks: string;
  learningLevel: "developing" | "progressing" | "proficient" | "advanced";
  conceptId: string;
  misconceptionTarget?: boolean;
  question: string;
  options?: string[];
  correctAnswer: string;
}
```

TEKS codes are always formatted as `"B.5A"` and never `"b5a"` or `"B5A"`.

---

## Contributing

This is an internal FBISD project. If you're a teacher or curriculum coordinator and want to contribute content or flag an issue, reach out directly.

For developers, read `.github/copilot-instructions.md` before touching the curriculum layer. It has the full TEKS reference, content generation rules, and TEA boundary constraints. Don't bypass lesson unlock logic or intervention thresholds, and run `npm run build` before opening a pull request.
