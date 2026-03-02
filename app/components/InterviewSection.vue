<script setup lang="ts">
import type { IInterviewSection } from '~/types/index';

interface IProps {
    section: IInterviewSection;
    index: number;
}

const props = defineProps<IProps>();

defineOptions({
    name: 'InterviewSection',
});
</script>

<template>
    <div class="interview-section">
        <div class="interview-section__header">
            <div class="interview-section__title-row">
                <span class="interview-section__number font-mono">{{ props.index + 1 }}</span>
                <h3 class="interview-section__title font-serif">{{ props.section.title }}</h3>
                <span class="interview-section__duration font-mono">{{ props.section.durationMinutes }}m</span>
            </div>
            <p class="interview-section__description">{{ props.section.description }}</p>
        </div>
        <div class="interview-section__questions">
            <QuestionCard v-for="(question, i) in props.section.questions" :key="question.id" :question="question" :index="i" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.interview-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    &__header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    &__title-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    &__number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--accent);
        color: var(--paper);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        font-weight: 600;
        box-shadow: 0 1px 4px rgb(0 0 0 / 0.04);
        flex-shrink: 0;
    }

    &__title {
        font-size: 1.15rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        margin: 0;
    }

    &__duration {
        font-size: 0.85rem;
        color: var(--ink-muted);
        background: var(--surface);
        border-radius: 12px;
        padding: 2px 10px;
        font-weight: 500;
    }

    &__description {
        font-size: 0.98rem;
        color: var(--ink-muted);
        margin: 0.2rem 0 0.5rem 0;
    }

    &__questions {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-top: 0.5rem;
    }
}
</style>
