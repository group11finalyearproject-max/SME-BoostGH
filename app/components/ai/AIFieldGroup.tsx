import React from 'react';
import { Text, View } from 'react-native';
import { AIHelperText } from './AIHelperText';

interface AIFieldGroupProps {
    label: string;
    helper?: string;
    example?: string;
    children: React.ReactNode;
}

export const AIFieldGroup: React.FC<AIFieldGroupProps> = ({
    label,
    helper,
    example,
    children,
}) => {
    return (
        <View className="mb-4 last:mb-0">
            <Text className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                {label}
            </Text>
            {children}
            <AIHelperText helper={helper} example={example} />
        </View>
    );
};
