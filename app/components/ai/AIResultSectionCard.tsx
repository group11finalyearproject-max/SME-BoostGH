import React from 'react';
import { Text, View } from 'react-native';

interface AIResultSectionCardProps {
    title: string;
    content: string;
}

export const AIResultSectionCard: React.FC<AIResultSectionCardProps> = ({
    title,
    content,
}) => {
    return (
        <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Text className="text-base font-bold text-gray-900 dark:text-white">{title}</Text>
            <Text className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {content}
            </Text>
        </View>
    );
};
