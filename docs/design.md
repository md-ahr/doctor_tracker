# Doctor Tracker — Design

Status: ready for implementation
Scope: visual language and interface behavior of the Next.js admin portal
Sources: `docs/project_guide.md`, `docs/requirements-spec.md`, `docs/frontend-structure.md`, `docs/ui-example/medic-dashboard-reference.png`

This is the style guide. It decides color, type, space, and how each screen behaves. Implementation comes after this document. Tokens are named so they can be copied into CSS variables later. Components are specified by anatomy and behavior, not by code.

## 1. Direction

Doctor Tracker is a directory an admin reads and corrects. The interface should feel like a well-printed ward list: warm paper, dark ink, hairline rules, and one deep green reserved for the action that matters. Figures and names are set in a text serif. Everything the admin operates — tables, filters, fields — is set in a highly legible sans.

The portal is dense on purpose. An admin scanning 20 doctors should see names, hospitals, and counts without scrolling past cards. Space is used to separate regions, not to pad every control into a tile.

One theme only. The paper surface is the identity. A dark theme is out of scope.

### 1.1 What this look is built from

| Choice       | Decision                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ground       | Warm paper, `#F7F4EE`. Never pure white as the page, never cool gray.                                                                                  |
| Type         | Newsreader for the wordmark, page titles, and dashboard figures. Atkinson Hyperlegible for every control, label, table cell, and paragraph.            |
| Action color | Verdigris `#1B6B56`, used for the primary button, the active nav mark, links, and the focus ring.                                                      |
| Shape        | 2px corners on controls. 4px on sheets and dialogs. Pills are reserved for condition marks.                                                            |
| Depth        | A change of paper tone plus a 1px rule. Shadow exists only on dialogs and menus.                                                                       |
| Icons        | Navigation pairs an 18px line icon with its word. Figure cards use a 36px icon badge. The search field uses a magnifier. No icon-only control is used. |

These choices are the difference between this portal and a default component kit: no cool-gray page, no blue primary, no 8px-rounded buttons, no shadow on every card, no icon-only sidebar, no uppercase tracking on every label.

### 1.2 Arrangement

`docs/ui-example/medic-dashboard-reference.png` decides where the dashboard regions sit. It does not decide color. The lavender surfaces, purple action, and cool gray page in that file are not part of this portal. Fills, inks, borders, and chart series stay the values in §4. Those values do not change to match the picture.

From 1024px up the dashboard content is two columns inside the main column, gap 24px. The wide column is about two thirds. The narrow column is the rest. Both columns start at the same top. Below 1024px the columns stack. The four figures are 2×2 until 1280px, then one row.

Wide column, top to bottom:

1. Page title and context line, with the range control in the header's right edge.
2. Four figure sheets: Patients, Doctors, Registered, and Doctors added. The anatomy is §10.2. Registered draws a sparkline of `patientsRegisteredByDay` in `green-600`; Doctors added draws one of `doctorsCreatedByDay` in the observation ink. The row is 2×2 below 1280px and four across from 1280px.
3. "Over this range". A wash of `green-600` under the patients line is allowed so the plot reads as the area chart in the reference. The wash is that same green, not a new color. Dots and the doctors series stay as specified in §10.2.
4. "Patients per doctor". A table card with the doctor name, specialization, and the active count with an inline bar. It replaces the horizontal bar chart.

Narrow column, top to bottom:

1. The month of the range's end date. The title is the month and year in the section-title style. The caption is the window, such as "20 Oct 2026 – 18 Nov 2026". Weekday letters are Mo, Tu, We, Th, Fr, Sa, Su, 12px, ink-500, not uppercase. Day numbers are 14px, tabular. Days inside the window use `green-100`. From and To, when they fall in that month, use `green-600` with `paper-0` text. Days are not buttons. From and To fields remain the control. The grid is `aria-hidden="true"`.
2. "By condition".
3. "Care mix". A donut derived from the same condition counts: stable and recovering versus critical and watch, with the total in the centre and a two-row legend.

Dashboard sheets use `paper-1`, a 1px `rule`, a 12px radius, and the 1px ambient shadow. They do not add a new color. Doctors and Patients list pages use the same card with a flush table region.

Below 1024px the columns stack in this order: title and range, the four figures as a 2×2, Over this range, Patients per doctor, month, By condition, Care mix.

The picture also shows payment, stock, help, appointments, and balance rings. Those are not screens in this portal. Do not add them.

## 2. Principles

1. **One obvious action per page.** From 720px up it sits at the right of the content top bar. Below that it sits at the right of the page title. Everything else is quieter.
2. **Names first.** A doctor or patient name is the strongest text in a row. Metadata follows in ink-700.
3. **Color means a condition or an action.** It is not decoration. Charts and status marks use the catalog in §4.3 and nothing else.
4. **The same control, the same size.** Inputs, selects, and buttons share a 40px height. Filters use the 36px compact size. Do not invent a third height.
5. **State is visible.** Loading, empty, and error each have their own treatment (§8). A blank table is not a loading state.
6. **Text does the work of color.** A condition mark always includes the word. A chart series always has a title.

