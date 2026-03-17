---
description: "Use when creating or editing Nitro server API handlers — covers guideStore access, Zod validation, LLM provider patterns, three-tier parse fallback, error handling, and debug logging"
applyTo: "server/api/**/*.ts"
---

# Server API Handler Guidelines

## guideStore

The in-memory guide store lives in `server/api/interview/generate.post.ts`. Import it by name — never re-declare it:

```ts
import { guideStore } from '~/server/api/interview/generate.post'
```

Always check for existence before reading; return an H3 error when not found:

```ts
const guide = guideStore.get(id)
if (!guide) {
  throw createError({ statusCode: 404, message: `Guide ${id} not found` })
}
```

## Zod Validation

Every parsed LLM output **must** pass through `validateGuide()` before being stored. Import from `#server/validation/guideSchema`:

```ts
import { validateGuide } from '#server/validation/guideSchema'

const result = validateGuide(parsed)
if (!result.success) {
  // log and fall through to fallback — never store invalid guides
}
```

The schema uses `.strict()` — unknown keys cause validation failures, so normalise the shape before calling `validateGuide`.

## Three-Tier Parse Fallback

When working with LLM responses, implement the same fallback chain used in `generate.post.ts`:

1. **Direct parse** — `JSON.parse(rawText)`
2. **Extract balanced JSON** — find the first `{` and extract to matching `}`
3. **Regenerate** — one retry with an explicit prompt correction
4. **Safe fallback** — return a minimal but schema-valid `IInterviewGuide`; the UI must never receive a 500 from a parse failure

## LLM Client Initialisation

All provider clients are lazy-initialised (created on first use, not at module load). Follow the same pattern:

```ts
let _client: AnthropicClient | undefined

function getClient(): AnthropicClient {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}
```

## Error Handling

Always `try/catch` with `err: unknown`. Return H3 errors for expected failures; log unexpected ones:

```ts
try {
  // handler logic
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  throw createError({ statusCode: 500, message })
}
```

Never `catch (err: any)` and never re-throw raw unknown values.

## Debug Logging

Use `logLLM()` from `#server/utils/llmLogger` — it only writes when `DEBUG_LLM=true`:

```ts
import { logLLM } from '#server/utils/llmLogger'

logLLM({ provider: 'anthropic', prompt: systemPrompt, response: rawText })
```

Log at minimum: the raw prompt, the raw response, and any parse error details. This makes debugging LLM output straightforward.

## Type Imports

Always use explicit `type` imports for interfaces — never mix type and value imports:

```ts
import type { IInterviewGuide, TProvider } from '~/types/index'
```

## Method Routing

For handlers that serve multiple HTTP methods from one file, branch on `event.method`:

```ts
if (event.method === 'GET') { ... }
else if (event.method === 'DELETE') { ... }
else { throw createError({ statusCode: 405, message: 'Method Not Allowed' }) }
```
