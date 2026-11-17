---
name: implement-web-task
description: Implements the next Doctor Tracker Next.js task from the frontend task list, including its unit test and verify command. Use when building, continuing, or fixing the portal, web app, dashboard, doctors, patients, login, or a frontend task.
---

# Implement one portal task

## Checklist

```text
- [ ] Find the lowest unchecked task
- [ ] Read the structure and design sections it depends on
- [ ] Write the listed test when cases are concrete
- [ ] Implement only the listed files
- [ ] Run format:check, lint, typecheck, unit tests, and build
- [ ] Check the task box and commit only if the gate passed
```

## Steps

1. Open `docs/frontend-tasks.md`, or `../docs/frontend-tasks.md` when the app repo is `web/`.
2. Take the first `- [ ]` task. The API should already expose the endpoints that task calls.
3. Read `docs/frontend-structure.md` for the folder and `docs/design.md` when the task renders UI.
4. Add the test first when the task names cases. Use the style in `web-tests`.
5. Implement the task. Keep pages free of `fetch` and query keys.
6. From the web root, run the scripts that exist, in order: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. `test` and `build` are required. UI tasks still need a browser pass of the changed flow when a dev server is available.
7. Mark the checkbox. Commit inside the web repository using `docs/commit-guidelines.md`. One task, one commit. Do not start the next task in the same commit.

## Stop conditions

- Tests fail. Stay on this task.
- The screen or field is not in the LLD or design doc. Load `stay-on-contract` and name the gap. Do not use a kit default.
- The change needs a sibling feature import. Move the shared piece to `components/ui` or `lib`, or compose the features from the page.

## Done

`format:check`, `lint`, `typecheck`, `npm test`, and `npm run build` exit 0 when those scripts exist. The diff matches the task file list. The subject is `type(scope): subject` under 50 characters.