## 3. Typography

Load two families, two weights each.

| Family                | Weights  | Use                                      |
| --------------------- | -------- | ---------------------------------------- |
| Newsreader            | 500, 600 | Wordmark, page titles, dashboard figures |
| Atkinson Hyperlegible | 400, 600 | UI, tables, forms, navigation, body      |

```css
--font-display: "Newsreader", "Iowan Old Style", Palatino, "Palatino Linotype", serif;
--font-ui: "Atkinson Hyperlegible", "Avenir Next", "Segoe UI", sans-serif;
```

Newsreader is a text face, so titles stay quiet. Atkinson Hyperlegible distinguishes `I`, `l`, and `1`, which matters in names, phones, and ids an admin must copy. Do not substitute Inter, Roboto, or the system UI font.

### 3.1 Roles

Root size is 16px. Sizes below are the only ones in the product.

| Role          | Font       | Size | Line height | Weight | Tracking | Color   |
| ------------- | ---------- | ---- | ----------- | ------ | -------- | ------- |
| Figure        | Newsreader | 40px | 1.1         | 500    | −0.02em  | ink-900 |
| Page title    | Newsreader | 28px | 1.2         | 500    | −0.015em | ink-900 |
| Section title | Newsreader | 22px | 1.25        | 500    | −0.01em  | ink-900 |
| Dialog title  | Newsreader | 22px | 1.25        | 500    | −0.01em  | ink-900 |
| UI            | Atkinson   | 15px | 1.4         | 400    | 0        | ink-900 |
| UI strong     | Atkinson   | 15px | 1.4         | 600    | 0        | ink-900 |
| Table cell    | Atkinson   | 14px | 1.4         | 400    | 0        | ink-900 |
| Table header  | Atkinson   | 12px | 1.3         | 600    | 0        | ink-700 |
| Caption       | Atkinson   | 12px | 1.35        | 400    | 0        | ink-700 |
| Eyebrow       | Atkinson   | 11px | 1.3         | 600    | 0.06em   | ink-500 |

Eyebrows are the only uppercase text. They label the four dashboard figures and nothing else. Buttons, nav items, and table headers are sentence case.

Numbers in figures, counts, and table count columns use `font-variant-numeric: tabular-nums`.

### 3.2 Measure

Prose — login introduction, empty states, dialog body, field help — wraps at 62 characters. Tables and filters do not wrap to a measure. They use the content column.

## 4. Color

Values are the source of truth. Semantic names are what components use. A component never references a raw hex.

### 4.1 Primitives

| Token         | Hex       | Role                                                       |
| ------------- | --------- | ---------------------------------------------------------- |
| `paper-0`     | `#F7F4EE` | Page ground                                                |
| `paper-1`     | `#FFFCF7` | Sheets: dialogs, menus, the login panel                    |
| `paper-2`     | `#EFEAE1` | Inset: table header, pressed row, filter field on the page |
| `rule`        | `#E4DDD2` | Hairline between rows and regions                          |
| `rule-strong` | `#CDBFA8` | Input border, stronger separators                          |
| `ink-900`     | `#1A2332` | Primary text                                               |
| `ink-700`     | `#3E4A5C` | Secondary text, table headers                              |
| `ink-500`     | `#6A6258` | Placeholders, eyebrows, chart axes                         |
| `green-700`   | `#145C4A` | Primary hover, links                                       |
| `green-600`   | `#1B6B56` | Primary button, focus, active mark                         |
| `green-100`   | `#E5F2ED` | Selected row tint, stable wash                             |
| `brick-700`   | `#8E2F2A` | Errors, destructive confirm                                |
| `brick-100`   | `#F8E8E6` | Error field wash                                           |

`ink-500` on `paper-0` is 5.5:1. Placeholders use it so hint text meets WCAG AA. Disabled controls do not fade their label. The label stays `ink-700`, the field fills with `paper-2`, and the control does not respond to the pointer.

### 4.2 Semantic tokens

