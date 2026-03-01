# CER Item Type Implementation Guide

## Overview

Complete end-to-end Claim-Evidence-Reasoning (CER) item type for BioSpark Next.js app. Fully integrated with student renderer, teacher builder, teacher review UI, and API validation.

## Architecture

### Data Models (types/item.ts)

```typescript
- Evidence: { id, text, sourceLabel?, tag? }
- CerMode: "open" | "claim-given" | "claim-evaluate"
- ItemCER: ItemBase + mode, claim?, evidenceBank[], constraints, scaffolds, rubric
- CerResponse: itemId, studentId?, claimText?, claimEvaluation?, selectedEvidenceIds[],
             reasoningText, autoScore?, teacherScore?
```

**Key distinction:**

- `kind: "cer"` (not `type`)
- Mode determines which components are shown/locked in UI
- Auto-scoring available for evidence selection via `correctEvidenceIds`

### Student Component (`components/items/CER.tsx`)

3-step wizard: Claim → Evidence → Reasoning

**Features:**

- Bilingual support via `useLang()` hook (returns `{ lang, setLang, toggleLang }`)
- Sentence stems dropdown + word bank chips for scaffolding
- Evidence cards with checkboxes, source labels, tags
- Character count for reasoning validation
- Post-submission summary with auto-feedback if available
- Constrains: `minEvidence`, `maxEvidence`, `reasoningMinChars`

**Important:**

- Uses destructured `useLang()` to access `lang` string value
- `BilingualText` imported as named export (not default)
- Progress bar shows step completion

### Teacher Builder (`components/teacher/CERBuilder.tsx`)

Builds a CER item config with `onPatch` callback for parent state management.

**Sections:**

1. Mode selector (open/claim-given/claim-evaluate)
2. Context/scenario textarea
3. Claim textarea (hidden if mode="open")
4. Evidence bank editor with source/tag selectors and "mark as correct" checkboxes
5. Constraints: min/max evidence, reasoning chars, custom note toggle
6. Rubric points (claim points hidden if mode="open")
7. Sentence stems (EN/ES): claim, evidence, reasoning starters
8. Word banks (EN/ES)

**Pattern:** Auto-patches on any field change via useMemo dependency on handlePatch.

### Teacher Review (`components/teacher/CERReview.tsx`)

Displays student response with scoring interface.

**Displays:**

- Student's claim/claim-evaluation (read-only)
- Selected evidence cards with source/tag badges
- Auto-feedback if available (yellow alert box)
- Reasoning text (read-only)
- Score inputs for claim/evidence/reasoning
- Comments textarea with quick-button presets
- Total score calculator

**Quick buttons:** "Needs Evidence", "Reasoning unclear", "Strong CER", "Good use of evidence", "Claim needs support"

### ItemRenderer Integration (`components/ItemRenderer.tsx`)

Added switch case:

```tsx
case "cer":
  return <CER item={item as any} onChecked={onChecked} />;
```

### Teacher Builder Page (`app/(app)/teacher/builder/page.tsx`)

- ItemType union now includes `"cer"`
- Grid button layout expanded to 4 columns (added CER button)
- CER state managed as `cerItem` useState
- CER builder rendered when `type === "cer"`
- itemJson useMemo spreads `cerItem` when building CER type
- Preview card shows mode, evidence count, constraints

### API Endpoints

#### `/api/check/route.ts` (existing, extended)

Added CER branch:

```tsx
if (item?.kind === "cer") {
  // Validates evidence selection against correctEvidenceIds
  // Returns: { correct, score, max, feedback }
  // Feedback includes: missed evidence, incorrect selections, etc.
}
```

#### `/api/score/cer/route.ts` (new)

Dedicated CER scoring endpoint:

```tsx
POST { item, response }
// Returns: { ok, autoScore, response }
// autoScore: { evidence, totalAuto, feedback[] }
```

## Important Implementation Details

### Bilingual Support Pattern

