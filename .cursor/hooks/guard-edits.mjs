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

const tool = String(input.tool_name ?? input.toolName ?? "");
if (tool && !/^(Write|StrReplace)$/i.test(tool)) {
  respond({ permission: "allow" });
  process.exit(0);
}

const raw = input.tool_input ?? input.arguments ?? input.input ?? {};
let data = raw;
if (typeof raw === "string") {
  try {
    data = JSON.parse(raw);
  } catch {
    data = {};
  }
}

const path = String(data.path ?? data.file_path ?? data.target_file ?? "");
const text = [data.contents, data.new_string, data.content]
  .filter((part) => typeof part === "string")
  .join("\n");

function deny(message) {
  respond({
    permission: "deny",
    user_message: message,
    agent_message: message,
  });
}

if (/(^|\/)src\/middleware\.ts$/.test(path)) {
  deny("The route gate is src/proxy.ts with a named export proxy.");
  process.exit(0);
}

if (/\/(?:app|pages)\/api\//.test(path)) {
  deny("Do not add a Next.js API route. A proxy that fetches a request URL is an SSRF and CSRF hole.");
  process.exit(0);
}

const inSource = /(^|\/)(src|e2e)\//.test(path);
if (!inSource) {
  respond({ permission: "allow" });
  process.exit(0);
}

const slop = slopViolation(text);
if (slop) {
  deny(slop);
  process.exit(0);
}

if (/\.(tsx|css)$/.test(path)) {
  const visual = visualViolation(text);
  if (visual) {
    deny(visual);
    process.exit(0);
  }
}

const blocks = [
  {
    test: /from\s+["'](?:date-fns|luxon|dayjs|moment)["']/,
    message: "Calendar helpers live in lib/time/calendar.ts and use Temporal.",
  },
  {
    test: /\blocalStorage\b|\bsessionStorage\b/,
    message: "The access token stays in the lib/auth/access-token.ts module variable.",
  },
  {
    test: /dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|\bdocument\.write\s*\(|\beval\s*\(|\bnew\s+Function\s*\(|javascript:/,
    message: "Render user text as React children. HTML injection and eval are XSS.",
  },
  {
    test: /NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|PASSWORD|MONGODB|JWT|TOKEN)|process\.env\.(?:JWT_ACCESS_SECRET|MONGODB_URI|ADMIN_PASSWORD)\b/,
    message: "The only public env var is NEXT_PUBLIC_API_URL. Secrets stay on the API.",
  },
];

const hit = blocks.find((block) => block.test.test(text));
if (hit) {
  deny(hit.message);
  process.exit(0);
}

const feature = path.match(/features\/(auth|doctors|patients|dashboard)\//);
if (feature) {
  const self = feature[1];
  const imported = text.matchAll(/features\/(auth|doctors|patients|dashboard)/g);
  for (const match of imported) {
    if (match[1] !== self) {
      deny(`features/${self} cannot import features/${match[1]}. Pages compose features. Shared UI lives in components/ui.`);
      process.exit(0);
    }
  }
}

if (/features\/[^/]+\/ui\//.test(path) && /\bfetch\s*\(/.test(text)) {
  deny("Feature UI calls its hooks. HTTP lives in lib/api and the feature api module.");
  process.exit(0);
}

if (/features\/[^/]+\/ui\//.test(path) && /HttpDoctorTrackerApi|doctor-tracker-api/.test(text)) {
  deny("Feature UI does not import the HTTP client. Call the feature hook.");
  process.exit(0);
}

respond({ permission: "allow" });

function slopViolation(source) {
  const rules = [
    {
      test: /@ts-(?:ignore|expect-error|nocheck)\b/,
      message: "Do not silence the type checker. Read the contract or Context7 and type the value.",
    },
    {
      test: /\beslint-disable\b/,
      message: "Do not disable a lint rule. Fix the code.",
    },
    {
      test: /\bas\s+any\b|[:<,(]\s*any\b|\bany\[\]/,
      message: "Do not use any. Name the type from the API resource or the Zod schema.",
    },
    {
      test: /\bas\s+unknown\s+as\b/,
      message: "Do not cast through unknown. Use the type the contract defines.",
    },
    {
      test: /(?:^|\n)\s*(?:\/\/|\/\*+).*\b(?:TODO|FIXME|XXX|HACK)\b/i,
      message: "Do not leave TODO or FIXME. Implement the task or stop and name the missing contract.",
    },
    {
      test: /throw new Error\(\s*["'][^"']*(?:not implemented|todo)[^"']*["']/i,
      message: "Do not ship a not-implemented stub.",
    },
    {
      test: /\blorem ipsum\b|\bcoming soon\b/i,
      message: "Do not use placeholder copy. Use the sentence from the design doc.",
    },
    {
      test: /catch\s*(?:\(\s*[^)]*\s*\))?\s*\{\s*\}/,
      message: "Do not swallow errors with an empty catch.",
    },
  ];
  return rules.find((rule) => rule.test.test(source))?.message;
}

function visualViolation(source) {
  const rules = [
    {
      test: /\b(?:Inter|Roboto)\b/,
      message: "Use Newsreader and Atkinson Hyperlegible. Do not substitute Inter or Roboto.",
    },
    {
      test: /\bdark:/,
      message: "One light theme. Do not add a dark variant.",
    },
    {
      test: /\b(?:bg|text|border|ring|from|to)-(?:blue|sky|indigo|slate|zinc|neutral|gray)-\d{2,3}\b/,
      message: "Use the paper, ink, and verdigris tokens from docs/design.md.",
    },
    {
      test: /\b(?:bg-white|bg-background|bg-card|bg-popover|bg-primary|text-muted-foreground|text-primary-foreground)\b/,
      message: "Use the design tokens (bg-page, bg-sheet, action-bg). Do not keep the default shadcn theme.",
    },
    {
      test: /\brounded-(?:md|lg|xl|2xl|3xl)\b/,
      message: "Controls are 2px (--radius-control). Dialogs are 4px (--radius-sheet). Do not use the default kit radius.",
    },
    {
      test: /\bshadow-(?:md|lg|xl|2xl)\b/,
      message: "Do not put a heavy shadow on a card. Elevation is only for dialogs and menus.",
    },
  ];
  return rules.find((rule) => rule.test.test(source))?.message;
}
