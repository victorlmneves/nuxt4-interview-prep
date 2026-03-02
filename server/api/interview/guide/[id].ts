import { guideStore } from '#server/api/interview/generate.post';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const method = getMethod(event);

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Guide ID is required.' });
    }

    if (method === 'GET') {
        const guide = guideStore.get(id);

        if (!guide) {
            throw createError({ statusCode: 404, statusMessage: 'Guide not found.' });
        }

        return guide;
    }

    if (method === 'DELETE') {
        const existed = guideStore.delete(id);

        if (!existed) {
            throw createError({ statusCode: 404, statusMessage: 'Guide not found.' });
        }

        return { success: true };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed.' });
});
