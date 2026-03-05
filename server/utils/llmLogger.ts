import { appendFile, mkdir, stat, rename } from 'node:fs/promises';
import path from 'node:path';

const LOG_DIR = path.join(process.cwd(), 'server', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'llm.jsonl');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ENTRY_BYTES = 512 * 1024; // 512 KB
const TRUNCATE_PROMPT = 10_000;
const TRUNCATE_RESPONSE = 20_000;

export type LLMLogEntry = {
    requestId?: string;
    provider?: string;
    prompt?: string;
    response?: unknown;
    error?: string;
    meta?: Record<string, unknown>;
};

function truncateString(s: string, limit: number) {
    return s.length > limit ? s.slice(0, limit) + '... [truncated]' : s;
}

function sanitizeEntry(entry: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    if (entry.requestId != null) {
        out.requestId = String(entry.requestId);
    }

    if (entry.provider != null) {
        out.provider = String(entry.provider);
    }

    if (entry.prompt != null) {
        out.prompt = truncateString(String(entry.prompt), TRUNCATE_PROMPT);
    }

    if (entry.error != null) {
        out.error = truncateString(String(entry.error), TRUNCATE_PROMPT);
    }

    if (entry.meta != null && typeof entry.meta === 'object') {
        out.meta = entry.meta as Record<string, unknown>;
    }

    if (entry.response != null) {
        if (typeof entry.response === 'string') {
            out.response = truncateString(entry.response, TRUNCATE_RESPONSE);
        } else if (typeof entry.response === 'object') {
            try {
                const respStr = JSON.stringify(entry.response);

                if (respStr.length > TRUNCATE_RESPONSE) {
                    const keys = Object.keys(entry.response as Record<string, unknown>).slice(0, 5);

                    out.response = `[object truncated; keys=${keys.join(',')}]`;
                } else {
                    out.response = entry.response;
                }
            } catch {
                out.response = '[unserializable response]';
            }
        } else {
            out.response = String(entry.response);
        }
    }

    return out;
}

export async function logLLM(entry: Record<string, unknown>): Promise<void> {
    // Only log if DEBUG_LLM is explicitly set to true
    if (!process.env.DEBUG_LLM || process.env.DEBUG_LLM === 'false') {
        return;
    }

    try {
        await mkdir(LOG_DIR, { recursive: true });

        // rotate the log if it exceeds the configured size
        try {
            const st = await stat(LOG_FILE);

            if (st.size >= MAX_LOG_SIZE) {
                const ts = new Date().toISOString().replace(/[:.]/g, '-');
                const rotated = path.join(LOG_DIR, `llm-${ts}.jsonl`);

                await rename(LOG_FILE, rotated);
            }
        } catch (err: unknown) {
            if (err instanceof Error && 'code' in err && err.code !== 'ENOENT') {
                console.warn('llmLogger: failed to stat/rotate log file', err);
            }
            // ignore ENOENT (file doesn't exist yet)
        }

        const sanitized = sanitizeEntry(entry);
        const payload: Record<string, unknown> = {
            ...sanitized,
            loggedAt: new Date().toISOString(),
        };
        let line = JSON.stringify(payload) + '\n';

        if (Buffer.byteLength(line, 'utf8') > MAX_ENTRY_BYTES) {
            // shrink largest fields and try again
            if (payload.prompt) {
                payload.prompt = truncateString(String(payload.prompt), TRUNCATE_PROMPT / 2);
            }

            if (payload.response) {
                payload.response = '[truncated]';
            }

            line = JSON.stringify(payload) + '\n';
        }

        await appendFile(LOG_FILE, line, 'utf8');
    } catch (err) {
        // Best-effort fallback to console if file write fails
        console.error('Failed to write LLM log:', err);
    }
}
