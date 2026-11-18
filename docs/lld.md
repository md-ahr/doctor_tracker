# Doctor Tracker — Low-Level Design

Status: ready for implementation
Requirements: `docs/requirements-spec.md`
Structure and decisions: `docs/hld.md`

This document is the build contract. An endpoint, a service, a rule, or a collection that is not described here is not part of the build.

## 1. Repository layout

Two repositories. They share this contract and do not share a package.

### 1.1 API

Four layers, grouped by feature file. Auth, doctors, patients, and dashboard each have a route, a controller, a service, and (where they persist data) a model. There is no `domain` / `application` / `infrastructure` / `interface` tree and no composition root. How to place code in these layers is in `docs/backend-structure.md`.

```text
src/
  server.ts                      listen
  app.ts                         build Express and mount routers
  seed.ts                        insert the admin when missing
  config/env.ts                  parse environment with Zod
  docs/
    openapi.ts                   OpenAPI document from the Zod schemas
    swagger.ts                   Swagger UI
  db/mongoose.ts                 connect
  lib/
    calendar.ts                  Temporal day bounds and range walk
    errors.ts                    DomainError
    password.ts                  argon2 hash and verify
    tokens.ts                    JWT issue and verify
  middleware/
    async-handler.ts
    error-handler.ts
    require-admin.ts
    validate.ts
    request-id.ts
  models/
    admin.model.ts
    session.model.ts
    doctor.model.ts
    patient.model.ts
  schemas/
    auth.schema.ts
    doctor.schema.ts
    patient.schema.ts
    dashboard.schema.ts
  services/
    auth.service.ts
    doctor.service.ts
    patient.service.ts
    dashboard.service.ts
  controllers/
    health.controller.ts
    auth.controller.ts
    doctor.controller.ts
    patient.controller.ts
    dashboard.controller.ts
  routes/
    health.routes.ts
    auth.routes.ts
    doctor.routes.ts
    patient.routes.ts
    dashboard.routes.ts
```

| Layer         | Responsibility                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `routes`      | Path and middleware. Hand off to one controller                                                |
| `controllers` | Read the validated request, call one service function, write the HTTP response                 |
| `services`    | Business rules in section 5.2. Throw `DomainError`. No `req` or `res`                          |
| `models`      | Mongoose schema, indexes, and queries. Return plain objects. No HTTP status and no role checks |
| `schemas`     | Zod input for each route                                                                       |
| `lib`         | Calendar, errors, password hashing, JWTs                                                       |

`dashboard` has no model. `dashboard.service.ts` calls count and aggregation functions on `doctor.model` and `patient.model`. `doctor.service.ts` may call patient count functions on `patient.model`. `patient.service.ts` may call `doctor.model.findById` and `findByIds`. Services do not import each other. `GET /doctors/:doctorId/patients` is declared on the doctor router. The doctor controller calls `patient.service`. Health has no service; its controller calls `pingDatabase`.

### 1.2 Web

```text
src/
  app/
    (public)/login/page.tsx
    (portal)/layout.tsx
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
  lib/auth/access-token.ts
  lib/time/calendar.ts           Temporal calendar helpers (mirror API)
  lib/query/query-client.ts
  proxy.ts                       sends anonymous users to /login
```

How to place code in these layers is in `docs/frontend-structure.md`.

Each feature is shaped the same way:

```text
features/patients/
  model/patient.ts               types
  model/patient-schema.ts        Zod
  api/patient-api.ts             functions over the API client
  hooks/use-patient-list.ts
  hooks/use-patient-mutations.ts
  ui/patient-table.tsx
  ui/patient-filters.tsx
  ui/patient-form.tsx
  ui/delete-patient-button.tsx
```

## 2. API

### 2.1 Conventions

| Item                      | Rule                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Base URL                  | `{API_ORIGIN}/api/v1`                                                                                                |
| Success body              | `{ "success": true, "message": "<string>", "data": <payload> }`                                                      |
| List success              | Same as success body, plus `"meta": { "page", "limit", "total", "totalPages" }` at the top level next to `data`      |
| Error body                | `{ "success": false, "message": "<string>", "data": null, "error": { "code", "details": [{ "path", "message" }] } }` |
| Ids                       | 24-character hex strings                                                                                             |
| Timestamps                | ISO-8601 UTC, for example `2026-11-17T08:30:00.000Z`                                                                 |
| Calendar inputs           | `YYYY-MM-DD`                                                                                                         |
| Auth header               | `Authorization: Bearer <accessToken>`                                                                                |
| Content type              | `application/json`                                                                                                   |
| Unknown fields            | Stripped by Zod, then ignored                                                                                        |
| Delete and logout success | `200` with `data: null` and an operation-specific `message` (no `meta`)                                              |

`totalPages` is `0` when `total` is `0`, otherwise `ceil(total / limit)`.

`message` is a short English summary for the client UI and logs. It is not repeated inside `error`. On lists, `message` describes the collection (`"Doctors retrieved successfully"`), not each row.

Canonical list shape:

```json
{
  "success": true,
  "message": "Doctors retrieved successfully",
  "data": [
    {
      "id": "65ab1c23d4e5f67890123456",
      "name": "Dr. Sarah Jenkins",
      "specialization": "Cardiology",
      "hospital": "City General",
      "phone": "+1 202 555 0148",
      "email": "sarah@citygeneral.example",
      "createdAt": "2026-11-01T10:00:00.000Z",
      "updatedAt": "2026-11-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 145,
    "totalPages": 15
  }
}
```

Canonical single-resource success:

```json
{
  "success": true,
  "message": "Doctor retrieved successfully",
  "data": {
    "id": "65ab1c23d4e5f67890123456",
    "name": "Dr. Sarah Jenkins",
    "specialization": "Cardiology",
    "hospital": "City General",
    "phone": "+1 202 555 0148",
    "email": "sarah@citygeneral.example",
    "createdAt": "2026-11-01T10:00:00.000Z",
    "updatedAt": "2026-11-01T10:00:00.000Z"
  }
}
```

