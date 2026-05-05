import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { AppScreenHeader } from '../../components/ui/AppScreenHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { consumeFlashMessage, FlashMessage } from '../../services/flashMessage';

type Invoice = {
    id: string;
    customer_name: string;
    amount: number;
    status: string;
    created_at: string;
    due_date?: string;
};

const formatMoney = (amount: number) =>
    `GHS ${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function Invoices() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<FlashMessage | null>(null);

    const fetchInvoices = async () => {
        if (!user) return;
        try {
            setErrorMessage('');
            const stored = await AsyncStorage.getItem(`@invoices_${user.id}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setInvoices(parsed);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setErrorMessage('We could not load your invoices right now. Pull down to try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setFeedbackMessage(consumeFlashMessage());
            fetchInvoices();
        }, [user])
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <AppScreenHeader
                title="Invoices"
                subtitle="Review what has been billed, paid, or still needs follow-up."
                rightAction={(
                    <TouchableOpacity
                        className="rounded-2xl bg-primary-600 p-3"
                        onPress={() => router.push('/invoices/new')}
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                )}
            />

            <FlatList
                data={invoices}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true);
                    fetchInvoices();
                }} />}
                ListHeaderComponent={
                    <View className="mb-4 gap-4">
                        {feedbackMessage ? (
                            <AppStateCard
                                title={feedbackMessage.title}
                                description={feedbackMessage.description}
                                tone={feedbackMessage.tone ?? 'success'}
                            />
                        ) : null}

                        {loading ? (
                            <AppStateCard
                                title="Loading invoices"
                                description="SME Boost GH is organizing your latest billing activity."
                                tone="loading"
                            />
                        ) : null}

                        {errorMessage ? (
                            <AppStateCard
                                title="Invoices need another try"
                                description={errorMessage}
                                tone="error"
                            />
                        ) : null}
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="mb-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        onPress={() => router.push(`/invoices/${item.id}`)}
                    >
                        <View className="flex-row items-start justify-between">
                            <View className="mr-3 flex-1">
                                <Text className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                    {item.id}
                                </Text>
                                <Text className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                                    {item.customer_name || 'Unknown customer'}
                                </Text>
                                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Created {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Due {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'not set'}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatMoney(item.amount)}
                                </Text>
                                <View className="mt-2">
                                    <StatusBadge status={item.status} />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    !loading ? (
                        <AppStateCard
                            title="No invoices yet"
                            description="Create your first invoice to start tracking payments, revenue, and customer activity."
                            tone="empty"
                            actionLabel="Create first invoice"
                            actionHref="/invoices/new"
                        />
                    ) : null
                }
            />
        </SafeAreaView>
    );
}
