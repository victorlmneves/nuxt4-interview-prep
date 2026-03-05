import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { randomUUID } from 'node:crypto';
import { logLLM } from '#server/utils/llmLogger';
import { validateGuide } from '#server/validation/guideSchema';
import type { IInterviewGuide, IGeneratePayload } from '~/types/index';

const client = new Anthropic();

function buildSystemPrompt(): string {
    return `You are an expert technical recruiter and interview coach. 
Your task is to generate a structured, personalised interview guide based on a candidate's CV and the job description provided.

Always respond with valid JSON only — no markdown, no extra text.

The JSON must follow this exact structure:
{
  "candidateName": string,
  "roleName": string,
  "totalDurationMinutes": number,
  "openingNotes": string,
  "closingNotes": string,
  "candidate": {
    "name": string,
    "currentRole": string,
    "totalExperience": string,
    "location": string,
    "education": string,
    "skills": string[]
  },
  "sections": [
    {
      "title": string,
      "description": string,
      "durationMinutes": number,
      "questions": [
        {
          "id": string,
          "question": string,
          "category": "technical" | "behavioural" | "situational" | "culture" | "leadership" | "problemSolving",
          "difficulty": "easy" | "medium" | "hard",
          "rationale": string,
          "followUps": string[],
          "evaluationCriteria": string[],
          "estimatedMinutes": number
        }
      ]
    }
  ]
}`;
}

function buildUserPrompt(payload: IGeneratePayload): string {
    const typeInstruction =
        payload.interviewType === 'technical'
            ? 'Focus primarily on technical questions (70% technical, 30% behavioural).'
            : payload.interviewType === 'behavioural'
              ? 'Focus primarily on behavioural questions (70% behavioural, 30% technical).'
              : 'Balance technical and behavioural questions equally (50/50).';

    return `Generate a comprehensive interview guide for the following candidate and role.

${typeInstruction}

Generate 3-4 sections with 3-5 questions each. Make questions specific to the candidate's experience and the role requirements.

--- CANDIDATE CV ---
${payload.cvText}

--- JOB DESCRIPTION ---
${payload.jobDescription}`;
}

async function generateWithAnthropic(payload: IGeneratePayload): Promise<string> {
    const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: buildSystemPrompt(),
        messages: [
            {
                role: 'user',
                content: buildUserPrompt(payload),
            },
        ],
    });

    const block = message.content[0];

    if (block?.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
    }

    return block.text;
}

function parseGuideResponse(raw: string, payload: IGeneratePayload): IInterviewGuide {
    const cleaned = raw
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    const parsed = JSON.parse(cleaned);

    // Patch missing candidate/candidate.name
    if (!parsed.candidate) {
        parsed.candidate = {};
    }

    if (typeof parsed.candidate.name !== 'string') {
        parsed.candidate.name = parsed.candidateName || 'Unknown';
    }

    // Patch questions: convert string questions to objects and fill missing fields
    if (Array.isArray(parsed.sections)) {
        parsed.sections = parsed.sections.map((section, sectionIdx) => {
            if (Array.isArray(section.questions)) {
                section.questions = section.questions.map((q, i) => {
                    // Convert string to object
                    const obj =
                        typeof q === 'string'
                            ? {
                                  id: `${sectionIdx + 1}-${i + 1}`,
                                  question: q,
                                  category: 'technical',
                                  difficulty: 'medium',
                                  rationale: '',
                                  followUps: [],
                                  evaluationCriteria: [],
                                  estimatedMinutes: 5,
                                  sampleAnswer: '',
                              }
                            : q;

                    // Patch missing fields
                    obj.id = obj.id ?? `${sectionIdx + 1}-${i + 1}`;
                    obj.question = obj.question ?? '';
                    obj.category = obj.category ?? 'technical';
                    obj.difficulty = obj.difficulty ?? 'medium';
                    obj.rationale = obj.rationale ?? '';
                    obj.followUps = Array.isArray(obj.followUps) ? obj.followUps : [];
                    obj.evaluationCriteria = Array.isArray(obj.evaluationCriteria) ? obj.evaluationCriteria : [];
                    obj.estimatedMinutes = typeof obj.estimatedMinutes === 'number' ? obj.estimatedMinutes : 5;
                    obj.sampleAnswer = obj.sampleAnswer ?? '';

                    return obj;
                });
            }

            return section;
        });
    }

    return {
        id: randomUUID(),
        generatedAt: new Date().toISOString(),
        provider: payload.provider,
        interviewType: payload.interviewType,
        cvText: payload.cvText,
        jobDescription: payload.jobDescription,
        ...parsed,
    } as IInterviewGuide;
}

// In-memory store — replace with DB in production
const guideStore = new Map<string, IInterviewGuide>();

