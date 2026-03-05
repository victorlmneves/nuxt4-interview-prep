import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const LOG_DIR = path.join(process.cwd(), 'server', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'llm.jsonl');

export async function logLLM(entry: Record<string, string | number | boolean | null>): Promise<void> {
    try {
        await mkdir(LOG_DIR, { recursive: true });
        const line = JSON.stringify({ ...entry, loggedAt: new Date().toISOString() }) + '\n';

        await appendFile(LOG_FILE, line, 'utf8');
    } catch (err) {
        // Best-effort fallback to console if file write fails
        console.error('Failed to write LLM log:', err);
    }
}
