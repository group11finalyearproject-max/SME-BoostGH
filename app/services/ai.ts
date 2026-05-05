import { getAuth } from 'firebase/auth';

// Base URL for the AI backend.
// Set EXPO_PUBLIC_API_URL in your .env file.
// Physical device: your machine's LAN IP e.g. http://192.168.1.27:8000
// Android Emulator: http://10.0.2.2:8000
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.27:8000';

/**
 * Retrieves a fresh Firebase ID token for the currently signed-in user.
 * Returns undefined if no user is logged in.
 */
const getFirebaseToken = async (): Promise<string | undefined> => {
    try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        return token;
    } catch (error) {
        console.warn('Could not retrieve Firebase token:', error);
        return undefined;
    }
};

/**
 * Generates AI content (business plan, marketing copy, email, etc.)
 * Token is fetched internally from Firebase — do NOT pass a Supabase token.
 */
export const generateAIContent = async (type: string, context: any): Promise<string> => {
    const token = await getFirebaseToken();

    const response = await fetch(`${API_URL}/ai/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type, context }),
    });

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const detail = errBody?.detail ?? `Request failed with status ${response.status}`;
        throw new Error(detail);
    }

    const data = await response.json();
    return data.content;
};

/**
 * Sends a chat message to the AI and returns the assistant reply.
 * Token is fetched internally from Firebase — do NOT pass a Supabase token.
 */
export const chatWithAI = async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> => {
    const token = await getFirebaseToken();

    const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const detail = errBody?.detail ?? `Request failed with status ${response.status}`;
        throw new Error(detail);
    }

    const data = await response.json();
    return data.content;
};