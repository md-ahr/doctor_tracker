# Doctor Tracker portal

Next.js client of the Express API. The browser never holds a MongoDB connection string. Pages compose features. Features do not import each other.

## Contract

1. `docs/lld.md` — client contract and screen list
2. `docs/frontend-structure.md` — folders and query keys
3. `docs/design.md` — color, type, and screen behavior
4. `docs/frontend-tasks.md` — the next unfinished task
5. `docs/commit-guidelines.md`

If this repository is `web/` inside the contract workspace, those files live in `../docs/`.

## How to work

- Implement the lowest-numbered open task. One task, then its tests.
- Load `implement-web-task` before feature work.
- Add shadcn primitives from the `base-nova` style (`@base-ui/react`), then restyle them to `docs/design.md`. Do not add Radix.
- Query `context7` for Next.js, TanStack Query, React Hook Form, Zod, Recharts, Tailwind, Vitest, and Playwright signatures.
- Use `next-devtools` when a route, build error, or Next.js runtime detail is unclear.

## Non-negotiables

- Access token stays in `lib/auth/access-token.ts` memory. No `localStorage` or `sessionStorage`.
- Refresh cookie `dt_refresh` is HttpOnly. The HTTP client sends `credentials: "include"` and retries one 401 via `POST /auth/refresh`.
- The portal gate reads `dt_session`, a first-party hint with no credential, because `dt_refresh` lives on the API origin. Login and refresh mark it; logout and a failed refresh clear it.
- Feature UI calls hooks. Hooks call the feature `api` module. That module calls `lib/api`.
- Query keys are only the ones in frontend-structure section 5.
- Chart and filter dates stay `YYYY-MM-DD` strings. Calendar math uses Temporal in `lib/time/calendar.ts`; `lib/time/temporal.ts` installs the polyfill where the engine ships no Temporal (Node 22/24, stable Safari).
- Route gate is `src/proxy.ts` exporting `proxy`. There is no `middleware.ts`.
- One light theme. Paper `#F7F4EE`, action `#1B6B56`, Newsreader and Atkinson Hyperlegible.
- If the contract does not state it, stop. No `any`, type ignore, TODO, Inter, blue primary, or default shadcn styling.
- Load `web-security` before rendering user text or changing the session. No HTML injection and no Next.js proxy routes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
