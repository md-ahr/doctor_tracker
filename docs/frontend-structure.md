# Doctor Tracker — Frontend structure guide

Contract: `docs/lld.md`
Decisions: `docs/hld.md`
API shape: `docs/backend-structure.md`

This guide says where each kind of web code goes, then shows the shape of every layer in section 12. The browser is a client of the REST API. It does not talk to MongoDB.

Pages compose features. Features do not import each other. Shared controls live in `components/ui` and know nothing about doctors or patients.

## 1. Shape

```text
Page (App Router)
  → feature UI          table, filters, form, dialog
  → feature hook        TanStack Query key, cache, invalidation
  → feature api         one function per endpoint
  → HTTP client         bearer token, cookie, one refresh retry
  → API
```

The access token lives in a module variable. It is never written to `localStorage`, `sessionStorage`, or a JavaScript-readable cookie. The refresh cookie is `HttpOnly` and is sent with `credentials: "include"`.

## 2. Folder layout

```text
src/
  app/
    layout.tsx                   root shell, mounts providers
    providers.tsx                QueryClientProvider (client)
    (public)/login/page.tsx
    (portal)/layout.tsx          nav, admin name, logout
    (portal)/dashboard/page.tsx
    (portal)/doctors/page.tsx
    (portal)/doctors/[doctorId]/page.tsx
    (portal)/patients/page.tsx
  features/auth/
  features/doctors/
  features/patients/
  features/dashboard/
  components/ui/                 shadcn/ui primitives only
  lib/api/http-client.ts
  lib/api/doctor-tracker-api.ts
  lib/api/types.ts               success, list, and error envelopes
  lib/auth/access-token.ts
  lib/time/calendar.ts           Temporal helpers, same rules as the API
  lib/query/query-client.ts
  proxy.ts                       cookie presence only. Next.js proxy, not middleware.ts
```

Each feature has the same inner layout:

```text
features/doctors/
  model/doctor.ts                types
  model/doctor-schema.ts         Zod for forms and filters
  api/doctor-api.ts              functions over the API client
  hooks/use-doctor-list.ts
  hooks/use-doctor-mutations.ts
  ui/doctor-screen.tsx           composes the feature UI
  ui/doctor-table.tsx
  ui/doctor-filters.tsx
  ui/doctor-form.tsx
```

Patients add `ui/delete-patient-button.tsx`. Dashboard adds chart components instead of a table. Auth adds `ui/login-form.tsx` and `hooks/use-session.ts`.

## 3. What each layer owns

| Layer                 | Owns                                                  | Does not own                                  |
| --------------------- | ----------------------------------------------------- | --------------------------------------------- |
| `proxy.ts`            | Redirect when the first-party session hint is missing | Token validity. The API remains the authority |
| `app` pages           | Route URL and which feature screen to render          | `fetch`, query keys, form state               |
| `app/providers.tsx`   | The shared `QueryClient`                              | Feature components                            |
| `(portal)/layout.tsx` | Navigation, admin name, logout                        | Doctor and patient tables                     |
| `features/*/model`    | Resource types and Zod schemas for the UI             | HTTP                                          |
| `features/*/api`      | Calling one client method and returning `data`        | Cache keys                                    |
| `features/*/hooks`    | Query keys, stale time, invalidation                  | Envelope parsing                              |
| `features/*/ui`       | Rendering and local form state                        | A sibling feature                             |
| `components/ui`       | Button, input, dialog, select, table, dropdown        | Domain words such as "doctor"                 |
| `lib/api`             | Envelope, bearer header, one refresh retry            | Screen layout                                 |
| `lib/auth`            | In-memory access token and portal session hint        | `localStorage`, `sessionStorage`, credentials |
| `lib/time`            | `YYYY-MM-DD` checks and range labels                  | `new Date("2026-11-16")` for chart buckets    |
| `lib/query`           | `QueryClient` defaults                                | A feature's query key                         |

## 4. Dependency direction

