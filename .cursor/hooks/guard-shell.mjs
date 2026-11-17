#!/usr/bin/env node
import { readFileSync } from "node:fs";

function respond(body) {
  process.stdout.write(JSON.stringify(body));
}

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  respond({ permission: "allow" });
  process.exit(0);
}

const command = String(input.command ?? "");

const blocks = [
  {
    test: /\bgit\s+push\b[^\n]*--force\b|\bgit\s+push\b[^\n]*(?:^|\s)-[A-Za-z]*f\b/,
    message: "Force push is blocked. Push the branch normally.",
  },
  {
    test: /\bgit\s+reset\s+--hard\b/,
    message: "git reset --hard is blocked.",
  },
  {
    test: /\bgit\s+clean\b[^\n]*\s-[^\n]*f/,
    message: "git clean -f is blocked.",
  },
  {
    test: /\bgit\s+commit\b[^\n]*--no-verify\b/,
    message: "Skipping git hooks is blocked.",
  },
  {
    test: /\b(npm|pnpm|yarn|bun)\s+(add|install|i)\b[^\n]*\b(date-fns|luxon|dayjs|moment|redux|mongoose|jsonwebtoken|argon2)\b/,
    message: "That package is outside the portal stack. Use Temporal, TanStack Query, and the REST client.",
  },
  {
    test: /\bgit\s+add\b[^\n]*(?:^|[\s"'`])\.env(?!\.example)\b/,
    message: "Do not stage .env. Stage .env.example only.",
  },
  {
    test: /\b(cat|less|head|tail|bat)\b[^\n]*(?:^|[\s"'`])\.env(?!\.example)\b/,
    message: "Reading .env is blocked. Secrets stay out of the transcript.",
  },
];

const hit = blocks.find((block) => block.test.test(command));
if (hit) {
  respond({
    permission: "deny",
    user_message: hit.message,
    agent_message: hit.message,
  });
  process.exit(0);
}

respond({ permission: "allow" });
