# Repository Guidelines

## Project Structure & Module Organization
- Monorepo workspaces:
  - `packages/frontend` (Next.js + TypeScript)
    - `src/app` (routes), `src/components` (UI), `src/lib` (utils), `public/` (assets)
  - `packages/backend` (Express + MongoDB)
    - `src/routes`, `src/models`, `src/utils`, `src/seeds`
- Root docs: `README.md`, `TESTING_GUIDE.md`, `DEPLOYMENT_GUIDE.md`, `API_DOCUMENTATION.md`
- Tests: FE `__tests__/*.test.tsx`; BE `__tests__/*.test.js`

## Build, Test, and Development Commands
- Install workspaces: `npm install`
- Build all packages: `npm run build`
- Frontend dev server: `npm run dev -w packages/frontend`
- Backend dev (nodemon): `npm run dev -w packages/backend`
- Start (prod): `npm start -w packages/frontend` and `npm start -w packages/backend`
- Seed sample data: `npm run seed -w packages/backend`
- Lint frontend: `npm run lint -w packages/frontend`
- Local API checks: `GET http://localhost:5002/health` and `/api/*`
- Tests: follow `TESTING_GUIDE.md` for exact commands.

## Coding Style & Naming Conventions
- 2-space indent, single quotes, no semicolons; match existing code.
- Frontend: TypeScript; React components in PascalCase; hooks/utilities camelCase; Tailwind classes in JSX; globals in `src/app/globals.css`.
- Backend: CommonJS; functions/vars camelCase; env vars UPPER_SNAKE_CASE.
- Keep diffs minimal and focused; follow local patterns per package.

## Testing Guidelines
- File patterns: FE `__tests__/*.test.tsx`; BE `__tests__/*.test.js`.
- Coverage targets: FE 80%, BE 85% (focus critical paths).
- Validate APIs locally via `/health` and `/api/*`. See `TESTING_GUIDE.md` for scenarios and commands.

## Commit & Pull Request Guidelines
- Conventional Commits, e.g., `feat(frontend): add meal planner`.
- Small, focused commits with clear rationale.
- PRs include description, linked issue, screenshots for UI changes, and testing notes.
- Ensure CI, lint, and build are clean before review.

## Security & Configuration Tips
- Backend requires `MONGODB_URI` and secrets in `.env` (never commit).
- CORS is enabled; restrict allowed origins before production.
- Frontend Firebase config at `packages/frontend/src/lib/firebase.ts`; use environment variables for deployment.
- See `DEPLOYMENT_GUIDE.md` for environment setup and `API_DOCUMENTATION.md` for endpoints.

