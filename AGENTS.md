# Repository Guidelines

This guide helps contributors work consistently across the monorepo. Follow the structure, commands, and conventions below to keep changes predictable and easy to review.

## Project Structure & Module Organization
- Monorepo with npm workspaces:
  - `packages/frontend` (Next.js + TypeScript)
    - `src/app` (app routes)
    - `src/components` (shared UI)
    - `src/lib` (utilities)
    - `public/` (static assets)
  - `packages/backend` (Express + MongoDB)
    - `src/routes`
    - `src/models`
    - `src/utils`
    - `src/seeds`
- Docs at repo root: `README.md`, `TESTING_GUIDE.md`, `DEPLOYMENT_GUIDE.md`, `API_DOCUMENTATION.md`.

## Build, Test, and Development Commands
- Install workspaces: `npm install`
- Build all packages: `npm run build`
- Frontend dev server: `npm run dev -w packages/frontend`
- Backend dev (nodemon): `npm run dev -w packages/backend`
- Start (prod): `npm start -w packages/frontend` and `npm start -w packages/backend`
- Seed sample data: `npm run seed -w packages/backend`
- Lint (frontend): `npm run lint -w packages/frontend`

## Coding Style & Naming Conventions
- Indentation: 2 spaces; prefer single quotes; no semicolons (match existing code).
- Frontend: TypeScript; React components in PascalCase (e.g., `MealPlanner.tsx`); hooks/utilities in camelCase; Tailwind in JSX; global styles in `src/app/globals.css`.
- Backend: CommonJS modules; functions/variables in camelCase; environment variables in UPPER_SNAKE_CASE.
- Keep diffs minimal and focused; follow local patterns in each package.

## Testing Guidelines
- Refer to `TESTING_GUIDE.md` for scenarios and examples (unit, API, E2E).
- File patterns: frontend `__tests__/*.test.tsx`; backend `__tests__/*.test.js`.
- Coverage targets: FE 80%, BE 85% for critical paths.
- Local API checks: `GET http://localhost:5002/health` and routes under `/api/*`.

## Commit & Pull Request Guidelines
- Use Conventional Commits (e.g., `feat(frontend): add meal planner`).
- Make small, focused commits with clear scope.
- PRs: include description, linked issue, screenshots for UI changes, and testing notes. Ensure CI, lint, and build are clean.

## Security & Configuration Tips
- Backend requires `MONGODB_URI` and related secrets in `.env` (never commit). CORS is enabled; restrict origins before production.
- Frontend Firebase config lives in `packages/frontend/src/lib/firebase.ts`; use environment variables for deployment.
- See `DEPLOYMENT_GUIDE.md` for environment setup and `API_DOCUMENTATION.md` for endpoints.

