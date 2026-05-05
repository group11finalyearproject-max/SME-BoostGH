import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    actionLabel?: string;
    actionHref?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    actionLabel,
    actionHref,
}) => {
    return (
        <View className="mb-3 flex-row items-end justify-between">
            <View className="mr-4 flex-1">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">{title}</Text>
                <Text className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                    {subtitle}
                </Text>
            </View>

            {actionLabel && actionHref ? (
                <Link href={actionHref as never} asChild>
                    <TouchableOpacity className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
                        <Text className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                            {actionLabel}
                        </Text>
                    </TouchableOpacity>
                </Link>
            ) : null}
        </View>
    );
};
