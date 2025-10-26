# Repository Guidelines

## Project Structure & Module Organization
- Monorepo with npm workspaces: `packages/frontend` (Next.js + TypeScript) and `packages/backend` (Express + MongoDB).
- Frontend: app routes in `packages/frontend/src/app`, shared UI in `src/components`, utilities in `src/lib`, static assets in `public/`.
- Backend: routes in `packages/backend/src/routes`, data models in `src/models`, helpers in `src/utils`, seed data in `src/seeds`.
- Docs live at repo root (e.g., `README.md`, `TESTING_GUIDE.md`, `DEPLOYMENT_GUIDE.md`).

## Build, Test, and Development Commands
- Install: `npm install`
- Build all workspaces: `npm run build`
- Frontend dev: `npm run dev -w packages/frontend` (serves Next.js)
- Backend dev: `npm run dev -w packages/backend` (nodemon API server)
- Start (prod): `npm start -w packages/frontend` and `npm start -w packages/backend`
- Seed sample data: `npm run seed -w packages/backend`
- Lint (frontend): `npm run lint -w packages/frontend`

## Coding Style & Naming Conventions
- Indentation: 2 spaces; prefer single quotes; no semicolons (match existing code).
- Frontend: TypeScript, React components in PascalCase (e.g., `MealPlanner.tsx`), hooks/utilities in camelCase.
- Backend: CommonJS modules; functions/variables in camelCase; environment variables in UPPER_SNAKE_CASE.
- CSS: Tailwind in JSX; global styles in `src/app/globals.css`.

## Testing Guidelines
- Refer to `TESTING_GUIDE.md` for scenarios and examples (unit, API, E2E). Suggested patterns: `__tests__` folders, files named `*.test.tsx` (frontend) and `*.test.js` (backend).
- Target coverage: FE 80%, BE 85% for critical paths.
- Local API testing: `GET http://localhost:5002/health` and routes under `/api/*`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- Commits: small, focused; include scope when useful (e.g., `feat(frontend): add meal planner`).
- PRs: include clear description, linked issue, screenshots for UI changes, and testing notes (steps or test IDs). Ensure CI passes and lint/build are clean.

## Security & Configuration Tips
- Backend requires `MONGODB_URI` and related secrets in `.env` (never commit). CORS is enabled; restrict origins before production.
- Frontend Firebase keys live in `packages/frontend/src/lib/firebase.ts`—use environment variables for deployment.
- See `DEPLOYMENT_GUIDE.md` for environment setup and `API_DOCUMENTATION.md` for endpoints.

