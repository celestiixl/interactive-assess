# Theme update checklist

Pages updated to use Student Dashboard theme primitives:

- [x] Student Dashboard: /apps/web/src/app/(app)/student/dashboard/page.tsx
- [x] Practice page: /apps/web/src/app/(app)/practice/page.tsx (normalized prompt container)
- [x] Teacher Dashboard: /apps/web/src/app/(app)/teacher/dashboard/page.tsx
- [x] Teacher Builder: /apps/web/src/app/(app)/teacher/builder/page.tsx

Files added (primitives):

- `apps/web/src/components/ui/PageShell.tsx`
- `apps/web/src/components/ui/Card.tsx`
- `apps/web/src/components/ui/Section.tsx`
- `apps/web/src/components/ui/CardHeader.tsx`
- `apps/web/src/components/ui/CardBody.tsx`
- `apps/web/src/components/ui/StatCard.tsx`
- `apps/web/src/components/ui/index.ts`

Notes / next steps

- Convert remaining pages to use `PageContent` and `Card` incrementally.
- Replace ad-hoc `rounded-*/border/bg` blocks with `Card` or `.ia-card-soft` where appropriate.
- Run full typecheck/build and verify visual parity.
