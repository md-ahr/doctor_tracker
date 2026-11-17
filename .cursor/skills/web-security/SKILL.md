---
name: web-security
description: Applies Doctor Tracker portal controls for XSS, CSRF, token theft, open redirects, and SSRF. Use when rendering user text, changing login or the HTTP client, adding a redirect, or adding any fetch besides the API client.
---

# Portal security

Read [reference.md](reference.md) for the pattern that matches the change.

## Before editing

1. Name the risk: XSS, CSRF, token theft, open redirect, or SSRF.
2. Keep user-controlled strings in React text nodes.
3. Call the API only through `lib/api/http-client.ts`.

## Hard stops

- `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or a `javascript:` URL.
- The access token is written to `localStorage`, `sessionStorage`, or a JavaScript-readable cookie.
- `NEXT_PUBLIC_` is used for a secret, `MONGODB_URI`, or `JWT_ACCESS_SECRET`.
- A new file under `app/api` or `pages/api` fetches a URL.
- `router.push` or `window.location` uses a URL from the query string.
- A link with `target="_blank"` omits `rel="noopener noreferrer"`.
