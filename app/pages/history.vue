<script setup lang="ts">
import { useInterviewGuide } from '~/composables/useInterviewGuide';
import { useDateFormat } from '~/composables/useDateFormat';
import type { IHistoryEntry } from '~/types/index';

const { loadHistory, history, isHistoryLoading, loadGuide, deleteFromHistory, clearHistory, interviewTypeLabel, providerLabel } = useInterviewGuide();

const { formatDateTime } = useDateFormat();

const router = useRouter();

async function openGuide(entry: IHistoryEntry): Promise<void> {
    await router.push(`/interview/${entry.id}`);
}

onMounted(async () => {
    await loadHistory();
});

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
@use '../assets/scss/variables' as vars;
@use '../assets/scss/mixins' as mixins;

.history-page {
    @include mixins.flex(column);
    gap: vars.$gap-2;

    &__header {
        @include mixins.flex(row, space-between, baseline);
    }

    &__title {
        font-size: 2rem;
        letter-spacing: -0.03em;
    }

    &__loading {
        @include mixins.flex(column);
        gap: vars.$gap-lg;
    }

    &__skeleton {
        @include mixins.flex(column);
        gap: vars.$gap-sm;
        padding: vars.$gap-lg;
        border: 1px solid var(--border);
        border-radius: vars.$radius-md;
    }

    &__empty {
        @include mixins.flex(column, flex-start, center);
        gap: vars.$gap-xl;
        padding: vars.$container-padding-bottom 0;
        color: var(--ink-muted);
        text-align: center;

        p {
            font-size: 1.2rem;
        }
    }

    &__grid {
        @include mixins.flex(column);
        gap: vars.$gap-md;
    }
}

.skeleton {
    border-radius: vars.$radius-xs;
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
    @include mixins.flex(row, flex-start, center);
    gap: vars.$gap-lg;
    padding: vars.$gap-lg vars.$gap-1-25;
    border: 1px solid var(--border);
    border-radius: vars.$radius-md;
    cursor: pointer;
    transition:
        border-color vars.$transition-fast,
        box-shadow vars.$transition-fast;

    &:hover {
        border-color: var(--accent);
        box-shadow: 0 2px 12px rgb(0 0 0 / 0.04);
    }

    &__avatar {
        width: vars.$avatar-size;
        height: vars.$avatar-size;
        border-radius: 50%;
        background: var(--accent);
        color: var(--paper);
        @include mixins.center(row);
        font-size: vars.$font-size-lg;
        flex-shrink: 0;
    }

    &__body {
        @include mixins.flex(column);
        gap: vars.$gap-xxs;
        flex: 1;
        min-width: 0;
    }

    &__name {
        font-size: vars.$font-size-md;
    }

    &__role {
        font-size: vars.$btn-font-size;
        color: var(--ink-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__chips {
        @include mixins.flex(row, flex-start, center);
        flex-wrap: wrap;
        gap: vars.$gap-xs;
        margin-top: vars.$gap-xxs;
    }

    &__chip {
        @include mixins.chip();
    }

    &__right {
        @include mixins.flex(column, flex-start, flex-end);
        gap: vars.$gap-sm;
        flex-shrink: 0;
    }

    &__date {
        font-size: vars.$chip-font-size;
        color: var(--ink-muted);
    }

    &__delete {
        background: none;
        border: none;
        font-size: vars.$font-size-sm;
        cursor: pointer;
        color: var(--ink-muted);
        opacity: 0.4;
        transition: opacity vars.$transition-fast;

        &:hover {
            opacity: 1;
            color: var(--red);
        }
    }
}

.nav-btn {
    @include mixins.btn();

    &:hover {
        border-color: var(--accent);
        color: var(--accent);
    }
}

.text-btn {
    background: none;
    border: none;
    font-size: vars.$btn-font-size;
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