### 2.2 Status and error codes

| HTTP | `code`                | When                                                                                                |
| ---- | --------------------- | --------------------------------------------------------------------------------------------------- |
| 400  | `VALIDATION_ERROR`    | Schema, date order, or id format failed                                                             |
| 401  | `INVALID_CREDENTIALS` | Email or password does not match                                                                    |
| 401  | `UNAUTHENTICATED`     | Missing, expired, or malformed access token, or a refresh cookie that does not match a live session |
| 403  | `FORBIDDEN`           | Token is valid and the role is not `admin`                                                          |
| 404  | `DOCTOR_NOT_FOUND`    | No doctor for that id                                                                               |
| 404  | `PATIENT_NOT_FOUND`   | No active patient for that id                                                                       |
| 409  | `EMAIL_IN_USE`        | Another doctor already has that email                                                               |
| 429  | `RATE_LIMITED`        | Login rate limit                                                                                    |
| 500  | `INTERNAL`            | Anything else. `details` is empty.                                                                  |

Example:

```json
{
  "success": false,
  "message": "Request validation failed",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "email", "message": "Enter a valid email" }]
  }
}
```

### 2.3 Shared field limits

| Field                            | Rule                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| Admin, doctor, and patient names | Trimmed, 1–120 characters                                                                   |
| Specialization                   | Trimmed, 1–80 characters                                                                    |
| Hospital                         | Trimmed, 1–120 characters                                                                   |
| Email                            | Trimmed, lowercased, valid email, max 254                                                   |
| Phone                            | Trimmed, 7–20 characters, digits with an optional leading `+` and interior spaces or dashes |
| Notes                            | Trimmed, max 2,000 characters. Empty becomes omitted.                                       |
| Date of birth                    | `YYYY-MM-DD`, not in the future, not more than 130 years ago                                |
| Sex                              | `female`, `male`, `other`, `undisclosed`                                                    |
| Condition                        | `critical`, `serious`, `stable`, `recovering`, `chronic`, `observation`                     |
| Search `q`                       | Trimmed, 1–100 characters when present                                                      |
| `page`                           | Integer ≥ 1, default 1                                                                      |
| `limit`                          | Integer 1–50, default 20                                                                    |
| Sort                             | A whitelist per endpoint. Anything else is `VALIDATION_ERROR`.                              |

### 2.4 Health

`GET /health`

Response `200`:

```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "database": "up",
    "datetime": "2026-11-17T08:30:00.000Z"
  }
}
```

`data.datetime` is the server time when the check ran, ISO-8601 UTC (same rule as other API timestamps).

Response `503` when the database ping fails:

```json
{
  "success": false,
  "message": "Database unavailable",
  "data": {
    "status": "degraded",
    "database": "down",
    "datetime": "2026-11-17T08:30:00.000Z"
  },
  "error": {
    "code": "INTERNAL",
    "details": []
  }
}
```

On failure, `data` still carries `status`, `database`, and `datetime` so monitors can read when the probe ran. `success` remains `false`.

### 2.5 Identity

#### `POST /auth/login`

Public. Rate limit: 10 requests per 15 minutes per IP.

Request:

```json
{ "email": "admin@example.com", "password": "correct horse" }
```

Response `200`:

```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 900,
    "admin": {
      "id": "665f1c0a2b3c4d5e6f708192",
      "name": "Avery Admin",
      "email": "admin@example.com"
    }
  }
}
```

Also sets:

```text
Set-Cookie: dt_refresh=<opaque>; HttpOnly; Secure; SameSite=None; Path=/api/v1/auth; Max-Age=604800
```

`SameSite=None` is required because the portal origin and the API origin differ. Localhost is treated as a secure site by Chromium, so `Secure` cookies work against `http://localhost` during the interview demo.

The access token payload is:

```json
{
  "sub": "665f1c0a2b3c4d5e6f708192",
  "email": "admin@example.com",
  "name": "Avery Admin",
  "role": "admin",
  "iat": 0,
  "exp": 0
}
```

Lifetime is 15 minutes. The secret is `JWT_ACCESS_SECRET`, algorithm HS256.

#### `POST /auth/refresh`

Cookie `dt_refresh` required. The `Origin` header must equal `FRONTEND_ORIGIN`. No bearer token.

Response `200` uses the login response envelope (`success`, `message`: `"Session refreshed successfully"`, and the same `data` shape as login). It replaces the cookie. The presented session row is revoked atomically in the same update that consumes it, before the new one is written, so two concurrent refreshes cannot both rotate the same token. If the presented token is unknown, expired, or already revoked, the response is `401 UNAUTHENTICATED` and the cookie is left untouched: a concurrent refresh may have just rotated it, and clearing it here would destroy that browser's new token. The client clears its local session hint instead.

#### `POST /auth/logout`

Cookie and origin check, same as refresh. Revokes the session when it exists. Response `200`:

```json
{
  "success": true,
  "message": "Signed out successfully",
  "data": null
}
```

An already missing cookie still returns `200` with the same body, so the button can be pressed twice.

#### `GET /auth/me`

Bearer. Response `200`:

```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "id": "665f1c0a2b3c4d5e6f708192",
    "name": "Avery Admin",
    "email": "admin@example.com"
  }
}
```

### 2.6 Doctors

Doctor resource:

```json
{
  "id": "665f1c0a2b3c4d5e6f708193",
  "name": "Amelia Rahman",
  "specialization": "Cardiology",
  "hospital": "City General",
  "phone": "+1 202 555 0148",
  "email": "amelia@citygeneral.example",
  "createdAt": "2026-11-01T10:00:00.000Z",
  "updatedAt": "2026-11-01T10:00:00.000Z"
}
```

