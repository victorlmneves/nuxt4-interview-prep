import type { TProvider, TInterviewType, IInterviewGuide, IHistoryEntry, IGeneratePayload } from '~/types/index';

export function useInterviewGuide() {
    async function generate(payload: IGeneratePayload): Promise<void> {
        isLoading.value = true;
        error.value = null;

        try {
            const data = await $fetch<IInterviewGuide>('/api/interview/generate', {
                method: 'POST',
                body: payload,
            });

            result.value = data;
        } catch (err: any) {
            error.value = err?.message || 'Failed to generate guide.';
        } finally {
            isLoading.value = false;
        }
    }

    // ── History management ─────────────────────────────────────────────
    async function deleteFromHistory(id: string): Promise<void> {
        history.value = history.value.filter((entry) => entry.id !== id);

        // Optionally, call API to persist deletion
        try {
            await $fetch(`/api/interview/history`, {
                method: 'DELETE',
                body: { id },
            });
        } catch {}
    }

    async function clearHistory(): Promise<void> {
        history.value = [];

        // Optionally, call API to persist clearing
        try {
            await $fetch(`/api/interview/history`, {
                method: 'DELETE',
                body: { all: true },
            });
        } catch {}
    }

    function reset(): void {
        result.value = null;
        error.value = null;
        progress.value = 0;
    }

    const result = ref<IInterviewGuide | null>(null);
    const isLoading = ref(false);
    const isHistoryLoading = ref(false);
    const error = ref<string | null>(null);
    const progress = ref(0);
    const history = ref<IHistoryEntry[]>([]);

    // ── Progress simulation ──────────────────────────────────────────────
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    function startProgress(): void {
        progress.value = 0;
        progressInterval = setInterval(() => {
            if (progress.value < 85) {
                progress.value += Math.random() * 8;
            }
        }, 400);
    }

    function finishProgress(): void {
        if (progressInterval !== null) {
            clearInterval(progressInterval);
            progressInterval = null;
        }

        progress.value = 100;
    }

    // ── History ─────────────────────────────────────────────────────────
    async function loadHistory(): Promise<void> {
        isHistoryLoading.value = true;

        try {
            const data = await $fetch<IHistoryEntry[]>('/api/interview/history');

            history.value = data;
        } catch {
            history.value = [];
        } finally {
            isHistoryLoading.value = false;
        }
    }

    async function loadGuide(id: string): Promise<void> {
        isLoading.value = true;
        error.value = null;

        try {
            const data = await $fetch<IInterviewGuide>(`/api/interview/guide/${id}`);

            result.value = data;
        } catch {
            error.value = 'Failed to load guide.';
        } finally {
            isLoading.value = false;
        }
    }

    function interviewTypeLabel(type: string): string {
        switch (type) {
            case 'technical':
                return 'Technical';
            case 'behavioural':
                return 'Behavioural';
            case 'mixed':
                return 'Mixed';
            default:
                return 'Unknown';
        }
    }

    function providerLabel(provider: string): string {
        switch (provider) {
            case 'anthropic':
                return 'Anthropic';
            case 'gpt-4o':
                return 'GPT-4o';
            case 'gemini':
                return 'Gemini';
            default:
                return 'Unknown';
        }
    }

    function categoryColor(category: string): string {
        switch (category) {
            case 'technical':
                return '#2d5be3';
            case 'behavioural':
                return '#1a8c4e';
            case 'situational':
                return '#c47c10';
            case 'culture':
                return '#7c3aed';
            case 'leadership':
                return '#0369a1';
            case 'problemSolving':
                return '#c42b1a';
            default:
                return '#6b6860';
        }
    }

    function difficultyColor(difficulty: string): string {
        switch (difficulty) {
            case 'easy':
                return '#1a8c4e';
            case 'medium':
                return '#c47c10';
            case 'hard':
                return '#c42b1a';
            default:
                return '#6b6860';
        }
    }

    return {
        result,
        isLoading,
        isHistoryLoading,
        error,
        progress,
        history,
        loadHistory,
        loadGuide,
        interviewTypeLabel,
        providerLabel,
        categoryColor,
        difficultyColor,
        generate,
        deleteFromHistory,
        clearHistory,
        reset,
    };
}
