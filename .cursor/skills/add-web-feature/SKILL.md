---
name: add-web-feature
description: Adds a Doctor Tracker portal feature as model, Zod schema, API wrapper, TanStack Query hooks, and UI. Use when adding doctors, patients, dashboard, auth screens, query keys, mutations, or a new portal route.
---

# Add a feature slice

Copy the doctor feature shape.

```text
features/<name>/
  model/<name>.ts
  model/<name>-schema.ts
  api/<name>-api.ts
  hooks/use-<name>-list.ts
  hooks/use-<name>-mutations.ts
  ui/<name>-screen.tsx
```

## Order

1. Types match the API resource in `docs/lld.md`. Dates that are calendar days stay strings.
2. Zod schema for the form and the filter query. The same limits as the API (names 1–120, limit 1–50).
3. API functions call `DoctorTrackerApi` methods and return `data`. They do not choose query keys.
4. Hooks own keys from frontend-structure section 5, stale time, and invalidation.
5. UI renders hooks and local dialog state. Forms use React Hook Form and the Zod resolver.
6. The App Router page imports the screen and nothing else from the data layer.

## Mutations

| Write | Invalidate |
| --- | --- |
| doctor create or update | `["doctors"]` |
| patient create, update, or delete | `["patients"]`, `["doctors", doctorId]`, `["dashboard"]` |

Doctor detail is the only page that imports two features. The patient table there uses the patient list key with `doctorId` set.

## Auth slice

Login and logout are mutations, not queries. `useSession` reads `["auth", "me"]`. The HTTP client owns refresh. The proxy only looks for the cookie.
