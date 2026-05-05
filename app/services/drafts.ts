import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFTS_KEY = '@sme_boost_drafts';

export type DraftType = 'business_plan' | 'marketing' | 'email';

export interface Draft {
    id: string;
    title: string;
    type: DraftType;
    content: string;
    createdAt: number; // timestamp for sorting
    date: string;      // human-readable date e.g. "04 Apr 2026"
}

/**
 * Returns a friendly label for the draft type.
 */
export const getDraftTypeLabel = (type: DraftType): string => {
    switch (type) {
        case 'business_plan': return 'Business Plan';
        case 'marketing':     return 'Marketing';
        case 'email':         return 'Email';
        default:              return 'Draft';
    }
};

/**
 * Loads all saved drafts, sorted newest first.
 */
export const loadDrafts = async (): Promise<Draft[]> => {
    try {
        const stored = await AsyncStorage.getItem(DRAFTS_KEY);
        const drafts: Draft[] = stored ? JSON.parse(stored) : [];
        return drafts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error('Failed to load drafts:', error);
        return [];
    }
};

/**
 * Saves a new draft to AsyncStorage.
 */
export const saveDraft = async (
    type: DraftType,
    title: string,
    content: string
): Promise<void> => {
    try {
        const existing = await loadDrafts();
        const now = new Date();
        const newDraft: Draft = {
            id: `draft_${Date.now()}`,
            title,
            type,
            content,
            createdAt: now.getTime(),
            date: now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
        };
        const updated = [newDraft, ...existing];
        await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save draft:', error);
        throw new Error('Could not save draft. Please try again.');
    }
};

/**
 * Deletes a draft by ID.
 */
export const deleteDraft = async (id: string): Promise<void> => {
    try {
        const existing = await loadDrafts();
        const updated = existing.filter((d) => d.id !== id);
        await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to delete draft:', error);
        throw new Error('Could not delete draft. Please try again.');
    }
};
