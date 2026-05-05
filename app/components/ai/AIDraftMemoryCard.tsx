import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Copy, Share2, Trash2 } from 'lucide-react-native';

interface AIDraftMemoryCardProps {
    title: string;
    subtitle: string;
    preview: string;
    accentBgClassName: string;
    accentTextClassName: string;
    continueLabel: string;
    onContinue: () => void;
    onCopy: () => void;
    onShare: () => void;
    onDelete: () => void;
}

export const AIDraftMemoryCard: React.FC<AIDraftMemoryCardProps> = ({
    title,
    subtitle,
    preview,
    accentBgClassName,
    accentTextClassName,
    continueLabel,
    onContinue,
    onCopy,
    onShare,
    onDelete,
}) => {
    return (
        <View className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                        {title}
                    </Text>
                    <View className={`mt-2 self-start rounded-full px-3 py-1 ${accentBgClassName}`}>
                        <Text className={`text-[11px] font-semibold ${accentTextClassName}`}>
                            {subtitle}
                        </Text>
                    </View>
                </View>
            </View>

            <Text className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300" numberOfLines={4}>
                {preview}
            </Text>

            <TouchableOpacity
                onPress={onContinue}
                className="mt-4 min-h-[48px] items-center justify-center rounded-2xl bg-primary-600 px-4 py-3 active:opacity-90"
            >
                <Text className="text-sm font-bold text-white">{continueLabel}</Text>
            </TouchableOpacity>

            <View className="mt-3 flex-row gap-3">
                <TouchableOpacity
                    onPress={onCopy}
                    className="min-h-[44px] flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 active:opacity-90 dark:border-gray-600 dark:bg-gray-700"
                >
                    <Copy size={14} color="#6B7280" />
                    <Text className="ml-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Copy
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onShare}
                    className="min-h-[44px] flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 active:opacity-90 dark:border-gray-600 dark:bg-gray-700"
                >
                    <Share2 size={14} color="#6B7280" />
                    <Text className="ml-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Share
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onDelete}
                    className="min-h-[44px] flex-1 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-3 py-3 active:opacity-90 dark:border-red-800 dark:bg-red-900/20"
                >
                    <Trash2 size={14} color="#EF4444" />
                    <Text className="ml-2 text-xs font-semibold text-red-500">
                        Delete
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