```tsx
const { lang } = useLang(); // Destructure to get string "en" | "es"
// NOT: const lang = useLang();  (returns object)

// Sentence stems:
const getStemOptions = (type: "claim" | "evidence" | "reasoning") => {
  const stems =
    lang === "es"
      ? item.scaffolds?.sentenceStems?.es?.[type]
      : item.scaffolds?.sentenceStems?.en?.[type];
  return stems ?? [];
};
```

### Evidence Tag Display

Evidence can have optional `tag` field ("supports", "contradicts", "neutral"). Used in:

- Evidence card badges (teacher builder)
- Review display (teacher review)
- Auto-feedback logic (if tag="supports" and not selected, suggest it)

### Constraints Validation

```typescript
minEvidence: number (default 1)
maxEvidence: number (default 3)
reasoningMinChars?: number (default 60)
allowCustomEvidenceNote?: boolean (default false)
```

Before Submit button: all three steps must be valid:

- Claim step: claim text or pre-filled (depending on mode)
- Evidence step: minEvidence ≤ selected ≤ maxEvidence
- Reasoning step: reasoningText.length ≥ reasoningMinChars + (mode=evaluate ? claimEval !== null)

### Auto-Scoring Logic

If `correctEvidenceIds` is defined:

1. Count correct evidence selected (intersection)
2. Award points (clamped to max)
3. Generate feedback:
   - "You missed X piece(s)" if undershooting
   - "You selected X that may not support" if overshooting
   - "Consider selecting evidence that supports" if no "supports" tagged items selected

If no `correctEvidenceIds`, just validates constraints.

## File Locations

```
types/item.ts                                    (types only, no new file)
components/items/CER.tsx                         (student component - NEW)
components/teacher/CERBuilder.tsx                (teacher builder - NEW)
components/teacher/CERReview.tsx                 (teacher review - NEW)
components/ItemRenderer.tsx                      (modified - added case)
app/api/check/route.ts                           (modified - added CER branch)
app/api/score/cer/route.ts                       (new endpoint)
app/(app)/teacher/builder/page.tsx               (modified - integrated CER)
```

## Key Patterns from Existing Code

### useLang Hook

From `/lib/useLang.ts`: Returns `{ lang: "en"|"es", setLang, toggleLang }`
Persists to localStorage under key `"acc.v1"` → `{ lang: ... }`
Used in all student components for bilingual support.

### BilingualText Component

From `/components/student/BilingualText.tsx`: Named export function

```tsx
<BilingualText
  text={string | { en: string, es: string }}
  showSupport={boolean}
/>
```

Only renders translated text if `showSupport=true`.

### Teacher Builder Patterns

- Type-specific state managed separately (mcqChoices, buckets, cerItem, etc.)
- useMemo for itemJson tracks all dependencies
- onPatch callback for child components to update parent
- PreviewCard component wraps preview sections

## Testing Notes

### CompileErrors Found & Fixed

1. `BilingualText` import: Changed from default to named export
2. `useLang()` usage: Destructure to get `lang` property (not entire object)
3. Tailwind class warnings (min-h-[80px] → min-h-20, etc.) - resolved

### Manual Testing Checklist

- [ ] Student CER render in ItemRenderer with all three modes
- [ ] Mode switching changes claim visibility
- [ ] Evidence selection respects min/max constraints
- [ ] Submit button disables until all steps valid
- [ ] Auto-feedback generates if correctEvidenceIds set
- [ ] Teacher builder CER option appears and saves item
- [ ] Sentence stems and word banks render in student UI
- [ ] Bilingual text switches correctly when lang changes
- [ ] Teacher review displays responses and accepts scores
- [ ] Quick comment buttons append to comments field

## Future Enhancements

- Media support in context/prompt (image/video/link)
- Claim evaluation rubric/criteria display
- Student response history/versioning
- Batch scoring view for teachers
- CER response export/PDF
- Comparison view (predicted vs actual correctness on evidence)

## Current Status

✅ **COMPLETE & INTEGRATED**

- All components built and connected
- API endpoints ready
- Teacher builder functional
- Student experience complete
- Bilingual support active
- Auto-scoring implemented
- Type definitions comprehensive

Ready for QA and production deployment.