export default defineEventHandler(async (event) => {
    const body = await readBody<IGeneratePayload>(event);

    if (!body.cvText || !body.jobDescription) {
        throw createError({ statusCode: 400, statusMessage: 'CV text and job description are required.' });
    }

    if (!body.provider) {
        throw createError({ statusCode: 400, statusMessage: 'Provider is required.' });
    }

    const requestId = randomUUID();
    const startMs = Date.now();
    let rawResponse: string;
    let modelName = '';

    if (body.provider === 'anthropic') {
        modelName = 'claude-sonnet-4-20250514';
        rawResponse = await generateWithAnthropic(body);
    } else if (body.provider === 'openai') {
        modelName = 'gpt-4o'; // placeholder name for logs
        rawResponse = await generateWithGPT4o(body);
    } else if (body.provider === 'gemini') {
        modelName = 'gemini-2.5-flash';
        rawResponse = await generateWithGemini(body);
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: `Unknown AI provider: ${body.provider}`,
        });
    }

    const durationMs = Date.now() - startMs;

    // Log raw LLM output (best-effort, redacting long inputs)
    await logLLM({
        id: requestId,
        provider: body.provider,
        model: modelName,
        durationMs,
        rawResponse,
        cvSnippet: typeof body.cvText === 'string' ? body.cvText.slice(0, 200) : null,
        jobSnippet: typeof body.jobDescription === 'string' ? body.jobDescription.slice(0, 200) : null,
    });

    // Placeholder Gemini handler
    async function generateWithGemini(payload) {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw createError({ statusCode: 500, statusMessage: 'Gemini API key not set.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // System prompt for interview guide generation
        const SYSTEM_PROMPT = `You are an expert technical interviewer and recruiter. Given a candidate CV and job description, generate a structured interview guide in valid JSON. The guide should include:
     - Candidate summary
     - Opening notes
     - Sections (with questions)
     - Closing notes
     For each technical question, include a 'sampleAnswer' field with a model answer that demonstrates the expected depth and quality for a senior candidate.
     Return ONLY valid JSON — no markdown, no preamble.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        });

        // Build prompt from payload
        const prompt = `Generate an interview guide for the following candidate and job description in JSON format.\n\nCandidate CV:\n${payload.candidateText}\n\nJob Description:\n${payload.jobDescription}\n\nInterview type: ${payload.interviewType}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Expecting the model to return a JSON string
        return text;
    }

    // Placeholder GPT-4o handler
    async function generateWithGPT4o(payload) {
        // TODO: Implement GPT-4o API call
        return JSON.stringify({
            candidateName: 'GPT-4o Candidate',
            roleName: 'GPT-4o Role',
            interviewType: payload.interviewType || 'mixed',
            provider: 'openai',
            generatedAt: new Date().toISOString(),
            sections: [],
            candidate: {
                name: payload.candidateText || '',
                totalExperience: '',
                location: '',
                education: '',
            },
            totalDurationMinutes: 0,
            openingNotes: '',
            closingNotes: '',
        });
    }

    let guide;

    try {
        guide = parseGuideResponse(rawResponse, body);
    } catch (err: unknown) {
        // Log parse errors with the raw response
        await logLLM({
            id: requestId,
            provider: body.provider,
            error: { message: (err as Error).message, stack: (err as Error).stack },
            rawResponse,
            failedAt: 'parse',
        });

        throw createError({ statusCode: 500, statusMessage: 'Failed to parse LLM response' });
    }

    // Validate parsed guide against Zod schema
    const firstValidation = validateGuide(guide);

    if (!firstValidation.success) {
        // Log validation failure and raw response
        await logLLM({
            id: requestId,
            provider: body.provider,
            validationErrors: firstValidation.error.errors,
            rawResponse,
            failedAt: 'validation_initial',
        });

        // Attempt a single automatic regenerate to recover from malformed output
        const maxRetries = 1;
        let attempt = 0;
        let validated = false;
        let lastValidation = firstValidation;

        while (attempt < maxRetries && !validated) {
            attempt += 1;
            const regenStart = Date.now();
            let newRaw: string;

            try {
                if (body.provider === 'anthropic') {
                    newRaw = await generateWithAnthropic(body);
                } else if (body.provider === 'openai') {
                    newRaw = await generateWithGPT4o(body);
                } else if (body.provider === 'gemini') {
                    newRaw = await generateWithGemini(body);
                } else {
                    break;
                }
            } catch (err: unknown) {
                await logLLM({
                    id: requestId,
                    provider: body.provider,
                    attempt,
                    error: { message: (err as Error).message, stack: (err as Error).stack },
                    failedAt: 'regenerate_call',
                });

                break;
            }

            const regenDuration = Date.now() - regenStart;

            await logLLM({
                id: requestId,
                provider: body.provider,
                attempt,
                regenDuration,
                rawResponse: newRaw,
                note: 'regenerate attempt',
            });

            try {
                guide = parseGuideResponse(newRaw, body);
            } catch (err: unknown) {
                await logLLM({
                    id: requestId,
                    provider: body.provider,
                    attempt,
                    error: { message: (err as Error).message, stack: (err as Error).stack },
                    rawResponse: newRaw,
                    failedAt: 'parse_regen',
                });

                continue;
            }

            const secondValidation = validateGuide(guide);

            if (!secondValidation.success) {
                await logLLM({
                    id: requestId,
                    provider: body.provider,
                    attempt,
                    validationErrors: secondValidation.error.errors,
                    rawResponse: newRaw,
                    failedAt: 'validation_regen',
                });
                lastValidation = secondValidation;

                continue;
            }

            validated = true;

            break;
        }

        if (!validated) {
            // Map zod errors for client-friendly output
            const mapped = lastValidation.error.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));

            await logLLM({ id: requestId, provider: body.provider, mappedValidationErrors: mapped, failedAt: 'validation_failed' });

            throw createError({
                statusCode: 422,
                statusMessage: 'LLM response failed schema validation',
                data: { requestId, errors: mapped } as Record<string, unknown>,
            });
        }
    }

    guideStore.set(guide.id, guide);

    return guide;
});

export { guideStore };