Doctor detail adds `activePatientCount`.

#### `POST /doctors`

Request body is `name`, `specialization`, `hospital`, `phone`, `email`. Response `201` with `success: true`, `message`: `"Doctor created successfully"`, and `data` as the doctor resource.

#### `GET /doctors`

| Query                      | Meaning                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `q`                        | Case-insensitive literal match against name, specialization, hospital, email, or phone |
| `specialization`           | Case-insensitive exact match                                                           |
| `hospital`                 | Case-insensitive exact match                                                           |
| `createdFrom`, `createdTo` | Inclusive creation-date window                                                         |
| `page`, `limit`            | Pagination                                                                             |
| `sort`                     | `createdAt` (default, descending) or `name` (ascending)                                |

Response `200` is the list envelope. `data` is an array of doctor resources without `activePatientCount`. `message`: `"Doctors retrieved successfully"`.

#### `GET /doctors/facets`

Response `200`:

```json
{
  "success": true,
  "message": "Doctor facets retrieved successfully",
  "data": {
    "specializations": ["Cardiology", "Pediatrics"],
    "hospitals": ["City General"]
  }
}
```

Values are the stored spellings, sorted alphabetically with the same case-insensitive collation as the filters. This route is declared before `/:doctorId` so the literal path `facets` is not parsed as an id.

#### `GET /doctors/:doctorId`

Response `200` uses the single-resource envelope. `data` is the doctor plus `activePatientCount`. `message`: `"Doctor retrieved successfully"`. Unknown id is `404`.

#### `PATCH /doctors/:doctorId`

Body is a partial of the five editable fields. At least one field is required. Email uniqueness ignores the doctor being edited. Response `200` with `message`: `"Doctor updated successfully"` and `data` as the updated doctor.

#### `GET /doctors/:doctorId/patients`

Same query keys as `GET /patients`, except `doctorId` is taken from the path and a query `doctorId` is rejected. Unknown doctor is `404` before the patient query runs. A doctor with no patients is `200` with the list envelope, empty `data`, and `message`: `"Patients retrieved successfully"`.

#### `POST /doctors/:doctorId/patients`

Request:

```json
{
  "fullName": "Noah Khan",
  "dateOfBirth": "1984-04-12",
  "sex": "male",
  "phone": "+1 202 555 0199",
  "email": "noah@example.com",
  "condition": "stable",
  "notes": "Registered from the cardiology clinic.",
  "registeredAt": "2026-11-16"
}
```

`dateOfBirth`, `sex`, `phone`, `email`, and `notes` may be omitted. `registeredAt` may be omitted and then defaults to now. Response `201` with `message`: `"Patient created successfully"` and `data` as the patient resource. Unknown doctor is `404` and nothing is written.

### 2.7 Patients

Patient resource:

```json
{
  "id": "665f1c0a2b3c4d5e6f708194",
  "doctorId": "665f1c0a2b3c4d5e6f708193",
  "doctorName": "Amelia Rahman",
  "fullName": "Noah Khan",
  "dateOfBirth": "1984-04-12",
  "sex": "male",
  "phone": "+1 202 555 0199",
  "email": "noah@example.com",
  "condition": "stable",
  "notes": "Registered from the cardiology clinic.",
  "registeredAt": "2026-11-16T00:00:00.000Z",
  "createdAt": "2026-11-16T08:00:00.000Z",
  "updatedAt": "2026-11-16T08:00:00.000Z"
}
```

`doctorName` is filled by reading the doctor. It is display data. Soft-deleted patients are not returned.

#### `GET /patients`

| Query                            | Meaning                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `q`                              | Literal match against full name, email, or phone                                                                                                            |
| `condition`                      | Exact catalog value                                                                                                                                         |
| `doctorId`                       | Only that doctor's patients. Unknown doctor is an empty page, not a 404, because the global page is a filter. The nested doctor route is the one that 404s. |
| `registeredFrom`, `registeredTo` | Inclusive registration window                                                                                                                               |
| `page`, `limit`                  | Pagination                                                                                                                                                  |
| `sort`                           | `registeredAt` (default, descending) or `fullName` (ascending)                                                                                              |

Response `200` is the list envelope. `message`: `"Patients retrieved successfully"`.

#### `GET /patients/:patientId`

Response `200` with `message`: `"Patient retrieved successfully"` and one patient in `data`. Deleted and unknown ids are `404`.

#### `PATCH /patients/:patientId`

Partial body of the editable fields: `fullName`, `dateOfBirth`, `sex`, `phone`, `email`, `condition`, `notes`, `registeredAt`, `doctorId`. At least one is required. A new `doctorId` must exist. Response `200` with `message`: `"Patient updated successfully"`.

Clearing an optional field is an explicit `null` for `dateOfBirth`, `sex`, `phone`, `email`, or `notes`.

#### `DELETE /patients/:patientId`

Response `200`:

```json
{
  "success": true,
  "message": "Patient deleted successfully",
  "data": null
}
```

The document remains with `deletedAt` and `updatedAt` set to now. A second delete is `404`.

### 2.8 Dashboard

#### `GET /dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD`

Both parameters are optional. The default window is the last 30 days through today in `APP_TIMEZONE`, inclusive. A window longer than 366 days, or a reversed window, is `VALIDATION_ERROR`.

Response `200`:

