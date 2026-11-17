---
name: web-libraries
description: Applies Doctor Tracker constraints for Next.js, React, Tailwind, shadcn/ui, TanStack Query, React Hook Form, Zod, Recharts, Temporal, Vitest, MSW, and Playwright. Use when calling one of these libraries or adding a portal dependency. Query Context7 or the shadcn MCP before guessing a signature.
---

# Portal libraries

Read [reference.md](reference.md) for the project rule on each package.

## Before using a library API

1. Use the helper the repo already owns: `lib/api/http-client.ts`, `lib/auth/access-token.ts`, `lib/query/query-client.ts`, `lib/time/calendar.ts`.
2. For a shadcn component, call the `shadcn` MCP (`get_add_command_for_items` or the registry search) and install into `components/ui`. Then apply `docs/design.md`.
3. For Next.js App Router behavior, call `next-devtools` or Context7. Resolve the library id before a Context7 query. Do not send tokens or cookies in the query.
4. For TanStack Query, React Hook Form, Zod, Recharts, Vitest, MSW, or Playwright signatures, query Context7.

## Defaults

| Need | Use |
| --- | --- |
| Routes | App Router pages under `src/app` |
| Server cache | TanStack Query with the keys in the data rule |
| Forms | React Hook Form plus `@hookform/resolvers/zod` |
| Charts | Recharts from the dashboard query |
| Styles | Tailwind utilities mapped to the CSS variables |
| Calendar | Temporal in `lib/time/calendar.ts` |
| Unit tests | Vitest, Testing Library, MSW |
| Browser flows | Playwright in Phase 12 |

Do not add Redux, Mongoose, a date library, or a second HTTP client.
