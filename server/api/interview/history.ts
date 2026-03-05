import { guideStore } from '#server/api/interview/generate.post';
import type { IHistoryEntry } from '~/types/index';

export default defineEventHandler(async (event) => {
    const method = getMethod(event);

    if (method === 'GET') {
        const entries: IHistoryEntry[] = Array.from(guideStore.values())
            .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
            .map((guide) => ({
                id: guide.id,
                candidateName: guide.candidateName,
                roleName: guide.roleName,
                interviewType: guide.interviewType,
                provider: guide.provider,
                totalQuestions: Array.isArray(guide.sections)
                    ? guide.sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0)
                    : 0,
                createdAt: guide.generatedAt,
            }));

        return entries;
    }

    if (method === 'DELETE') {
        guideStore.clear();

        return { success: true };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed.' });
});
