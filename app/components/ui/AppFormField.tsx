import React from 'react';
import { Text, View } from 'react-native';

interface AppFormFieldProps {
    label: string;
    helper?: string;
    example?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export const AppFormField: React.FC<AppFormFieldProps> = ({
    label,
    helper,
    example,
    error,
    required = false,
    children,
}) => {
    return (
        <View>
            <View className="mb-2 flex-row items-center">
                <Text className="font-semibold text-gray-800 dark:text-gray-200">{label}</Text>
                {required ? <Text className="ml-1 text-red-500">*</Text> : null}
            </View>

            {children}

            {error ? (
                <Text className="mt-2 text-sm leading-5 text-red-600 dark:text-red-300">{error}</Text>
            ) : helper ? (
                <Text className="mt-2 text-sm leading-5 text-gray-500 dark:text-gray-400">
                    {helper}
                    {example ? ` Example: ${example}` : ''}
                </Text>
            ) : example ? (
                <Text className="mt-2 text-sm leading-5 text-gray-500 dark:text-gray-400">
                    Example: {example}
                </Text>
            ) : null}
        </View>
    );
};
