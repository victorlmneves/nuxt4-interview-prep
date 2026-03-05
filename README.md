# Nuxt 4 Interview Preparation App

Generates personalized technical and behavioral interview guides from a candidate CV and a job description using large language models.

---

## Tech stack

- **Nuxt 4** + **TypeScript**
- **SCSS** (BEM, scoped per component)
- **Anthropic SDK** (primary) — OpenAI and Google Generative AI are scaffolded
- **Google Fonts** (Lora · Instrument Sans · JetBrains Mono)
- **`pdf-parse`, `mammoth`** for document extraction (dev deps present)

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

## Quick start

Prerequisites:

- Node 18+ (recommended)
- pnpm (or npm / yarn)

1. Copy the example env file and set API keys:

```bash
cp .env.example .env
# Set ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY as needed
```

2. Install and start the dev server:

```bash
pnpm install
pnpm dev
```
---

Useful scripts
-------------

- `pnpm dev` — start development server (`nuxt dev`)
- `pnpm build` — build for production
- `pnpm preview` — preview production build
- `pnpm generate` — static generate
- `pnpm postinstall` — `nuxt prepare` (runs after install)
- `pnpm lint`, `pnpm lint:fix` — ESLint checks/fixes
- `pnpm format` — Prettier + Stylelint + ESLint auto-fixes

Key server endpoints
--------------------

Implemented under `server/api` and exposed at `/api/*` during development:

- `POST /api/extract-text` — upload CV (PDF/DOCX/text) → extracted plain text
- `POST /api/interview/generate` — generate an interview guide
- `GET/DELETE /api/interview/history` — list or clear generation history
- `GET/DELETE /api/interview/guide/[id]` — fetch or delete a single guide

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


## Notes & next steps

- **Persistence:** The `guide` store used by the API is currently in-memory and will reset on server restart. For production use replace it with a persistent store (e.g. Drizzle + SQLite/Postgres).
- **CV extraction:** `extract-text` is a basic extraction stub — integrate `pdf-parse` and `mammoth` (dev deps present) for more robust PDF/DOCX handling.
- **LLM providers:** Anthropic has a first-class SDK integration (via the Anthropic SDK). Google Gemini and OpenAI are also supported. The server defaults to `gemini` when the `provider` field is omitted; you can override this default with the `DEFAULT_LLM_PROVIDER` environment variable.
  - **Anthropic:** implemented using the Anthropic SDK and configured in the server to call the Claude family (for example `claude-sonnet-4-20250514` in `server/api/interview/generate.post.ts`).
  - **Gemini:** supports `GEMINI_API_KEY` or Application Default Credentials (ADC). Set `GEMINI_API_KEY` in `.env` for API-key access, or configure ADC and set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file for server-to-server auth.
  - **OpenAI:** uses `OPENAI_API_KEY` and the Responses/Chat APIs. The server includes a defensive OpenAI handler that extracts common response shapes and falls back to a minimal, schema-valid guide for local development (prevents UI 500s when model output is malformed or API errors occur).

- **LLM output handling & validation:** The generator now normalizes and sanitizes LLM outputs before Zod validation — it maps alternate keys (e.g. `candidateSummary` → `candidate`), extracts balanced JSON blocks from noisy model text, converts arrays to strings for `openingNotes`/`closingNotes`, and coerces question fields to the expected shape. On validation failures the server will attempt a single automatic regenerate and log detailed validation errors; if parsing/validation still fails it returns a safe fallback guide so the UI remains usable.

- **LLM logging & rotation:** `server/utils/llmLogger.ts` writes JSONL to `server/logs/llm.jsonl`. It now sanitizes/truncates large fields and performs size-based rotation (when the file exceeds ~5 MB it is renamed to `llm-<timestamp>.jsonl`). Use these logs to debug parsing/validation issues and to inspect raw/regenerated outputs.

- **Development notes:** For local development the server will return fallback guides when provider keys are missing or APIs return errors; for production, ensure API keys and ADC are configured and switch the in-memory `guide` store to a persistent DB. Do not commit `.env` or service account JSON files to source control.

