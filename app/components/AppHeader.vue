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
.app-header {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    height: 56px;
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
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}
</style>
