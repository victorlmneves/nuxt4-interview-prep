<script setup lang="ts">
defineOptions({
    name: 'AppHeader',
});
</script>

<template>
    <header class="app-header">
        <NuxtLink to="/" class="app-header__logo font-serif">
            Interview
            <em>Prep</em>
        </NuxtLink>
        <nav class="app-header__nav">
            <slot />
        </nav>
    </header>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as vars;
@use '~/assets/scss/mixins' as mixins;

.app-header {
    position: sticky;
    top: 0;
    z-index: 100;
    @include mixins.flex(row, space-between, center);
    padding: 0 var(--header-padding-inline);
    height: var(--header-height);
    background: var(--paper);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(8px);

    &__logo {
        font-size: 1.1rem;
        text-decoration: none;
        color: var(--ink);
        letter-spacing: -0.02em;

        em {
            color: var(--accent);
            font-style: normal;
        }
    }

    &__nav {
        @include mixins.flex(row, flex-start, center);
        gap: 0.5rem;
    }
}
</style>
