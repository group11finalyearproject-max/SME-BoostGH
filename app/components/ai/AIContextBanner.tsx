import React from 'react';
import { Text, View } from 'react-native';
import { BarChart3, Users, WalletCards } from 'lucide-react-native';
import { BusinessMetrics } from '../../services/ai_sales';

interface AIContextBannerProps {
    metrics?: BusinessMetrics;
}

const MetricPill = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => (
    <View className="flex-1 rounded-2xl bg-white/10 p-3">
        <View className="mb-2">{icon}</View>
        <Text className="text-[11px] font-medium text-primary-100">{label}</Text>
        <Text className="mt-1 text-sm font-bold text-white">{value}</Text>
    </View>
);

export const AIContextBanner: React.FC<AIContextBannerProps> = ({ metrics }) => {
    const hasMetrics = Boolean(metrics);

    return (
        <View className="rounded-3xl bg-primary-900 px-5 py-5 shadow-md dark:bg-primary-800">
            <Text className="text-xs font-semibold uppercase tracking-wider text-primary-200">
                Advisor Context
            </Text>
            <Text className="mt-2 text-2xl font-bold text-white">
                Your assistant is working with your current business snapshot
            </Text>
            <Text className="mt-3 text-sm leading-6 text-primary-100">
                {hasMetrics
                    ? 'Ask about sales, customers, and follow-up priorities. Replies are grounded in the activity currently stored in SME Boost GH.'
                    : 'Your business metrics are not available yet. Add customers and invoices to get more grounded advice.'}
            </Text>

            {hasMetrics ? (
                <View className="mt-5 flex-row gap-3">
                    <MetricPill
                        icon={<Users size={16} color="#D1FAE5" />}
                        label="Customers"
                        value={`${metrics?.total_customers ?? 0}`}
                    />
                    <MetricPill
                        icon={<BarChart3 size={16} color="#DBEAFE" />}
                        label="Invoices"
                        value={`${metrics?.total_invoices ?? 0}`}
                    />
                    <MetricPill
                        icon={<WalletCards size={16} color="#FEF3C7" />}
                        label="Revenue"
                        value={`GHS ${(metrics?.revenue ?? 0).toLocaleString()}`}
                    />
                </View>
            ) : null}
        </View>
    );
};
