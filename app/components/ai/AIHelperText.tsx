import React from 'react';
import { Text, View } from 'react-native';

interface AIHelperTextProps {
    helper?: string;
    example?: string;
}

export const AIHelperText: React.FC<AIHelperTextProps> = ({ helper, example }) => {
    if (!helper && !example) return null;

    return (
        <View className="mt-1 gap-1">
            {helper ? (
                <Text className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {helper}
                </Text>
            ) : null}
            {example ? (
                <Text className="text-xs leading-5 text-primary-700 dark:text-primary-300">
                    Example: {example}
                </Text>
            ) : null}
        </View>
    );
};
