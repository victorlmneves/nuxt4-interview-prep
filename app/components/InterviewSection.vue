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
        /* ...restante CSS... */
    }
}
</style>
