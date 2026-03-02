<script setup lang="ts">
import { useInterviewGuide } from '~/composables/useInterviewGuide';
import { useDateFormat } from '~/composables/useDateFormat';
import type { TProvider, TInterviewType, IHistoryEntry } from '~/types/index';

// ── Composables ───────────────────────────────────────────────────────────────
const {
    result,
    isLoading,
    isHistoryLoading,
    error,
    progress,
    history,
    generate,
    loadGuide,
    deleteFromHistory,
    clearHistory,
    reset,
    providerLabel,
    interviewTypeLabel,
} = useInterviewGuide();

const { formatDate } = useDateFormat();

// ── Input state ───────────────────────────────────────────────────────────────
const cvText = ref('');
const jobDescription = ref('');
const provider = ref<TProvider>('anthropic');
const interviewType = ref<TInterviewType>('mixed');
const cvInputMode = ref<'paste' | 'upload'>('paste');
const showHistory = ref(false);
const uploadedFileName = ref<string | null>(null);
const isDraggingOver = ref(false);

// ── File upload ───────────────────────────────────────────────────────────────
async function handleFile(file: File): Promise<void> {
    uploadedFileName.value = file.name;

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        cvText.value = await file.text();

        return;
    }

    const form = new FormData();

    form.append('file', file);

    try {
        const response = await fetch('/api/extract-text', {
            method: 'POST',
            body: form,
        });

        if (!response.ok) {
            throw new Error('Failed to extract text');
        }

        const data = (await response.json()) as { text: string };

        cvText.value = data.text;
    } catch {
        cvText.value = '';
        uploadedFileName.value = null;

        alert('Could not extract text. Please paste the CV text directly.');
    }
}

function onDrop(e: DragEvent): void {
    isDraggingOver.value = false;

    const file = e.dataTransfer?.files[0];

    if (file) {
        handleFile(file);
    }
}

function onFileInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
        handleFile(file);
    }
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submit(): Promise<void> {
    await generate({
        cvText: cvText.value,
        jobDescription: jobDescription.value,
        provider: provider.value,
        interviewType: interviewType.value,
    });
}

// ── History ───────────────────────────────────────────────────────────────────
async function loadEntry(entry: IHistoryEntry): Promise<void> {
    showHistory.value = false;
    await loadGuide(entry.id);
}

// ── Computed helpers ──────────────────────────────────────────────────────────
const totalQuestions = computed(() => {
    if (!result.value) {
        return 0;
    }

    return result.value.sections.reduce((acc, s) => acc + s.questions.length, 0);
});

const providers: TProvider[] = ['anthropic', 'openai', 'gemini'];
const interviewTypes: TInterviewType[] = ['technical', 'behavioural', 'mixed'];

const canSubmit = computed(() => {
    return cvText.value.trim().length > 0 && jobDescription.value.trim().length > 0;
});

defineOptions({
    name: 'IndexPage',
});
</script>

