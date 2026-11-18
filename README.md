# Doctor Tracker Web

Admin portal for the doctor directory, the patient registry, and the dashboard. This app is its own repository. It reads and writes through the [Doctor Tracker API](https://doctor-tracker-api.ahr-web-pro.workers.dev/api/docs). When both checkouts sit side by side, the API project is `api-doctor-tracker`.

## Setup

Requires Node.js 22 (`nvm use`).

```bash
npm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL` to the API origin plus its prefix, with no trailing slash. The sample value is `http://localhost:9000/api/v1`. Point it at the API you are actually running. The browser keeps the access token in memory and sends the refresh cookie with `credentials: "include"`.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the admin seeded by the API.

## Scripts

| Script                 | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Next.js dev server                                 |
| `npm run build`        | Production build                                   |
| `npm start`            | Serve the production build                         |
| `npm test`             | Vitest unit tests                                  |
| `npm run test:e2e`     | Playwright: login, delete confirm, empty dashboard |
| `npm run typecheck`    | `tsc --noEmit`                                     |
| `npm run lint`         | ESLint, zero warnings                              |
| `npm run format:check` | Prettier check                                     |

## Technical decisions

**Server data lives in TanStack Query, not Redux.** The screens are a cache of the API. Doctors, patients, and the dashboard each have a query key, a stale time, and an invalidation after a write. A client store such as Redux would copy those responses into reducers and still need in-flight requests, de-duplication, and cache invalidation. Redux fits shared client state. This portal's shared state is server state. The access token stays in a module variable. It is not in Redux, and it is not in `localStorage`.

**Dashboard figures are aggregated when they are read.** The page sends a `from`/`to` range and draws the series the API returns, including days whose count is zero. The client does not keep a running patient counter on each doctor. A stored counter would have to change on every registration and every delete, and a missed update would stay wrong in the tiles and the charts. Asking for the range at read time keeps one number on the screen for that window. The four tiles that say "All records" or "Active" are the totals in that response. The tiles that say "In this range" are sums of the daily series, still computed from the payload just loaded, not from a counter the browser remembers.

## Screenshots

Desktop is 1280px wide. Mobile is 390px wide. `npm run test:e2e` refreshes these files.

| Screen    | Desktop                                           | Mobile                                          |
| --------- | ------------------------------------------------- | ----------------------------------------------- |
| Dashboard | [desktop](docs/screenshots/dashboard-desktop.png) | [mobile](docs/screenshots/dashboard-mobile.png) |
| Doctors   | [desktop](docs/screenshots/doctors-desktop.png)   | [mobile](docs/screenshots/doctors-mobile.png)   |
| Patients  | [desktop](docs/screenshots/patients-desktop.png)  | [mobile](docs/screenshots/patients-mobile.png)  |

- [x] Dashboard, desktop and mobile
- [x] Doctors, desktop and mobile
- [x] Patients, desktop and mobile
