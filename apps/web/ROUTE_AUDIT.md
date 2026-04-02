# BioSpark Route Audit

Generated: 2026-04-02

## Routes Inventory

All routes discovered via `find apps/web/src/app -name "page.tsx" | sort`.

---

## Reachable Routes

Routes that have a `page.tsx` AND at least one nav link or programmatic push pointing to them.

| Route | Linked from |
|-------|-------------|
| `/` | `href="/"` in navigation |
| `/assessment` | `redirect("/assessment")` in app, `router.push("/student/assessment")` |
| `/phenomena-studio` | `href="/phenomena-studio"`, `router.push("/phenomena-studio")` |
| `/phenomena-studio/gulf-dead-zone-animation-v17` | `href="/phenomena-studio/gulf-dead-zone-animation-v17"` |
| `/phenomena-studio/plant-systems-b12b` | `href="/phenomena-studio/plant-systems-b12b"` |
| `/phenomena-studio/upload-guide` | `href="/phenomena-studio/upload-guide"` |
| `/practice` | `href="/practice"`, `router.push("/practice")` |
| `/simulations` | `href="/simulations"`, `router.push("/simulations")` |
| `/simulations/population-genetics` | (reachable from `/simulations` page) |
| `/student/assessment` | `href="/student/assessment"`, `router.push("/student/assessment")` |
| `/student/assessment/items` | `href="/student/assessment/items"`, `router.push("/student/assessment/items")` |
| `/student/assignments` | `href="/student/assignments?kind=assessment"`, `href="/student/assignments?kind=assignment"` |
| `/student/dashboard` | `href="/student/dashboard"`, `redirect("/student/dashboard")` |
| `/student/guardian` | `href="/student/guardian"` |
| `/student/learn` | `href="/student/learn"` |
| `/student/learn/interventions` | `href="/student/learn/interventions"` |
| `/student/learn/rankings` | `href="/student/learn/rankings"` |
| `/student/learn/simulations/bottle-ecosystem-cycles` | `href="/student/learn/simulations/bottle-ecosystem-cycles"` |
| `/student/learn/simulations/population-genetics` | `href="/student/learn/simulations/population-genetics"` |
| `/student/learn/standards` | `href="/student/learn/standards"` |
| `/student/learn/unit-7` | `href="/student/learn/unit-7"` |
| `/student/learn/unit-7/plant-systems-b12b` | `href="/student/learn/unit-7/plant-systems-b12b"` |
| `/student/learn/unit-7/plant-systems-b12b-phenomenon` | `href="/student/learn/unit-7/plant-systems-b12b-phenomenon"` |
| `/student/login` | `href="/student/login"` |
| `/student/profile` | `href="/student/profile"` |
| `/teacher/builder` | `href="/teacher/builder"`, `router.push("/teacher/builder")` |
| `/teacher/content-quality` | `href="/teacher/content-quality"` |
| `/teacher/dashboard` | `href="/teacher/dashboard"` |
| `/teacher/import-curriculum` | `href="/teacher/import-curriculum"` |
| `/teacher/learning-analytics` | `href="/teacher/learning-analytics"`, `router.push("/teacher/learning-analytics")` |
| `/teacher/learning-analytics/weekly-digest` | `href="/teacher/learning-analytics/weekly-digest"` |
| `/teacher/learning-controls` | `href="/teacher/learning-controls"` |
| `/teacher/login` | `href="/teacher/login"`, `router.push("/teacher/login")` |

---

## Orphaned Routes (needs decision)

Routes that have a `page.tsx` but NO nav link pointing to them.  
Teacher review required before deleting.

