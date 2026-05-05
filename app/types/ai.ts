export type AIToolType = 'email' | 'business_plan' | 'marketing' | 'financial_summary' | 'chat';

export interface AIContentRequest {
    type: AIToolType;
    context: Record<string, string | number>;
}

export interface AIChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIDraft {
    id: string;
    user_id: string;
    type: AIToolType;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}