| File                                       | May import                              | Must not import                           |
| ------------------------------------------ | --------------------------------------- | ----------------------------------------- |
| `features/doctors`                         | `lib/api`, `lib/query`, `components/ui` | `features/patients`, `features/dashboard` |
| `features/patients`                        | `lib/api`, `lib/query`, `components/ui` | `features/doctors`                        |
| `features/dashboard`                       | `lib/api`, `lib/time`, `components/ui`  | Other features                            |
| `features/auth`                            | `lib/api`, `lib/auth`                   | Other features                            |
| `app/(portal)/doctors/[doctorId]/page.tsx` | Doctor feature and patient feature      | `fetch`                                   |
| Feature UI                                 | Its own hooks                           | `HttpDoctorTrackerApi`, `fetch`           |
| Hooks                                      | Their feature `api` module              | A sibling feature                         |

`DoctorTrackerApi` is the client contract. `HttpDoctorTrackerApi` implements it. Hooks call the feature `api` functions. Components do not import `HttpDoctorTrackerApi`.

## 5. Data rules

TanStack Query caches server data a screen shows more than once. One `QueryClient` wraps the app. A screen adds a query only when leaving and coming back should reuse the last result.

| Cached read          | Key                       | Why it is cached                                                                      |
| -------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| Doctor page          | `["doctors", query]`      | The table is revisited and refreshed after a doctor write                             |
| Doctor filter values | `["doctors", "facets"]`   | The same specialization and hospital lists feed the filter bar                        |
| Doctor summary       | `["doctors", id]`         | The detail adds `activePatientCount`, which the list row does not have                |
| Patient page         | `["patients", query]`     | The same list is the global page and the doctor page when `query` includes `doctorId` |
| Dashboard            | `["dashboard", from, to]` | One response feeds every tile and chart                                               |
| Admin name           | `["auth", "me"]`          | The portal header reads it on each portal page                                        |

| Item                            | Rule                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Default stale time              | 30 seconds, set once on the `QueryClient`                                                                       |
| Dashboard stale time            | 60 seconds on that query only                                                                                   |
| After a doctor write            | Invalidate `["doctors"]`                                                                                        |
| After a patient write or delete | Invalidate `["patients"]`, `["doctors", doctorId]`, and `["dashboard"]`                                         |
| Dates on charts                 | Print the `YYYY-MM-DD` string from the API. Do not pass it through `new Date()`                                 |
| Forms                           | React Hook Form and Zod. Field state stays in the form                                                          |
| Charts                          | Recharts, rendered from the dashboard query result. An all-zero series shows "Nothing registered in this range" |

Do not cache these:

- Login, logout, and refresh. They are commands. Refresh stays inside the HTTP client.
- Create, edit, and delete responses. A mutation invalidates the keys above. It does not store a query for the write.
- Filter text, page number, dialog open state, and the date range. Those stay in component state. Search text is debounced before it is placed in a query key, so a keystroke does not fetch.
- A patient edit form. The dialog uses the row already loaded by the list. It does not call `GET /patients/:id`.
- One query per chart, per table row, or per form field.
- Prefetch of a detail page the admin has not opened.

The client reads `success`, `message`, `data`, and `meta`. It does not invent a second envelope.

## 6. Screens

| Route                 | Renders                                                                                        | Primary action   |
| --------------------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| `/login`              | Email and password form                                                                        | Sign in          |
| `/dashboard`          | Four figures, daily lines, doctors table, calendar, condition bars, care-mix donut, date range | Change the range |
| `/doctors`            | Filters, table, pagination                                                                     | Add doctor       |
| `/doctors/[doctorId]` | Doctor summary and that doctor's patient table                                                 | Add patient      |
| `/patients`           | Filters, including doctor and condition, table, pagination                                     | Edit or delete   |

Add and edit open a dialog. Delete opens a confirm dialog that names the patient. The portal layout links to Dashboard, Doctors, and Patients.

`/` is not a screen. It is the entry alias: `proxy.ts` sends an anonymous visit to `/login` and a visit carrying the session hint to `/dashboard`.