| Route | File path | Notes |
|-------|-----------|-------|
| `/phenomena-studio/[slug]` | `apps/web/src/app/(app)/phenomena-studio/[slug]/page.tsx` | Dynamic catch-all - no explicit href; may be reached programmatically from data |
| `/phenomena-studio/imported/[slug]` | `apps/web/src/app/(app)/phenomena-studio/imported/[slug]/page.tsx` | Dynamic route; no explicit href found |
| `/simulations/enzyme-kinetics` | `apps/web/src/app/(app)/simulations/enzyme-kinetics/page.tsx` | No direct nav link found; possibly linked from simulations index page dynamically |
| `/student/bioart-demo` | `apps/web/src/app/(app)/student/bioart-demo/page.tsx` | Demo/prototype page - no nav link |
| `/student/genome-browser` | `apps/web/src/app/(app)/student/genome-browser/page.tsx` | No nav link found in codebase |
| `/student/learn/[unitId]` | `apps/web/src/app/(app)/student/learn/[unitId]/page.tsx` | Dynamic - linked programmatically from learn hub |
| `/student/learn/[unitId]/[lessonSlug]` | `apps/web/src/app/(app)/student/learn/[unitId]/[lessonSlug]/page.tsx` | Dynamic - linked programmatically from unit pages |
| `/student/learn/[unitId]/[lessonSlug]/flashcards` | `apps/web/src/app/(app)/student/learn/[unitId]/[lessonSlug]/flashcards/page.tsx` | Dynamic - linked from lesson pages; no static href |
| `/student/learn/simulations` | `apps/web/src/app/(app)/student/learn/simulations/page.tsx` | No direct href found for this index page |
| `/student/learn/simulations/ecological-succession` | `apps/web/src/app/(app)/student/learn/simulations/ecological-succession/page.tsx` | No nav link found |
| `/student/learn/simulations/punnett-maker` | `apps/web/src/app/(app)/student/learn/simulations/punnett-maker/page.tsx` | No nav link found |
| `/student/learn/unit-3` | `apps/web/src/app/(app)/student/learn/unit-3/page.tsx` | Stub/upcoming unit - no nav link |
| `/student/learn/unit-3/cell-growth` | `apps/web/src/app/(app)/student/learn/unit-3/cell-growth/page.tsx` | Stub - no nav link |
| `/student/learn/unit-3/disruptions-cell-cycle` | `apps/web/src/app/(app)/student/learn/unit-3/disruptions-cell-cycle/page.tsx` | Stub - no nav link |
| `/student/learn/unit-7/plant-systems-b12b/flashcards` | `apps/web/src/app/(app)/student/learn/unit-7/plant-systems-b12b/flashcards/page.tsx` | No direct href; may be linked from lesson page |
| `/student/learning-hub` | `apps/web/src/app/(app)/student/learning-hub/page.tsx` | Standalone learning hub - no external nav link found |
| `/student/tutor-demo` | `apps/web/src/app/(app)/student/tutor-demo/page.tsx` | Demo page - no nav link |
| `/teacher/assessments` | `apps/web/src/app/(app)/teacher/assessments/page.tsx` | `router.push("/teacher/assessments")` only (programmatic, no href) |
| `/teacher/assignments/[assignmentId]/summary` | `apps/web/src/app/(app)/teacher/assignments/[assignmentId]/summary/page.tsx` | Dynamic - linked programmatically |
| `/teacher/assignments/create` | `apps/web/src/app/(app)/teacher/assignments/create/page.tsx` | No nav link found |
| `/teacher/item-bank` | `apps/web/src/app/(app)/teacher/item-bank/page.tsx` | `router.push("/teacher/item-bank")` only (no href) |
| `/teacher/punnett-maker` | `apps/web/src/app/(app)/teacher/punnett-maker/page.tsx` | No nav link found |
| `/auth/teacher/login` (maps to `/(auth)/teacher/login`) | `apps/web/src/app/(auth)/teacher/login/page.tsx` | Auth route - treated separately from app routes |

---

## Nav Links With No Matching Page

Links that exist in nav components or code but have no corresponding `page.tsx`.

| Link href | Found in |
|-----------|----------|
| `/student/hotq` | `href="/student/hotq"` - no matching `page.tsx` found |
| `/animations/gulf_dead_zone.html` | `href="/animations/gulf_dead_zone.html"` - static HTML, not a Next.js route |
| `/lessons/plant-systems-b12b.html` | `href="/lessons/plant-systems-b12b.html"` - static HTML, not a Next.js route |
| `/phenomena-studio/buffalo-bayou-harvey-ecosystem-lab` | `href="/phenomena-studio/buffalo-bayou-harvey-ecosystem-lab"` - served by `[slug]` dynamic route if the slug resolves, but no static page |

---

## Notes

- Dynamic routes (`[unitId]`, `[lessonSlug]`, `[slug]`) are technically reachable but require runtime data to resolve. They are listed in Orphaned Routes to flag that no static nav link points to them directly.
- Demo/prototype pages (`bioart-demo`, `tutor-demo`, `genome-browser`) should be reviewed for production inclusion.
- Stub unit-3 pages exist but have no curriculum content or nav links yet.
- `/student/hotq` has a nav link but no page - this is a broken link that needs a page or the link should be removed.
