import React from 'react';
import { Text, View } from 'react-native';

interface AISectionCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const AISectionCard: React.FC<AISectionCardProps> = ({
    title,
    description,
    children,
}) => {
    return (
        <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">{title}</Text>
            {description ? (
                <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {description}
                </Text>
            ) : null}
            <View className="mt-4">{children}</View>
        </View>
    );
};
