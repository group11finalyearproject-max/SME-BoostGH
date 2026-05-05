import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface AIEditableOutputCardProps {
    value: string;
    onChangeText: (value: string) => void;
}

export const AIEditableOutputCard: React.FC<AIEditableOutputCardProps> = ({
    value,
    onChangeText,
}) => {
    return (
        <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Text className="text-base font-bold text-gray-900 dark:text-white">
                Edit your draft
            </Text>
            <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Adjust the wording, add more detail, or personalize the draft before you save or share it.
            </Text>

            <TextInput
                className="mt-4 min-h-[220px] rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                multiline
                textAlignVertical="top"
                value={value}
                onChangeText={onChangeText}
                placeholder="Your editable draft will appear here after generation."
                placeholderTextColor="#9CA3AF"
            />
        </View>
    );
};
