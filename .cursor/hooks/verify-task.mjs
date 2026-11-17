#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { markerPath, passStampPath } from "./gate-paths.mjs";

const OPTIONAL_SCRIPTS = ["format:check", "lint", "typecheck"];
const REQUIRED_SCRIPTS = ["test", "build"];
const IGNORED = /(^|\/)(node_modules|dist|\.next|coverage|\.cursor)(\/|$)/;

function emit(body) {
  process.stdout.write(`${JSON.stringify(body)}\n`);
}

function main() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    emit({});
    return;
  }

  if (input.status && input.status !== "completed") {
    emit({});
    return;
  }

  if (!existsSync(markerPath())) {
    emit({});
    return;
  }

  if (!existsSync("package.json")) {
    emit({});
    return;
  }

  const gitOk = git(["rev-parse", "--is-inside-work-tree"]).status === 0;
  const changed = gitOk ? meaningfulChanges() : [];

  if (gitOk && changed.length === 0) {
    clearGate();
    emit({});
    return;
  }

  const fingerprint = gitOk ? changeFingerprint(changed) : "no-git";
  const stamp = readStamp();
  const guidelines = guidelinesPath();

  if (stamp === fingerprint) {
    emit({ followup_message: commitMessage(changed, guidelines, lastCommands()) });
    return;
  }

  const scripts = packageScripts();
  const plan = [];
  for (const name of OPTIONAL_SCRIPTS) {
    if (scripts[name]) plan.push(name);
  }
  const missing = REQUIRED_SCRIPTS.filter((name) => !scripts[name]);
  for (const name of REQUIRED_SCRIPTS) {
    if (scripts[name]) plan.push(name);
  }

  if (missing.length > 0) {
    emit({
      followup_message: [
        `Task gate stopped. package.json is missing script(s): ${missing.join(", ")}.`,
        "Add them, then let format:check, lint, typecheck, unit tests, and build pass before committing.",
        "Do not start the next task.",
      ].join("\n"),
    });
    return;
  }

  const skipped = OPTIONAL_SCRIPTS.filter((name) => !scripts[name]);
  for (const name of plan) {
    const result = runScript(name);
    if (!result.ok) {
      rmSync(passStampPath(), { force: true });
      emit({
        followup_message: [
          `Task gate failed at \`npm run ${name}\` (exit ${result.status}).`,
          "",
          tail(redact(result.output)),
          "",
          "Fix this task. Do not commit. Do not start the next task.",
          "The same gate runs again when this turn ends.",
        ].join("\n"),
      });
      return;
    }
  }

  writeFileSync(passStampPath(), JSON.stringify({ fingerprint, commands: plan }));
  const note = skipped.length > 0 ? `Skipped until the package.json script exists: ${skipped.join(", ")}.` : "";
  emit({
    followup_message: commitMessage(changed, guidelines, plan, note, gitOk),
  });
}

function packageScripts() {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  return pkg.scripts ?? {};
}

