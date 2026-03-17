# Nuxt 4 Interview Prep — AI Assistant Guidelines

This file is intentionally minimal to avoid duplicating project guidelines in multiple places.

The **single canonical source of truth** for all project rules, architecture notes, and type/interface examples is:

- `.cursor/rules/project.mdc`

For GitHub Copilot configuration, see:

- `.github/copilot-instructions.md` (which should reference the same canonical rules)

### Server (server/)

| File | Role |
|------|------|
| `server/api/interview/generate.post.ts` | Main generation endpoint: exports `guideStore` (in-memory `Map<string, IInterviewGuide>`), `buildSystemPrompt()`, `buildUserPrompt()`, `parseGuideResponse()` |
| `server/api/extract-text.post.ts` | Multipart file → plain text (`.txt`, `.pdf`, `.docx`) |
| `server/api/interview/history.ts` | GET (list) / DELETE (clear all) on `guideStore` |
| `server/api/interview/guide/[id].ts` | GET / DELETE single guide by ID from `guideStore` |
| `server/validation/guideSchema.ts` | Zod schemas — call `validateGuide()` for non-throwing validation of any parsed LLM output |
| `server/utils/llmLogger.ts` | JSONL debug logger — call `logLLM(entry)` when `DEBUG_LLM=true`; handles size rotation automatically |

**LLM parsing fallback** (implemented in `generate.post.ts`, replicate when adding new routes):
1. Direct `JSON.parse()`
2. Extract balanced JSON block from noisy model text
3. Heuristic key-extraction + single regenerate attempt
4. Return safe fallback guide — the UI must never see a 500 from a parse failure

### Data Shapes (key interfaces)

```ts
// IInterviewGuide — the full generated guide
interface IInterviewGuide {
  id: string;
  candidateName: string;
  roleName: string;
  provider: TProvider;
  generatedAt: string;
  totalDurationMinutes: number;
  interviewType: TInterviewType;
  openingNotes: string;
  closingNotes: string;
  sections: IInterviewSection[];
  candidate: ICandidate;
  cvText: string;
  jobDescription: string;
}

// IHistoryEntry — lightweight card for history list
interface IHistoryEntry {
  id: string;
  candidateName: string;
  roleName: string;
  interviewType: TInterviewType;
  provider: TProvider;
  totalQuestions: number;
  createdAt: string;
}

// IGeneratePayload — POST /api/interview/generate body
interface IGeneratePayload {
  cvText: string
  jobDescription: string
  provider: TProvider
  interviewType: TInterviewType
}
```

## Build & Dev

```bash
pnpm dev         # start dev server
pnpm build       # production build
pnpm lint:fix    # ESLint auto-fix
pnpm format      # Prettier + Stylelint + ESLint
DEBUG_LLM=true pnpm dev  # enable LLM request/response logging
```

## Environment Variables

```
ANTHROPIC_API_KEY    # Required for Anthropic provider
OPENAI_API_KEY       # Required for OpenAI provider
GEMINI_API_KEY       # Required for Gemini provider (or use ADC)
GOOGLE_APPLICATION_CREDENTIALS  # Path to service account JSON (Gemini ADC)
DEFAULT_LLM_PROVIDER             # Override default provider (default: gemini)
DEBUG_LLM                        # Set true to write server/logs/llm.jsonl
```

Never commit `.env` or service account JSON files.

## Notes

- The in-memory `guideStore` resets on server restart. Replace with Drizzle + SQLite/Postgres for production.
- `pdf-parse` and `mammoth` are runtime dependencies used by `server/api/extract-text.post.ts`; keep them in `dependencies` (not `devDependencies`) for production CV extraction.
- Always run `validateGuide()` on parsed LLM output before storing in `guideStore`.
