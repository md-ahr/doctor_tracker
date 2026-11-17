---
name: stay-on-contract
description: Stops Doctor Tracker portal work when a screen, query key, label, color, or library signature is not in the design docs or the current task. Use when a UI detail is ambiguous, a React or Next API is uncertain, or the code would need any, a TODO, default shadcn styling, or an extra component.
---

# Stay on the contract

## When to stop

Stop before writing code when any of these are true:

- The task file does not list the file you were about to create.
- `docs/lld.md`, `docs/frontend-structure.md`, or `docs/design.md` does not name the route, query key, label, empty copy, or color.
- You are about to call Next.js, TanStack Query, React Hook Form, Recharts, or Playwright from memory and Context7 has not confirmed the signature.
- The only way to compile is `any`, a type ignore, or a `TODO`.
- The UI would use Inter, a blue primary, `rounded-lg`, a heavy shadow, or a dark theme.

Name the missing contract line in the reply. Do not fill it with a kit default.

## When to write

Write the screen the task names, with tokens from `docs/design.md`. Query keys stay the six listed in the structure guide. Restyle shadcn primitives before they render.
