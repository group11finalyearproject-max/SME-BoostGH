import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface AppScreenHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export const AppScreenHeader: React.FC<AppScreenHeaderProps> = ({
    title,
    subtitle,
    onBack,
    rightAction,
}) => {
    return (
        <View className="border-b border-gray-100 bg-white px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <View className="flex-row items-center justify-between">
                <View className="mr-4 flex-1 flex-row items-center">
                    {onBack ? (
                        <TouchableOpacity onPress={onBack} className="mr-4 p-2 -ml-2">
                            <ArrowLeft size={24} color="#6B7280" />
                        </TouchableOpacity>
                    ) : null}

                    <View className="flex-1">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </Text>
                        {subtitle ? (
                            <Text className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {rightAction}
            </View>
        </View>
    );
};
