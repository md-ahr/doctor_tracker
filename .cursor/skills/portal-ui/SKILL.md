---
name: portal-ui
description: Builds Doctor Tracker screens with the paper theme, shadcn primitives, accessible dialogs, and Recharts. Use when styling UI, adding a page, table, filter, form, dialog, chart, or matching the design doc.
---

# Portal UI

Read `docs/design.md` before drawing a screen. Add primitives from the `base-nova` shadcn style, which uses `@base-ui/react`. Do not add Radix. Restyle every primitive to the tokens. Do not leave the default zinc and blue theme.

## Primitives

Add only what the task names: button, input, label, dialog, table, select, dropdown. Registry components land in `components/ui` and stay free of domain words.

| Control | Size |
| --- | --- |
| Button, input, select | 40px height |
| Filter control | 36px height |
| Radius | 2px controls, 4px dialogs |

Primary button uses the action token (`#1B6B56` on paper). Destructive confirm uses brick. Links are underlined.

## Screen map

| Route | Content | Primary action |
| --- | --- | --- |
| `/login` | email and password | Sign in |
| `/dashboard` | four figures, patients-per-doctor bar, condition bar, two daily lines | date range |
| `/doctors` | filters, table, pagination | Add doctor |
| `/doctors/[doctorId]` | summary and that doctor's patients | Add patient |
| `/patients` | filters including doctor and condition, table | edit or delete on the row |

## Charts

Recharts reads the dashboard query result. Series colors:

| Series | Color |
| --- | --- |
| Patients per doctor | `#1A2332` |
| Patients registered by day | `#1B6B56` |
| Doctors created by day | `#2C4A6E` |

Condition bars use the six catalog colors in acute-to-chronic order. The category name is on the chart. An all-zero series renders the sentence "Nothing registered in this range" and no plot.

Figures use Newsreader, 40px, tabular numbers. Eyebrows are the only uppercase text.

## States

A blank table is not loading. Show a loading treatment, an empty sentence, and an error sentence as three separate states. Delete dialogs name the patient. Field errors come from the API `error.details` path.

## Check

Desktop and a narrow viewport for any layout change. Keyboard focus uses the green focus ring.
