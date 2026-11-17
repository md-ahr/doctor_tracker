---
name: web-tests
description: Writes Doctor Tracker portal tests with Vitest, Testing Library, MSW, and Playwright. Use when adding a unit test, hook test, component test, proxy test, or an end-to-end spec.
---

# Portal tests

## Pick the style

| Target | Setup |
| --- | --- |
| Access token and calendar | Vitest, no DOM |
| HTTP client | MSW. Assert bearer header, cookie credentials, and a single refresh retry |
| Hook | `renderHook`, a fresh `QueryClient`, MSW |
| Form or table | Testing Library. Drive the control with `userEvent` |
| Proxy | Call `proxy` with a request whose cookie jar has or lacks `dt_refresh` |
| Phase 12 flow | Playwright: login redirect, invalid form, delete confirm, empty chart copy |

Wrap hook and component tests in the same `QueryClientProvider` the app uses. Default stale time in tests can be 0 so assertions do not wait.

## Cases the contract names

- Anonymous portal URLs redirect to `/login`. A cookie on `/login` redirects to `/dashboard`.
- Login stores the access token in the module variable.
- A data `401` refreshes once and retries once. A failed refresh clears the token.
- Doctor and patient forms surface Zod and API field errors.
- Delete asks for confirmation that includes the patient name.
- Dashboard renders "Nothing registered in this range" when every point is 0.
- Chart labels stay the `YYYY-MM-DD` strings from the payload.

## Commands

```bash
npm test -- src/features/doctors/hooks/use-doctor-list.test.tsx
npm test
npm run test:e2e
```

Run the single file while iterating. Run the full unit suite before the commit. `test:e2e` is Phase 12.