```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "range": { "from": "2026-10-19", "to": "2026-11-17", "timezone": "UTC" },
    "totals": { "doctors": 12, "patients": 148 },
    "patientsPerDoctor": [
      {
        "doctorId": "665f1c0a2b3c4d5e6f708193",
        "name": "Amelia Rahman",
        "specialization": "Cardiology",
        "patientCount": 20
      }
    ],
    "patientsByCondition": [{ "condition": "stable", "patientCount": 80 }],
    "patientsRegisteredByDay": [
      { "date": "2026-11-16", "count": 4 },
      { "date": "2026-11-17", "count": 0 }
    ],
    "doctorsCreatedByDay": [
      { "date": "2026-11-16", "count": 1 },
      { "date": "2026-11-17", "count": 0 }
    ]
  }
}
```

`totals`, `patientsPerDoctor`, and `patientsByCondition` ignore the window. The two daily series include every date in the window, including zeroes. `patientsPerDoctor` is sorted by `patientCount` descending, then name ascending. Doctors with zero patients are included. `patientsByCondition` lists every catalog condition, including zeroes.

### 2.9 API documentation (Swagger)

Public. Not under the admin guard.

| URL                          | Body               |
| ---------------------------- | ------------------ |
| `GET /api/docs`              | Swagger UI         |
| `GET /api/docs/openapi.json` | OpenAPI 3 document |

The document is built in `src/docs/openapi.ts` from the Zod schemas (`@asteasolutions/zod-to-openapi`). `swagger-ui-express` serves the UI. Do not keep a second hand-written YAML.

The spec defines the success envelope, the list envelope with `meta`, and the error envelope once. Each path in section 2 references those components and lists the status codes from §2.2. Private paths declare bearer auth. Refresh and logout document the `dt_refresh` cookie. Placement rules are in `docs/backend-structure.md`.

## 3. Interfaces

### 3.1 Domain types

```typescript
type Role = "admin";

type PatientCondition =
  "critical" | "serious" | "stable" | "recovering" | "chronic" | "observation";

type Sex = "female" | "male" | "other" | "undisclosed";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Patient {
  id: string;
  doctorId: string;
  fullName: string;
  dateOfBirth: string | null;
  sex: Sex | null;
  phone: string | null;
  email: string | null;
  condition: PatientCondition;
  notes: string | null;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

interface DateWindow {
  from: Date;
  to: Date;
}
```

Objects returned to services are active patients only. `deletedAt` is not part of the public patient resource. The patient model hides soft-deleted rows.

### 3.2 Domain errors

```typescript
class DomainError extends Error {
  constructor(
    readonly code:
      | "INVALID_CREDENTIALS"
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "DOCTOR_NOT_FOUND"
      | "PATIENT_NOT_FOUND"
      | "EMAIL_IN_USE"
      | "VALIDATION_ERROR",
  ) {
    super(code);
  }
}
```

Services throw `DomainError`. The error handler is the only place that assigns an HTTP status.

### 3.3 Model and service contracts

```typescript
interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

interface AccessTokenIssuer {
  issue(admin: Admin): { token: string; expiresIn: number };
  verify(token: string): Admin;
}

interface Clock {
  now(): Date;
}

interface AdminRepository {
  findByEmail(email: string): Promise<(Admin & { passwordHash: string }) | null>;
  findById(id: string): Promise<Admin | null>;
  create(input: { name: string; email: string; passwordHash: string; role: Role }): Promise<Admin>;
}

interface SessionRepository {
  create(input: { adminId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findLiveByHash(
    tokenHash: string,
    now: Date,
  ): Promise<{
    id: string;
    adminId: string;
  } | null>;
  revoke(id: string, revokedAt: Date): Promise<void>;
}

interface DoctorRepository {
  create(input: NewDoctor): Promise<Doctor>;
  update(id: string, patch: DoctorPatch): Promise<Doctor | null>;
  findById(id: string): Promise<Doctor | null>;
  findByEmail(email: string): Promise<Doctor | null>;
  search(query: DoctorQuery): Promise<Page<Doctor>>;
  facets(): Promise<{ specializations: string[]; hospitals: string[] }>;
  count(): Promise<number>;
  countCreatedByDay(window: DateWindow, timezone: string): Promise<DayCount[]>;
}

interface PatientRepository {
  create(input: NewPatient): Promise<Patient>;
  update(id: string, patch: PatientPatch): Promise<Patient | null>;
  softDelete(id: string, deletedAt: Date): Promise<boolean>;
  findActiveById(id: string): Promise<Patient | null>;
  search(query: PatientQuery): Promise<Page<Patient>>;
  countActive(doctorId?: string): Promise<number>;
  countByDoctor(): Promise<Array<{ doctorId: string; patientCount: number }>>;
  countByCondition(): Promise<Array<{ condition: PatientCondition; patientCount: number }>>;
  countRegisteredByDay(window: DateWindow, timezone: string): Promise<DayCount[]>;
}

interface DoctorTrackerApi {
  login(input: { email: string; password: string }): Promise<AuthResult>;
  refresh(): Promise<AuthResult>;
  logout(): Promise<void>;
  me(): Promise<Admin>;
  createDoctor(input: NewDoctorInput): Promise<DoctorResource>;
  listDoctors(query: DoctorListQuery): Promise<Page<DoctorResource>>;
  doctorFacets(): Promise<{ specializations: string[]; hospitals: string[] }>;
  getDoctor(id: string): Promise<DoctorDetail>;
  updateDoctor(id: string, patch: DoctorPatch): Promise<DoctorResource>;
  listDoctorPatients(doctorId: string, query: PatientListQuery): Promise<Page<PatientResource>>;
  createPatient(doctorId: string, input: NewPatientInput): Promise<PatientResource>;
  listPatients(query: PatientListQuery): Promise<Page<PatientResource>>;
  getPatient(id: string): Promise<PatientResource>;
  updatePatient(id: string, patch: PatientPatch): Promise<PatientResource>;
  deletePatient(id: string): Promise<void>;
  getDashboard(range?: { from?: string; to?: string }): Promise<DashboardResource>;
}
```

