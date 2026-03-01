# Student Dashboard Theme (sitewide)

This document maps the Student Dashboard visual tokens and the Tailwind/CSS classes used as the app-wide theme.

Page container

- Container: `mx-auto max-w-6xl px-6` (used by `PageContent`).
- Page background: `min-h-dvh bg-slate-50` (applied by `PageShell`).

Card surfaces

- Primary large card: `rounded-[28px] border bg-white/95 p-6 shadow-sm` (default `Card`).
- Small/stat card: `rounded-2xl border bg-white p-5 shadow-sm` (`Card variant="sm"` / `StatCard`).
- Soft glass card: `.ia-card-soft` (backdrop blur, translucent white) — used for compact surfaces.

Typography

- Page title: `text-4xl font-semibold tracking-tight` (dashboard header).
- Section headings: `text-xl font-semibold` / `text-3xl` for larger headings.
- Body copy: base 15–16px (global `body` font-size); utilities: `text-sm`, `text-xs` for helper text.

Buttons & inputs

- Primary button: `.ia-btn-primary` (gradient background, white text).
- Default button: `.ia-btn` (white surface, subtle border).
- Small buttons: `.ia-btn-xs` / utility classes `rounded-md`, `px-3 py-1.5`.
- Inputs: `border border-slate-200 p-2 rounded-2xl` or `.ia-card-soft` for filled inputs.

CSS variables (globals.css)

- `--ia-grad-from`, `--ia-grad-via`, `--ia-grad-to` — primary gradients
- `--ia-bg`, `--ia-card`, `--ia-border`, `--ia-shadow-rgb`, `--ia-ink` — base colors and shadows
- Radius tokens: `--ia-radius-md`, `--ia-radius-lg`, `--ia-radius-xl`

Usage guidance

- Prefer `Card` and `StatCard` over ad-hoc `rounded-*/border/bg/px/py` combinations.
- Use `PageShell` / `PageContent` for page-level background and consistent horizontal padding.
- Reuse `.ia-btn` / `.ia-btn-primary` for buttons.
- Keep accessibility: use focus-visible outlines (already in globals.css).