| Token             | Light value   | Use                                    |
| ----------------- | ------------- | -------------------------------------- |
| `bg-page`         | `paper-0`     | Portal and login ground                |
| `bg-sheet`        | `paper-1`     | Dialog, menu, login panel              |
| `bg-inset`        | `paper-2`     | Table header, hover row                |
| `bg-selected`     | `green-100`   | Selected table row, active filter chip |
| `text-primary`    | `ink-900`     | Names, values, titles                  |
| `text-secondary`  | `ink-700`     | Supporting columns, help               |
| `text-tertiary`   | `ink-500`     | Placeholder, axis, eyebrow             |
| `border-subtle`   | `rule`        | Row and region rules                   |
| `border-control`  | `rule-strong` | Inputs at rest                         |
| `border-focus`    | `green-600`   | Focus ring                             |
| `action-bg`       | `green-600`   | Primary button                         |
| `action-bg-hover` | `green-700`   | Primary hover                          |
| `action-fg`       | `paper-0`     | Text on the primary button             |
| `danger-bg`       | `brick-700`   | Confirm delete                         |
| `danger-fg`       | `paper-0`     | Text on confirm delete                 |
| `danger-text`     | `brick-700`   | Inline error, row-level Delete         |

Link text is `green-700`, underlined, with offset 2px. Links are underlined at rest so they are not identified by color alone.

### 4.3 Condition catalog

Six conditions, six fixed pairs. The word is always present. The wash is the mark background. The ink is the word. Each pair is at least 5.9:1.

| Condition     | Ink       | Wash      | Reading             |
| ------------- | --------- | --------- | ------------------- |
| `critical`    | `#8E2F2A` | `#F8E8E6` | Needs attention now |
| `serious`     | `#8A4B12` | `#F8EEDF` | Unstable            |
| `observation` | `#2C4A6E` | `#E6EDF5` | Being watched       |
| `stable`      | `#145C4A` | `#E5F2ED` | Holding             |
| `recovering`  | `#3E5A14` | `#EEF3E0` | Improving           |
| `chronic`     | `#5C3D55` | `#F3EAF0` | Long-term           |

Do not reuse these inks for buttons, links, or navigation. `stable` shares a family with the action green. That overlap is acceptable because the condition mark always carries the word "Stable", and the action green appears on buttons and the focus ring.

Sort and chart order is fixed, from most acute to long-term: critical, serious, observation, stable, recovering, chronic. Filters and the condition chart use this order, not alphabetical order and not the order returned if it differs.

### 4.4 Chart series

| Series                     | Color                  | Token           |
| -------------------------- | ---------------------- | --------------- |
| Patients per doctor        | `#1A2332`              | `ink-900`       |
| Patients registered by day | `#1B6B56`              | `green-600`     |
| Doctors created by day     | `#2C4A6E`              | observation ink |
| Patients by condition      | the six condition inks | §4.3            |
| Axis and grid              | `#E4DDD2`              | `rule`          |
| Axis text                  | `#6A6258`              | `ink-500`       |

One series, one color. Patients-per-doctor is not a rainbow. Specialization is written beside the name, not encoded as a bar color.

## 5. Space, size, and elevation

### 5.1 Spacing

Base unit is 4px. These steps are the only ones used.

| Token     | px  | Typical use                                                |
| --------- | --- | ---------------------------------------------------------- |
| `space-1` | 4   | Icon gap, focus offset                                     |
| `space-2` | 8   | Gap inside a compact control group                         |
| `space-3` | 12  | Padding inside a table cell, gap between label and field   |
| `space-4` | 16  | Control padding, stack gap inside a form                   |
| `space-5` | 24  | Gap between page title and the filter rule, dialog padding |
| `space-6` | 32  | Page padding from 720px up, section gap                    |
| `space-7` | 48  | Gap between dashboard figures and the first chart          |
| `space-8` | 64  | Login panel offset from the top of the viewport            |

### 5.2 Layout sizes

| Token                   | Value                             | Use                                             |
| ----------------------- | --------------------------------- | ----------------------------------------------- |
| Rail width              | 216px                             | Desktop navigation                              |
| Content max             | 1120px                            | Main column, centered in the remaining viewport |
| Page padding            | 16px below 720px, 32px from 720px | Inset of the main column                        |
| Control height          | 40px                              | Buttons, inputs, selects                        |
| Control height, compact | 36px                              | Filters and pagination                          |
| Table row               | 52px                              | One doctor or one patient                       |
| Table header            | 36px                              | Column labels                                   |
| Dialog width            | 480px                             | Create and edit. 420px for delete confirm       |
| Login panel             | 400px                             | The only element on the login page              |

The content max keeps a table from stretching into an unreadable line on a wide monitor. Below 720px the column is the viewport minus 16px on each side.

### 5.3 Radius

| Token            | Value | Use                       |
| ---------------- | ----- | ------------------------- |
| `radius-control` | 2px   | Buttons, inputs, selects  |
| `radius-sheet`   | 4px   | Login panel, dialog, menu |
| `radius-card`    | 12px  | Page and dashboard cards  |
| `radius-mark`    | 999px | Condition marks only      |

### 5.4 Rules and shadow

Regions separate with a 1px `rule`. Controls use a 1px `rule-strong` border. There is no border on the page title and no border around a whole table. The table is a sequence of row rules.

