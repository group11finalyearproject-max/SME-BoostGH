import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { BookmarkPlus, CheckCircle, Copy, RotateCcw, Share2 } from 'lucide-react-native';

interface AIActionBarProps {
    onRegenerate: () => void;
    onSave: () => void;
    onCopy: () => void;
    onShare: () => void;
    loading?: boolean;
    saving?: boolean;
    saved?: boolean;
    copied?: boolean;
}

const ActionButton = ({
    label,
    icon,
    onPress,
    disabled,
    variant = 'neutral',
}: {
    label: string;
    icon: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'neutral' | 'accent' | 'success';
}) => {
    const variantClass =
        variant === 'accent'
            ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/30 dark:border-primary-800'
            : variant === 'success'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800'
                : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600';

    const textClass =
        variant === 'accent'
            ? 'text-primary-700 dark:text-primary-300'
            : variant === 'success'
                ? 'text-green-700 dark:text-green-300'
                : 'text-gray-700 dark:text-gray-300';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`min-h-[48px] flex-1 flex-row items-center justify-center rounded-2xl border px-3 py-3 ${
                disabled ? 'opacity-60' : 'active:opacity-90'
            } ${variantClass}`}
        >
            {icon}
            <Text className={`ml-2 text-xs font-semibold ${textClass}`}>{label}</Text>
        </TouchableOpacity>
    );
};

export const AIActionBar: React.FC<AIActionBarProps> = ({
    onRegenerate,
    onSave,
    onCopy,
    onShare,
    loading = false,
    saving = false,
    saved = false,
    copied = false,
}) => {
    return (
        <View className="gap-3">
            <View className="flex-row gap-3">
                <ActionButton
                    label="Regenerate"
                    onPress={onRegenerate}
                    disabled={loading}
                    icon={<RotateCcw size={16} color="#6B7280" />}
                />
                <ActionButton
                    label={copied ? 'Copied' : 'Copy'}
                    onPress={onCopy}
                    disabled={loading}
                    variant={copied ? 'success' : 'neutral'}
                    icon={
                        copied ? (
                            <CheckCircle size={16} color="#16A34A" />
                        ) : (
                            <Copy size={16} color="#6B7280" />
                        )
                    }
                />
            </View>

            <View className="flex-row gap-3">
                <ActionButton
                    label="Share"
                    onPress={onShare}
                    disabled={loading}
                    icon={<Share2 size={16} color="#6B7280" />}
                />
                <ActionButton
                    label={saving ? 'Saving' : saved ? 'Saved' : 'Save'}
                    onPress={onSave}
                    disabled={loading || saving || saved}
                    variant={saved ? 'success' : 'accent'}
                    icon={
                        saving ? (
                            <ActivityIndicator size="small" color="#2E7D32" />
                        ) : saved ? (
                            <CheckCircle size={16} color="#16A34A" />
                        ) : (
                            <BookmarkPlus size={16} color="#2E7D32" />
                        )
                    }
                />
            </View>
        </View>
    );
};
