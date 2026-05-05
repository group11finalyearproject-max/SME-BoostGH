import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface AIAdvisorTaskCardProps {
    title: string;
    description: string;
    prompt: string;
    icon: LucideIcon;
    iconColor: string;
    iconBgClassName: string;
    onPress: (prompt: string) => void;
}

export const AIAdvisorTaskCard: React.FC<AIAdvisorTaskCardProps> = ({
    title,
    description,
    prompt,
    icon: Icon,
    iconColor,
    iconBgClassName,
    onPress,
}) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(prompt)}
            className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm active:opacity-90 dark:border-gray-700 dark:bg-gray-800"
        >
            <View className={`h-11 w-11 items-center justify-center rounded-2xl ${iconBgClassName}`}>
                <Icon size={20} color={iconColor} />
            </View>
            <Text className="mt-4 text-sm font-bold text-gray-900 dark:text-white">
                {title}
            </Text>
            <Text className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                {description}
            </Text>
        </TouchableOpacity>
    );
};
