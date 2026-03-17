---
description: "Add a new interview question category to the schema, normalisation logic, color mapping, and UI — keeps all 5 touch-points consistent"
argument-hint: "Category name in camelCase (e.g. 'systemDesign') and a short display label"
agent: agent
---

Add a new interview question category to the nuxt4-interview-prep application, keeping all 5 touch-points consistent.

**Category details**: ${input}

## Steps

Work through each file in order — do not skip any step.

### Step 1 — Type (`app/types/index.ts`)

Add the new category to the `TQuestionCategory` union:

```ts
export type TQuestionCategory =
  | 'technical'
  | 'behavioural'
  | 'situational'
  | 'culture'
  | 'leadership'
  | 'problemSolving'
  | '<new-category>'
```

### Step 2 — Normalisation (`server/api/interview/generate.post.ts`)

Add a mapping in `normalizeCategory()` so LLM output using alternate spellings maps to the canonical name:

```ts
if (/^<pattern>/i.test(raw)) { return '<new-category>' }
```

Place it before the final fallback `return 'technical'` line.

### Step 3 — Color helper (`app/composables/useInterviewGuide.ts`)

Add a `case '<new-category>':` entry in `categoryColor()` returning a hex color that visually distinguishes it from existing categories. Check current colors to avoid duplicates.

### Step 4 — Zod schema (`server/validation/guideSchema.ts`)

Add the new category to the `TQuestionCategory` enum in `QuestionSchema`:

```ts
z.enum(['technical', 'behavioural', 'situational', 'culture', 'leadership', 'problemSolving', '<new-category>'])
```

### Step 5 — Fallback answer (`app/components/QuestionCard.vue`)

Add a fallback example answer for the new category in the `fallbackExampleAnswer` logic (the `switch` or `if` block that handles `behavioural`, `situational`, `culture`, and `leadership`). Keep it concise and relevant to the category intent.

---

After completing all steps, verify TypeScript types are consistent across all five files and that no `switch`/`if` blocks for category handling are missing a case for the new value.
