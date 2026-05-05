import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

interface DashboardHeroProps {
    firstName: string;
    summary: string;
    customerCount: number;
    invoiceCount: number;
    primaryActionLabel: string;
    primaryActionHref: string;
    secondaryActionLabel: string;
    secondaryActionHref: string;
}

const SummaryChip = ({ label }: { label: string }) => (
    <View className="rounded-full bg-white/15 px-3 py-2">
        <Text className="text-xs font-medium text-white">{label}</Text>
    </View>
);

export const DashboardHero: React.FC<DashboardHeroProps> = ({
    firstName,
    summary,
    customerCount,
    invoiceCount,
    primaryActionLabel,
    primaryActionHref,
    secondaryActionLabel,
    secondaryActionHref,
}) => {
    const initial = firstName.charAt(0).toUpperCase() || 'U';

    return (
        <View className="rounded-3xl bg-primary-600 px-5 py-6 shadow-md dark:bg-primary-700">
            <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                    <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-100">
                        Business Command Center
                    </Text>
                    <Text className="text-3xl font-bold leading-tight text-white">
                        Hello, {firstName}
                    </Text>
                    <Text className="mt-3 text-sm leading-6 text-primary-50">
                        {summary}
                    </Text>
                </View>

                <View className="h-14 w-14 items-center justify-center rounded-full bg-white/15">
                    <Text className="text-xl font-bold text-white">{initial}</Text>
                </View>
            </View>

            <View className="mt-5 flex-row gap-3">
                <SummaryChip
                    label={`${customerCount} ${customerCount === 1 ? 'customer' : 'customers'}`}
                />
                <SummaryChip
                    label={`${invoiceCount} ${invoiceCount === 1 ? 'invoice' : 'invoices'}`}
                />
            </View>

            <View className="mt-5 flex-row gap-3">
                <View className="flex-1">
                    <Link href={primaryActionHref as never} asChild>
                        <TouchableOpacity className="min-h-[48px] items-center justify-center rounded-2xl bg-white px-4 py-3 active:opacity-90">
                            <Text className="text-sm font-bold text-primary-700">
                                {primaryActionLabel}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <View className="flex-1">
                    <Link href={secondaryActionHref as never} asChild>
                        <TouchableOpacity className="min-h-[48px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3 active:opacity-90">
                            <Text className="text-sm font-semibold text-white">
                                {secondaryActionLabel}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
};
