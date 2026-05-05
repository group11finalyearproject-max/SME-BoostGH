import React from 'react';
import { Text, View } from 'react-native';
import { MessageSquare, Plus, Users } from 'lucide-react-native';
import { PrimaryActionCard } from './PrimaryActionCard';

interface GettingStartedCardProps {
    hasCustomers: boolean;
    customerCount: number;
}

export const GettingStartedCard: React.FC<GettingStartedCardProps> = ({
    hasCustomers,
    customerCount,
}) => {
    const title = hasCustomers
        ? 'Your business activity will appear here soon'
        : 'Your business activity will start with one customer';
    const description = hasCustomers
        ? `You already have ${customerCount} ${customerCount === 1 ? 'customer' : 'customers'}. Create your first invoice to begin tracking payments, revenue, and follow-up work.`
        : 'Add a customer first, then create your first invoice. SME Boost GH will start organizing your business activity from there.';

    return (
        <View className="rounded-3xl border border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">{title}</Text>
            <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {description}
            </Text>

            <View className="mt-4 gap-3">
                {hasCustomers ? (
                    <PrimaryActionCard
                        title="Create Invoice"
                        description="Send your first invoice and start tracking revenue."
                        href="/invoices/new"
                        icon={Plus}
                        tone="primary"
                    />
                ) : (
                    <PrimaryActionCard
                        title="Add Customer"
                        description="Create a customer profile before you raise your first invoice."
                        href="/crm/new"
                        icon={Users}
                        tone="secondary"
                    />
                )}

                <PrimaryActionCard
                    title="Open AI Tools"
                    description="Choose the AI workflow that fits your next business task."
                    href="/ai-tools"
                    icon={MessageSquare}
                />
            </View>
        </View>
    );
};
