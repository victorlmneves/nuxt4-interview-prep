export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',

    devtools: { enabled: true },

    future: {
        compatibilityVersion: 4,
    },

    modules: ['@nuxtjs/google-fonts'],

    googleFonts: {
        families: {
            Lora: [400, 500, 600],
            'Instrument Sans': [400, 500, 600],
            'JetBrains Mono': [400, 500],
        },
        display: 'swap',
        preload: true,
    },

    css: ['~/assets/styles/global.scss'],

    runtimeConfig: {
        anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
        openaiApiKey: process.env.OPENAI_API_KEY ?? '',
        geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    },

    nitro: {
        experimental: {
            openAPI: true,
        },
    },
});
