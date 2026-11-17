#!/usr/bin/env node
import { existsSync } from "node:fs";

function contractPath(name) {
  if (existsSync(`docs/${name}`)) return `docs/${name}`;
  if (existsSync(`../docs/${name}`)) return `../docs/${name}`;
  return name;
}

const context = [
  "Doctor Tracker portal (Next.js App Router).",
  `Contract: ${contractPath("frontend-structure.md")}, ${contractPath("design.md")}, ${contractPath("lld.md")}.`,
  `Next task: lowest unchecked item in ${contractPath("frontend-tasks.md")}.`,
  "Token in memory. Query keys from the structure guide. Features do not import features.",
  "Dates on charts stay YYYY-MM-DD. Use the shadcn MCP for primitives and context7 for library APIs.",
  "If the design docs do not state a screen, label, or color, stop. No any, ts-ignore, TODO, Inter, blue primary, or default shadcn theme.",
  "XSS: React text only. CSRF: credentials include, no Next API proxy. Token stays in memory. No fetch of a user-supplied URL.",
  "After a task's edits, the stop hook runs format:check, lint, typecheck, unit tests, and build when those scripts exist. Commit with the commit guidelines only after that gate passes.",
].join(" ");

process.stdout.write(JSON.stringify({ additional_context: context }));
