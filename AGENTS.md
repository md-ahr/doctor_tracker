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
- Add shadcn primitives through the `shadcn` MCP, then restyle them to `docs/design.md`.
- Query `context7` for Next.js, TanStack Query, React Hook Form, Zod, Recharts, Tailwind, Vitest, and Playwright signatures.
- Use `next-devtools` when a route, build error, or Next.js runtime detail is unclear.

## Non-negotiables

- Access token stays in `lib/auth/access-token.ts` memory. No `localStorage` or `sessionStorage`.
- Refresh cookie `dt_refresh` is HttpOnly. The HTTP client sends `credentials: "include"` and retries one 401 via `POST /auth/refresh`.
- Feature UI calls hooks. Hooks call the feature `api` module. That module calls `lib/api`.
- Query keys are only the ones in frontend-structure section 5.
- Chart and filter dates stay `YYYY-MM-DD` strings. Calendar math uses Temporal in `lib/time/calendar.ts`.
- Route gate is `src/proxy.ts` exporting `proxy`. There is no `middleware.ts`.
- One light theme. Paper `#F7F4EE`, action `#1B6B56`, Newsreader and Atkinson Hyperlegible.
- If the contract does not state it, stop. No `any`, type ignore, TODO, Inter, blue primary, or default shadcn styling.
- Load `web-security` before rendering user text or changing the session. No HTML injection and no Next.js proxy routes.
