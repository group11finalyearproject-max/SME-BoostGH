import AsyncStorage from '@react-native-async-storage/async-storage';

const draftsKey = (userId: string) => `@sme_boost_drafts_${userId}`;

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
    return [];
};

/**
 * Loads all saved drafts for a specific user, sorted newest first.
 */
export const loadDraftsForUser = async (userId: string): Promise<Draft[]> => {
    try {
        const stored = await AsyncStorage.getItem(draftsKey(userId));
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
    userId: string,
    type: DraftType,
    title: string,
    content: string
): Promise<void> => {
    try {
        const existing = await loadDraftsForUser(userId);
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
        await AsyncStorage.setItem(draftsKey(userId), JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save draft:', error);
        throw new Error('Could not save draft. Please try again.');
    }
};

/**
 * Deletes a draft by ID.
 */
export const deleteDraft = async (userId: string, id: string): Promise<void> => {
    try {
        const existing = await loadDraftsForUser(userId);
        const updated = existing.filter((d) => d.id !== id);
        await AsyncStorage.setItem(draftsKey(userId), JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to delete draft:', error);
        throw new Error('Could not delete draft. Please try again.');
    }
};