Shadow is one overlay value for dialogs and menus, plus one 1px ambient value for cards:

```css
--shadow-overlay: 0 16px 40px rgba(26, 35, 50, 0.12);
```

A summary block on the doctor page is a region inside the shared card. Dashboard and list cards in §1.2 use `paper-1`, a 1px `rule`, a 12px radius, and the 1px ambient shadow. They do not take a new color.

### 5.5 Focus

Every interactive element uses the same ring: 2px solid `green-600`, offset by 2px. The offset color matches the surface under the control. The browser outline is replaced by this ring, not removed. `:focus-visible` only, so a mouse click does not leave a ring behind.

### 5.6 Motion

| Interaction              | Duration | Easing   |
| ------------------------ | -------- | -------- |
| Hover color, button, row | 120ms    | ease-out |
| Dialog and menu enter    | 160ms    | ease-out |
| Dialog and menu exit     | 120ms    | ease-in  |

Dialogs enter by fading and moving 4px up. They do not scale. `prefers-reduced-motion: reduce` sets every duration to 0ms. No bounce, no spring, no page-load stagger.

## 6. Portal shell

From 720px up, the shell is a fixed left rail and a scrolling main column.

The rail is `paper-1` with a 1px `rule` on its right edge, so it reads as a sheet beside the paper ground. Structure, top to bottom:

1. Wordmark, 20px from the top and 24px from the left. "Doctor Tracker" in Newsreader 500, 22px, ink-900. A 24px by 2px green-600 rule sits 8px under the wordmark.
2. Navigation, 24px below that rule. Three items: Dashboard, Doctors, Patients. Each item is an 18px line icon followed by the word in Atkinson 15px. Inactive is ink-700. Active is green-700, weight 600, on a `green-100` pill, with a 3px by 18px green-600 bar at the left edge of the pill. Hit area is 44px tall and the full rail width. Row gap is 4px.
3. Admin block, pinned to the bottom with 16px padding above a 1px rule. Admin name in 14px ink-900, email in 12px ink-700, then a "Log out" text button.

The main column has a sticky top bar, 72px, `paper-0`, with a 1px `rule` on its bottom edge. The admin identity and avatar sit at the left, a pill search field in the middle, and the primary action at the right. The page title lives once, in the content under the top bar. The dashboard range control stays in the content header, not the top bar.

Below 720px the top bar is hidden. The primary action returns to the page title row, and the page's own filter row carries search.

Below 720px the rail is replaced by a top bar, 56px, with the wordmark at the left and the three links in a row at the right if they fit. Below 480px the three links wrap onto a second row under the wordmark and the bar grows to fit. The admin name and "Log out" sit on that bar's right end, and the email is omitted. Do not introduce a hamburger for three destinations.

The active route is also exposed to assistive tech with `aria-current="page"`.

## 7. Page anatomy

Every authenticated page uses the same header, then its content.

```text
Page title                          [ Primary action ]
One sentence of context, optional
────────────────────────────────────
Filters or range, when the page has them
Content
```

From 720px up, search and the primary action sit in the content top bar (§6). The title and the context line stay in the content. Below 720px the title and the primary action share one row, aligned to the cap height of the title. The context line is 12px caption, ink-700, 4px under the title. A 1px rule follows, 24px below the title block. Content starts 24px under that rule. The dashboard follows §1.2 instead of a single stacked chart column.

| Route           | Title             | Context line                                                             | Primary action                              |
| --------------- | ----------------- | ------------------------------------------------------------------------ | ------------------------------------------- |
| `/dashboard`    | Dashboard         | "Counts are all active records. The charts below follow the range."      | none — the range control is the page's tool |
| `/doctors`      | Doctors           | "Directory of doctors. Date filter uses the day the record was created." | Add doctor                                  |
| `/doctors/[id]` | The doctor's name | Specialization · hospital                                                | Add patient                                 |
| `/patients`     | Patients          | "Active patients across every doctor."                                   | none — edit and delete live on the row      |
| `/login`        | Doctor Tracker    | "Sign in to the directory."                                              | Sign in, inside the form                    |

The doctor detail title is the name, in the page-title style, so the admin always knows whose list they are editing. Specialization and hospital are the context line, not a second heading.

## 8. States

Each list and the dashboard implement all three. They replace the content region. The page title and the primary action stay put.

### 8.1 Loading

A loading region announces `aria-busy="true"`. It shows three quiet lines, not a spinner in the middle of the page and not a skeleton that mimics a fake table. The lines are 12px tall, `paper-2`, full width of the content column, with 12px gaps, radius 2px. They do not shimmer. A request that finishes in under 150ms shows nothing, so a fast response does not flicker.

Charts reserve their final height while loading, so the page does not jump.

### 8.2 Empty

