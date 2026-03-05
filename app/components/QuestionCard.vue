<script setup lang="ts">
import Prism from 'prismjs';
import { useInterviewGuide } from '~/composables/useInterviewGuide';
import type { IInterviewQuestion } from '~/types/index';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup';

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

function formatSampleAnswer(answer: string): Array<{ type: 'text' | 'code', content: string, lang?: string }> {
    // Split answer into text and code blocks (markdown style)
    const blocks: Array<{ type: 'text' | 'code', content: string, lang?: string }> = [];
    // Support language hints: ```js, ```ts, ```vue
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(answer)) !== null) {
        if (match.index > lastIndex) {
            blocks.push({ type: 'text', content: answer.slice(lastIndex, match.index) });
        }

        // match[1] is the language, match[2] is the code
        blocks.push({ type: 'code', lang: match[1] ? match[1].toLowerCase() : 'javascript', content: match[2].trim() });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < answer.length) {
        blocks.push({ type: 'text', content: answer.slice(lastIndex) });
    }

    // Fallback: highlight lines that look like code (if no code blocks found)
    if (blocks.length === 1 && blocks[0] && blocks[0].type === 'text') {
        const lines = blocks[0].content.split(/\r?\n/);
        const codeLineRegex = /^\s*(?:const|let|var|function|interface|class|type|import|export|return|if|for|while|switch|case|catch|async|await|[\]{}()]).*/;
        let buffer: string[] = [];
        let inCode = false;
        const fallbackBlocks: Array<{ type: 'text' | 'code', content: string }> = [];

        for (const line of lines) {
            if (codeLineRegex.test(line)) {
                if (!inCode && buffer.length) {
                    fallbackBlocks.push({ type: 'text', content: buffer.join('\n') });
                    buffer = [];
                }

                inCode = true;
                buffer.push(line);
            } else {
                if (inCode && buffer.length) {
                    fallbackBlocks.push({ type: 'code', content: buffer.join('\n') });
                    buffer = [];
                }

                inCode = false;
                buffer.push(line);
            }
        }

        if (buffer.length) {
            fallbackBlocks.push({ type: inCode ? 'code' : 'text', content: buffer.join('\n') });
        }

        return fallbackBlocks;
    }

    // Highlight code blocks using PrismJS
    return blocks.map(block => {
        if (block.type === 'code') {
            let lang = block.lang || 'javascript';
            let prismLang;

            if (lang === 'vue') {
                prismLang = Prism.languages.markup;
                lang = 'markup';
            } else if (lang === 'ts' || lang === 'typescript') {
                prismLang = Prism.languages.typescript;
                lang = 'typescript';
            } else if (Prism.languages[lang]) {
                prismLang = Prism.languages[lang];
            } else {
                prismLang = Prism.languages.javascript;
                lang = 'javascript';
            }

            return {
                type: 'code',
                content: Prism.highlight(block.content, prismLang, lang),
                lang,
            };
        }

        return block;
    });
}

defineOptions({
    name: 'QuestionCard',
});
</script>