The repository interfaces above are the functions each model file exports. Services call those functions directly. They are not injected through a composition root.

`DoctorTrackerApi` is the web client contract. `HttpDoctorTrackerApi` implements it. Hooks take the methods they need. Components do not import `HttpDoctorTrackerApi`.

`AccessTokenIssuer.verify` checks the signature and expiry and returns the admin named by the token. A bad token throws `UNAUTHENTICATED`. `requireAdmin` then rejects a role other than `admin` with `FORBIDDEN`. The issuer does not decide which roles may call a route.

### 3.4 HTTP middleware order

1. Request id (`x-request-id`, generated when absent)
2. Structured request log
3. `helmet`
4. CORS: origin `FRONTEND_ORIGIN`, credentials enabled, methods `GET,POST,PATCH,DELETE`, allowed headers `Authorization,Content-Type`
5. JSON parser, limit 16 KB
6. Login rate limit on `POST /auth/login` only
7. Router
8. Not-found handler → `404` with `code: "PATIENT_NOT_FOUND"` is wrong for unknown paths. Unknown paths return `404` with `code: "VALIDATION_ERROR"` and message `Route not found`.
9. Error handler

`requireAdmin` is applied to the doctor, patient, and dashboard routers, and to `GET /auth/me`. It reads the bearer token, verifies it, rejects any role other than `admin`, and sets `req.admin`.

### 3.5 Web client behavior

`lib/auth/access-token.ts` holds the token in a module variable. It is never written to `localStorage`, `sessionStorage`, or a non-HTTP-only cookie.

`lib/api/http-client.ts`:

- sends `credentials: "include"`
- sets `Authorization` when a token is present
- on `401` from a data call, calls `POST /auth/refresh` once and retries the original request once
- if refresh fails, clears the token and redirects to `/login`

Query keys:

| Key                       | Data                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `["auth", "me"]`          | Current admin                                               |
| `["doctors", query]`      | Doctor page                                                 |
| `["doctors", "facets"]`   | Filter values                                               |
| `["doctors", id]`         | Doctor detail                                               |
| `["patients", query]`     | Patient page, including `{ doctorId }` on the doctor screen |
| `["dashboard", from, to]` | Dashboard                                                   |

These are the only TanStack Query keys. Login, logout, refresh, and form state are not cached. After a doctor write, invalidate `["doctors"]`. After a patient write or delete, invalidate `["patients"]`, `["doctors", doctorId]`, and `["dashboard"]`. Stale time is 30 seconds, except the dashboard, which is 60 seconds. Edit a patient from the row already in the list. Do not add a patient-detail query to open the dialog.

`proxy.ts` only checks for the presence of the `dt_refresh` cookie to decide whether to allow a portal URL. The API remains the authority. A stolen or expired cookie still fails on refresh.

## 4. Dependencies

### 4.1 Runtime libraries

| Package                                  | Where            | Used for                                                                                                                                       |
| ---------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `express`                                | API              | HTTP                                                                                                                                           |
| `mongoose`                               | API repositories | Schema, indexes, queries                                                                                                                       |
| `zod`                                    | Both             | Input schemas                                                                                                                                  |
| `@asteasolutions/zod-to-openapi`         | API              | OpenAPI document generated from those Zod schemas                                                                                              |
| `swagger-ui-express`                     | API              | Swagger UI at `GET /api/docs`                                                                                                                  |
| `argon2`                                 | API              | Password hashing                                                                                                                               |
| `jsonwebtoken`                           | API              | Access tokens                                                                                                                                  |
| `helmet`, `cors`, `express-rate-limit`   | API              | Security edge                                                                                                                                  |
| `pino`, `pino-http`                      | API              | Logs                                                                                                                                           |
| Native `Temporal` API                    | Both             | Calendar-day bounds, range iteration, list filter dates, dashboard zero-fill (`lib/calendar.ts` on the API, `lib/time/calendar.ts` on the web) |
| `next`, `react`, `react-dom`             | Web              | UI shell                                                                                                                                       |
| `@tanstack/react-query`                  | Web              | Server-state cache                                                                                                                             |
| `react-hook-form`, `@hookform/resolvers` | Web              | Forms                                                                                                                                          |
| `recharts`                               | Web              | Charts                                                                                                                                         |
| `tailwindcss`                            | Web              | Layout and visual design                                                                                                                       |
| shadcn/ui                                | Web              | Accessible controls copied into `components/ui` (button, input, dialog, select, table, dropdown). Styled with Tailwind.                        |

The API does not depend on Next.js. The web app does not depend on Mongoose, `jsonwebtoken`, or `argon2`. Neither app adds a third-party date library (Luxon, date-fns, Day.js, and similar). Calendar logic uses the ECMAScript Temporal API only.

**Dates and runtime.** Use `Temporal.PlainDate` for `YYYY-MM-DD` fields and range walking, and `Temporal.ZonedDateTime` with `APP_TIMEZONE` (or the dashboard `timezone` from the API response) for start-of-day and end-of-day bounds converted to `Date` for MongoDB. Persisted instants (`registeredAt`, `createdAt`, token expiry) stay `Date` / ISO-8601 strings in JSON. Run the API on Node.js 22 or newer so `Temporal` is available without a polyfill. Target evergreen browsers on the web so the dashboard date control and list date filters can validate `from`/`to` with the same helpers as the API.

### 4.2 Module dependency matrix