Centered in the content region, 64px of space above it. One sentence in 15px ink-900, then one sentence of guidance in 14px ink-700. If the page can create the missing record, the primary action is repeated as a button under the copy.

| Surface                         | Title                            | Guidance                                                         |
| ------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| Doctors, no records at all      | No doctors yet                   | Add the first doctor to start the directory.                     |
| Doctors, filters match nothing  | No doctors match                 | Clear the search or widen the dates.                             |
| Doctor detail, no patients      | No patients for this doctor      | Add a patient to assign them here.                               |
| Patients, no records            | No patients yet                  | Open a doctor and add a patient.                                 |
| Patients, filters match nothing | No patients match                | Clear the search or choose a different condition.                |
| Dashboard series, all zeros     | Nothing registered in this range | Totals above are unchanged. Widen the range to see earlier days. |

An empty filter result keeps the filter bar. An empty directory hides it.

### 8.3 Error

A full-width band at the top of the content region, wash `brick-100`, 1px border `brick-700` at 40% opacity, padding 12px 16px, radius 2px. The message is the server `message` when it is safe to show, otherwise "The directory could not be loaded." A text button, "Try again", sits at the end of the band and refetches. The band is a polite live region.

Field errors are separate and sit under the field (§9.3). They do not use this band.

## 9. Controls

### 9.1 Buttons

Height 40px, horizontal padding 16px, radius 2px, Atkinson 15px weight 600, sentence case. Icon-only buttons are not used.

| Variant      | Rest                                            | Hover                        | Where                                            |
| ------------ | ----------------------------------------------- | ---------------------------- | ------------------------------------------------ |
| Primary      | `green-600` fill, `paper-0` text                | `green-700` fill             | The page's one action, and Sign in               |
| Secondary    | `paper-1` fill, 1px `rule-strong`, ink-900 text | `paper-2` fill               | Cancel, Clear filters, Previous, Next            |
| Quiet        | no fill, no border, ink-700 text                | ink-900 text, `paper-2` fill | Log out, Try again, row Edit                     |
| Danger quiet | no fill, `brick-700` text                       | `brick-100` fill             | Row Delete                                       |
| Danger       | `brick-700` fill, `paper-0` text                | 8% darker                    | The confirm button inside the delete dialog only |

A busy button keeps its width, replaces the label with "Saving…", and ignores further clicks. Disabled is the treatment in §4.1, not a reduced opacity.

### 9.2 Fields

Label above the field, 12px weight 600, ink-700, 4px gap. The label is always visible. Placeholders show an example, such as `amina@cityhospital.org`, and are never the only name of the field.

The field is 40px, padding 0 12px, radius 2px, fill `paper-1`, border 1px `rule-strong`, text 15px ink-900. Placeholder is ink-500. On focus the border becomes `green-600` and the focus ring draws.

Selects use the same box. The menu is a `paper-1` sheet with `--shadow-overlay`, radius 4px, items 36px tall. The selected item has a `green-100` wash.

Textareas for notes are the same border and type, min-height 96px, padding 12px, and they grow with the content up to 200px.

Required fields show the word "Required" in the label row, right-aligned, 12px ink-500. They do not use a red asterisk.

### 9.3 Validation

Validate on submit, then on change for fields that already have an error. The message sits 4px under the field, 12px, `brick-700`. The field border switches to `brick-700` and the fill to `brick-100`. The error is linked to the field with `aria-describedby`.

Server field errors from `error.details` land on the same slot. A form-level server message, such as "Invalid email or password" or a duplicate doctor email, sits in an error band above the submit button, using the §8.3 band. Login uses that band and does not mark one field as the culprit.

### 9.4 Filter bar

A single wrapping row, gap 8px, aligned to the bottom of the controls. From 720px up, search sits in the content top bar and grows there, min-width 200px. The filter row then starts with the selects. Below 720px, search comes first in the filter row. Then the date pair. Then "Clear", a quiet button, visible only when a filter is set. Doctor detail keeps its search with that doctor's patients, in the top bar from 720px up and above the table below 720px.

Search does not call the API on each keystroke. It waits 300ms after the last change. Changing any filter resets the page to 1.

Date fields are native date inputs, styled as fields, labeled "From" and "To". They send `YYYY-MM-DD`. If From is after To, the field error "From is after To" shows under the pair and the request is not sent.

### 9.5 Tables

Desktop tables start at 1024px. Between 720px and 1023px the table uses the stacked-record layout, because the rail leaves too little width for six patient columns.

- Header row 36px, fill `paper-2`, labels 12px weight 600 ink-700, sentence case, left aligned. Count columns are right aligned.
- Body row 52px, bottom border 1px `rule`. Name is 14px weight 600. Other cells are 14px weight 400 ink-900. Secondary detail inside a cell, such as an email under a phone, is 12px ink-700.
- Hover fill is `paper-2`. The row is a link when the whole row navigates (the doctor list). Edit and Delete are real buttons and do not trigger the row link.
- No zebra stripes. No outer card. No rounded container.

