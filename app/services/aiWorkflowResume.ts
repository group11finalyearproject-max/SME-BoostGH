import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftType } from './drafts';

const getResumeKey = (userId: string, type: DraftType) => `@ai_resume_${userId}_${type}`;

export interface WorkflowResumePayload {
    title: string;
    content: string;
}

export const saveWorkflowResume = async (
    userId: string,
    type: DraftType,
    payload: WorkflowResumePayload
) => {
    await AsyncStorage.setItem(getResumeKey(userId, type), JSON.stringify(payload));
};

export const consumeWorkflowResume = async (
    userId: string,
    type: DraftType
): Promise<WorkflowResumePayload | null> => {
    const stored = await AsyncStorage.getItem(getResumeKey(userId, type));
    if (!stored) return null;

    await AsyncStorage.removeItem(getResumeKey(userId, type));
    return JSON.parse(stored);
};