## 7. Code examples

Examples use the doctor list and the login flow. Patients and dashboard copy the same files with their own types. The app uses the Next.js App Router and `"use client"` only where there is state, a query, or a form.

### 7.1 Proxy — `src/proxy.ts`

Next.js runs this file instead of `middleware.ts`. The export is named `proxy`. The cookie check is a gate, not authentication. An expired cookie still fails when the API refresh runs.

The API writes `dt_refresh` on the API origin, scoped to `/api/v1/auth` and `HttpOnly`. A portal request never carries it, so the gate also reads `dt_session`, the first-party hint `lib/auth/session-marker.ts` writes after login or refresh. The hint holds no credential: `lib/auth/session-marker.ts` clears it whenever a refresh fails.

```typescript
import { NextResponse, type NextRequest } from "next/server";

import { REFRESH_COOKIE, SESSION_MARKER_COOKIE } from "@/lib/auth/cookies";

export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(REFRESH_COOKIE) || request.cookies.has(SESSION_MARKER_COOKIE);
  const isLogin = request.nextUrl.pathname === "/login";
  const isRoot = request.nextUrl.pathname === "/";

  if (!hasSession && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && (isLogin || isRoot)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/doctors/:path*", "/patients/:path*"],
};
```

### 7.2 Access token — `src/lib/auth/access-token.ts`

```typescript
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
```

### 7.3 Envelopes — `src/lib/api/types.ts`

```typescript
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PageMeta;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  data: null;
  error: {
    code: string;
    details: { path: string; message: string }[];
  };
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

### 7.4 HTTP client — `src/lib/api/http-client.ts`

Every call sends the cookie. A data call that returns `401` refreshes once and retries once. A failed refresh clears the token and sends the admin to `/login`. Refresh itself must not recurse.

```typescript
import { clearAccessToken, getAccessToken, setAccessToken } from "../auth/access-token";
import { ApiError, type ApiErrorBody, type ApiSuccess } from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  refreshPromise ??= fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) return false;
      const body = (await response.json()) as ApiSuccess<{ accessToken: string }>;
      setAccessToken(body.data.accessToken);
      return true;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<ApiSuccess<T>> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry && !path.endsWith("/auth/refresh")) {
    const refreshed = await refreshSession();
    if (refreshed) return apiRequest<T>(path, init, false);
    clearAccessToken();
    if (typeof window !== "undefined") window.location.assign("/login");
    throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue");
  }

  const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiErrorBody | null;

  if (!response.ok || !body || body.success === false) {
    const errorBody = body && body.success === false ? body : null;
    throw new ApiError(
      response.status,
      errorBody?.error.code ?? "INTERNAL",
      errorBody?.message ?? "Something went wrong",
      errorBody?.error.details ?? [],
    );
  }

  return body;
}
```

### 7.5 API client — `src/lib/api/doctor-tracker-api.ts`

Hooks depend on these functions. A page test can replace the module. Components never import this file.

```typescript
import { apiRequest } from "./http-client";
import type { PageMeta } from "./types";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListQuery {
  q?: string;
  specialization?: string;
  hospital?: string;
  createdFrom?: string;
  createdTo?: string;
  page: number;
  limit: number;
  sort: "createdAt" | "name";
}

export async function listDoctors(query: DoctorListQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const body = await apiRequest<Doctor[]>(`/api/v1/doctors?${params.toString()}`);
  return { items: body.data, meta: body.meta as PageMeta };
}

