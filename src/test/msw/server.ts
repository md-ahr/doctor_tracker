import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { handlers } from "@/test/msw/handlers";

const require = createRequire(import.meta.url);
const mswNode = join(dirname(require.resolve("msw/package.json")), "lib/node/index.js");
const { setupServer: createServer } = require(mswNode) as typeof import("msw/node");

const server = createServer(...handlers);
let listening = false;

export function listen(options?: Parameters<typeof server.listen>[0]) {
  if (listening) return;
  server.listen(options);
  listening = true;
}

/** One server for the suite. A second `listen()` would run every request twice. */
export function setupServer() {
  return {
    listen,
    use: server.use.bind(server),
    resetHandlers: server.resetHandlers.bind(server),
    close() {
      return undefined;
    },
  };
}
