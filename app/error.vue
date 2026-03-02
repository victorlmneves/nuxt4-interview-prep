<script setup>
defineProps({ error: Object });
</script>

<template>
    <div class="error-page">
        <h1>Error</h1>
        <p>{{ error.message }}</p>
    </div>
</template>
