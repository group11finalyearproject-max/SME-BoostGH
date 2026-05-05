import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight, FileText } from 'lucide-react-native';
import { Invoice } from '../../types/invoice';
import { StatusBadge } from '../shared/StatusBadge';

interface RecentActivityCardProps {
    invoice: Invoice;
}

const getActivityLabel = (status: Invoice['status']) => {
    if (status === 'paid') return 'Paid and completed';
    if (status === 'pending') return 'Waiting for payment';
    return 'Needs follow-up';
};

const formatMoney = (amount: number) =>
    `GHS ${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ invoice }) => {
    return (
        <Link href={`/invoices/${invoice.id}` as never} asChild>
            <TouchableOpacity className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm active:opacity-90 dark:border-gray-700 dark:bg-gray-800">
                <View className="flex-row items-start justify-between">
                    <View className="mr-3 flex-1">
                        <View className="flex-row items-center">
                            <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30">
                                <FileText size={20} color="#2E7D32" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold text-gray-900 dark:text-white">
                                    {invoice.customer_name || 'Unnamed customer'}
                                </Text>
                                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {getActivityLabel(invoice.status)} • {new Date(invoice.created_at).toLocaleDateString()}
                                </Text>
                                {invoice.due_date ? (
                                    <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Due {new Date(invoice.due_date).toLocaleDateString()}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        <Text className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                            {formatMoney(invoice.amount)}
                        </Text>
                    </View>

                    <View className="items-end">
                        <StatusBadge status={invoice.status} />
                        <View className="mt-5">
                            <ChevronRight size={18} color="#9CA3AF" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
};
