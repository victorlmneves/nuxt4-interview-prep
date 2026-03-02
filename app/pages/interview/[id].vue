<script setup lang="ts">
import { useInterviewGuide } from '~/composables/useInterviewGuide';
import { useDateFormat } from '~/composables/useDateFormat';

const route = useRoute();
const router = useRouter();

const { result, isLoading, error, loadGuide, providerLabel, interviewTypeLabel } = useInterviewGuide();

const { formatDate } = useDateFormat();

const id = computed(() => {
    const raw = route.params.id;

    if (Array.isArray(raw)) {
        return raw[0];
    }

    return raw;
});

const totalQuestions = computed(() => {
    if (!result.value) {
        return 0;
    }

    return result.value.sections.reduce((acc, s) => acc + s.questions.length, 0);
});

onMounted(async () => {
    await loadGuide(id.value);
});

function goBack(): void {
    router.push('/history');
}

defineOptions({
    name: 'InterviewDetailPage',
});
</script>

<template>
    <div class="app-shell">
        <AppHeader>
            <NuxtLink to="/" class="nav-btn">New Guide</NuxtLink>
            <NuxtLink to="/history" class="nav-btn">← History</NuxtLink>
        </AppHeader>

        <main class="main-content">
            <div v-if="isLoading" class="loading-panel animate-fade-in">
                <div class="loading-panel__inner">
                    <div class="loading-panel__icon font-serif">⟳</div>
                    <p class="loading-panel__sub">Loading guide…</p>
                </div>
            </div>

            <div v-else-if="error" class="error-msg">{{ error }}</div>

            <section v-else-if="result" class="results-panel animate-fade-up">
                <div class="results-panel__header">
                    <button class="results-panel__back" @click="goBack">← Back</button>

                    <div class="results-panel__meta">
                        <span class="results-panel__meta-provider font-mono">{{ providerLabel(result.provider) }}</span>
                        <span class="results-panel__meta-type font-mono">{{ interviewTypeLabel(result.interviewType) }}</span>
                        <span class="results-panel__meta-date font-mono">{{ formatDate(result.generatedAt) }}</span>
                    </div>
                </div>

                <div class="hero-card">
                    <div class="hero-card__left">
                        <div class="candidate__avatar font-serif">
                            {{ result.candidate.name?.charAt(0) ?? '?' }}
                        </div>

                        <div class="candidate__info">
                            <h2 class="candidate__name font-serif">{{ result.candidateName }}</h2>
                            <p class="candidate__role">{{ result.roleName }}</p>

                            <div class="candidate__chips">
                                <span v-if="result.candidate.totalExperience" class="candidate__chip font-mono">
                                    {{ result.candidate.totalExperience }}
                                </span>
                                <span v-if="result.candidate.location" class="candidate__chip font-mono">
                                    {{ result.candidate.location }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="hero-card__stats">
                        <div class="stat">
                            <span class="stat__value font-serif">{{ result.sections.length }}</span>
                            <span class="stat__label font-mono">sections</span>
                        </div>
                        <div class="stat">
                            <span class="stat__value font-serif">{{ totalQuestions }}</span>
                            <span class="stat__label font-mono">questions</span>
                        </div>
                        <div class="stat">
                            <span class="stat__value font-serif">{{ result.totalDurationMinutes }}</span>
                            <span class="stat__label font-mono">minutes</span>
                        </div>
                    </div>
                </div>

                <div v-if="result.openingNotes" class="result-card result-card--highlight">
                    <h3 class="result-card__title font-serif">Opening Notes</h3>
                    <p class="result-card__body">{{ result.openingNotes }}</p>
                </div>

                <div class="sections-list">
                    <InterviewSection v-for="(section, i) in result.sections" :key="i" :section="section" :index="i" />
                </div>

                <div v-if="result.closingNotes" class="result-card">
                    <h3 class="result-card__title font-serif">Closing Notes</h3>
                    <p class="result-card__body">{{ result.closingNotes }}</p>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped lang="scss">
.main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
}

.loading-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;

    &__inner {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    &__icon {
        font-size: 2rem;
        animation: spin 2s linear infinite;
    }

    &__sub {
        font-size: 0.875rem;
        color: var(--ink-muted);
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.error-msg {
    font-size: 0.875rem;
    color: var(--red);
    padding: 0.75rem 1rem;
    border: 1px solid color-mix(in srgb, var(--red) 30%, var(--border));
    border-radius: 6px;
}

.results-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    &__header {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    &__back {
        background: none;
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.35rem 0.85rem;
        font-size: 0.8rem;
        cursor: pointer;
        color: var(--ink-muted);
        transition: all 0.15s;

        &:hover {
            border-color: var(--ink);
            color: var(--ink);
        }
    }

    &__meta {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    &__meta-provider,
    &__meta-type,
    &__meta-date {
        font-size: 0.75rem;
        color: var(--ink-muted);
        padding: 2px 8px;
        border: 1px solid var(--border);
        border-radius: 4px;
    }
}

.hero-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    gap: 1.5rem;

    &__left {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }

    &__stats {
        display: flex;
        gap: 2rem;
        flex-shrink: 0;
    }
}

.candidate {
    &__avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--accent);
        color: var(--paper);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        flex-shrink: 0;
    }

    &__info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    &__name {
        font-size: 1.2rem;
        letter-spacing: -0.02em;
    }

    &__role {
        font-size: 0.875rem;
        color: var(--ink-muted);
    }

    &__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.25rem;
    }

    &__chip {
        font-size: 0.7rem;
        padding: 2px 8px;
        border: 1px solid var(--border);
        border-radius: 20px;
        color: var(--ink-muted);
    }
}

.stat {
    text-align: center;

    &__value {
        display: block;
        font-size: 1.75rem;
        letter-spacing: -0.03em;
        line-height: 1;
    }

    &__label {
        display: block;
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--ink-muted);
        margin-top: 0.25rem;
    }
}

.result-card {
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &--highlight {
        background: color-mix(in srgb, var(--accent) 5%, var(--paper));
        border-color: color-mix(in srgb, var(--accent) 25%, var(--border));
    }

    &__title {
        font-size: 1rem;
        letter-spacing: -0.01em;
    }

    &__body {
        font-size: 0.9rem;
        color: var(--ink-muted);
        line-height: 1.65;
    }
}

.sections-list {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.nav-btn {
    display: inline-flex;
    align-items: center;
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

.animate-fade-up {
    animation: fadeUp 0.35s ease both;
}

.animate-fade-in {
    animation: fadeIn 0.3s ease both;
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

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