export async function createDoctor(input: {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}) {
  const body = await apiRequest<Doctor>("/api/v1/doctors", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return body.data;
}
```

Login is the same client, and it stores the token before returning:

```typescript
export async function login(input: { email: string; password: string }) {
  const body = await apiRequest<{
    accessToken: string;
    expiresIn: number;
    admin: { id: string; name: string; email: string };
  }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAccessToken(body.data.accessToken);
  return body.data;
}
```

### 7.6 Query client — `src/lib/query/query-client.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
```

`src/app/providers.tsx` is the client boundary for that cache.

```tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { createQueryClient } from "@/lib/query/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

The root layout renders `Providers` around `{children}`. It does not fetch doctors. The defaults above apply to every cached read. Only the dashboard query sets its own `staleTime`. Hooks do not repeat `retry` or `refetchOnWindowFocus`.

### 7.7 Calendar — `src/lib/time/calendar.ts`

Same Temporal rules as the API. Chart labels stay strings.

```typescript
export function parsePlainDate(value: string): Temporal.PlainDate {
  return Temporal.PlainDate.from(value);
}

export function isDateOrderValid(from: string, to: string): boolean {
  return Temporal.PlainDate.compare(parsePlainDate(from), parsePlainDate(to)) <= 0;
}

export function formatChartDate(value: string): string {
  return value;
}
```

A dashboard range default is the last 30 inclusive days in the timezone the API returns. Build it with `Temporal.PlainDate`, not `new Date(isoDate)`.

### 7.8 Feature model — `features/doctors/model`

```typescript
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
```

```typescript
import { z } from "zod";

export const doctorFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(120),
  specialization: z.string().trim().min(1).max(80),
  hospital: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email("Enter a valid email").max(254),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;
```

The schema mirrors the API limits so the form can show a field error before the request. The API remains the authority.

### 7.9 Feature API — `features/doctors/api/doctor-api.ts`

A thin wrapper so the hook does not import the HTTP client file scattered across UI.

```typescript
import { createDoctor, listDoctors, type DoctorListQuery } from "@/lib/api/doctor-tracker-api";

export const doctorApi = {
  list: (query: DoctorListQuery) => listDoctors(query),
  create: createDoctor,
};
```

### 7.10 Hooks

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { doctorApi } from "../api/doctor-api";
import type { DoctorListQuery } from "@/lib/api/doctor-tracker-api";

export function useDoctorList(query: DoctorListQuery) {
  return useQuery({
    queryKey: ["doctors", query],
    queryFn: () => doctorApi.list(query),
  });
}
```

```tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorApi } from "../api/doctor-api";
import type { DoctorFormValues } from "../model/doctor-schema";

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorFormValues) => doctorApi.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}
```

A patient mutation invalidates more than one key:

```typescript
await queryClient.invalidateQueries({ queryKey: ["patients"] });
await queryClient.invalidateQueries({ queryKey: ["doctors", doctorId] });
await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
```

### 7.11 UI

The screen owns filter state. The table receives the page. The form owns its own field state inside a dialog. Debounce `q` by about 300ms before passing it to `useDoctorList`, so typing does not create a request per character. The edit dialog reads the selected row from this list. It does not add another query.

```tsx
"use client";

import { useState } from "react";
import { useDoctorList } from "../hooks/use-doctor-list";
import { DoctorFilters } from "./doctor-filters";
import { DoctorTable } from "./doctor-table";
import { DoctorFormDialog } from "./doctor-form";

export function DoctorScreen() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const list = useDoctorList({ q: q || undefined, page, limit: 20, sort: "createdAt" });

  return (
    <section>
      <header>
        <h1>Doctors</h1>
        <DoctorFormDialog />
      </header>
      <DoctorFilters q={q} onQChange={setQ} />
      <DoctorTable
        items={list.data?.items ?? []}
        meta={list.data?.meta}
        isLoading={list.isLoading}
        onPageChange={setPage}
      />
    </section>
  );
}
```

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorFormSchema, type DoctorFormValues } from "../model/doctor-schema";
import { useCreateDoctor } from "../hooks/use-doctor-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/types";

export function DoctorFormDialog() {
  const createDoctor = useCreateDoctor();
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: { name: "", specialization: "", hospital: "", phone: "", email: "" },
  });

  async function onSubmit(values: DoctorFormValues) {
    try {
      await createDoctor.mutateAsync(values);
      form.reset();
    } catch (error) {
      if (error instanceof ApiError) {
        for (const detail of error.details) {
          form.setError(detail.path as keyof DoctorFormValues, { message: detail.message });
        }
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add doctor</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Input {...form.register("name")} />
          <Button type="submit" disabled={createDoctor.isPending}>
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

Delete uses a confirm dialog that names the patient, then calls the delete mutation. The button lives in the patient feature. The doctor page does not reimplement it.

### 7.12 Pages

A page chooses the screen. It does not call `fetch`.

```tsx
import { DoctorScreen } from "@/features/doctors/ui/doctor-screen";