Below 720px the table becomes a stack of records. Each record is a block with 16px vertical padding and a bottom rule. The name is the first line. Each remaining field is a line of "Label value", label in ink-700. Edit and Delete sit on the last line. Horizontal scrolling of a wide table is not used. A stack keeps every field on screen.

Column order:

| Table             | Columns                                                         |
| ----------------- | --------------------------------------------------------------- |
| Doctors           | Name, Specialization, Hospital, Patients, Created               |
| Doctor's patients | Name, Condition, Registered, Phone, and the row actions         |
| Patients          | Name, Condition, Doctor, Registered, Phone, and the row actions |

Patients is a count, right aligned. Created and Registered print as `12 Nov 2026`, in the application's timezone, from the `YYYY-MM-DD` or ISO value. Do not show a time of day.

### 9.6 Pagination

Left side, caption: "Showing 1–20 of 148". Right side: Previous, "Page 2 of 8", Next. Previous and Next are compact secondary buttons. They are disabled at the ends, not hidden. Page size is fixed at 20. There is no page-size selector. A single page hides the whole pagination row and keeps the showing-caption.

### 9.7 Dialogs

Centered, `paper-1`, radius 4px, shadow `--shadow-overlay`, padding 24px, width as in §5.2. The page behind is dimmed with `rgba(26, 35, 50, 0.4)`.

Title in the dialog-title style. A one-sentence description under it in 14px ink-700. Fields stack with 16px gaps. The action row is right-aligned, 24px above the fields' end, gap 8px: Cancel (secondary), then the primary or the danger button.

Open focus moves to the first field, or to the Cancel button on a delete confirm. Escape and a click on the dimmed region close the dialog, except while a save is in flight. Focus returns to the button that opened it.

Delete confirm names the patient: title "Delete {full name}?", description "They will disappear from lists, from their doctor, and from the counts. This cannot be undone here." Confirm label is "Delete patient". The dialog does not ask the admin to retype the name.

### 9.8 Condition mark

Height 24px, padding 0 8px, radius 999px, wash and ink from §4.3, Atkinson 12px weight 600. The text is the condition word with a capital first letter. The mark is inline in the table cell. It is not a button.

### 9.9 Menus

The account area does not need a menu. Filter selects use the field menu in §9.2. Any overflow menu uses the same sheet, items 36px, and a danger-quiet style on a destructive item.

## 10. Screens

### 10.1 Login

The page ground is `paper-0`. One panel, 400px, `paper-1`, radius 4px, padding 32px, placed 64px from the top and centered. No split layout and no illustration.

Inside, in order: the wordmark in Newsreader 28px, the 24px green rule, "Sign in to the directory." in 14px ink-700, then Email, Password, the error band if needed, and Sign in stretched to the panel width. Password has a "Show" quiet button inside the field, 12px, which toggles the type and announces the change.

There is no "forgot password" and no registration link. Those flows do not exist.

### 10.2 Dashboard

The regions and their order are §1.2. From, To, and a quiet "Last 30 days" button restore or set the window. The default window is the last 30 days inclusive in the API timezone. They sit in the range control at the right of the page header and wrap under the title on narrow screens. The caption under the title already explains that totals ignore the range.

Each figure is a sheet with an icon badge in the top-right. The four figures are a 2×2 grid until 1280px, then one row. Each figure is:

- Eyebrow, uppercase, 11px
- Number, Newsreader 40px, tabular
- Caption, 12px ink-700, naming the scope
- A sparkline for Registered and Doctors added

| Figure     | Eyebrow       | Source                           | Caption       |
| ---------- | ------------- | -------------------------------- | ------------- |
| Doctors    | Doctors       | `totals.doctors`                 | All records   |
| Patients   | Patients      | `totals.patients`                | Active        |
| Registered | Registered    | sum of `patientsRegisteredByDay` | In this range |
| Added      | Doctors added | sum of `doctorsCreatedByDay`     | In this range |

The last two are derived in the client from series the API already returns. They are labeled "In this range" so they cannot be read as all-time totals.

From 1024px up, "Over this range" is the wide column and "By condition" is the narrow column, as in §1.2. Below 1024px they stack, with 48px between chart blocks. Each chart block has a section title and a 12px caption, then the plot at 280px tall. The month grid is not a chart and has no plot height.

| Chart               | Title               | Caption                                                            | Form                                                                                                               |
| ------------------- | ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Patients per doctor | Patients per doctor | All active patients. Includes doctors with zero.                   | Table card. Doctor name, specialization, and the count with an inline bar.                                         |
| By condition        | By condition        | All active patients, in fixed condition order.                     | Horizontal bars in the condition inks. The word is the label. Zero still draws the label and a value of 0.         |
| Over time           | Over this range     | Patients registered and doctors created, including days with zero. | Two lines on one date axis. Green for patients, observation ink for doctors. A green wash under the patients line. |

