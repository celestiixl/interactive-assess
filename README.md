# BioSpark

BioSpark is a Biology learning platform for FBISD high school students. Every lesson, question, and assignment is tagged to a TEKS standard, and mastery is tracked continuously as students work, not just at the unit test. When a student falls behind on a specific standard, the platform surfaces an intervention automatically and flags it for their teacher.

Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. The repository is a pnpm monorepo with three packages: a Next.js web front end, a Fastify API service, and a background worker.

---

## Getting Started

Requires Node.js 18+ and pnpm 9.

```bash
git clone https://github.com/celestiixl/biospark.git
cd biospark
pnpm install
pnpm dev:web
```

Open `http://localhost:3000`. Student login routes to `/student/dashboard`, teacher login to `/teacher/dashboard`.

```bash
pnpm --filter web build
pnpm --filter web start
```

### Environment variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=your_key_here   # AI scoring and translation
AUTH_SECRET=your_secret_here
```

---

## What it does

### For students

The dashboard shows a mastery ring across all TEKS, color-coded by unit, with focus indicators on weak standards. From there students move through the curriculum unit by unit; the next lesson stays locked until they hit the mastery threshold for the current one, so they can't skip over gaps.

Lessons are broken into sections with quick-check questions throughout. Attempt history, scores, and completion state are all saved locally so nothing is lost on refresh. Students who need language support or read-aloud have those controls available on every lesson.

The standards heatmap at `/student/learn/standards` gives students a personal view of where they stand across all TEKS and surfaces what to review next. If interventions have been triggered, they show up in a queue at `/student/learn/interventions` with the flagged standard, the reason it was flagged, and a next step.

**Simulations** at `/student/learn/simulations` are interactive, data-driven models tied directly to TEKS. Current simulations include Hardy-Weinberg equilibrium, genetic drift, natural selection, population bottleneck effects, ecological succession, and a bottle ecosystem cycles model.

The **Genome Browser** at `/student/genome-browser` lets students navigate annotated DNA and RNA sequences, visualize base pairing, and explore mutations in context (TEKS B.7A, B.7C).

**Practice mode** at `/practice` delivers STAAR-aligned question sets with inline choice, CER prompts, and drag-and-drop interactives. Students can work through items at their own pace with immediate feedback.

**Quest Rankings** at `/student/learn/rankings` surface a class leaderboard and daily challenge to motivate consistent practice.

The guardian snapshot at `/student/guardian` is written for parents: completed lessons, average check scores, missing and upcoming assignments, no education jargon.

### For teachers

Learning controls let teachers toggle unit and lesson visibility by class period, set pacing mode, and configure due windows. Analytics shows a funnel view of how many students reached each stage of a lesson or unit, with stuck-point analysis that identifies exactly where students are dropping off and which TEKS have the lowest class-wide mastery.

The **Item Bank** at `/teacher/item-bank` provides a searchable library of TEKS-tagged assessment items that teachers can add to assignments or assessments directly.

The **Assessment Builder** at `/teacher/builder` lets teachers compose custom assessments from item bank questions, inline choice items, and CER prompts, with a live preview before publishing.

Assignments and assessments are managed separately at `/teacher/assignments` and `/teacher/assessments`, each with scoring, due-date configuration, and per-period publishing controls.

Curriculum can be imported in bulk via a JSON validator at `/teacher/import-curriculum` with a preview step before committing. Content versioning, approval workflow, and a changelog are available at `/teacher/content-quality`.

**Phenomena Studio** at `/phenomena-studio` is a shared authoring and viewing space for phenomenon-based instructional assets. Teachers can upload, preview, and link phenomena (animations, interactive labs, and case studies) to specific units and TEKS. Existing phenomena include the Gulf Dead Zone animation, Buffalo Bayou ecosystem lab, and plant systems interactives for Unit 7.

---

## Curriculum

BioSpark follows the FBISD Biology curriculum across 8 units. Each unit has concept-level breakdowns with TEKS tags, four-level learning progressions (developing / progressing / proficient / advanced), and three-tier vocabulary (everyday / academic / content-specific).

Units 1, 2, and 7 are fully implemented. Units 3-6 and 8 exist as route stubs and will be filled in as curriculum documents are uploaded.

**Unit 1: Biomolecules and Cells** (26 days)
- Lab Safety (B.1D, B.1B, B.3A)
- Biomolecules and Cells (B.5A, B.5B)
- Cellular Processes (B.5C, B.11B)
- Energy Conversions in Cells (B.11A)

**Unit 2: Nucleic Acids and Protein Synthesis** (11 days)
- DNA, RNA, and Protein Synthesis (B.7A, B.7C)
- Gene Expression (B.7B)

**Unit 7: Processes in Plants** (9 days)
- Transport System / Vascular System (B.12B)
- Reproductive System in Plants (B.12B)
- Response System: Tropisms and Hormones (B.12B)
- Integration of Systems (B.12B)

The following TEKS are marked priority and gate lesson unlock and unit completion: B.5A, B.5B, B.11A, B.11B, B.7A, B.7B, B.7C, B.12B.

### TEA Tier 1 boundaries

Some standards have content that is explicitly out of scope for Tier 1 instruction:

- **B.11A**: no aerobic/anaerobic distinction, no Krebs cycle, no electron transport chain
- **B.11B**: no specific enzyme names or reaction mechanisms
- **B.7C**: no chromosomal mutations
- **B.12B**: students are not expected to memorize all types of asexual reproduction

---

## Intervention system

| Trigger | Tier | Strategies |
|---------|------|------------|
| Quick-check score below 70% | Tier 2 | Graphic organizers, concept maps, model-building activities |
| Score below 50% or 2+ failed attempts | Tier 3 | Scaffolded materials, sentence starters, simplified content, modified assessments |

---

## Project structure

This is a pnpm monorepo. Application code lives under `apps/`.

```
biospark/
├── apps/
│   ├── web/                         # Next.js front end
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (app)/
│   │       │   │   ├── student/
│   │       │   │   │   ├── dashboard/
│   │       │   │   │   ├── learning-hub/
│   │       │   │   │   ├── learn/
│   │       │   │   │   │   ├── [unitId]/[lessonSlug]/
│   │       │   │   │   │   ├── simulations/
│   │       │   │   │   │   ├── standards/
│   │       │   │   │   │   ├── interventions/
│   │       │   │   │   │   └── rankings/
│   │       │   │   │   ├── assignments/
│   │       │   │   │   ├── assessment/
│   │       │   │   │   ├── genome-browser/
│   │       │   │   │   ├── guardian/
│   │       │   │   │   └── profile/
│   │       │   │   ├── teacher/
│   │       │   │   │   ├── dashboard/
│   │       │   │   │   ├── learning-controls/
│   │       │   │   │   ├── learning-analytics/
│   │       │   │   │   ├── import-curriculum/
│   │       │   │   │   ├── content-quality/
│   │       │   │   │   ├── item-bank/
│   │       │   │   │   ├── builder/
│   │       │   │   │   ├── assessments/
│   │       │   │   │   └── assignments/
│   │       │   │   ├── phenomena-studio/
│   │       │   │   ├── practice/
│   │       │   │   └── assessment/
│   │       │   └── api/
│   │       │       ├── mastery/
│   │       │       ├── assignments/
│   │       │       ├── check/
│   │       │       ├── attempts/
│   │       │       ├── score/cer/
│   │       │       ├── score/short/
│   │       │       ├── phenomena/
│   │       │       ├── student/validate-name/
│   │       │       ├── teacher/weekly-digest/
│   │       │       ├── translate/
│   │       │       └── health/
│   │       ├── components/
│   │       ├── data/                # static item banks, TEKS data, STAAR sets
│   │       ├── hooks/
│   │       ├── lib/                 # mastery, interventions, persistence, TEKS utils
│   │       └── types/
│   ├── api/                         # Fastify API service
│   └── worker/                      # Background worker
└── packages/                        # shared packages (if any)
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
| `/api/phenomena/import-pr` | POST | Import a phenomenon package |
| `/api/teacher/weekly-digest` | GET | Weekly progress digest for teachers |
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

For developers, read `.github/copilot-instructions.md` before touching the curriculum layer. It has the full TEKS reference, content generation rules, and TEA boundary constraints. Don't bypass lesson unlock logic or intervention thresholds, and run `pnpm --filter web build` before opening a pull request.