| File                              | May import                                                      | Must not import                              |
| --------------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| `routes/*`                        | matching controller, schemas, middleware                        | models, services                             |
| `controllers/*`                   | matching service, `lib/response`, `lib/errors`                  | models                                       |
| `auth.service.ts`                 | `admin.model`, `session.model`, `lib`                           | doctor, patient, or dashboard files, Express |
| `doctor.service.ts`               | `doctor.model`, `patient.model` count functions, `lib`          | `patient.service`, auth, Express             |
| `patient.service.ts`              | `patient.model`, `doctor.model.findById` and `findByIds`, `lib` | `doctor.service`, auth, Express              |
| `dashboard.service.ts`            | doctor and patient model query functions, `lib`                 | other services, Express                      |
| `models/*`                        | `mongoose`                                                      | services, controllers, routes, Express       |
| `features/doctors`                | `lib/api`, `lib/query`, `components/ui`                         | `features/patients`, `features/dashboard`    |
| `features/patients`               | `lib/api`, `lib/query`, `components/ui`                         | `features/doctors`                           |
| `features/dashboard`              | `lib/api`, `lib/time`, `components/ui`                          | other features                               |
| `features/auth`                   | `lib/api`, `lib/auth`                                           | other features                               |
| `app/(portal)/doctors/[doctorId]` | doctor feature and patient feature                              | `fetch`                                      |
| feature UI                        | its own hooks                                                   | `HttpDoctorTrackerApi`, `fetch`              |
| hooks                             | their feature `api` module                                      | a sibling feature                            |

### 4.3 Environment

API:

| Variable            | Required | Rule                            |
| ------------------- | -------- | ------------------------------- |
| `MONGODB_URI`       | yes      | Mongo connection string         |
| `JWT_ACCESS_SECRET` | yes      | At least 32 characters          |
| `FRONTEND_ORIGIN`   | yes      | Exact origin, no trailing slash |
| `PORT`              | no       | Default `4000`                  |
| `NODE_ENV`          | no       | `development` or `production`   |
| `APP_TIMEZONE`      | no       | IANA name, default `UTC`        |
| `LOG_LEVEL`         | no       | pino level, default `info`      |
| `ADMIN_NAME`        | seed     | Seed only                       |
| `ADMIN_EMAIL`       | seed     | Seed only                       |
| `ADMIN_PASSWORD`    | seed     | At least 8 characters           |

Web:

