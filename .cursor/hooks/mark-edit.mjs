#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { markerPath } from "./gate-paths.mjs";

function finish() {
  process.stdout.write("{}\n");
}

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  finish();
  process.exit(0);
}

const command = typeof input.command === "string" ? input.command.trim() : "";
if (command && isReadOnly(command)) {
  finish();
  process.exit(0);
}

const filePath = typeof input.file_path === "string" ? input.file_path : "";
if (filePath && /[/\\](\.cursor|node_modules)[/\\]/.test(filePath)) {
  finish();
  process.exit(0);
}

if (!command && !filePath) {
  finish();
  process.exit(0);
}

writeFileSync(markerPath(), "1");
finish();

function isReadOnly(value) {
  return /^(?:git\s+(?:status|diff|log|show|rev-parse)\b|npm\s+(?:test\b|run\s+(?:test|lint|format:check|typecheck|build)\b)|npm\s+run\s+test\b|npx\s+tsc\b|ls\b|pwd\b)/.test(
    value,
  );
}
