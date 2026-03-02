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
                <!-- ...restante markup... -->
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
/* ...restante CSS... */
</style>
