import React from 'react';
import { Text, View } from 'react-native';
import { Bot, Sparkles } from 'lucide-react-native';
import { BusinessMetrics } from '../../services/ai_sales';
import { getStructuredAdvisorReply } from '../../lib/aiChat';

interface AIAdvisorMessageCardProps {
    content: string;
    metricsUsed?: BusinessMetrics;
}

export const AIAdvisorMessageCard: React.FC<AIAdvisorMessageCardProps> = ({
    content,
    metricsUsed,
}) => {
    const structured = getStructuredAdvisorReply(content);

    return (
        <View className="max-w-[88%] rounded-[28px] rounded-tl-md border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <View className="flex-row items-center">
                <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                    <Bot size={16} color="#16A34A" />
                </View>
                <Text className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                    SME Boost Advisor
                </Text>
            </View>

            <Text className="mt-3 text-sm leading-7 text-gray-800 dark:text-gray-200">
                {structured.summary}
            </Text>

            {structured.actionItems.length > 0 ? (
                <View className="mt-4 rounded-2xl bg-primary-50 p-3 dark:bg-primary-900/20">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                        Recommended Actions
                    </Text>
                    <View className="mt-2 gap-2">
                        {structured.actionItems.map((item, index) => (
                            <View key={`${item}-${index}`} className="flex-row">
                                <Text className="mr-2 text-sm text-primary-700 dark:text-primary-300">
                                    {index + 1}.
                                </Text>
                                <Text className="flex-1 text-sm leading-6 text-primary-900 dark:text-primary-100">
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : null}

            {structured.supportPoints.length > 0 ? (
                <View className="mt-4 gap-2">
                    {structured.supportPoints.map((item, index) => (
                        <View key={`${item}-${index}`} className="flex-row">
                            <Text className="mr-2 text-sm text-gray-400">•</Text>
                            <Text className="flex-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                {item}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : null}

            {metricsUsed ? (
                <View className="mt-4 flex-row items-center border-t border-gray-100 pt-3 dark:border-gray-700">
                    <Sparkles size={12} color="#9CA3AF" />
                    <Text className="ml-1 text-[11px] text-gray-500 dark:text-gray-400">
                        Grounded in {metricsUsed.total_customers} customers and {metricsUsed.total_invoices} invoices
                    </Text>
                </View>
            ) : null}
        </View>
    );
};
