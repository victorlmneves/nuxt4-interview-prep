<script setup lang="ts">
defineProps<{ error: { message: string } }>();
</script>

<template>
    <div class="error-page">
        <h1>Error</h1>
        <p>{{ error.message }}</p>
    </div>
</template>
