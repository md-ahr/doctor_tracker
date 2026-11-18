import { NextRequest } from "next/server";
import { expect, test } from "vitest";

import { config, proxy } from "@/proxy";

function request(pathname: string, cookies: string[] = []) {
  const headers = new Headers();
  if (cookies.length > 0) {
    headers.set("cookie", cookies.join("; "));
  }

  return new NextRequest(new URL(pathname, "http://localhost:3000"), { headers });
}

const refreshCookie = "dt_refresh=refresh-token";
const sessionMarker = "dt_session=1";

test("sends a gated path without a session to login", () => {
  for (const pathname of ["/", "/dashboard", "/doctors/doc-1", "/patients"]) {
    const response = proxy(request(pathname));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  }
});

test("sends a logged-in visit to login onward to the dashboard", () => {
  for (const cookie of [refreshCookie, sessionMarker]) {
    const response = proxy(request("/login", [cookie]));

    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  }
});

test("sends a logged-in visit to the root onward to the dashboard", () => {
  for (const cookie of [refreshCookie, sessionMarker]) {
    const response = proxy(request("/", [cookie]));

    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  }
});

test("allows a portal path when only the first-party session marker is present", () => {
  const response = proxy(request("/dashboard", [sessionMarker]));

  expect(response.headers.get("location")).toBeNull();
  expect(response.headers.get("x-middleware-next")).toBe("1");
});

test("allows the login page when the session cookie is missing", () => {
  const response = proxy(request("/login"));

  expect(response.headers.get("location")).toBeNull();
  expect(response.headers.get("x-middleware-next")).toBe("1");
});

test("matches the root, login, and the portal routes", () => {
  expect(config.matcher).toEqual([
    "/",
    "/login",
    "/dashboard/:path*",
    "/doctors/:path*",
    "/patients/:path*",
  ]);
});
