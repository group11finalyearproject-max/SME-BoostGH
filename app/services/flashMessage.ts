export type FlashMessageTone = 'success' | 'error' | 'warning' | 'neutral';

export interface FlashMessage {
    title: string;
    description: string;
    tone?: FlashMessageTone;
}

let pendingFlashMessage: FlashMessage | null = null;

export const setFlashMessage = (message: FlashMessage) => {
    pendingFlashMessage = message;
};

export const consumeFlashMessage = () => {
    const message = pendingFlashMessage;
    pendingFlashMessage = null;
    return message;
};
