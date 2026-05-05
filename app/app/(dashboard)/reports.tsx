import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { BarChart3, CircleAlert, TrendingUp, Users, WalletCards } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Analytics } from '../../services/analytics';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { AppScreenHeader } from '../../components/ui/AppScreenHeader';
import { BusinessReport, getBusinessReport, ReportRange } from '../../services/reports';

const formatMoney = (amount: number) =>
    `GHS ${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const ranges: Array<{ value: ReportRange; label: string }> = [
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
];

const statusTone = {
    paid: {
        accent: 'bg-green-100 dark:bg-green-900/30',
        text: '#15803D',
        label: 'Paid',
    },
    pending: {
        accent: 'bg-amber-100 dark:bg-amber-900/30',
        text: '#B45309',
        label: 'Pending',
    },
    overdue: {
        accent: 'bg-red-100 dark:bg-red-900/30',
        text: '#DC2626',
        label: 'Overdue',
    },
} as const;

export default function Reports() {
    const { user } = useAuth();
    const [range, setRange] = useState<ReportRange>('30d');
    const [report, setReport] = useState<BusinessReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchReport = useCallback(
        async (nextRange: ReportRange) => {
            if (!user?.id) return;

            try {
                setLoading(true);
                setErrorMessage('');
                const data = await getBusinessReport(user.id, nextRange);
                setReport(data);
                await Analytics.logEvent('reports_viewed', { range: nextRange });
            } catch (error) {
                console.error('Could not load reports', error);
                setErrorMessage('We could not prepare your reports right now. Please try again.');
            } finally {
                setLoading(false);
            }
        },
        [user?.id]
    );

    useFocusEffect(
        useCallback(() => {
            void fetchReport(range);
        }, [fetchReport, range])
    );

    const highestRevenue = Math.max(...(report?.monthlyRevenue.map((item) => item.amount) ?? [0]), 1);

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <AppScreenHeader
                title="Reports"
                subtitle="Understand revenue, collections, and customer activity more clearly."
            />

            <ScrollView className="flex-1">
                <View className="gap-4 px-5 pb-12 pt-6">
                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <View className="flex-row items-start justify-between">
                            <View className="mr-4 flex-1">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    Business performance snapshot
                                </Text>
                                <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                    These reports are built from your saved customers and invoices, so you can quickly see what is being collected and what still needs follow-up.
                                </Text>
                            </View>
                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                                <BarChart3 size={22} color="#2E7D32" />
                            </View>
                        </View>

                        <View className="mt-5 flex-row flex-wrap gap-2">
                            {ranges.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() => {
                                        setRange(item.value);
                                        void fetchReport(item.value);
                                    }}
                                    className={`rounded-full border px-4 py-2 ${
                                        range === item.value
                                            ? 'border-primary-600 bg-primary-600'
                                            : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700'
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-medium ${
                                            range === item.value
                                                ? 'text-white'
                                                : 'text-gray-700 dark:text-gray-200'
                                        }`}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {loading ? (
                        <AppStateCard
                            title="Preparing reports"
                            description="SME Boost GH is reviewing your latest invoice and customer activity."
                            tone="loading"
                        />
                    ) : null}

                    {errorMessage ? (
                        <AppStateCard
                            title="Reports need another try"
                            description={errorMessage}
                            tone="error"
                        />
                    ) : null}

                    {!loading && report ? (
                        <>
                            <View className="flex-row gap-3">
                                <View className="flex-1 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
                                        <TrendingUp size={20} color="#15803D" />
                                    </View>
                                    <Text className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Revenue Collected
                                    </Text>
                                    <Text className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatMoney(report.paidRevenue)}
                                    </Text>
                                    <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {report.paidCount} paid invoice{report.paidCount === 1 ? '' : 's'} in this period
                                    </Text>
                                </View>

                                <View className="flex-1 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                                        <Users size={20} color="#2563EB" />
                                    </View>
                                    <Text className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Customers
                                    </Text>
                                    <Text className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                        {report.customerCount}
                                    </Text>
                                    <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {report.recentCustomerCount} added in the selected range
                                    </Text>
                                </View>
                            </View>

                            <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <Text className="text-base font-bold text-gray-900 dark:text-white">
                                    Invoice collection health
                                </Text>
                                <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                    Track what has been collected and what still needs action.
                                </Text>

                                <View className="mt-5 gap-3">
                                    {report.statusBreakdown.map((item) => {
                                        const tone = statusTone[item.status];
                                        const denominator =
                                            report.paidRevenue +
                                                report.pendingAmount +
                                                report.overdueAmount || 1;
                                        const width = Math.max((item.amount / denominator) * 100, 8);

                                        return (
                                            <View key={item.status} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/40">
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-row items-center">
                                                        <View className={`mr-3 h-10 w-10 items-center justify-center rounded-2xl ${tone.accent}`}>
                                                            <WalletCards size={18} color={tone.text} />
                                                        </View>
                                                        <View>
                                                            <Text className="font-semibold text-gray-900 dark:text-white">
                                                                {tone.label}
                                                            </Text>
                                                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                                                {item.count} invoice{item.count === 1 ? '' : 's'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text className="font-bold text-gray-900 dark:text-white">
                                                        {formatMoney(item.amount)}
                                                    </Text>
                                                </View>

                                                <View className="mt-4 h-3 rounded-full bg-gray-200 dark:bg-gray-600">
                                                    <View
                                                        className="h-3 rounded-full"
                                                        style={{
                                                            width: `${width}%`,
                                                            backgroundColor: tone.text,
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <Text className="text-base font-bold text-gray-900 dark:text-white">
                                    Monthly revenue trend
                                </Text>
                                <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                    Paid invoices from the last four calendar months.
                                </Text>

                                <View className="mt-5 flex-row items-end justify-between gap-3">
                                    {report.monthlyRevenue.map((item) => (
                                        <View key={item.label} className="flex-1 items-center">
                                            <Text className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                {item.amount > 0 ? formatMoney(item.amount) : 'GHS 0.00'}
                                            </Text>
                                            <View className="h-40 w-full justify-end rounded-3xl bg-gray-100 px-2 pb-2 dark:bg-gray-700/50">
                                                <View
                                                    className="w-full rounded-2xl bg-primary-600"
                                                    style={{
                                                        height: `${Math.max((item.amount / highestRevenue) * 100, item.amount > 0 ? 16 : 4)}%`,
                                                    }}
                                                />
                                            </View>
                                            <Text className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                {item.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View className="rounded-3xl border border-amber-100 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
                                <View className="flex-row items-start">
                                    <View className="mr-3 mt-1">
                                        <CircleAlert size={20} color="#B45309" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-bold text-amber-900 dark:text-amber-100">
                                            Quick interpretation
                                        </Text>
                                        <Text className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-200">
                                            Your collection rate is {(report.collectionRate * 100).toFixed(0)}%. If overdue invoices are rising, the next best action is to send reminders or share invoice details again from the invoice screen.
                                        </Text>
                                        <Text className="mt-3 text-sm leading-6 text-amber-800 dark:text-amber-200">
                                            Average invoice value: {formatMoney(report.averageInvoiceValue)}.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