function runScript(name) {
  const result = spawnSync("npm", ["run", name], {
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
    timeout: 8 * 60 * 1000,
    maxBuffer: 12 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}\n${result.error?.message ?? ""}`.trim();
  return { ok: result.status === 0, status: result.status ?? "timeout", output };
}

function meaningfulChanges() {
  const status = git(["status", "--porcelain"]);
  if (status.status !== 0) return [];
  return (status.stdout ?? "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => pathsOf(line).some((file) => !IGNORED.test(file)));
}

function pathsOf(line) {
  const body = line.slice(3).trim();
  if (body.includes(" -> ")) return body.split(" -> ").map((part) => part.trim());
  return [body];
}

function changeFingerprint(lines) {
  const hash = createHash("sha256");
  const files = filesFromStatus(lines);
  hash.update(files.join("\n"));
  hash.update("\n");
  hash.update(git(["diff"]).stdout ?? "");
  hash.update(git(["diff", "--cached"]).stdout ?? "");
  for (const file of files) {
    try {
      const body = readFileSync(file);
      if (body.length <= 500_000) hash.update(body);
    } catch {
      hash.update(file);
    }
  }
  return hash.digest("hex");
}

function filesFromStatus(lines) {
  return lines
    .flatMap(pathsOf)
    .flatMap(listFiles)
    .filter((file) => !IGNORED.test(file));
}

function listFiles(file) {
  const normalized = file.replace(/\/+$/, "") || file;
  let info;
  try {
    info = statSync(normalized);
  } catch {
    return [normalized];
  }
  if (!info.isDirectory()) return [normalized];
  const found = [];
  for (const entry of readdirSync(normalized)) {
    found.push(...listFiles(`${normalized}/${entry}`));
  }
  return found;
}

function readStamp() {
  if (!existsSync(passStampPath())) return "";
  try {
    return JSON.parse(readFileSync(passStampPath(), "utf8")).fingerprint ?? "";
  } catch {
    return "";
  }
}

function lastCommands() {
  try {
    return JSON.parse(readFileSync(passStampPath(), "utf8")).commands ?? [];
  } catch {
    return [];
  }
}

function commitMessage(lines, guidelines, commands, note = "", gitOk = true) {
  const files = filesFromStatus(lines);
  const scopes = [...new Set(files.map(scopeFor).filter(Boolean))];
  const scopeHint =
    scopes.length === 0
      ? "Omit the scope if the change is repo-wide."
      : scopes.length === 1
        ? `Use scope \`${scopes[0]}\`.`
        : `Paths span ${scopes.join(", ")}. Use the scope for this task, or omit it.`;
  const secret = files.some((file) => /(^|\/)\.env(?!\.example)/.test(file));
  const shown = files.slice(0, 30);
  const more = files.length > shown.length ? `\n- … ${files.length - shown.length} more` : "";

  const linesOut = [
    `Task gate passed (${commands.map((name) => `npm run ${name}`).join(", ")}).`,
  ];
  if (note) linesOut.push(note);
  linesOut.push(
    gitOk
      ? "Commit this task in this repository now. Do not change code. Do not start the next task. Do not push."
      : "This directory is not a git repository. Initialize it, then commit this task. Do not start the next task.",
    "",
    `Follow ${guidelines}:`,
    "- type(scope): subject",
    "- imperative subject, under 50 characters, no trailing period",
    "- one task, one commit, including its unit test",
    "- stage named paths only",
    "- do not commit .env, node_modules, dist, .next, or coverage",
    "- do not pass --no-verify",
    "- do not amend unless that guideline allows it",
    "",
    scopeHint,
  );
  if (secret) linesOut.push("Leave .env unstaged.");
  linesOut.push("Files:", ...shown.map((file) => `- ${file}`));
  if (more) linesOut.push(more.trim());
  return linesOut.join("\n");
}

function scopeFor(file) {
  return webScope(file.replaceAll("\\", "/"));
}

function webScope(path) {
  if (path.includes("components/ui") || path.endsWith("globals.css")) return "ui";
  if (path.includes("src/lib/")) return "lib";
  if (path.includes("features/auth") || path.endsWith("proxy.ts") || path.includes("/login/")) return "auth";
  if (path.includes("features/doctors") || path.includes("/doctors/")) return "doctors";
  if (path.includes("features/patients") || path.includes("/patients/")) return "patients";
  if (path.includes("features/dashboard") || path.includes("/dashboard/")) return "dashboard";
  if (path.includes("src/app/")) return "app";
  return "";
}

function guidelinesPath() {
  if (existsSync("docs/commit-guidelines.md")) return "docs/commit-guidelines.md";
  if (existsSync("../docs/commit-guidelines.md")) return "../docs/commit-guidelines.md";
  return "docs/commit-guidelines.md";
}

function git(args) {
  return spawnSync("git", args, { encoding: "utf8", maxBuffer: 12 * 1024 * 1024 });
}

function clearGate() {
  rmSync(markerPath(), { force: true });
  rmSync(passStampPath(), { force: true });
}

function tail(text) {
  const clean = text.replace(/\u001b\[[0-9;]*m/g, "").trim();
  if (clean.length <= 3500) return clean || "(no output)";
  return clean.slice(-3500);
}

function redact(text) {
  return text
    .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "mongodb://[redacted]")
    .replace(/\b(JWT_ACCESS_SECRET|ADMIN_PASSWORD|MONGODB_URI|NEXT_PUBLIC_API_URL)=(\S+)/g, "$1=[redacted]");
}

try {
  main();
} catch (error) {
  emit({
    followup_message: `Task gate could not run: ${error instanceof Error ? error.message : "unknown error"}. Fix the failure and stop again.`,
  });
}
