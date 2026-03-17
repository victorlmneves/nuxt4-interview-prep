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
            <QuestionCard
                v-for="(question, i) in props.section.questions"
                :key="question.id"
                :question="question"
                :index="i"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as vars;
@use '~/assets/scss/mixins' as mixins;

.interview-section {
    @include mixins.flex(column);
    gap: var(--gap-lg);

    &__header {
        @include mixins.flex(column);
        gap: var(--gap-sm);
    }

    &__title-row {
        @include mixins.flex(row, flex-start, center);
        gap: var(--gap-md);
    }
    &__number {
        width: var(--control-size-xs);
        height: var(--control-size-xs);
        border-radius: 50%;
        background: var(--accent);
        color: var(--paper);
        @include mixins.flex(row, center, center);
        font-size: var(--font-size-md);
        font-weight: 600;
        box-shadow: 0 1px 4px rgb(0 0 0 / 0.04);
        flex-shrink: 0;
    }

    &__title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        letter-spacing: -0.01em;
        margin: 0;
    }

    &__duration {
        font-size: var(--font-size-sm);
        color: var(--ink-muted);
        background: var(--surface);
        border-radius: var(--radius-lg);
        padding: var(--chip-padding);
        font-weight: 500;
    }

    &__description {
        font-size: var(--font-size-md);
        color: var(--ink-muted);
        margin: var(--gap-xxxs) 0 0.5rem 0;
    }

    &__questions {
        display: flex;
        flex-direction: column;
        gap: var(--gap-xl);
        margin-top: var(--gap-sm);
    }
}
</style>
