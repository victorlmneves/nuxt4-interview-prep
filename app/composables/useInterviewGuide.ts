import type { IInterviewGuide, IHistoryEntry, IGeneratePayload } from '~/types/index';

export function useInterviewGuide() {
    const result = ref<IInterviewGuide | null>(null);
    const isLoading = ref(false);
    const isHistoryLoading = ref(false);
    const error = ref<string | null>(null);
    const progress = ref(0);
    const history = ref<IHistoryEntry[]>([]);

    // LocalStorage keys
    const HISTORY_KEY = 'interview_history';
    const GUIDES_KEY = 'interview_guides';

    // Save history and guides to localStorage
    function saveHistoryToLocalStorage() {
        try {
            // eslint-disable-next-line
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value));
        } catch {
            console.warn('Failed to save history to localStorage.');
        }
    }

    function saveGuideToLocalStorage(guide: IInterviewGuide) {
        try {
            const raw = localStorage.getItem(GUIDES_KEY);
            const guides = raw ? JSON.parse(raw) : {};

            guides[guide.id] = guide;

            // eslint-disable-next-line
            localStorage.setItem(GUIDES_KEY, JSON.stringify(guides));
        } catch {
            console.warn('Failed to save guide to localStorage.');
        }
    }

    function loadHistoryFromLocalStorage() {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);

            history.value = raw ? JSON.parse(raw) : [];
        } catch {
            history.value = [];
        }
    }

    function loadGuideFromLocalStorage(id: string): IInterviewGuide | null {
        try {
            const raw = localStorage.getItem(GUIDES_KEY);

            if (!raw) {
                return null;
            }

            const guides = JSON.parse(raw);

            return guides[id] || null;
        } catch {
            return null;
        }
    }

    // ── Guide generation ─────────────────────────────────────────────
    async function generate(payload: IGeneratePayload): Promise<void> {
        isLoading.value = true;
        error.value = null;
        startProgress();

        try {
            const data = await $fetch<IInterviewGuide>('/api/interview/generate', {
                method: 'POST',
                body: payload,
            });

            result.value = data;
            finishProgress();

            // Add to history
            const entry: IHistoryEntry = {
                id: data.id,
                candidateName: data.candidateName,
                roleName: data.roleName,
                interviewType: data.interviewType,
                provider: data.provider,
                totalQuestions: data.sections.reduce((acc, s) => acc + s.questions.length, 0),
                createdAt: data.generatedAt,
            };

            history.value.unshift(entry);
            saveHistoryToLocalStorage();
            saveGuideToLocalStorage(data);
        } catch (err: unknown) {
            error.value = (err as { message?: string })?.message || 'Failed to generate guide.';
            finishProgress();
        } finally {
            isLoading.value = false;
        }
    }

    // ── History management ─────────────────────────────────────────────
    async function deleteFromHistory(id: string): Promise<void> {
        history.value = history.value.filter((entry) => entry.id !== id);
        saveHistoryToLocalStorage();

        // Also remove guide from localStorage
        try {
            const raw = localStorage.getItem(GUIDES_KEY);

            if (raw) {
                const guides = JSON.parse(raw);

                delete guides[id];

                // eslint-disable-next-line
                localStorage.setItem(GUIDES_KEY, JSON.stringify(guides));
            }
        } catch {
            console.warn('Failed to delete guide from localStorage.');
        }
    }

    async function clearHistory(): Promise<void> {
        history.value = [];
        saveHistoryToLocalStorage();
        localStorage.removeItem(GUIDES_KEY);
    }

    async function loadHistory(): Promise<void> {
        isHistoryLoading.value = true;
        loadHistoryFromLocalStorage();
        isHistoryLoading.value = false;
    }

    async function loadGuide(id: string): Promise<void> {
        isLoading.value = true;
        error.value = null;

        // Use helper to load from localStorage
        const guide = loadGuideFromLocalStorage(id);

        if (guide) {
            result.value = guide;
            isLoading.value = false;

            return;
        }

        // Fallback to API if not found locally
        try {
            const data = await $fetch<IInterviewGuide>(`/api/interview/guide/${id}`);

            result.value = data;
        } catch {
            error.value = 'Failed to load guide.';
        } finally {
            isLoading.value = false;
        }
    }

    function reset(): void {
        result.value = null;
        error.value = null;
        progress.value = 0;
    }

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

    // ── Label helpers ──────────────────────────────────────────────────
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
