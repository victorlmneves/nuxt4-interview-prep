<script setup lang="ts">
import type { IInterviewQuestion } from '~/types/index';
import { useInterviewGuide } from '~/composables/useInterviewGuide';

interface IProps {
    question: IInterviewQuestion;
    index: number;
}

const props = defineProps<IProps>();
const isExpanded = ref(false);
const { categoryColor, difficultyColor } = useInterviewGuide();

function toggleExpand(): void {
    isExpanded.value = !isExpanded.value;
}

defineOptions({
    name: 'QuestionCard',
});
</script>

<template>
    <div class="question-card" :class="{ 'question-card--expanded': isExpanded }">
        <div class="question-card__header" @click="toggleExpand">
            <div class="question-card__meta">
                <span class="question-card__index font-mono">Q{{ props.index + 1 }}</span>
                <span
                    class="question-card__category font-mono"
                    :style="{
                        color: categoryColor(props.question.category),
                        background: categoryColor(props.question.category) + '18',
                    }"
                >
                    {{ props.question.category }}
                </span>
                <span
                    class="question-card__difficulty font-mono"
                    :style="{
                        color: difficultyColor(props.question.difficulty),
                        background: difficultyColor(props.question.difficulty) + '18',
                    }"
                >
                    {{ props.question.difficulty }}
                </span>
                <span class="question-card__time font-mono">~{{ props.question.estimatedMinutes }}m</span>
            </div>
            <span class="question-card__toggle">{{ isExpanded ? '\u2212' : '+' }}</span>
        </div>
        <p class="question-card__text">{{ props.question.question }}</p>
        <Transition name="expand">
            <div v-if="isExpanded" class="question-card__details">
                <div v-if="props.question.rationale" class="question-card__rationale">
                    <strong class="question-card__label">Rationale:</strong>
                    <p>{{ props.question.rationale }}</p>
                </div>
                <div v-if="props.question.followUps && props.question.followUps.length" class="question-card__followups">
                    <strong class="question-card__label">Follow-up questions:</strong>
                    <ul>
                        <li v-for="(followUp, i) in props.question.followUps" :key="i">{{ followUp }}</li>
                    </ul>
                </div>
                <div v-if="props.question.evaluationCriteria && props.question.evaluationCriteria.length" class="question-card__criteria">
                    <strong class="question-card__label">Evaluation criteria:</strong>
                    <ul>
                        <li v-for="(criteria, i) in props.question.evaluationCriteria" :key="i">{{ criteria }}</li>
                    </ul>
                </div>
                <div v-if="props.question.sampleAnswer" class="question-card__answer">
                    <strong class="question-card__label">Sample answer:</strong>
                    <div class="question-card__answer-content">{{ props.question.sampleAnswer }}</div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
.question-card__answer {
    margin-top: 1.2rem;
    background: var(--surface);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.03);
}

.question-card__answer-content {
    font-size: 0.98rem;
    color: var(--ink);
    margin-top: 0.2rem;
    white-space: pre-line;
}

.question-card {
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-elevated, #fff);
    padding: 1rem;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.question-card:hover {
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.06);
}

.question-card--expanded {
    border-color: var(--primary, #6366f1);
}

.question-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    cursor: pointer;
    user-select: none;
}

.question-card__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.question-card__index,
.question-card__category,
.question-card__difficulty,
.question-card__time {
    font-size: 0.78rem;
    line-height: 1;
    padding: 0.35rem 0.5rem;
    border-radius: 999px;
    background: var(--surface);
    border: 1px solid var(--border);
}

.question-card__toggle {
    width: 1.6rem;
    height: 1.6rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid var(--border);
    font-weight: 700;
    color: var(--ink);
    background: var(--surface);
}

.question-card__details {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--surface);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.04);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.question-card__label {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.3rem;
    display: block;
}

.question-card__rationale,
.question-card__followups,
.question-card__criteria {
    margin-bottom: 0.5rem;
}

.question-card__followups ul,
.question-card__criteria ul {
    margin: 0.3rem 0 0 1.2rem;
    padding: 0;
    list-style: disc inside;
    font-size: 0.95rem;
    color: var(--ink-muted);
}

.question-card__text {
    margin: 0.9rem 0 0;
    color: var(--ink);
    line-height: 1.5;
}

/* Transition for <Transition name="expand"> */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.2s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-4px);
}

.expand-enter-to,
.expand-leave-from {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
}
</style>
