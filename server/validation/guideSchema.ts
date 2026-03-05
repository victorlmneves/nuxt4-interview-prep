import { z } from 'zod';

export const QuestionCategory = z.enum(['technical', 'behavioural', 'situational', 'culture', 'leadership', 'problemSolving']);

export const DifficultyEnum = z.enum(['easy', 'medium', 'hard']);

export const QuestionSchema = z
    .object({
        id: z.string(),
        question: z.string().min(1),
        category: QuestionCategory,
        difficulty: DifficultyEnum,
        rationale: z.string().optional().default(''),
        followUps: z.array(z.string()).optional().default([]),
        evaluationCriteria: z.array(z.string()).optional().default([]),
        estimatedMinutes: z.number().int().nonnegative().optional().default(5),
        sampleAnswer: z.string().optional().default(''),
    })
    .strict();

export const SectionSchema = z
    .object({
        title: z.string().min(1),
        description: z.string().optional().default(''),
        durationMinutes: z.number().int().nonnegative().optional().default(0),
        questions: z.array(QuestionSchema).min(1),
    })
    .strict();

export const CandidateSchema = z
    .object({
        name: z.string(),
        currentRole: z.string().optional().default(''),
        totalExperience: z.string().optional().default(''),
        location: z.string().optional().default(''),
        education: z.string().optional().default(''),
        skills: z.array(z.string()).optional().default([]),
    })
    .strict();

export const GuideSchema = z
    .object({
        id: z.string(),
        generatedAt: z.string(),
        provider: z.string(),
        interviewType: z.string(),
        cvText: z.string().optional(),
        jobDescription: z.string().optional(),
        candidateName: z.string().optional(),
        roleName: z.string().optional(),
        totalDurationMinutes: z.number().int().nonnegative(),
        openingNotes: z.string().optional().default(''),
        closingNotes: z.string().optional().default(''),
        candidate: CandidateSchema,
        sections: z.array(SectionSchema).min(1),
    })
    .strict();

export function validateGuide(value: unknown) {
    return GuideSchema.safeParse(value);
}

export type GuideType = z.infer<typeof GuideSchema>;