Grid lines are horizontal only, in `rule`. No vertical grid. No chart background fill. Tooltip is a `paper-1` sheet, radius 4px, 12px type, showing the date or name and the count. The line legend is a single line in the card header, using an 8px square and the series name. The bar charts are labeled directly and have no legend.

The chart card clips overflow so a fixed-width plot cannot widen the page. An all-zero line series replaces the plot with the empty copy in §8.2. The four figures remain.

### 10.3 Doctors

Filter bar: search, specialization, hospital, From, To. Specialization and hospital options come from the facet endpoint, with "Any" as the first option.

The name cell is the row link to `/doctors/[id]`. The patients column is the active count. Created is the formatted creation date.

### 10.4 Doctor detail

The header is the doctor's name and the primary action "Add patient". Under the context line, a definition list in one row, wrapping on narrow screens: Phone, Email, Added. Labels are captions, values are 15px.

Then a section title "Patients" and that doctor's table. Search on this page filters this doctor's patients only. There is no condition filter here. The global Patients page owns the full filter set.

Editing the doctor is a quiet "Edit details" button beside the definition list, opening the same dialog shape as create, with the current values filled. It is secondary to adding a patient.

### 10.5 Patients

Filter bar: search, condition, doctor, From, To. Condition options follow §4.3 order, plus "Any". Doctor options are the doctor directory by name.

The doctor cell links to that doctor's page. Edit opens the patient dialog. Delete opens the confirm dialog. Both are on the row, Edit first, then Delete.

### 10.6 Create and edit forms

| Form    | Fields, in order                                                                  |
| ------- | --------------------------------------------------------------------------------- |
| Doctor  | Name, Specialization, Hospital, Phone, Email                                      |
| Patient | Full name, Condition, Doctor, Registered, Date of birth, Sex, Phone, Email, Notes |

Doctor, condition, and registered are required on a patient. The optional fields sit after the required ones and are labeled "Optional" in the label row. Sex is a select: Female, Male, Other, Unknown, and an empty "Not recorded". Date of birth is a date field and may be empty.

The doctor field is omitted when the dialog was opened from a doctor page, and the description reads "This patient will be assigned to {name}." On the Patients page the doctor field is a required select.

## 11. Writing

Short, specific, and calm. Address the admin as the person doing the task. Use the record's name.

| Write                     | Avoid              |
| ------------------------- | ------------------ |
| Delete Amina Rahman?      | Are you sure?      |
| No doctors match          | Oops, nothing here |
| Invalid email or password | User not found     |
| Saving…                   | Please wait        |
| Add doctor                | + New              |

Buttons are verbs. Titles are nouns. Errors say what happened and, when the admin can fix it, what to change.

## 12. Accessibility

| Requirement  | Rule                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Contrast     | Body text, labels, placeholders, and button labels meet WCAG AA. Pairs in §4 were checked.                                                      |
| Keyboard     | Every control is reachable in DOM order. Dialogs trap focus. Escape closes menus and dialogs.                                                   |
| Focus        | The ring in §5.5 is always visible on `:focus-visible`.                                                                                         |
| Names        | Inputs have visible labels. Icon-only controls are not used, so no control depends on `aria-label` alone. The search field is labeled "Search". |
| Status       | Condition is text plus color. Errors are text plus a border change.                                                                             |
| Live regions | The error band is `aria-live="polite"`. A successful save does not use a toast. The dialog closes and the new row is in the table.              |
| Motion       | Honors `prefers-reduced-motion`.                                                                                                                |
| Zoom         | Layout holds at 200% on a 1280px canvas. The record stack from §9.5 is what narrow and zoomed viewports use.                                    |
| Language     | The document is `lang="en"`.                                                                                                                    |

Hit targets are at least 40px on the primary controls and 36px on compact ones. The condition mark is not a target.

## 13. Responsive summary

| Width      | Shell                                                   | Tables           | Figures  | Charts                              |
| ---------- | ------------------------------------------------------- | ---------------- | -------- | ----------------------------------- |
| ≥ 1024px   | Left rail 216px, content top bar, dashboard two columns | Rows and columns | 4 across | Wide and narrow columns, 280px tall |
| 720–1023px | Left rail 216px, content top bar, dashboard one column  | Stacked records  | 2×2      | Stacked, 280px tall                 |
| 480–719px  | Rail becomes a top bar, links in a row                  | Stacked records  | 2×2      | Stacked, 240px tall                 |
| < 480px    | Rail becomes a top bar, links wrap                      | Stacked records  | 2×2      | Stacked, 240px tall                 |

