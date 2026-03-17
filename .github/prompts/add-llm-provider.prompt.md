---
description: "Add a new LLM provider (e.g. Mistral, Cohere, Ollama) to the interview guide generator"
argument-hint: "Provider name and SDK/API details (e.g. 'Mistral using @mistralai/mistralai SDK, key MISTRAL_API_KEY')"
agent: agent
---

Wire a new LLM provider into the nuxt4-interview-prep application following the project's established 5-step pattern.

**Provider details**: ${input}

## Steps

Follow the `llm-provider` agent workflow in order:

1. **`app/types/index.ts`** — add the provider name to the `TProvider` union
2. **`server/api/interview/generate.post.ts`** — add lazy-init client, handler function, and `switch` case; validate output with `validateGuide()`; log with `logLLM()`
3. **`app/composables/useInterviewGuide.ts`** — add `providerLabel()` mapping
4. **`app/pages/index.vue`** — add entry to the `providers` selector array
5. **Env config** — if a new env variable is needed, add it to `.env.example` and the README env section, and read it from `process.env` in server handlers (to match existing providers). Only add a `runtimeConfig` key in `nuxt.config.ts` if you also migrate the corresponding server code to use `useRuntimeConfig()`.

After completing all steps, verify there are no TypeScript errors and that the `TProvider` union, switch cases, and UI labels are all consistent.
