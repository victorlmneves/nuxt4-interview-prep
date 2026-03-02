export type TProvider = 'anthropic' | 'openai' | 'gemini';

export type TInterviewType = 'technical' | 'behavioural' | 'mixed';

export type TQuestionCategory = 'technical' | 'behavioural' | 'situational' | 'culture' | 'leadership' | 'problemSolving';

export type TDifficulty = 'easy' | 'medium' | 'hard';

export type TConfidence = 'low' | 'medium' | 'high';

export interface ICandidate {
    name: string;
    currentRole: string;
    totalExperience: string;
    location: string;
    education: string;
    skills: string[];
}

export interface IInterviewQuestion {
    id: string;
    question: string;
    category: TQuestionCategory;
    difficulty: TDifficulty;
    rationale: string;
    followUps: string[];
    evaluationCriteria: string[];
    estimatedMinutes: number;
}

export interface IInterviewSection {
    title: string;
    description: string;
    durationMinutes: number;
    questions: IInterviewQuestion[];
}

export interface IInterviewGuide {
    id: string;
    candidateName: string;
    roleName: string;
    provider: TProvider;
    generatedAt: string;
    totalDurationMinutes: number;
    interviewType: TInterviewType;
    openingNotes: string;
    closingNotes: string;
    sections: IInterviewSection[];
    candidate: ICandidate;
    cvText: string;
    jobDescription: string;
}

export interface IHistoryEntry {
    id: string;
    candidateName: string;
    roleName: string;
    interviewType: TInterviewType;
    provider: TProvider;
    totalQuestions: number;
    createdAt: string;
}

export interface IGeneratePayload {
    cvText: string;
    jobDescription: string;
    provider: TProvider;
    interviewType: TInterviewType;
}
