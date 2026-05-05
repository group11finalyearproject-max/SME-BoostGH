import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';

interface InsightCardProps {
    title: string;
    value: string;
    helper: string;
    icon: LucideIcon;
    accentClassName: string;
    iconColor: string;
    loading?: boolean;
    className?: string;
    actionLabel?: string;
    actionHref?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
    title,
    value,
    helper,
    icon: Icon,
    accentClassName,
    iconColor,
    loading = false,
    className = '',
    actionLabel,
    actionHref,
}) => {
    return (
        <View
            className={`rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
        >
            <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </Text>
                    {loading ? (
                        <ActivityIndicator
                            size="small"
                            color="#2E7D32"
                            className="mt-3 self-start"
                        />
                    ) : (
                        <Text className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </Text>
                    )}
                    <Text className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                        {helper}
                    </Text>
                </View>

                <View className={`h-11 w-11 items-center justify-center rounded-2xl ${accentClassName}`}>
                    <Icon size={20} color={iconColor} />
                </View>
            </View>

            {actionLabel && actionHref ? (
                <View className="mt-4">
                    <Link href={actionHref as never} asChild>
                        <TouchableOpacity className="rounded-2xl bg-gray-50 px-3 py-3 active:opacity-90 dark:bg-gray-700">
                            <Text className="text-center text-xs font-semibold text-primary-600 dark:text-primary-400">
                                {actionLabel}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            ) : null}
        </View>
    );
};
