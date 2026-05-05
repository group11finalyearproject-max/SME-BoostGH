import React from 'react';
import { Text, View } from 'react-native';

interface AIDraftGroupSectionProps {
    title: string;
    description: string;
    count: number;
    children: React.ReactNode;
}

export const AIDraftGroupSection: React.FC<AIDraftGroupSectionProps> = ({
    title,
    description,
    count,
    children,
}) => {
    return (
        <View className="mb-8">
            <View className="mb-3 flex-row items-end justify-between">
                <View className="mr-4 flex-1">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">{title}</Text>
                    <Text className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                        {description}
                    </Text>
                </View>
                <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">
                    <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {count}
                    </Text>
                </View>
            </View>
            <View className="gap-3">{children}</View>
        </View>
    );
};
