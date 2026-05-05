import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftType } from './drafts';

const getResumeKey = (type: DraftType) => `@ai_resume_${type}`;

export interface WorkflowResumePayload {
    title: string;
    content: string;
}

export const saveWorkflowResume = async (
    type: DraftType,
    payload: WorkflowResumePayload
) => {
    await AsyncStorage.setItem(getResumeKey(type), JSON.stringify(payload));
};

export const consumeWorkflowResume = async (
    type: DraftType
): Promise<WorkflowResumePayload | null> => {
    const stored = await AsyncStorage.getItem(getResumeKey(type));
    if (!stored) return null;

    await AsyncStorage.removeItem(getResumeKey(type));
    return JSON.parse(stored);
};
