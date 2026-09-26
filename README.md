# D-DanceFE

Frontend repository for the Dance Institute app.

## Stack

- Next.js 14 App Router
- React 18
- TypeScript
- TanStack Query
- next-intl

## Initial scope

This setup corresponds to the frontend portions of:

- `FOUND-01` Monorepo Bootstrap, adapted to separate repo layout
- `AUTH-03` Next.js Web Skeleton, partially scaffolded

## UI rule

This frontend must be built mobile-first throughout the project.

- Use small-screen defaults first
- Add larger-screen layout enhancements afterward
- Do not treat desktop tables, spacing, or nav patterns as the baseline UX

## Local development

1. Install dependencies with `pnpm install`
2. Copy `.env.example` to `.env.local`
3. Run `pnpm dev`
4. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` before opening a pull request

## CI and deployment

Pull requests to `env/dev` and `main`, plus direct pushes to those branches,
run typechecking, linting, unit tests, a production build, and the Playwright
browser suite. The production frontend is connected to `env/dev` through
Vercel's Git integration, so merging to `env/dev` triggers the deployment.
Deployment credentials are not stored in GitHub Actions and there is no
separate repository deployment workflow.

## Workspace docs

Use the workspace agent entry document for project-wide workflow:

- `../docs/agent-dev/ENTRYPOINT.md` in the local workspace
