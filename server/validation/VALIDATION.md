# LLM Guide Validation — Zod schema & checks

This document explains the validation rules applied to LLM-generated interview guides, the expected schema fields, how validation failures are handled, and where logs are written.

Primary resources:

- Schema implementation: [server/validation/guideSchema.ts](server/validation/guideSchema.ts)
- Validation + retry flow: [server/api/interview/generate.post.ts](server/api/interview/generate.post.ts)
- LLM logging helper: [server/utils/llmLogger.ts](server/utils/llmLogger.ts)

---

## Purpose

We validate the JSON produced by LLM providers to ensure the application receives a predictable, strongly-typed `IInterviewGuide` object before storing or using it in the UI. Validation helps detect malformed output, avoid runtime errors, and provide actionable feedback (and a single automatic regenerate attempt) when the model output doesn't meet expectations.

## High-level flow

1. The endpoint receives the raw LLM string response.
2. `parseGuideResponse(raw, payload)` attempts to clean common artifacts (code fences) and `JSON.parse` the content. It also applies a few lightweight patches (e.g. ensure `candidate.name` exists, convert string questions into question objects with defaults).
3. The parsed object is validated with Zod using `GuideSchema` (via `validateGuide`).
4. If validation fails, the system logs validation errors and raw output and performs one automatic regenerate attempt for the same payload.
5. The regenerated response is parsed and validated again. If it still fails, the endpoint returns a 422 with a mapped, client-friendly list of errors and a `requestId` for troubleshooting.

---

## GuideSchema (top-level) — expected fields

See [server/validation/guideSchema.ts](server/validation/guideSchema.ts) for the authoritative implementation. Summary:

- `id` (string) — UUID assigned by the server (required).
- `generatedAt` (string) — ISO timestamp when the guide was produced (required).
- `provider` (string) — provider name (e.g. `anthropic`, `openai`, `gemini`) (required).
- `interviewType` (string) — `technical | behavioural | mixed` (required by usage; schema accepts string).
- `cvText` (string | optional) — original CV snippet (optional; may be present for traceability).
- `jobDescription` (string | optional) — optional job description (optional; may be present for traceability).
- `candidateName` (string | optional) — top-level candidate name (optional).
- `roleName` (string | optional) — role name (optional).
- `totalDurationMinutes` (number, integer >= 0) — total estimated duration of the interview (required).
- `openingNotes` (string, default '') — optional text.
- `closingNotes` (string, default '') — optional text.
- `candidate` (object) — `CandidateSchema` (required).
- `sections` (array of `SectionSchema`) — must contain at least one section (required).

Note: `GuideSchema` is `.strict()`, so extra unexpected top-level properties will cause validation errors.

### CandidateSchema

- `name` (string) — required. `parseGuideResponse` attempts to patch this from `candidateName` when missing.
- `currentRole` (string, default '') — optional.
- `totalExperience` (string, default '') — optional.
- `location` (string, default '') — optional.
- `education` (string, default '') — optional.
- `skills` (string[], default []) — optional.

### SectionSchema

- `title` (string, min length 1) — required.
- `description` (string, optional, default '').
- `durationMinutes` (integer, >= 0, default 0).
- `questions` (array of `QuestionSchema`, min length 1) — required.

### QuestionSchema

- `id` (string) — required.
- `question` (string, min length 1) — required (the actual question text).
- `category` (enum) — one of `technical`, `behavioural`, `situational`, `culture`, `leadership`, `problemSolving`.
- `difficulty` (enum) — `easy`, `medium`, or `hard`.
- `rationale` (string, optional, default '').
- `followUps` (string[], optional, default []).
- `evaluationCriteria` (string[], optional, default []).
- `estimatedMinutes` (integer, >= 0, default 5).
- `sampleAnswer` (string, optional, default '').

`QuestionSchema` is `.strict()` as well: unexpected fields on a question will trigger validation errors. Note that `parseGuideResponse` attempts to convert string-typed questions into objects and add sensible defaults, but the LLM output should ideally already match the object shape.

---

## Validation failures — logging & client-visible errors

- All validation failures are logged via `logLLM()` to `server/logs/llm.jsonl` along with the `rawResponse` and a `requestId` so you can correlate logs with client errors. See [server/utils/llmLogger.ts](server/utils/llmLogger.ts).
- The first validation failure is logged with `failedAt: 'validation_initial'`.
- The server will attempt one regenerate and log `regenerate` attempts and their outcomes (`parse_regen`, `validation_regen`), including timings.
- If validation still fails after the single regenerate, the server responds with HTTP 422 and a helpful payload: `{ requestId, errors: [{ path, message }, ...] }`. Example:

```json
{
  "requestId": "47ccc15b-80aa-48b5-8c3b-2839d347f613",
  "errors": [
    { "path": "sections.0.questions.2.question", "message": "String must contain at least 1 character" },
    { "path": "candidate.name", "message": "Required" }
  ]
}
```

This mapping is derived from Zod error entries and preserves a simple `path` (dot-notation) and `message` for display or debugging in the client.

---

## Where to look for logs

- File logger: `server/logs/llm.jsonl` (JSONL, one object per line). Use:

```bash
tail -n 200 server/logs/llm.jsonl
```

- Logger implementation: [server/utils/llmLogger.ts](server/utils/llmLogger.ts)

Notes: logs include small `cvSnippet` / `jobSnippet` fields (first ~200 chars) to aid debugging — avoid exposing full PII-sensitive content in production logs.

---

## Recommendations and next improvements

- Consider stricter checks for counts and lengths expected by the UI (for example, enforce 3–4 sections and 3–5 questions each) if the UI relies on that shape.
- Run moderation/safety checks against the rawResponse to detect PII or harmful content before storing or returning the guide.
- Consider redacting or hashing CV content before logging in production to protect candidate data.
- For high reliability, convert Zod schemas to generated TypeScript types (already done via `z.infer`) and/or add unit tests that validate common LLM edge-case outputs.
- If needed, increase the retry strategy (exponential backoff, more attempts) and add a circuit-breaker to avoid repeated failed calls against a provider.

---

If you want, I can:

- Add unit tests for `parseGuideResponse` and the Zod schema, including sample malformed LLM outputs and expected mapped errors.
- Wire logs to Sentry/Datadog with GDPR-safe redaction for CVs.