<template>
    <div :class="['question-card', { 'question-card--expanded': isExpanded }]">
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
                    <div class="question-card__answer-content">
                        <template v-for="(block, i) in formatSampleAnswer(props.question.sampleAnswer)" :key="i">
                            <div v-if="block.type === 'text'">{{ block.content }}</div>
                            <pre v-else class="code-block"><code :class="'language-' + (block.lang || 'javascript')" :lang="block.lang || 'javascript'" v-html="block.content"></code></pre>
                        </template>
                    </div>
                </div>
                <div v-else-if="['behavioural','situational','culture','leadership'].includes(props.question.category)" class="question-card__answer">
                    <strong class="question-card__label">Example answers:</strong>
                    <div class="question-card__answer-content">
                        <ul>
                            <li v-if="props.question.category === 'behavioural'">
                                "I handled a conflict between team members by facilitating an open discussion, listening to both sides, and helping them find common ground. This improved collaboration and team morale."
                            </li>
                            <li v-if="props.question.category === 'behavioural'">
                                "When faced with a tight deadline, I prioritized tasks, communicated clearly with stakeholders, and motivated the team to deliver on time without sacrificing quality."
                            </li>
                            <li v-if="props.question.category === 'situational'">
                                "If I were assigned a project outside my expertise, I would research best practices, seek advice from experienced colleagues, and break the problem into manageable steps."
                            </li>
                            <li v-if="props.question.category === 'situational'">
                                "If a project suddenly changed scope, I would quickly reassess priorities, communicate the impact to the team, and adjust our plan to stay aligned with business goals."
                            </li>
                            <li v-if="props.question.category === 'culture'">
                                "I contribute to a positive team culture by celebrating wins, supporting colleagues, and encouraging open feedback."
                            </li>
                            <li v-if="props.question.category === 'culture'">
                                "I value diversity and inclusion, and I make sure all voices are heard during meetings and decision-making."
                            </li>
                            <li v-if="props.question.category === 'leadership'">
                                "As a leader, I set clear expectations, provide regular feedback, and empower my team to take ownership of their work."
                            </li>
                            <li v-if="props.question.category === 'leadership'">
                                "I mentor junior team members by sharing knowledge, offering guidance, and encouraging their professional growth."
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
@use '../assets/scss/variables' as vars;
@use '../assets/scss/mixins' as mixins;

.question-card__answer {
    margin-top: var(--gap-1-25);
    background: var(--surface);
    border-radius: var(--radius-md);
    padding: var(--gap-lg);
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.03);
}
    
.question-card__answer-content {
    font-size: var(--font-size-md);
    color: var(--ink);
    margin-top: var(--gap-xxxs);
    white-space: pre-line;
    word-break: break-word;
}

.code-block {
    background: #f6f8fa;
    color: #222;
    font-family: 'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
    font-size: var(--font-size-md);
    border-radius: var(--radius-sm);
    padding: var(--code-block-padding);
    margin: var(--gap-md) 0;
    overflow-x: auto;
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.03);
}

.question-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface-elevated, #fff);
    padding: var(--gap-lg);
    transition: box-shadow var(--transition-medium) ease, border-color var(--transition-medium) ease;
}

.question-card:hover {
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.06);
}

.question-card--expanded {
    border-color: var(--primary, #6366f1);
}

.question-card__header {
    @include mixins.flex(row, space-between, center);
    gap: var(--gap-md);
    cursor: pointer;
    user-select: none;
}

.question-card__meta {
    @include mixins.flex(row, flex-start, center);
    flex-wrap: wrap;
    gap: var(--gap-sm);
}

.question-card__index,
.question-card__category,
.question-card__difficulty,
.question-card__time {
    font-size: var(--font-size-sm);
    line-height: 1;
    padding: var(--badge-padding);
    border-radius: var(--radius-pill);
    background: var(--surface);
    border: 1px solid var(--border);
}

.question-card__toggle {
    width: var(--control-size-sm);
    height: var(--control-size-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    font-weight: 700;
    color: var(--ink);
    background: var(--surface);
}

.question-card__details {
    margin-top: var(--gap-lg);
    padding: var(--gap-lg);
    background: var(--surface);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.04);
    @include mixins.flex(column);
    gap: var(--gap-lg);
}

.question-card__label {
    font-weight: 600;
    font-size: var(--font-size-md);
    margin-bottom: 0.3rem;
    display: block;
}

.question-card__rationale,
.question-card__followups,
.question-card__criteria {
    margin-bottom: var(--gap-sm);
}

.question-card__followups ul,
.question-card__criteria ul {
    margin: 0.3rem 0 0 var(--gap-1-25);
    padding: 0;
    list-style: disc inside;
    font-size: var(--font-size-md);
    color: var(--ink-muted);
}

.question-card__text {
    margin: var(--gap-lg) 0 0;
    color: var(--ink);
    line-height: 1.5;
}

/* Transition for <Transition name="expand"> */
.expand-enter-active,
.expand-leave-active {
    transition: all var(--transition-medium) ease;
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
