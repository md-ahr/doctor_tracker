# Doctor Tracker — Commit guidelines

Applies to **both repositories**: the Express API (`api/`) and the Next.js portal (`web/`). They do not share a git history. Commit inside the repository you changed.

Task order: `docs/backend-tasks.md`, `docs/frontend-tasks.md`.

## 1. Format

Use [Conventional Commits](https://www.conventionalcommits.org/).

```text
<type>(<scope>): <subject>

<body>
```

| Part      | Rule                                                                                   |
| --------- | -------------------------------------------------------------------------------------- |
| `type`    | One of the types in section 2                                                          |
| `scope`   | Optional. A short area name from section 3. Omit when the change is repo-wide          |
| `subject` | Imperative, present tense, **under 50 characters**, no trailing period                 |
| `body`    | Optional. Why the change exists. Wrap near 72 characters. Blank line after the subject |

One logical change per commit. A task in the backend or frontend task list is one commit when its unit tests pass.

## 2. Types

| Type       | Use when                                                                                |
| ---------- | --------------------------------------------------------------------------------------- |
| `feat`     | A new behavior a user or API client can observe                                         |
| `fix`      | A correction to existing behavior                                                       |
| `test`     | Tests only, no production code                                                          |
| `refactor` | Structure change with the same behavior                                                 |
| `docs`     | README, comments meant for readers, or docs in that repo                                |
| `chore`    | Tooling, dependencies, config, seed scripts that are not a feature                      |
| `style`    | Formatting only (web). Do not use for CSS that changes layout — that is `feat` or `fix` |

Do not use `feat` for a failing stub. The commit that introduces the behavior should already have its unit test green.

## 3. Scopes

Pick the scope that matches the files you touched. Use the same names in both repos when the idea is the same.

### API (`api/`)

| Scope        | Typical paths                                      |
| ------------ | -------------------------------------------------- |
| `config`     | `src/config/`                                      |
| `lib`        | `src/lib/`                                         |
| `middleware` | `src/middleware/`                                  |
| `db`         | `src/db/`                                          |
| `auth`       | auth schema, service, controller, routes, seed     |
| `doctors`    | doctor schema, model, service, controller, routes  |
| `patients`   | patient schema, model, service, controller, routes |
| `dashboard`  | dashboard schema, service, controller, routes      |
| `docs`       | `src/docs/` (OpenAPI, Swagger)                     |
| `health`     | health controller, route, and app shell wiring     |

### Web (`web/`)

| Scope       | Typical paths                                           |
| ----------- | ------------------------------------------------------- |
| `ui`        | `src/components/ui/`, global tokens                     |
| `lib`       | `src/lib/` (http client, token, calendar, query client) |
| `auth`      | `src/features/auth/`, login page, proxy                 |
| `doctors`   | `src/features/doctors/`, doctor pages                   |
| `patients`  | `src/features/patients/`, patient pages                 |
| `dashboard` | `src/features/dashboard/`, dashboard page               |
| `app`       | layouts, providers, route shells with no feature logic  |

A commit that only adds tests for one scope still uses that scope: `test(auth): cover dummy-hash login path`.

## 4. Subject examples

Good:

```text
feat(auth): issue access token on login
fix(patients): hide soft-deleted rows
test(dashboard): zero-fill missing days
chore: add vitest and typescript config
docs: describe env vars in readme
refactor(lib): share day bounds helper
```

Bad:

```text
feat: stuff
Fix bug.
feat(auth): Added login endpoint and also updated the doctor list filters
WIP
```

The third line is too long, past tense, and mixes two features. Split it.

## 5. Body

Add a body when the subject cannot say why.

```text
feat(auth): reject unknown email after dummy hash

Login always runs a password verify so timing does not reveal
which admin emails exist. See LLD section 5.2 Login.
```

Do not paste task numbers as the only message. The subject must stand alone in `git log --oneline`.

## 6. What one commit contains

| Do                                          | Do not                                              |
| ------------------------------------------- | --------------------------------------------------- |
| Include the unit test that proves the task  | Commit production code with a known red test        |
| Keep API and web changes in their own repos | Commit both apps in one repository                  |
| Stage only files for that task              | Mix an unrelated format sweep into a feature commit |

Suggested cadence while following the task docs:

1. Finish the task’s implementation and its unit test.
2. Run that task’s verify command.
3. Commit with a message that names the outcome, not the task id.

Example after API Task 1.2:

```text
feat(lib): map domain errors to http status
```

Example after web Task 5.4:

```text
feat(auth): show login errors from the api
```

## 7. Files that must not be committed

Never commit:

- `.env` or any file with real secrets (`JWT_ACCESS_SECRET`, `MONGODB_URI`, `ADMIN_PASSWORD`)
- `node_modules/`, build output (`dist/`, `.next/`)
- Local database dumps and editor junk

Do commit:

- `.env.example` with empty secret values
- Lockfiles (`package-lock.json` or the lockfile the repo already uses)

If a secret was committed, rotate it. Do not rely on a follow-up delete commit.

## 8. Commands

From the repository root (`api/` or `web/`):

```bash
git status
git diff
git log -8 --oneline
```

Stage named paths. Avoid `git add -A` when untracked experiments are in the tree.

```bash
git add src/lib/errors.ts tests/lib/errors.test.ts
git commit -m "$(cat <<'EOF'
feat(lib): map domain errors to http status

EOF
)"
```

| Rule       | Detail                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Hooks      | Do not skip with `--no-verify` unless you are fixing the hook itself in a follow-up you were asked to make              |
| Amend      | Only amend a commit that has not been pushed, and only to fold in hook auto-fixes or a message typo on that same commit |
| Push       | Push only when you intend to update the remote                                                                          |
| Force push | Do not force-push `main` or `master`                                                                                    |

## 9. Pull requests

When a branch is ready:

- Title uses the same Conventional Commit shape as the most important commit, still under 50 characters in the subject portion.
- Body lists what changed and how you tested it (the verify commands you ran).
- One PR does not need one commit, but each commit on the branch should still follow sections 1–6.

## 10. Quick check before you commit

- Subject is imperative and under 50 characters.
- Type matches the change (`feat` vs `fix` vs `test` vs `chore`).
- Scope matches the area, or is omitted on purpose.
- Tests for this change are included and passing.
- No secrets, no `node_modules`, no build output.
