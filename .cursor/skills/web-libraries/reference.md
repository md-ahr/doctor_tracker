# Library rules for the portal

Query Context7 for current signatures. Use the shadcn MCP for registry components. The rows below are how this codebase uses the library.

| Package | Project rule |
| --- | --- |
| `next` | App Router. `src/proxy.ts` exports `proxy`. No `middleware.ts`. `"use client"` only for state, queries, and forms |
| `react` | Function components. Memoize only when a measurement shows a need |
| `tailwindcss` | Utilities over the CSS variables from `docs/design.md`. Page ground is paper, not white |
| shadcn/ui | Copy primitives into `components/ui`. Restyle height, radius, and color. No domain words in those files |
| `@tanstack/react-query` | One `QueryClient` in `app/providers.tsx`. Stale time 30s, dashboard 60s. Keys listed in the data rule |
| `react-hook-form` | Field state stays in the form. Dialogs edit the row already on screen |
| `@hookform/resolvers` | Zod resolver for login, doctor, and patient forms |
| `zod` | Form and filter schemas in `features/*/model`. Mirror API limits |
| `recharts` | Dashboard only. One query feeds every chart. Empty series is a sentence, not an empty plot |
| Temporal | `lib/time/calendar.ts` matches the API day-bound rules. Chart buckets stay `YYYY-MM-DD` strings |
| `vitest` | `jsdom` for components. Node-style tests for `lib` |
| `@testing-library/react` | Query by role and name. `userEvent` for typing and dialogs |
| `msw` | Handlers in `src/test/msw/`. Used by client, hook, and component tests |
| `@playwright/test` | Phase 12. Login redirect, form errors, delete confirm, empty dashboard |

## Environment

`NEXT_PUBLIC_API_URL` is required. No trailing slash. Put it in `.env.example` with an empty or local value. Do not put `MONGODB_URI` or `JWT_ACCESS_SECRET` in the web app.

## MCP tools

| Server | Use |
| --- | --- |
| `shadcn` | Search the registry and get the add command for button, input, dialog, table, select, dropdown |
| `context7` | Current Next.js, TanStack Query, React Hook Form, Recharts, Zod, Vitest, and Playwright APIs |
| `next-devtools` | Route tree, build failures, and App Router behavior while the app is running |

## Context7 queries that pay off

- Next.js `proxy` file convention versus middleware
- TanStack Query `invalidateQueries` partial keys
- React Hook Form `zodResolver` error shape
- Recharts hiding a series when every value is 0
- MSW `http.get` handlers for an envelope `{ success, message, data, meta }`
