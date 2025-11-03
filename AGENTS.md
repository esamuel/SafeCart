# Repository Guidelines

This guide standardizes how we work in this monorepo. Follow the structure, commands, and conventions below to keep changes predictable and easy to review.

## Project Structure & Module Organization
- packages/frontend (Next.js + TypeScript)
  - `src/app` (routes), `src/components` (UI), `src/lib` (utils), `public/` (assets)
- packages/backend (Express + MongoDB)
  - `src/routes`, `src/models`, `src/utils`, `src/seeds`
- Root docs: `README.md`, `TESTING_GUIDE.md`, `DEPLOYMENT_GUIDE.md`, `API_DOCUMENTATION.md`
- Tests: frontend `__tests__/*.test.tsx`; backend `__tests__/*.test.js`

## Build, Test, and Development Commands
- Install workspaces: `npm install`
- Build all packages: `npm run build`
- Frontend dev: `npm run dev -w packages/frontend` (Next.js server)
- Backend dev: `npm run dev -w packages/backend` (nodemon)
- Start (prod): `npm start -w packages/frontend` and `npm start -w packages/backend`
- Seed data: `npm run seed -w packages/backend`
- Lint (frontend): `npm run lint -w packages/frontend`
- Local API checks: `GET http://localhost:5002/health` and `/api/*` routes

## Coding Style & Naming Conventions
- Indentation 2 spaces, single quotes, no semicolons; match existing code.
- Frontend: TypeScript; React components in PascalCase (e.g., `MealPlanner.tsx`); hooks/utilities in camelCase; Tailwind in JSX; globals in `src/app/globals.css`.
- Backend: CommonJS modules; functions/variables in camelCase; env vars in UPPER_SNAKE_CASE.
- Keep diffs minimal and focused; follow local patterns per package.

## Testing Guidelines
- See `TESTING_GUIDE.md` for scenarios and exact commands.
- File patterns: FE `__tests__/*.test.tsx`; BE `__tests__/*.test.js`.
- Coverage targets: FE 80%, BE 85% (critical paths).
- Validate APIs locally via `/health` and `/api/*` endpoints.

## Commit & Pull Request Guidelines
- Conventional Commits (e.g., `feat(frontend): add meal planner`).
- Small, focused commits with clear scope and rationale.
- PRs include: description, linked issue, screenshots for UI changes, and testing notes.
- Ensure CI, lint, and build are clean before requesting review.

## Security & Configuration Tips
- Backend requires `MONGODB_URI` and secrets in `.env` (never commit). CORS is enabled—restrict origins before production.
- Frontend Firebase config at `packages/frontend/src/lib/firebase.ts`; use environment variables for deployment.
- See `DEPLOYMENT_GUIDE.md` for environment setup and `API_DOCUMENTATION.md` for endpoints.

