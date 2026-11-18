# Portal security patterns

## XSS

React escapes text. Notes, names, hospitals, and API `message` strings stay in text nodes. Chart labels use the same strings. Do not feed them to a markdown or HTML renderer.

```tsx
// Rejected
<div dangerouslySetInnerHTML={{ __html: patient.notes }} />

// Required
<p>{patient.notes}</p>
```

Do not build a URL with `javascript:` or assign `element.innerHTML`.

## CSRF

The refresh cookie is `HttpOnly` and `SameSite=None`. The browser sends it because the client uses `credentials: "include"`. The API rejects the cookie when `Origin` is not `FRONTEND_ORIGIN`. Do not reimplement refresh outside `lib/api/http-client.ts`. The `/api/v1` rewrite in `next.config.ts` is the only thing that forwards the cookie to the API, and it keeps the cookie first-party; do not add a `src/app/api` route that proxies it.

The access token is attached as `Authorization`. A foreign page cannot read it from memory.

## Token theft

`lib/auth/access-token.ts` is the only store. `NEXT_PUBLIC_API_URL` is the only public env var. `JWT_ACCESS_SECRET`, `MONGODB_URI`, and `ADMIN_PASSWORD` are not part of the web app.

## SSRF

The browser may call the API origin. The Next server does not call a URL the admin typed. There is no `src/app/api` directory and no `pages/api` directory.

```typescript
// Rejected: a route that fetches the query string
await fetch(searchParams.get("url"));

// Required: the shared client, base URL from NEXT_PUBLIC_API_URL
return api.listDoctors(query);
```

## Open redirect

`src/proxy.ts` sends people to `/login` or `/dashboard`. Do not add `?next=` and then assign that value to `window.location` or `router.push`.

## Links

```tsx
<a href={doctor.email ? `mailto:${doctor.email}` : undefined} />
<a href="https://example.invalid" target="_blank" rel="noopener noreferrer" />
```

Do not iframe HTML from a patient field. Do not postMessage to `*` with the access token.
