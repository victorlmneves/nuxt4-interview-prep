<script setup lang="ts">
import { useInterviewGuide } from '~/composables/useInterviewGuide';
import { useDateFormat } from '~/composables/useDateFormat';
import type { IHistoryEntry } from '~/types/index';

const { history, isHistoryLoading, loadGuide, deleteFromHistory, clearHistory, interviewTypeLabel, providerLabel } = useInterviewGuide();

const { formatDateTime } = useDateFormat();

const router = useRouter();

async function openGuide(entry: IHistoryEntry): Promise<void> {
    await router.push(`/interview/${entry.id}`);
}

defineOptions({
    name: 'HistoryPage',
});
</script>

<template>
    <div class="app-shell">
        <AppHeader>
            <NuxtLink to="/" class="nav-btn">← New Guide</NuxtLink>
        </AppHeader>

        <main class="main-content">
            <div class="history-page animate-fade-up">
                <div class="history-page__header">
                    <h1 class="history-page__title font-serif">Interview History</h1>

                    <button v-if="history.length > 0" class="text-btn text-btn--danger" @click="clearHistory">Clear all</button>
                </div>

                <div v-if="isHistoryLoading" class="history-page__loading">
                    <div v-for="i in 5" :key="i" class="history-page__skeleton">
                        <div class="skeleton skeleton--name" />
                        <div class="skeleton skeleton--meta" />
                    </div>
                </div>

                <div v-else-if="history.length === 0" class="history-page__empty">
                    <p class="font-serif">No guides yet.</p>
                    <NuxtLink to="/" class="nav-btn">Generate your first guide →</NuxtLink>
                </div>

                <div v-else class="history-page__grid">
                    <div v-for="entry in history" :key="entry.id" class="history-entry" @click="openGuide(entry)">
                        <div class="history-entry__avatar font-serif">
                            {{ entry.candidateName?.charAt(0) ?? '?' }}
                        </div>

                        <div class="history-entry__body">
                            <strong class="history-entry__name">{{ entry.candidateName }}</strong>
                            <span class="history-entry__role">{{ entry.roleName }}</span>

                            <div class="history-entry__chips">
                                <span class="history-entry__chip font-mono">
                                    {{ interviewTypeLabel(entry.interviewType) }}
                                </span>
                                <span class="history-entry__chip font-mono">
                                    {{ providerLabel(entry.provider) }}
                                </span>
                                <span class="history-entry__chip font-mono">{{ entry.totalQuestions }} questions</span>
                            </div>
                        </div>

                        <div class="history-entry__right">
                            <span class="history-entry__date font-mono">
                                {{ formatDateTime(entry.createdAt) }}
                            </span>
                            <button class="history-entry__delete" title="Delete" @click.stop="deleteFromHistory(entry.id)">✕</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped lang="scss">
.history-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    &__header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
    }

    &__title {
        font-size: 2rem;
        letter-spacing: -0.03em;
    }

    &__loading {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    &__skeleton {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 10px;
    }

    &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        padding: 4rem 0;
        color: var(--ink-muted);
        text-align: center;

        p {
            font-size: 1.2rem;
        }
    }

    &__grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
}

.skeleton {
    border-radius: 4px;
    background: var(--border);
    animation: pulse 1.5s infinite;

    &--name {
        height: 16px;
        width: 60%;
    }

    &--meta {
        height: 12px;
        width: 40%;
    }
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.45;
    }
}

.history-entry {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    transition:
        border-color 0.15s,
        box-shadow 0.15s;

    &:hover {
        border-color: var(--accent);
        box-shadow: 0 2px 12px rgb(0 0 0 / 0.04);
    }

    &__avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--accent);
        color: var(--paper);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
        min-width: 0;
    }

    &__name {
        font-size: 0.95rem;
    }

    &__role {
        font-size: 0.8rem;
        color: var(--ink-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-top: 0.25rem;
    }

    &__chip {
        font-size: 0.65rem;
        padding: 2px 8px;
        border: 1px solid var(--border);
        border-radius: 20px;
        color: var(--ink-muted);
    }

    &__right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
        flex-shrink: 0;
    }

    &__date {
        font-size: 0.7rem;
        color: var(--ink-muted);
    }

    &__delete {
        background: none;
        border: none;
        font-size: 0.75rem;
        cursor: pointer;
        color: var(--ink-muted);
        opacity: 0.4;
        transition: opacity 0.15s;

        &:hover {
            opacity: 1;
            color: var(--red);
        }
    }
}

.nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--ink);
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;

    &:hover {
        border-color: var(--accent);
        color: var(--accent);
    }
}

.text-btn {
    background: none;
    border: none;
    font-size: 0.8rem;
    cursor: pointer;

    &--danger {
        color: var(--red);

        &:hover {
            text-decoration: underline;
        }
    }
}

.animate-fade-up {
    animation: fadeUp 0.35s ease both;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
