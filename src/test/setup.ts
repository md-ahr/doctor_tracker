import { afterAll, afterEach, beforeAll } from "vitest";

import { listen, setupServer } from "@/test/msw/server";

const server = setupServer();

beforeAll(() => {
  listen({ onUnhandledFrame: "bypass" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