export default function DoctorsPage() {
  return <DoctorScreen />;
}
```

The doctor detail page is the one route that composes two features:

```tsx
import { DoctorSummary } from "@/features/doctors/ui/doctor-summary";
import { PatientScreen } from "@/features/patients/ui/patient-screen";

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  return (
    <>
      <DoctorSummary doctorId={doctorId} />
      <PatientScreen doctorId={doctorId} />
    </>
  );
}
```

`PatientScreen` passes `doctorId` into the list query. The query key is `["patients", { doctorId, ...filters }]`.

### 7.13 Portal layout

```tsx
import { PortalNav } from "@/features/auth/ui/portal-nav";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PortalNav />
      <main>{children}</main>
    </div>
  );
}
```

`PortalNav` is the only reader of `["auth", "me"]`. It shows the admin name and links to `/dashboard`, `/doctors`, and `/patients`. Logout calls `POST /auth/logout`, clears the in-memory token, and routes to `/login`. Logout is not a query.

### 7.14 Dashboard charts

One hook loads the dashboard. Its key is `["dashboard", from, to]` and its `staleTime` is `60_000`. Tiles and charts receive slices of that result as props. They do not call `useQuery`. The line chart uses `date` as a string category.

```tsx
import { Line, LineChart, XAxis, YAxis } from "recharts";

export function RegistrationChart({ points }: { points: { date: string; count: number }[] }) {
  const empty = points.every((point) => point.count === 0);
  if (empty) return <p>Nothing registered in this range</p>;

  return (
    <LineChart data={points}>
      <XAxis dataKey="date" />
      <YAxis allowDecimals={false} />
      <Line dataKey="count" />
    </LineChart>
  );
}
```

The date-range control validates `from` and `to` with `isDateOrderValid` before it changes the query key.

### 7.15 Login

```tsx
"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/doctor-tracker-api";
import { ApiError } from "@/lib/api/types";

export function LoginForm() {
  const router = useRouter();
  const form = useForm({ defaultValues: { email: "", password: "" } });

  async function onSubmit(values: { email: string; password: string }) {
    try {
      await login(values);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        form.setError("root", { message: error.message });
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input type="email" {...form.register("email")} />
      <input type="password" {...form.register("password")} />
      <p>{form.formState.errors.root?.message}</p>
      <button type="submit">Sign in</button>
    </form>
  );
}
```

On a full page load the access token is gone. The portal calls `POST /auth/refresh` through the HTTP client, receives a new token, and then loads the page. A failed refresh sends the admin to `/login`.

## 8. Adding a screen

1. Confirm the endpoint exists in the LLD.
2. Add the type and the Zod schema under `features/<feature>/model`.
3. Add a function on the API client and a wrapper in `features/<feature>/api`.
4. Add a `useQuery` hook only when the read is listed in section 5. Otherwise call the API function from the event handler.
5. Add UI that calls the hook. Keep field state inside the form.
6. Add a page that renders that UI and nothing else.
7. Invalidate the keys listed in section 5 after a write.

## 9. Out of scope

- A Redux store for server data. TanStack Query caches only the reads in section 5.
- A query for login, logout, refresh, or a form field.
- MongoDB, Mongoose, or `jsonwebtoken` in this app.
- `fetch` inside a table or a form.
- A feature importing another feature.
- Luxon, date-fns, or Day.js.
- Storing the access token in `localStorage`.