Breakpoints are 1280px, 1024px, 720px, and 480px. The shell changes at 720px; the dashboard and table density change at 1024px and 1280px.

## 14. Token sheet

Copy these into the global stylesheet when implementation starts. Semantic tokens point at primitives so a later adjustment happens in one place.

```css
:root {
  --paper-0: #f7f4ee;
  --paper-1: #fffcf7;
  --paper-2: #efeae1;
  --rule: #e4ddd2;
  --rule-strong: #cdbfa8;
  --ink-900: #1a2332;
  --ink-700: #3e4a5c;
  --ink-500: #6a6258;
  --green-700: #145c4a;
  --green-600: #1b6b56;
  --green-100: #e5f2ed;
  --brick-700: #8e2f2a;
  --brick-100: #f8e8e6;

  --bg-page: var(--paper-0);
  --bg-sheet: var(--paper-1);
  --bg-inset: var(--paper-2);
  --bg-selected: var(--green-100);
  --text-primary: var(--ink-900);
  --text-secondary: var(--ink-700);
  --text-tertiary: var(--ink-500);
  --border-subtle: var(--rule);
  --border-control: var(--rule-strong);
  --border-focus: var(--green-600);
  --action-bg: var(--green-600);
  --action-bg-hover: var(--green-700);
  --action-fg: var(--paper-0);
  --danger-bg: var(--brick-700);
  --danger-fg: var(--paper-0);
  --danger-text: var(--brick-700);

  --font-display: "Newsreader", "Iowan Old Style", Palatino, "Palatino Linotype", serif;
  --font-ui: "Atkinson Hyperlegible", "Avenir Next", "Segoe UI", sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --radius-control: 2px;
  --radius-sheet: 4px;
  --radius-card: 12px;
  --radius-mark: 999px;

  --shadow-overlay: 0 16px 40px rgba(26, 35, 50, 0.12);
  --shadow-card: 0 1px 2px rgba(26, 35, 50, 0.04);

  --control-height: 40px;
  --control-height-compact: 36px;
  --row-height: 52px;
  --content-max: 1120px;
  --rail-width: 216px;
}
```

Condition pairs stay as a map next to the patient catalog, not as extra global variables, so a condition cannot be applied to a button by accident.

## 15. Traceability

| Requirement                                                                | Where it is satisfied                 |
| -------------------------------------------------------------------------- | ------------------------------------- |
| NFR-UX-01 Modern admin layout, spacing, type hierarchy, one primary action | §2, §3, §5, §7                        |
| NFR-UX-02 Labels, keyboard, focus                                          | §5.5, §9, §12                         |
| NFR-UX-03 Narrow tables                                                    | §9.5, §13                             |
| NFR-UX-04 Chart title, labeling, empty series                              | §10.2, §8.2                           |
| FR-UI-01 Navigation among Dashboard, Doctors, Patients                     | §6                                    |
| FR-UI-02 Desktop and mobile                                                | §13                                   |
| FR-UI-03 Loading, empty, error                                             | §8                                    |
| FR-UI-04 Field and server validation                                       | §9.3                                  |
| FR-UI-05 Delete confirmation                                               | §9.7                                  |
| FR-DASH-01–05 Figures and charts                                           | §10.2                                 |
| README visual evidence, desktop and mobile                                 | §13 defines the two widths to capture |

## 16. Reference-parity implementation

The dashboard and portal pages follow the region anatomy of `docs/ui-example/medic-dashboard-reference.png` with the tokens in §4. Color, type, and the paper ground are unchanged.

| Decision             | Implementation                                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell                | The rail is a `paper-1` sheet with icon-and-label links, an active `green-100` pill, and the account block pinned to the bottom. The top bar is sticky, 72px, with the admin identity, a pill search field, and the primary action. |
| Cards                | `portal-card`: `paper-1`, 1px `rule`, 12px radius, and a 1px ambient shadow. Table cards are flush and use `portal-card-pad` for inner regions.                                                                                     |
| Dashboard columns    | Two columns from 1024px, not 720px, because the 216px rail leaves too little room for the right column. The four figures are 2x2 until 1280px, then one row.                                                                        |
| Figures              | Each figure has an icon badge, eyebrow, 40px figure, caption, and a sparkline for the two range series.                                                                                                                             |
| Patients per doctor  | A table card with doctor, specialization, and a count plus inline bar. It replaces the horizontal Recharts bar.                                                                                                                     |
| Care mix             | A donut card derived from the condition counts: stable and recovering versus critical and watch.                                                                                                                                    |
| Tables               | Desktop tables start at 1024px. Between 720px and 1023px the existing stacked-record layout is used, so six patient columns never clip inside the rail layout.                                                                      |
| Out-of-scope widgets | Payment, product and stock, appointments, and the balance ring are not added because the API has no data for them.                                                                                                                  |
