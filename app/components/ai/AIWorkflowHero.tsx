import React from 'react';
import { Text, View } from 'react-native';

interface AIWorkflowHeroProps {
    eyebrow: string;
    title: string;
    description: string;
}

export const AIWorkflowHero: React.FC<AIWorkflowHeroProps> = ({
    eyebrow,
    title,
    description,
}) => {
    return (
        <View className="rounded-3xl bg-primary-900 px-5 py-6 shadow-md dark:bg-primary-800">
            <Text className="text-xs font-semibold uppercase tracking-wider text-primary-200">
                {eyebrow}
            </Text>
            <Text className="mt-2 text-3xl font-bold leading-tight text-white">
                {title}
            </Text>
            <Text className="mt-3 text-sm leading-6 text-primary-100">
                {description}
            </Text>
        </View>
    );
};
