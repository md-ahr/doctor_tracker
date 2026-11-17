# Doctor Tracker Web — Frontend task breakdown

> **Contracts:** `docs/lld.md`, `docs/frontend-structure.md`, `docs/design.md`, `docs/hld.md`
> **Prerequisite:** API tasks through at least LLD §9 step 5 (dashboard) before wiring live data on the dashboard. Auth and list screens can start against a running API from step 2.
> **Workflow:** Implement **one task**, run **that task’s unit tests**, then move on. Do not stack unfinished tasks.

**Goal:** Build the Next.js admin portal in small steps. Each step is shippable and testable in isolation.

**Architecture:** App Router pages compose feature UI. Features use hooks → feature `api` → `lib/api`. Server data in TanStack Query only where `docs/frontend-structure.md` §5 lists a key. Access token in memory; refresh cookie via `credentials: "include"`.

**Tech stack:** Next.js (App Router), React, TypeScript (strict), Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Recharts, Vitest, Testing Library, MSW (API mocks). Temporal for calendar — no Luxon, date-fns, or Day.js.

## Global constraints

- Web app lives in its **own repository** (sibling to the API). Paths below use `web/` as the repo root.
- `NEXT_PUBLIC_API_URL` — API origin, no trailing slash.
- **No** `localStorage`, `sessionStorage`, or non-HttpOnly cookies for the access token.
- Features **must not** import sibling features (`features/doctors` ↛ `features/patients`). Exception: **pages** may compose two features (doctor detail only).
- Feature UI **must not** call `fetch` or import `HttpDoctorTrackerApi` / `doctor-tracker-api` directly — use feature `api` + hooks.
- Proxy lives in `src/proxy.ts` with export `proxy`, **not** `middleware.ts` (per frontend-structure §7.1).
- Chart date labels: use `YYYY-MM-DD` strings from the API — **not** `new Date(isoDate)` for bucketing.
- Design: single light theme per `docs/design.md` — paper ground `#F7F4EE`, primary `#1B6B56`, Newsreader + Atkinson Hyperlegible.

## How to use this document

| Step | Action                                                                                  |
| ---- | --------------------------------------------------------------------------------------- |
| 1    | Pick the **lowest-numbered open task** (first `- [ ]`).                                 |
| 2    | Create or change only the files listed for that task.                                   |
| 3    | Prefer **test first** when the task lists concrete cases.                               |
| 4    | Run the **verify command**; all tests for that task must pass.                          |
| 5    | Check the task box, commit using `docs/commit-guidelines.md`, then start the next task. |

### What counts as a unit test here

| Layer                       | Unit test style                                       |
| --------------------------- | ----------------------------------------------------- |
| `lib/*` (no React)          | Vitest, mock `global.fetch` or MSW                    |
| `features/*/model`          | Zod `safeParse` fixtures                              |
| `features/*/api`, `lib/api` | MSW or mocked `apiRequest`                            |
| Hooks                       | `renderHook` + `QueryClientProvider` + MSW            |
| UI components               | React Testing Library; mock hooks or MSW              |
| `proxy.ts`                  | Pure function tests with stub `NextRequest` / cookies |

