import { NextRequest } from "next/server";
import { expect, test } from "vitest";

import { config, proxy } from "@/proxy";

function request(pathname: string, refreshCookie?: string) {
  const headers = new Headers();
  if (refreshCookie !== undefined) {
    headers.set("cookie", `dt_refresh=${refreshCookie}`);
  }

  return new NextRequest(new URL(pathname, "http://localhost:3000"), { headers });
}

test("sends a portal path without dt_refresh to login", () => {
  for (const pathname of ["/dashboard", "/doctors/doc-1", "/patients"]) {
    const response = proxy(request(pathname));

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  }
});

test("sends a logged-in visit to login onward to the dashboard", () => {
  const response = proxy(request("/login", "refresh-token"));

  expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
});

test("allows the login page when the refresh cookie is missing", () => {
  const response = proxy(request("/login"));

  expect(response.headers.get("location")).toBeNull();
  expect(response.headers.get("x-middleware-next")).toBe("1");
});

test("matches login and the portal routes", () => {
  expect(config.matcher).toEqual([
    "/login",
    "/dashboard/:path*",
    "/doctors/:path*",
    "/patients/:path*",
  ]);
});
