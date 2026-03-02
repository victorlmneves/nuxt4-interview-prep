# Nuxt 4 Interview Preparation App

Generates personalised technical and behavioural interview guides from a candidate CV and job description, powered by Claude (Anthropic).

---

## Stack

- **Nuxt 4** + **TypeScript**
- **SCSS** (BEM, scoped per component)
- **Anthropic SDK** for AI generation
- **Google Fonts** (Lora · Instrument Sans · JetBrains Mono)

---

## Project structure (Nuxt 4 app directory)

```
interview-prep/
├── app/
│   ├── assets/
│   │   └── scss/
│   │       └── global.scss           # Design tokens, resets
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── InterviewSection.vue
│   │   └── QuestionCard.vue
│   ├── composables/
│   │   ├── useDateFormat.ts
│   │   └── useInterviewGuide.ts      # Core state machine
│   ├── pages/
│   │   ├── index.vue                 # Generator
│   │   ├── index.scss
│   │   ├── history.vue               # All past guides
│   │   └── interview/
│   │       └── [id].vue              # Guide detail
│   ├── types/
│   │   └── index.ts
│   └── ...
├── server/api/
│   ├── extract-text.post.ts          # CV file → plain text
│   └── interview/
│       ├── generate.post.ts          # AI generation endpoint
│       ├── history.ts                # GET / DELETE history
│       └── guide/
│           └── [id].ts               # GET / DELETE single guide
├── nuxt.config.ts
├── tsconfig.json
└── .env.example
```

---

## Setup

```bash
cp .env.example .env
# Fill in your ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY


pnpm run dev
```

---

## Coding conventions

- No one-line conditions — all `if` blocks use braces
- Explicit `type` imports from `~/types/index`
- All composable functions are typed with explicit return and parameter types
- `defineOptions({ name: 'ComponentName' })` on every component
- BEM class naming in SCSS, always scoped
- `async/await` throughout — no `.then()` chains
- Error handling via `try/catch` with `err: unknown`

---


## Production notes

- The in-memory `guideStore` in `generate.post.ts` resets on server restart — replace with a database (Drizzle + SQLite or Postgres) for persistence
- PDF/DOCX extraction stub in `extract-text.post.ts` — wire up `pdfjs-dist` and `mammoth` for full support
- OpenAI and Gemini providers are stubbed — add SDK calls alongside the Anthropic path