**E2E tests** (Playwright) are in [Phase 12](#phase-12-e2e-polish-and-readme). LLD §8 expects: login redirect, form errors, delete confirm, dashboard empty series.

### Default verify commands

```bash
cd web
npm test
npm test -- src/lib/auth/access-token.test.ts
npm run test:e2e    # after Phase 12.1
```

---

## Phase 0 — Repository and test runner

Do these four tasks in order. Each one is config and a verify command. No feature code. Tailwind and shadcn start in Phase 1.

### Task 0.1 — Next.js package scaffold

- [x] **Deliverable:** Next.js app typechecks, builds, and Vitest runs one smoke test.

**Files:**

- Create: `web/package.json`, `web/tsconfig.json`, `web/next.config.ts`, `web/vitest.config.ts`, `web/.env.example`, `web/.gitignore`, `web/.nvmrc`
- Create: `web/src/app/layout.tsx` (minimal), `web/src/app/page.tsx` (placeholder redirect or hello)
- Create: `web/src/smoke.test.ts`

**Implement:**

- Next.js App Router, TypeScript `strict`. `"private": true`, `"engines": { "node": ">=22" }`.
- `.nvmrc` contains `22`. CI reads this file. Vitest runs calendar helpers on Node, and Temporal needs Node 22 with no polyfill (LLD §4.1).
- `tsconfig`: `strict: true`, `jsx: "preserve"`, `moduleResolution: "bundler"`, Next.js plugin. This is not the API's NodeNext config. `typecheck` is `tsc --noEmit`. `build` is `next build`.
- Scripts: `dev`, `build`, `start`, `test`, `test:watch`, `typecheck`, `test:e2e` (the e2e script may exit 0 with a message until Phase 12 wires Playwright).
- Dev deps: `typescript`, `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`. `msw` can wait until Phase 1.
- `.gitignore`: `node_modules/`, `.next/`, `out/`, `coverage/`, `.env`, `.env.*` except `.env.example`.
- `.env.example` lists `NEXT_PUBLIC_API_URL` with an empty value. No trailing slash. No secrets.
- Smoke test asserts `true`. The page can be a placeholder. Do not add features, tokens, or the API client here.

**Verify:** `cd web && npm test && npm run typecheck && npm run build`

---

### Task 0.2 — ESLint and Prettier

- [x] **Deliverable:** Lint fails on `console.*`. Format is checked in one command. Prettier does not fight ESLint.

**Files:**

- Create: `web/eslint.config.mjs`, `web/.prettierrc.json`, `web/.prettierignore`
- Modify: `web/package.json` scripts

**Implement:**

- ESLint flat config, not `next lint`. Spread `eslint-config-next/core-web-vitals`, then `eslint-config-next/typescript`. Last: `eslint-config-prettier`, so format rules are not duplicated.
- Rule `no-console` is `"error"` everywhere, including tests. No `console` allow-list.
- Ignore `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `node_modules/**`, `coverage/**`, `.cursor/**`.
- `lint` is `eslint . --max-warnings 0`. Also add `lint:fix`.
- Prettier: semicolons, double quotes, trailing commas, print width 100. Same choices as the API, so snippets match across the two repos.
- `.prettierignore`: `.next`, `out`, `node_modules`, `coverage`, `package-lock.json`, `next-env.d.ts`, `.cursor`.
- Scripts: `format` (`prettier --write .`), `format:check` (`prettier --check .`).
- Dev dependencies: `eslint`, `eslint-config-next`, `prettier`, `eslint-config-prettier`.

**Verify:** `npm run lint && npm run format:check`. A temporary `console.log` in a scratch file must fail lint; remove that file before the task is done.

---

### Task 0.3 — Lefthook

- [x] **Deliverable:** Commits are formatted, linted, and message-checked. Pushes run typecheck and tests.

**Files:**

- Create: `web/lefthook.yml`, `web/commitlint.config.js`
- Modify: `web/package.json` — dev dependencies `lefthook`, `@commitlint/cli`, `@commitlint/config-conventional`, and a `prepare` script `lefthook install`

**Hooks:**

| Hook         | What it runs                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pre-commit` | Prettier write and ESLint `--fix` on staged files, in parallel. Lefthook `stage_fixed: true` so the fixed files are part of the commit.                                                                            |
| `commit-msg` | `commitlint --edit`. Extends `@commitlint/config-conventional`. `subject-max-length` 50. `header-max-length` 72. Turn `subject-case` off so names like `API` are allowed. Rules match `docs/commit-guidelines.md`. |
| `pre-push`   | `npm run typecheck`, then `npm test`. Not parallel.                                                                                                                                                                |

Prettier glob: `*.{js,cjs,mjs,ts,tsx,json,yml,yaml,md,css}`. ESLint glob: `*.{js,cjs,mjs,ts,tsx}`.

`prepare` only succeeds after `web/` is its own git repository. Do not pass `--no-verify`.

**Verify:** `npx lefthook run pre-commit` and `npx commitlint --edit` against a sample message file. A subject longer than 50 characters must fail.

---

### Task 0.4 — CI pipeline

- [x] **Deliverable:** GitHub Actions runs the same checks as the hooks, plus the production build, on every push and pull request.

**Files:**

- Create: `web/.github/workflows/ci.yml`

**Pipeline:**

- Triggers: `push` to `main` and `master`, `pull_request`, and `workflow_dispatch`.
- Concurrency group per ref, cancel in-progress runs.
- Job on `ubuntu-latest`: checkout, `actions/setup-node` with `node-version-file: .nvmrc` and npm cache, then `npm ci`, `format:check`, `lint`, `typecheck`, `test`, `build`.
- The workflow file must sit at the **git root** of the web repository. GitHub does not run `.github` nested inside a subfolder of a larger repo.

This job is CI only. It does not deploy.

**Verify:** `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build` locally. After the first push, the Actions tab is green.

---

### Hold until a later phase

These are useful and **not** part of Phase 0. Add them when the note says.

| Item                                           | When                                                                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tailwind, `components.json`, shadcn primitives | Phase 1. Do not add them in the scaffold.                                                                                                        |
| Vercel or Netlify deploy                       | After Task 0.4, when `next build` is green in CI. The host is Vercel or Netlify (HLD). Do not add a deploy job that has no project to attach to. |
| Playwright in CI                               | Phase 12, when `test:e2e` runs real browser tests. Install the browser in that workflow, not in Task 0.4.                                        |
| Coverage threshold                             | After Phase 2, once there is more than the smoke test. Report in CI; do not fail the build on a number picked too early.                         |
| Dependabot or Renovate                         | After the lockfile exists and the repo is on GitHub. Group minor npm updates weekly.                                                             |
| EditorConfig                                   | Optional. Prettier already owns formatting. Add `.editorconfig` only if editors disagree before Prettier runs.                                   |
| Secret scan (gitleaks) on `pre-commit`         | Optional. `.gitignore` already blocks `.env`. A scanner catches a secret pasted into a source file.                                              |
| `npm audit` in CI                              | Optional and noisy on transitive issues. Run on a schedule, not as a required check on every pull request.                                       |

---

## Phase 1 — Design tokens and global styles

### Task 1.1 — CSS variables and base layout

- [x] **Deliverable:** Global tokens from `docs/design.md` §4–§5 applied on `body` and content column.

**Files:**

- Create: `web/src/app/globals.css` (primitives + semantic tokens)
- Modify: `web/src/app/layout.tsx` — import globals, set `lang="en"`

**Unit test:** `web/src/app/globals.test.ts` (optional) or visual check — assert token file exports expected `--color-ground` / paper value

**Verify:** `npm run build`; manual: page background is warm paper, not pure white

---

### Task 1.2 — Typography (font loading)

- [x] **Deliverable:** Newsreader + Atkinson Hyperlegible via `next/font` (or equivalent), `--font-display` / `--font-ui`.

**Files:**

- Create: `web/src/lib/fonts.ts` (or inline in layout)
- Modify: `web/src/app/layout.tsx`

**Unit test:** None required; smoke build

**Verify:** `npm run build`

---

### Task 1.3 — shadcn/ui init and Button

- [x] **Deliverable:** Tailwind + shadcn configured; `Button` matches 40px height and verdigris primary per design §2.

**Files:**

- Create: `web/components.json`, `web/src/lib/utils.ts` (`cn`)
- Create: `web/src/components/ui/button.tsx`

**Unit test:** `web/src/components/ui/button.test.tsx`

- Renders children; primary variant has accessible name

**Verify:** `npm test -- src/components/ui/button.test.tsx`

---

### Task 1.4 — Form primitives (Input, Label)

- [x] **Deliverable:** Input 40px height; Label sentence case.

**Files:**

- Create: `web/src/components/ui/input.tsx`, `web/src/components/ui/label.tsx`

**Unit test:** `web/src/components/ui/input.test.tsx` — associates with label via `htmlFor`

**Verify:** `npm test -- src/components/ui/input.test.tsx`

---

### Task 1.5 — Dialog and Table shells

- [x] **Deliverable:** Dialog 4px radius; Table for dense lists.

**Files:**

- Create: `web/src/components/ui/dialog.tsx`, `web/src/components/ui/table.tsx`

**Unit test:** `web/src/components/ui/dialog.test.tsx` — opens from trigger (RTL)

**Verify:** `npm test -- src/components/ui/dialog.test.tsx`

---

### Task 1.6 — Select and Dropdown (filters)

- [x] **Deliverable:** Select 36px compact for filter bar per design.

**Files:**

- Create: `web/src/components/ui/select.tsx`, `web/src/components/ui/dropdown-menu.tsx` (if needed for row actions)

**Unit test:** Smoke render test for Select

**Verify:** `npm test` (full suite so far)

---

## Phase 2 — Shared `lib` (no feature UI)

### Task 2.1 — Access token module

- [x] **Deliverable:** `getAccessToken`, `setAccessToken`, `clearAccessToken` — module scope only.

**Files:**

- Create: `web/src/lib/auth/access-token.ts`

**Unit test:** `web/src/lib/auth/access-token.test.ts`

- Set/get/clear cycle; never touches `localStorage`

**Verify:** `npm test -- src/lib/auth/access-token.test.ts`

---

### Task 2.2 — API envelope types

- [x] **Deliverable:** `ApiSuccess`, `ApiErrorBody`, `PageMeta`, `ApiError` class.

**Files:**

- Create: `web/src/lib/api/types.ts`

**Unit test:** `web/src/lib/api/types.test.ts`

- `ApiError` exposes `code`, `details`, `status`

**Verify:** `npm test -- src/lib/api/types.test.ts`

---

### Task 2.3 — HTTP client: success and error parsing

- [x] **Deliverable:** `apiRequest` — JSON envelope, throws `ApiError` on failure.

**Files:**

- Create: `web/src/lib/api/http-client.ts` (without refresh retry first)

**Unit test:** `web/src/lib/api/http-client.test.ts` (mock `fetch`)

- Success body returns typed `data`
- `success: false` → `ApiError` with `details`

**Verify:** `npm test -- src/lib/api/http-client.test.ts`

---

### Task 2.4 — HTTP client: 401 refresh retry

- [x] **Deliverable:** Single refresh attempt, sets token, retries once; failed refresh clears token and assigns `/login` (guard `window` in test).

**Files:**

- Modify: `web/src/lib/api/http-client.ts`

**Unit test:** `web/src/lib/api/http-client.refresh.test.ts`

- First 401 → calls refresh → retries with new `Authorization`
- Refresh fails → does not loop
- `/auth/refresh` path does not recurse

**Verify:** `npm test -- src/lib/api/http-client.refresh.test.ts`

---

### Task 2.5 — Query client factory

- [x] **Deliverable:** `createQueryClient` — `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false`.

**Files:**

- Create: `web/src/lib/query/query-client.ts`

**Unit test:** `web/src/lib/query/query-client.test.ts`

- Default query options match frontend-structure §7.6

**Verify:** `npm test -- src/lib/query/query-client.test.ts`

---

### Task 2.6 — Calendar helpers

- [x] **Deliverable:** `parsePlainDate`, `isDateOrderValid`, `formatChartDate`, default dashboard range (last 30 days via Temporal).

**Files:**

- Create: `web/src/lib/time/calendar.ts`

**Unit test:** `web/src/lib/time/calendar.test.ts`

- `isDateOrderValid` false when from after to
- Default range returns inclusive `YYYY-MM-DD` strings
- No `new Date("YYYY-MM-DD")` for chart keys in helpers

**Verify:** `npm test -- src/lib/time/calendar.test.ts`

---

### Task 2.7 — App providers

- [x] **Deliverable:** Client `Providers` with `QueryClientProvider`.

**Files:**

- Create: `web/src/app/providers.tsx`
- Modify: `web/src/app/layout.tsx` — wrap children with `Providers`

**Unit test:** `web/src/app/providers.test.tsx`

- Child can use `useQueryClient` without throw

**Verify:** `npm test -- src/app/providers.test.tsx`

---

## Phase 3 — Route protection (proxy)

### Task 3.1 — Proxy cookie gate

- [x] **Deliverable:** `proxy` + `config.matcher` per frontend-structure §7.1.

**Files:**

- Create: `web/src/proxy.ts`

**Unit test:** `web/src/proxy.test.ts`

- No `dt_refresh` + portal path → redirect `/login`
- Has cookie + `/login` → redirect `/dashboard`
- Public `/login` allowed without cookie

**Verify:** `npm test -- src/proxy.test.ts`

---

## Phase 4 — API client surface (`doctor-tracker-api`)

Implement methods in `web/src/lib/api/doctor-tracker-api.ts`. Each task adds methods + unit tests with MSW.

### Task 4.1 — Auth client methods

- [ ] **Deliverable:** `login`, `logout`, `refresh` (if exposed), `me` — `login` calls `setAccessToken`.

**Files:**

- Create: `web/src/lib/api/doctor-tracker-api.ts` (auth section)

**Unit test:** `web/src/lib/api/doctor-tracker-api.auth.test.ts` (MSW)

- Login stores token from response body
- Logout POST includes credentials

**Verify:** `npm test -- src/lib/api/doctor-tracker-api.auth.test.ts`

---

### Task 4.2 — Doctor client methods

- [ ] **Deliverable:** `listDoctors`, `createDoctor`, `doctorFacets`, `getDoctor`, `updateDoctor`, `listDoctorPatients`, `createPatientUnderDoctor`.

**Files:**

- Modify: `web/src/lib/api/doctor-tracker-api.ts`

**Unit test:** `web/src/lib/api/doctor-tracker-api.doctors.test.ts`

- List parses `meta` at top level
- Query string omits empty optional filters

**Verify:** `npm test -- src/lib/api/doctor-tracker-api.doctors.test.ts`

---

### Task 4.3 — Patient client methods

- [ ] **Deliverable:** `listPatients`, `updatePatient`, `deletePatient` (no `getPatient` for edit dialog).

**Files:**

- Modify: `web/src/lib/api/doctor-tracker-api.ts`

**Unit test:** `web/src/lib/api/doctor-tracker-api.patients.test.ts`

- Delete expects `200` and `data: null`

**Verify:** `npm test -- src/lib/api/doctor-tracker-api.patients.test.ts`

---

### Task 4.4 — Dashboard client method

- [ ] **Deliverable:** `getDashboard({ from?, to? })`.

**Files:**

- Modify: `web/src/lib/api/doctor-tracker-api.ts`
- Create: `web/src/lib/api/dashboard-types.ts` (or colocate types)

**Unit test:** `web/src/lib/api/doctor-tracker-api.dashboard.test.ts`

- Passes `from` / `to` query params when set

**Verify:** `npm test -- src/lib/api/doctor-tracker-api.dashboard.test.ts`

---

## Phase 5 — Auth feature and login

### Task 5.1 — Login form schema

- [ ] **Deliverable:** Zod schema mirroring API limits.

**Files:**

- Create: `web/src/features/auth/model/login-schema.ts`

**Unit test:** `web/src/features/auth/model/login-schema.test.ts`

**Verify:** `npm test -- src/features/auth/model/login-schema.test.ts`

---

### Task 5.2 — Auth feature API wrapper

- [ ] **Deliverable:** `authApi.login`, `logout`, `me`.

**Files:**

- Create: `web/src/features/auth/api/auth-api.ts`

**Unit test:** Thin re-export smoke or mock `doctor-tracker-api` once

**Verify:** `npm test` (auth lib tests still green)

---

### Task 5.3 — `useSession` hook

- [ ] **Deliverable:** Query key `["auth", "me"]`; enabled only when token or post-refresh bootstrap applies.

**Files:**

- Create: `web/src/features/auth/hooks/use-session.ts`

**Unit test:** `web/src/features/auth/hooks/use-session.test.tsx` (MSW)

- Returns admin name/email on success

**Verify:** `npm test -- src/features/auth/hooks/use-session.test.tsx`

---

### Task 5.4 — Login form UI

- [ ] **Deliverable:** RHF + Zod; maps `ApiError` to root or field errors; navigates to `/dashboard` on success.

**Files:**

- Create: `web/src/features/auth/ui/login-form.tsx`
- Create: `web/src/app/(public)/login/page.tsx`

**Unit test:** `web/src/features/auth/ui/login-form.test.tsx`

- Shows API error message on failed login
- Does not call `useQuery` for login

**Verify:** `npm test -- src/features/auth/ui/login-form.test.tsx`

---

### Task 5.5 — Portal nav and logout

- [ ] **Deliverable:** Links Dashboard / Doctors / Patients; admin name from `useSession`; logout clears token and routes to login.

**Files:**

- Create: `web/src/features/auth/ui/portal-nav.tsx`

**Unit test:** `web/src/features/auth/ui/portal-nav.test.tsx`

- Logout calls API and does not leave stale token in memory (mock)

**Verify:** `npm test -- src/features/auth/ui/portal-nav.test.tsx`

---

### Task 5.6 — Portal session bootstrap

- [ ] **Deliverable:** On portal entry, if token missing but cookie present, trigger refresh once before data queries (layout or small client wrapper).

**Files:**

- Create: `web/src/features/auth/ui/portal-session-gate.tsx` (or hook `useBootstrapSession`)
- Modify: `web/src/app/(portal)/layout.tsx` when created in Phase 6

**Unit test:** `web/src/features/auth/hooks/use-bootstrap-session.test.tsx`

- Skips refresh when token already set
- Failed refresh sends user to login

**Verify:** `npm test -- src/features/auth/hooks/use-bootstrap-session.test.tsx`

---

## Phase 6 — Portal shell

### Task 6.1 — Portal layout

- [ ] **Deliverable:** `PortalNav` + `<main>` content column per design measure.

**Files:**

- Create: `web/src/app/(portal)/layout.tsx` — compose `PortalSessionGate`, `PortalNav`

**Unit test:** RTL smoke — nav links present

**Verify:** `npm run build`

---

### Task 6.2 — Placeholder portal routes

- [ ] **Deliverable:** Empty pages for dashboard, doctors, patients (text stub) inside portal layout.

**Files:**

- Create: `web/src/app/(portal)/dashboard/page.tsx`
- Create: `web/src/app/(portal)/doctors/page.tsx`
- Create: `web/src/app/(portal)/patients/page.tsx`

**Unit test:** None

**Verify:** Manual navigation with proxy + cookie

---

## Phase 7 — Doctors feature

### Task 7.1 — Doctor types and form schema

- [ ] **Deliverable:** `Doctor`, `DoctorFormValues`, `doctorFormSchema`.

**Files:**

- Create: `web/src/features/doctors/model/doctor.ts`, `web/src/features/doctors/model/doctor-schema.ts`

**Unit test:** `web/src/features/doctors/model/doctor-schema.test.ts`

**Verify:** `npm test -- src/features/doctors/model/doctor-schema.test.ts`

---

### Task 7.2 — Doctor feature API

- [ ] **Deliverable:** `doctorApi.list`, `create`, `facets`, `get`, `update`.

**Files:**

- Create: `web/src/features/doctors/api/doctor-api.ts`

**Verify:** Re-run doctor client tests

---

### Task 7.3 — Doctor list and facets hooks

- [ ] **Deliverable:** `useDoctorList`, `useDoctorFacets` — keys `["doctors", query]`, `["doctors", "facets"]`.

**Files:**

- Create: `web/src/features/doctors/hooks/use-doctor-list.ts`, `use-doctor-facets.ts`

**Unit test:** `web/src/features/doctors/hooks/use-doctor-list.test.tsx`

**Verify:** `npm test -- src/features/doctors/hooks/use-doctor-list.test.tsx`

---

### Task 7.4 — Doctor mutations hook

- [ ] **Deliverable:** `useCreateDoctor`, `useUpdateDoctor` — invalidate `["doctors"]` on success.

**Files:**

- Create: `web/src/features/doctors/hooks/use-doctor-mutations.ts`

**Unit test:** `web/src/features/doctors/hooks/use-doctor-mutations.test.tsx`

- Invalidates doctor queries after create

**Verify:** `npm test -- src/features/doctors/hooks/use-doctor-mutations.test.tsx`

---

### Task 7.5 — Doctor table and filters

- [ ] **Deliverable:** Pagination controls; debounced search (~300ms); specialization/hospital selects from facets; date range for `createdFrom`/`createdTo`.

**Files:**

- Create: `web/src/features/doctors/ui/doctor-filters.tsx`, `web/src/features/doctors/ui/doctor-table.tsx`

**Unit test:** `web/src/features/doctors/ui/doctor-filters.test.tsx`

- Debounce does not fire immediate fetch (mock list hook)

**Verify:** `npm test -- src/features/doctors/ui/doctor-filters.test.tsx`

---

### Task 7.6 — Doctor form dialog

- [ ] **Deliverable:** Create doctor dialog; maps `ApiError.details` to fields.

**Files:**

- Create: `web/src/features/doctors/ui/doctor-form.tsx` (or `doctor-form-dialog.tsx`)

**Unit test:** `web/src/features/doctors/ui/doctor-form.test.tsx`

**Verify:** `npm test -- src/features/doctors/ui/doctor-form.test.tsx`

---

### Task 7.7 — Doctor screen and doctors page

- [ ] **Deliverable:** `DoctorScreen` composes header, filters, table, add dialog.

**Files:**

- Create: `web/src/features/doctors/ui/doctor-screen.tsx`
- Modify: `web/src/app/(portal)/doctors/page.tsx`

**Unit test:** Loading / empty / error states per design §8 (at least empty copy)

**Verify:** `npm test -- src/features/doctors/ui/doctor-screen.test.tsx`

---

### Task 7.8 — Doctor summary (detail header)

- [ ] **Deliverable:** `useDoctor(doctorId)` — key `["doctors", id]`; shows `activePatientCount`.

**Files:**

- Create: `web/src/features/doctors/hooks/use-doctor.ts`, `web/src/features/doctors/ui/doctor-summary.tsx`

**Unit test:** `web/src/features/doctors/hooks/use-doctor.test.tsx`

**Verify:** `npm test -- src/features/doctors/hooks/use-doctor.test.tsx`

---

### Task 7.9 — Doctor detail page shell

- [ ] **Deliverable:** Route `/doctors/[doctorId]` composes `DoctorSummary` + patient slot (stub until Phase 9).

**Files:**

- Create: `web/src/app/(portal)/doctors/[doctorId]/page.tsx`

**Verify:** `npm run build`

---

## Phase 8 — Patients feature

### Task 8.1 — Patient types and schemas

- [ ] **Deliverable:** Patient resource type; form schema; filter schema (condition, doctor, dates).

**Files:**

- Create: `web/src/features/patients/model/patient.ts`, `patient-schema.ts`, `patient-filter-schema.ts`

**Unit test:** `web/src/features/patients/model/patient-schema.test.ts`

**Verify:** `npm test -- src/features/patients/model/patient-schema.test.ts`

---

### Task 8.2 — Patient feature API

- [ ] **Deliverable:** `patientApi.list`, `update`, `delete`, `createUnderDoctor`.

**Files:**

- Create: `web/src/features/patients/api/patient-api.ts`

**Verify:** Patient client MSW tests green

---

### Task 8.3 — Patient list hook

- [ ] **Deliverable:** `usePatientList(query)` — key `["patients", query]` including optional `doctorId`.

**Files:**

- Create: `web/src/features/patients/hooks/use-patient-list.ts`

**Unit test:** Same key shape when `doctorId` passed from doctor page

**Verify:** `npm test -- src/features/patients/hooks/use-patient-list.test.tsx`

---

### Task 8.4 — Patient mutations hook

- [ ] **Deliverable:** Create/update/delete — invalidate `["patients"]`, `["doctors", doctorId]`, `["dashboard"]` per §5.

**Files:**

- Create: `web/src/features/patients/hooks/use-patient-mutations.ts`

**Unit test:** Assert three invalidations on delete

**Verify:** `npm test -- src/features/patients/hooks/use-patient-mutations.test.tsx`

---

### Task 8.5 — Patient table and filters

- [ ] **Deliverable:** Condition badge with text; doctor filter on global page only; debounced `q`.

**Files:**

- Create: `web/src/features/patients/ui/patient-table.tsx`, `patient-filters.tsx`

**Unit test:** Condition mark includes visible label (a11y)

**Verify:** `npm test -- src/features/patients/ui/patient-table.test.tsx`

---

### Task 8.6 — Patient edit dialog

- [ ] **Deliverable:** Opens from row; seeds form from row data — **no** `GET /patients/:id`.

**Files:**

- Create: `web/src/features/patients/ui/patient-form.tsx`

**Unit test:** Ensure hook list not refetched for single patient GET (MSW: 0 GET by id calls)

**Verify:** `npm test -- src/features/patients/ui/patient-form.test.tsx`

---

### Task 8.7 — Delete patient confirm

- [ ] **Deliverable:** Confirm dialog **names the patient**; calls delete mutation.

**Files:**

- Create: `web/src/features/patients/ui/delete-patient-button.tsx`

**Unit test:** `web/src/features/patients/ui/delete-patient-button.test.tsx` (LLD §8)

- Confirm shows patient name before destructive action

**Verify:** `npm test -- src/features/patients/ui/delete-patient-button.test.tsx`

---

### Task 8.8 — Patient screen and patients page

- [ ] **Deliverable:** `PatientScreen` with optional `doctorId` prop for scoped list.

**Files:**

- Create: `web/src/features/patients/ui/patient-screen.tsx`
- Modify: `web/src/app/(portal)/patients/page.tsx`

**Verify:** `npm test -- src/features/patients/ui/patient-screen.test.tsx`

---

### Task 8.9 — Doctor detail: patient list + add patient

- [ ] **Deliverable:** Wire `PatientScreen doctorId={id}`; add patient dialog posts to `POST /doctors/:id/patients`.

**Files:**

- Modify: `web/src/app/(portal)/doctors/[doctorId]/page.tsx`
- Create: `web/src/features/patients/ui/patient-create-dialog.tsx` (or extend patient form)

**Unit test:** Create under doctor invalidates correct keys

**Verify:** `npm test` + manual doctor detail flow

---

## Phase 9 — Dashboard feature

### Task 9.1 — Dashboard model types

- [ ] **Deliverable:** Types matching LLD dashboard `data` shape (totals, series arrays).

**Files:**

- Create: `web/src/features/dashboard/model/dashboard.ts`

**Verify:** Typecheck only

---

### Task 9.2 — Dashboard API wrapper and hook

- [ ] **Deliverable:** `useDashboard(from, to)` — key `["dashboard", from, to]`, `staleTime: 60_000`.

**Files:**

- Create: `web/src/features/dashboard/api/dashboard-api.ts`
- Create: `web/src/features/dashboard/hooks/use-dashboard.ts`

**Unit test:** Hook uses 60s stale time (inspect query options)

**Verify:** `npm test -- src/features/dashboard/hooks/use-dashboard.test.tsx`

---

### Task 9.3 — Stat tiles

- [ ] **Deliverable:** Four figures — Newsreader 40px, tabular nums.

**Files:**

- Create: `web/src/features/dashboard/ui/stat-tiles.tsx`

**Unit test:** Renders totals from fixture props

**Verify:** `npm test -- src/features/dashboard/ui/stat-tiles.test.tsx`

---

### Task 9.4 — Bar charts (doctors + condition)

- [ ] **Deliverable:** Recharts horizontal bar + condition bar; colors from design §4.3.

**Files:**

- Create: `web/src/features/dashboard/ui/patients-per-doctor-chart.tsx`, `patients-by-condition-chart.tsx`

**Unit test:** Smoke render with sample data

**Verify:** `npm test` (dashboard chart tests)

---

### Task 9.5 — Line charts and empty copy

- [ ] **Deliverable:** Shared date axis; string `date` category; all-zero → `"Nothing registered in this range"`.

**Files:**

- Create: `web/src/features/dashboard/ui/registration-chart.tsx`, `doctors-created-chart.tsx`

**Unit test:** `web/src/features/dashboard/ui/registration-chart.test.tsx` (LLD §8)

- All counts zero shows empty copy, not blank chart

**Verify:** `npm test -- src/features/dashboard/ui/registration-chart.test.tsx`

---

### Task 9.6 — Date range control

- [ ] **Deliverable:** Local state for `from`/`to`; `isDateOrderValid` before updating query key; default last 30 days.

**Files:**

- Create: `web/src/features/dashboard/ui/dashboard-range-control.tsx`

**Unit test:** Invalid order does not change hook inputs

**Verify:** `npm test -- src/features/dashboard/ui/dashboard-range-control.test.tsx`

---

### Task 9.7 — Dashboard screen and page

- [ ] **Deliverable:** Single `useDashboard`; charts receive slices as props — charts do not call `useQuery`.

**Files:**

- Create: `web/src/features/dashboard/ui/dashboard-screen.tsx`
- Modify: `web/src/app/(portal)/dashboard/page.tsx`

**Verify:** `npm run build`; reference `docs/ui-example/medic-dashboard-reference.png` for layout density (manual)

---

## Phase 10 — Responsive and states

### Task 10.1 — Loading and error patterns

- [ ] **Deliverable:** Shared empty/loading/error for tables and dashboard per design §8.

**Files:**

- Create: `web/src/components/ui/data-state.tsx` (or per-feature consistent copy)

**Unit test:** Table shows explicit empty message, not skeleton forever

**Verify:** RTL tests on doctor + patient screens

---

### Task 10.2 — Responsive portal layout

- [ ] **Deliverable:** Nav and content column usable on mobile widths per design.

**Files:**

- Modify: portal layout + nav styles in `globals.css`

**Verify:** Manual resize or Playwright viewport in Phase 12

---

## Phase 11 — MSW test harness

### Task 11.1 — Shared MSW handlers

- [ ] **Deliverable:** Default handlers for auth, list envelopes, dashboard fixture; used in Vitest setup.

**Files:**

- Create: `web/src/test/msw/server.ts`, `web/src/test/msw/handlers.ts`
- Modify: `web/vitest.config.ts` — setup file

**Verify:** `npm test` (full unit suite)

---

## Phase 12 — E2E, polish, and README

### Task 12.1 — Playwright setup

- [ ] **Deliverable:** `playwright.config.ts`, auth fixture or login helper against real API or mocked.

**Files:**

- Create: `web/playwright.config.ts`, `web/e2e/login.spec.ts`

**Verify:** `npm run test:e2e` — login redirect (LLD §8)

---

### Task 12.2 — E2E: form errors and delete confirm

- [ ] **Deliverable:** Invalid login message; delete dialog shows patient name.

**Files:**

- Create: `web/e2e/patients-delete.spec.ts`

**Verify:** `npm run test:e2e`

---

### Task 12.3 — E2E: dashboard empty series

- [ ] **Deliverable:** Range with zero registrations shows empty copy.

**Files:**

- Create: `web/e2e/dashboard-empty.spec.ts`

**Verify:** `npm run test:e2e`

---

### Task 12.4 — Web README and technical decisions

- [ ] **Deliverable:** Setup (`NEXT_PUBLIC_API_URL`), scripts, link to API; **two decisions** from LLD §9 (TanStack Query vs Redux; dashboard read-time aggregation — client perspective).

**Files:**

- Create: `web/README.md`

**Verify:** Manual review

---

### Task 12.5 — Manual screenshot pass

- [ ] **Deliverable:** Desktop + mobile screenshots of Dashboard, Doctors, Patients (LLD §8).

**Files:**

- Store under `web/docs/screenshots/` or submission folder per project brief

**Verify:** Checklist in README

---

## Task count summary

| Phase     |  Tasks | Focus                      |
| --------- | -----: | -------------------------- |
| 0         |      4 | Scaffold, lint, hooks, CI  |
| 1         |      6 | Design tokens + shadcn     |
| 2         |      7 | `lib` + providers          |
| 3         |      1 | Proxy                      |
| 4         |      4 | API client                 |
| 5         |      6 | Auth                       |
| 6         |      2 | Portal shell               |
| 7         |      9 | Doctors                    |
| 8         |      9 | Patients                   |
| 9         |      7 | Dashboard                  |
| 10        |      2 | UX states + responsive     |
| 11        |      1 | MSW harness                |
| 12        |      5 | E2E + README + screenshots |
| **Total** | **63** |                            |

## Mapping to LLD §9 implementation order

| LLD order                     | This document     | Backend doc                         |
| ----------------------------- | ----------------- | ----------------------------------- |
| 1–5. API features             | —                 | `docs/backend-tasks.md` Phases 0–11 |
| 6. Web shell                  | Phases 0–3, 5–6   | API auth + refresh running          |
| 7. Doctor and patient screens | Phases 7–8        | API doctors + patients              |
| 8. Dashboard charts           | Phase 9           | API dashboard                       |
| 9. Explain + README           | Backend 12.3–12.4 | API only                            |
| Web verification              | Phase 12          | LLD §8 web tests                    |

## Cross-document index

| Document                     | Purpose                           |
| ---------------------------- | --------------------------------- |
| `docs/backend-tasks.md`      | API sequential tasks              |
| `docs/frontend-tasks.md`     | This file                         |
| `docs/design.md`             | Visual tokens and screen behavior |
| `docs/frontend-structure.md` | Layer rules and query keys        |

---

**Next step:** Start with **Task 0.1** in `web/`. Complete **Task 2.4** (refresh retry) before relying on portal pages after a hard refresh. Wire live dashboard only after the API **Task 10.2** (`getDashboard`) passes unit tests.