<template>
    <div class="app-shell">
        <!-- ── Header ──────────────────────────────────────────────── -->
        <AppHeader>
            <NuxtLink to="/history" class="nav-btn">History</NuxtLink>

            <button class="nav-btn" :class="{ 'nav-btn--active': showHistory }" @click="showHistory = !showHistory">
                Recent
                <span v-if="history.length > 0" class="nav-btn__badge">{{ history.length }}</span>
            </button>
        </AppHeader>

        <!-- ── History sidebar ────────────────────────────────────── -->
        <Transition name="slide">
            <aside v-if="showHistory" class="history-sidebar">
                <div class="history-sidebar__header">
                    <h3 class="font-serif">Recent Guides</h3>

                    <div class="history-sidebar__actions">
                        <button v-if="history.length > 0" class="text-btn text-btn--danger" @click="clearHistory">Clear all</button>
                        <button class="history-sidebar__close" @click="showHistory = false">✕</button>
                    </div>
                </div>

                <div v-if="isHistoryLoading" class="history-sidebar__loading">
                    <div v-for="i in 3" :key="i" class="history-sidebar__skeleton-row">
                        <div class="skeleton skeleton--name" />
                        <div class="skeleton skeleton--meta" />
                    </div>
                </div>

                <div v-else-if="history.length === 0" class="history-sidebar__empty">
                    <p>No guides generated yet.</p>
                </div>

                <ul v-else class="history-list">
                    <li v-for="entry in history" :key="entry.id" class="history-list__item" @click="loadEntry(entry)">
                        <div class="history-list__item-body">
                            <strong class="history-list__candidate">{{ entry.candidateName }}</strong>
                            <span class="history-list__role">{{ entry.roleName }}</span>
                        </div>

                        <div class="history-list__item-meta">
                            <span class="history-list__type font-mono">{{ interviewTypeLabel(entry.interviewType) }}</span>
                            <span class="history-list__date font-mono">{{ formatDate(entry.createdAt) }}</span>
                            <button class="history-list__delete" title="Delete guide" @click.stop="deleteFromHistory(entry.id)">✕</button>
                        </div>
                    </li>
                </ul>
            </aside>
        </Transition>

        <Transition name="fade">
            <div v-if="showHistory" class="history-sidebar__backdrop" @click="showHistory = false" />
        </Transition>

        <!-- ── Main ───────────────────────────────────────────────── -->
        <main class="main-content">
            <!-- Input panel -->
            <section v-if="!result && !isLoading" class="input-panel animate-fade-up">
                <div class="input-panel__intro">
                    <h1 class="input-panel__title font-serif">
                        Interview Guide
                        <br />
                        <em>tailored to every candidate</em>
                    </h1>
                    <p class="input-panel__subtitle">
                        Upload a CV and job description. Get a structured, personalised interview guide with technical and behavioural
                        questions — tailored to the candidate's profile and role.
                    </p>
                </div>

                <div class="input-panel__grid">
                    <!-- CV input -->
                    <div class="input-card">
                        <div class="input-card__header">
                            <label class="input-card__label">Candidate CV</label>
                            <div class="input-card__tabs">
                                <button
                                    class="tab-btn"
                                    :class="{ 'tab-btn--active': cvInputMode === 'paste' }"
                                    @click="cvInputMode = 'paste'"
                                >
                                    Paste
                                </button>
                                <button
                                    class="tab-btn"
                                    :class="{ 'tab-btn--active': cvInputMode === 'upload' }"
                                    @click="cvInputMode = 'upload'"
                                >
                                    Upload
                                </button>
                            </div>
                        </div>

                        <textarea
                            v-if="cvInputMode === 'paste'"
                            v-model="cvText"
                            class="text-input font-mono"
                            placeholder="Paste the candidate's CV here…"
                            rows="14"
                        />

                        <div
                            v-else
                            class="dropzone"
                            :class="{ 'dropzone--drag-over': isDraggingOver }"
                            @dragover.prevent="isDraggingOver = true"
                            @dragleave="isDraggingOver = false"
                            @drop.prevent="onDrop"
                        >
                            <input id="cv-file" type="file" accept=".txt,.pdf,.docx" class="dropzone__file-input" @change="onFileInput" />

                            <label for="cv-file" class="dropzone__label">
                                <span class="dropzone__icon">↑</span>
                                <span v-if="uploadedFileName" class="dropzone__filename font-mono">
                                    {{ uploadedFileName }}
                                </span>
                                <span v-else>
                                    Drop a file or
                                    <u>browse</u>
                                    <br />
                                    <small>.txt · .pdf · .docx</small>
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- JD input -->
                    <div class="input-card">
                        <div class="input-card__header">
                            <label class="input-card__label">Job Description</label>
                        </div>

                        <textarea
                            v-model="jobDescription"
                            class="text-input font-mono"
                            placeholder="Paste the job description or role requirements here…"
                            rows="14"
                        />
                    </div>
                </div>

                <!-- Options row -->
                <div class="options-row">
                    <!-- Interview type -->
                    <div class="options-row__group">
                        <span class="options-row__label">Interview type</span>
                        <div class="options-row__toggle">
                            <button
                                v-for="t in interviewTypes"
                                :key="t"
                                class="options-row__btn"
                                :class="{ 'options-btn--active': interviewType === t }"
                                @click="interviewType = t"
                            >
                                {{ interviewTypeLabel(t) }}
                            </button>
                        </div>
                    </div>

                    <!-- Provider -->
                    <div class="options-row__group">
                        <span class="options-row__label">AI provider</span>
                        <div class="options-row__toggle">
                            <button
                                v-for="p in providers"
                                :key="p"
                                class="options-row__btn"
                                :class="{ 'options-btn--active': provider === p }"
                                @click="provider = p"
                            >
                                {{ providerLabel(p) }}
                            </button>
                        </div>
                    </div>

                    <button class="options-row__submit" :disabled="!canSubmit" @click="submit">Generate guide →</button>
                </div>

                <p v-if="error" class="error-msg">{{ error }}</p>
            </section>

            <!-- Loading state -->
            <section v-if="isLoading" class="loading-panel animate-fade-in">
                <div class="loading-panel__inner">
                    <div class="loading-panel__icon font-serif">⟳</div>
                    <h2 class="loading-panel__title font-serif">Generating interview guide…</h2>
                    <p class="loading-panel__sub">Analysing profile, crafting questions, structuring guide</p>

                    <div class="progress-bar">
                        <div class="progress-bar__fill" :style="{ width: progress + '%' }" />
                    </div>

                    <span class="progress-bar__label font-mono">{{ Math.round(progress) }}%</span>
                </div>
            </section>

            <!-- Results -->
            <section v-if="result && !isLoading" class="results-panel animate-fade-up">
                <!-- Results header -->
                <div class="results-panel__header">
                    <button class="results-panel__back" @click="reset">← New guide</button>

                    <div class="results-panel__meta">
                        <span class="results-panel__meta-provider font-mono">{{ providerLabel(result.provider) }}</span>
                        <span class="results-panel__meta-type font-mono">{{ interviewTypeLabel(result.interviewType) }}</span>
                        <span class="results-panel__meta-date font-mono">{{ formatDate(result.generatedAt) }}</span>
                    </div>
                </div>

                <!-- Guide hero -->
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
                                <span v-if="result.candidate.education" class="candidate__chip font-mono">
                                    {{ result.candidate.education }}
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

                <!-- Opening notes -->
                <div v-if="result.openingNotes" class="result-card result-card--highlight">
                    <h3 class="result-card__title font-serif">Opening Notes</h3>
                    <p class="result-card__body">{{ result.openingNotes }}</p>
                </div>

                <!-- Sections -->
                <div class="sections-list">
                    <InterviewSection v-for="(section, i) in result.sections" :key="i" :section="section" :index="i" />
                </div>

                <!-- Closing notes -->
                <div v-if="result.closingNotes" class="result-card">
                    <h3 class="result-card__title font-serif">Closing Notes</h3>
                    <p class="result-card__body">{{ result.closingNotes }}</p>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped lang="scss" src="./index.scss"></style>
