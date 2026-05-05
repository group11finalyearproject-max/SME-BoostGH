import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle, Copy, Share2 } from 'lucide-react-native';

interface AIVariantCardProps {
    title: string;
    description?: string;
    content: string;
    selected?: boolean;
    onUse: () => void;
    onCopy: () => void;
    onShare: () => void;
}

export const AIVariantCard: React.FC<AIVariantCardProps> = ({
    title,
    description,
    content,
    selected = false,
    onUse,
    onCopy,
    onShare,
}) => {
    return (
        <View
            className={`rounded-3xl border p-5 shadow-sm ${
                selected
                    ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                    : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}
        >
            <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                        {title}
                    </Text>
                    {description ? (
                        <Text className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {description}
                        </Text>
                    ) : null}
                </View>

                {selected ? <CheckCircle size={18} color="#2E7D32" /> : null}
            </View>

            <Text className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {content}
            </Text>

            <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                    onPress={onUse}
                    className={`min-h-[44px] flex-1 items-center justify-center rounded-2xl px-3 py-3 ${
                        selected
                            ? 'bg-primary-600 active:opacity-90'
                            : 'bg-gray-100 active:opacity-90 dark:bg-gray-700'
                    }`}
                >
                    <Text
                        className={`text-xs font-semibold ${
                            selected
                                ? 'text-white'
                                : 'text-gray-700 dark:text-gray-200'
                        }`}
                    >
                        {selected ? 'Using This Version' : 'Use This Version'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onCopy}
                    className="min-h-[44px] flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 active:opacity-90 dark:border-gray-600 dark:bg-gray-700"
                >
                    <Copy size={15} color="#6B7280" />
                    <Text className="ml-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Copy
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onShare}
                    className="min-h-[44px] flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 active:opacity-90 dark:border-gray-600 dark:bg-gray-700"
                >
                    <Share2 size={15} color="#6B7280" />
                    <Text className="ml-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Share
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
