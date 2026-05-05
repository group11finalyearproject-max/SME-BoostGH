import { Alert } from 'react-native';

interface ConfirmDestructiveActionOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void | Promise<void>;
}

export const confirmDestructiveAction = ({
    title,
    message,
    confirmLabel = 'Delete',
    onConfirm,
}: ConfirmDestructiveActionOptions) => {
    Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
            text: confirmLabel,
            style: 'destructive',
            onPress: () => {
                void onConfirm();
            },
        },
    ]);
};