| Variable              | Required | Rule                          |
| --------------------- | -------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL` | yes      | API origin, no trailing slash |

Each repository ships `.env.example` with these keys and empty secrets.

## 5. Business logic structure

### 5.1 Call shape

```text
routes/*.routes.ts           path, middleware, controller
controllers/*.controller.ts  read validated input, call one service, write the envelope
services/*.service.ts        rules in section 5.2
models/*.model.ts            MongoDB only
lib/password.ts              argon2
lib/tokens.ts                JWT
```

Each heading in section 5.2 is a function on the matching service. Example:

```typescript
export async function createPatient(doctorId: string, input: NewPatientInput) {
  const doctor = await doctorModel.findById(doctorId);
  if (!doctor) throw new DomainError("DOCTOR_NOT_FOUND");
  const registeredAt = input.registeredAt
    ? dayBounds(input.registeredAt, env.APP_TIMEZONE).start
    : new Date();
  return patientModel.create({ ...input, doctorId, registeredAt, deletedAt: null });
}
```

### 5.2 Use cases

#### `Login`

1. Normalize email.
2. Load the admin by email. If missing, still run a hash verification against a dummy hash so the timing does not reveal which emails exist, then throw `INVALID_CREDENTIALS`.
3. Verify the password. On failure throw `INVALID_CREDENTIALS`.
4. Create 32 random bytes, hex-encode them as the cookie value, and store the SHA-256 hex digest.
5. Set expiry to now plus 7 days.
6. Issue the access token from the admin profile. Do not put the refresh token inside the JWT.

#### `RefreshSession`

1. Hash the cookie value.
2. Find a session with that hash, `revokedAt` null, and `expiresAt` in the future.
3. If missing, throw `UNAUTHENTICATED`.
4. Load the admin. If missing, revoke and throw `UNAUTHENTICATED`.
5. Revoke the current session.
6. Create a new session and issue a new access token.

Revoke-then-create is two writes. If the process dies between them, the admin signs in again. That is acceptable. A reused revoked token fails step 2 because `findLiveByHash` ignores revoked rows. This build does not keep a family tree of stolen tokens.

#### `Logout`

Hash the cookie, find the live session, revoke it if it exists. Return success either way.

#### `CreateDoctor`

1. Normalize email.
2. If `findByEmail` returns a doctor, throw `EMAIL_IN_USE`.
3. Insert.
4. If the unique index races and MongoDB returns duplicate key `11000`, throw `EMAIL_IN_USE`.

#### `UpdateDoctor`

1. Load the doctor or throw `DOCTOR_NOT_FOUND`.
2. If the email is changing, run the same uniqueness check against other doctors.
3. Save the provided fields and `updatedAt`.

#### `ListDoctors` and `ListPatients`

1. Reject a window whose start is after its end.
2. Convert `createdFrom` / `registeredFrom` to the start of that calendar day in `APP_TIMEZONE`, and the `To` parameter to the end of that day.
3. Escape `q` with `escapeRegex` so characters such as `.` and `*` are literal.
4. Call `search` with the page, limit, sort whitelist, and filters.
5. Return the page unchanged. Do not filter again in memory.

#### `GetDoctor`

Load the doctor or throw `DOCTOR_NOT_FOUND`. Ask `patient.model.countActive(doctorId)`.

#### `CreatePatient`

1. If `doctorExists` is false, throw `DOCTOR_NOT_FOUND`.
2. Default `registeredAt` to now when omitted. When the client sends a date, store the start of that day in `APP_TIMEZONE`.
3. Insert one patient with `deletedAt: null`.

#### `UpdatePatient`

1. Load the active patient or throw `PATIENT_NOT_FOUND`.
2. If `doctorId` is present and the doctor does not exist, throw `DOCTOR_NOT_FOUND`.
3. Apply the patch, including nulls that clear optional fields.
4. Set `updatedAt`.

#### `DeletePatient`

Call `softDelete`. If it reports that no active row matched, throw `PATIENT_NOT_FOUND`.

#### `GetDashboard`

Run these reads together:

- `doctors.count()`
- `patients.countActive()`
- `patients.countByDoctor()`
- `patients.countByCondition()`
- `patients.countRegisteredByDay(window, timezone)`
- `doctors.countCreatedByDay(window, timezone)`
- `doctors.search` is not used. Load id, name, and specialization for the grouped doctor ids with `findById` in one `find({ _id: { $in } })` repository method, `findByIds`.

Then:

1. Join doctor names onto the per-doctor counts.
2. Append doctors that have zero patients, with `patientCount: 0`.
3. Emit all six conditions, using `0` when a condition is absent.
4. Build every calendar date from `from` through `to` and fill missing days with `0`.

`dashboard.service.ts` owns steps 1–4. MongoDB returns only the days and groups that exist.

### 5.3 Search and filter construction

Doctor filter, built inside `DoctorRepository.search`:

```typescript
const filter: Filter<DoctorDocument> = {};

if (query.specialization) filter.specialization = query.specialization;
if (query.hospital) filter.hospital = query.hospital;
if (query.createdFrom || query.createdTo) {
  filter.createdAt = { $gte: query.createdFrom, $lte: query.createdTo };
}
if (query.q) {
  const pattern = escapeRegex(query.q);
  filter.$or = ["name", "specialization", "hospital", "email", "phone"].map((field) => ({
    [field]: { $regex: pattern, $options: "i" },
  }));
}
```

Equality filters on specialization and hospital run with collation `{ locale: "en", strength: 2 }`, which is the same collation as their indexes.

Patient filter always starts with `{ deletedAt: null }`. It adds `doctorId`, `condition`, `registeredAt`, and an `$or` across `fullName`, `email`, and `phone` using the same escaped pattern.

Sort objects:

```typescript
const doctorSort = {
  createdAt: { createdAt: -1, _id: -1 },
  name: { name: 1, _id: 1 },
} as const;

const patientSort = {
  registeredAt: { registeredAt: -1, _id: -1 },
  fullName: { fullName: 1, _id: 1 },
} as const;
```

The repository issues `find(filter).sort(sort).skip((page - 1) * limit).limit(limit)` and `countDocuments(filter)` together. Reads use `.lean()`.

### 5.4 Dashboard pipelines

Active patient match:

```javascript
{
  deletedAt: null;
}
```

Patients per doctor:

```javascript
[{ $match: { deletedAt: null } }, { $group: { _id: "$doctorId", patientCount: { $sum: 1 } } }];
```

Patients per condition:

```javascript
[{ $match: { deletedAt: null } }, { $group: { _id: "$condition", patientCount: { $sum: 1 } } }];
```

Registrations per day:

```javascript
[
  { $match: { deletedAt: null, registeredAt: { $gte: from, $lte: to } } },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$registeredAt", timezone },
      },
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
];
```

Doctors created per day uses the same date grouping on `doctors.createdAt` and the window. There is no `deletedAt` on doctors.

`findByIds` projects `name` and `specialization` only.

### 5.5 Calendar helpers (`lib/calendar.ts`, web `lib/time/calendar.ts`)

Keep the same module shape in both repositories so list filters, patient `registeredAt` defaults, and the dashboard use one implementation.

```typescript
function parsePlainDate(date: string): Temporal.PlainDate {
  try {
    return Temporal.PlainDate.from(date);
  } catch {
    throw new DomainError("VALIDATION_ERROR");
  }
}

function dayBounds(date: string, timezone: string): { start: Date; end: Date } {
  const plain = parsePlainDate(date);
  const start = plain.toZonedDateTime(timezone);
  const end = plain.add({ days: 1 }).toZonedDateTime(timezone).subtract({ milliseconds: 1 });
  return {
    start: new Date(start.epochMilliseconds),
    end: new Date(end.epochMilliseconds),
  };
}

function eachPlainDateInRange(from: string, to: string): string[] {
  const keys: string[] = [];
  let current = parsePlainDate(from);
  const end = parsePlainDate(to);
  while (Temporal.PlainDate.compare(current, end) <= 0) {
    keys.push(current.toString());
    current = current.add({ days: 1 });
  }
  return keys;
}
```

`ListDoctors`, `ListPatients`, and `CreatePatient` call `dayBounds` for `*From` / `*To` and client-supplied registration dates. `GetDashboard` uses `dayBounds` on `from` and `to` for the aggregation window. Zero-fill calls `eachPlainDateInRange(from, to)` and merges Mongo counts by those `YYYY-MM-DD` keys. The web app displays the keys as text and formats range inputs with `Temporal.PlainDate`; it does not bucket chart labels with `new Date(isoDate)`.

### 5.6 Mapping a patient to JSON

```typescript
function toPatientResource(patient: Patient, doctorName: string) {
  return {
    id: patient.id,
    doctorId: patient.doctorId,
    doctorName,
    fullName: patient.fullName,
    dateOfBirth: patient.dateOfBirth,
    sex: patient.sex,
    phone: patient.phone,
    email: patient.email,
    condition: patient.condition,
    notes: patient.notes,
    registeredAt: patient.registeredAt.toISOString(),
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  };
}
```

List mapping loads the distinct doctor ids on the page with `findByIds` once. It does not look up a doctor per row.

## 6. Database schema

### 6.1 `admins`

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,          // stored lowercase
  passwordHash: string,
  role: "admin",
  createdAt: Date,
  updatedAt: Date
}
```

| Index          | Options |
| -------------- | ------- |
| `{ email: 1 }` | unique  |

### 6.2 `sessions`

```typescript
{
  _id: ObjectId,
  adminId: ObjectId,
  tokenHash: string,     // sha256 hex of the cookie value
  expiresAt: Date,
  revokedAt: Date | null,
  createdAt: Date
}
```

| Index              | Options                      |
| ------------------ | ---------------------------- |
| `{ tokenHash: 1 }` | unique                       |
| `{ expiresAt: 1 }` | TTL, `expireAfterSeconds: 0` |
| `{ adminId: 1 }`   | none                         |

The TTL removes expired documents. Logout does not wait for it. Logout sets `revokedAt`.

### 6.3 `doctors`

```typescript
{
  _id: ObjectId,
  name: string,
  specialization: string,
  hospital: string,
  phone: string,
  email: string,          // stored lowercase
  createdAt: Date,
  updatedAt: Date
}
```

| Index                                  | Options                                   |
| -------------------------------------- | ----------------------------------------- |
| `{ email: 1 }`                         | unique                                    |
| `{ createdAt: -1, _id: -1 }`           | default list                              |
| `{ specialization: 1, createdAt: -1 }` | collation `{ locale: "en", strength: 2 }` |
| `{ hospital: 1, createdAt: -1 }`       | same collation                            |

Queries that filter specialization or hospital pass that collation. Queries that do not filter them use the default-list index and do not pass a collation.

### 6.4 `patients`

```typescript
{
  _id: ObjectId,
  doctorId: ObjectId,
  fullName: string,
  dateOfBirth: string | null,   // YYYY-MM-DD
  sex: "female" | "male" | "other" | "undisclosed" | null,
  phone: string | null,
  email: string | null,         // stored lowercase when present
  condition: PatientCondition,
  notes: string | null,
  registeredAt: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null
}
```

| Index                                        | Options                       |
| -------------------------------------------- | ----------------------------- |
| `{ doctorId: 1, registeredAt: -1, _id: -1 }` | partial `{ deletedAt: null }` |
| `{ registeredAt: -1, _id: -1 }`              | partial `{ deletedAt: null }` |
| `{ condition: 1, registeredAt: -1 }`         | partial `{ deletedAt: null }` |

Index selection:

| Query shape                                      | Index                                                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| A doctor's patients, optional date window        | `doctorId, registeredAt, _id`                                                                                               |
| Registration window, no doctor and no condition  | `registeredAt, _id`                                                                                                         |
| Condition, with or without a registration window | `condition, registeredAt`                                                                                                   |
| Doctor and condition together                    | `doctorId` index. Condition is a residual predicate. A doctor's patient list is the selective side.                         |
| Search text only                                 | The active date index limits the sort, and the regex is residual. This is the known scan-prone shape. Page size stays ≤ 50. |

No index is declared for `fullName`. An unanchored regex would not use it.

### 6.5 Index creation

On startup the API calls `createIndexes()` for the four models. It does not call `syncIndexes()`, which would drop an index that was created by hand. Models declare `autoIndex: false` outside tests, and startup creates indexes explicitly so a fresh Atlas database is ready before traffic.

### 6.6 Seed

`npm run seed` connects, hashes `ADMIN_PASSWORD`, and inserts the admin only when `findByEmail` is empty. It is safe to run twice.

## 7. Web screens

| Route                 | Composition                                                                                                         | Primary action              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `/login`              | Email and password form                                                                                             | Sign in                     |
| `/dashboard`          | Four summary figures, patients-per-doctor bar chart, condition bar chart, two daily line charts, date-range control | Change the date range       |
| `/doctors`            | Filter bar, table, pagination                                                                                       | Add doctor                  |
| `/doctors/[doctorId]` | Doctor summary, that doctor's patient table                                                                         | Add patient                 |
| `/patients`           | Filter bar including doctor and condition, table, pagination                                                        | Edit or delete from the row |

Add and edit open a dialog. Delete opens a confirm dialog that names the patient. The portal layout shows the admin name and a logout control, and links to Dashboard, Doctors, and Patients.

Chart mapping:

| Figure                            | Source field          | Chart                        |
| --------------------------------- | --------------------- | ---------------------------- |
| Total doctors, total patients     | `totals`              | Statistic tiles              |
| Patients per doctor               | `patientsPerDoctor`   | Horizontal bar               |
| Patients by condition             | `patientsByCondition` | Bar                          |
| Registrations and doctors created | the two daily arrays  | Lines, sharing the date axis |

An all-zero series renders the empty copy "Nothing registered in this range" instead of a blank chart.

## 8. Verification

| Check                                           | What it proves                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| Service tests with mocked models                | Duplicate email, unknown doctor, soft delete, zero-filled days, dummy-hash login path |
| API tests against MongoDB                       | Status codes, cookie rotation, pagination bounds, validation                          |
| `explain()` on the three indexed patient shapes | `IXSCAN` and no `COLLSCAN` for doctor scope, condition, and registration date         |
| Web tests                                       | Login redirect, form errors, delete confirm, dashboard empty series                   |
| Manual pass                                     | Desktop and mobile screenshots of Dashboard, Doctors, and Patients                    |

The explain assertion is part of the patient repository test, using a few hundred seeded patients so the planner has statistics.

## 9. Implementation order

1. API shell: env, Mongo connection, health, error shape, request id.
2. Identity: seed, login, guard, refresh, logout.
3. Doctors: create, list, filters, pagination, detail.
4. Patients: create under a doctor, global list, edit, soft delete.
5. Dashboard aggregation and zero-fill.
6. Web shell: login, token memory, refresh retry, portal layout.
7. Doctor and patient screens.
8. Dashboard charts.
9. Explain-plan test, then README with the two decisions below.

The README technical-decision section should use these two, because they are the decisions a reviewer will question:

1. Why server data lives in TanStack Query rather than a client store such as Redux.
2. Why dashboard figures are aggregated at read time rather than stored as a counter on the doctor.
