# interactive-assess

Interactive assessment platform monorepo.

## Workspace

- `apps/web` — Next.js web application
- `apps/api` — API service (if present in your local checkout)
- `apps/worker` — background jobs (if present in your local checkout)

## Requirements

- Node.js 20+
- `pnpm` 9+

## Install

```bash
pnpm install
```

## Development

Run the web app:

```bash
pnpm dev:web
```

Other workspace scripts:

```bash
pnpm dev:api
pnpm dev:worker
```

## Web app commands

From the repo root:

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web lint
```

## Notes

- If port `3000` is in use, Next.js may automatically start on `3001`.
- Environment values should be added in the app-specific `.env.local` files when needed.
