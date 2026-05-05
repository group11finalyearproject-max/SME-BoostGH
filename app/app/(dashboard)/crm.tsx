import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Phone, Plus, Search, Users } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AppScreenHeader } from '../../components/ui/AppScreenHeader';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { consumeFlashMessage, FlashMessage } from '../../services/flashMessage';

type Customer = {
    id: string;
    name: string;
    phone: string;
    email: string;
    created_at?: string;
};

export default function CRM() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<FlashMessage | null>(null);

    const fetchCustomers = async () => {
        if (!user) return;
        try {
            setErrorMessage('');
            const stored = await AsyncStorage.getItem(`@customers_${user.id}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setCustomers(parsed);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setErrorMessage('We could not load your customers right now.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setFeedbackMessage(consumeFlashMessage());
            fetchCustomers();
        }, [user])
    );

    const filteredCustomers = useMemo(
        () =>
            customers.filter((customer) =>
                customer.name.toLowerCase().includes(search.toLowerCase()) ||
                (customer.email && customer.email.toLowerCase().includes(search.toLowerCase()))
            ),
        [customers, search]
    );

    const showSearchEmpty = search.trim().length > 0 && filteredCustomers.length === 0 && customers.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <AppScreenHeader
                title="Customers"
                subtitle="Keep customer records ready for follow-up, invoicing, and relationship history."
                rightAction={(
                    <TouchableOpacity
                        className="rounded-2xl bg-primary-600 p-3"
                        onPress={() => router.push('/crm/new')}
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                )}
            />

            <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
                ListHeaderComponent={
                    <View className="mb-4 gap-4">
                        <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
                            <Search size={20} color="#9CA3AF" />
                            <TextInput
                                className="ml-2 flex-1 text-gray-900 dark:text-white"
                                placeholder="Search customers"
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        {feedbackMessage ? (
                            <AppStateCard
                                title={feedbackMessage.title}
                                description={feedbackMessage.description}
                                tone={feedbackMessage.tone ?? 'success'}
                            />
                        ) : null}

                        {loading ? (
                            <AppStateCard
                                title="Loading customers"
                                description="SME Boost GH is preparing your customer list."
                                tone="loading"
                            />
                        ) : null}

                        {errorMessage ? (
                            <AppStateCard
                                title="Customers need another try"
                                description={errorMessage}
                                tone="error"
                            />
                        ) : null}
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="mb-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        onPress={() => router.push(`/crm/${item.id}`)}
                    >
                        <View className="flex-row items-center">
                            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-secondary-100">
                                <Text className="text-lg font-bold text-secondary-700">
                                    {item.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    {item.name}
                                </Text>

                                {item.email ? (
                                    <View className="mt-2 flex-row items-center">
                                        <Mail size={14} color="#6B7280" />
                                        <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                            {item.email}
                                        </Text>
                                    </View>
                                ) : null}

                                {item.phone ? (
                                    <View className="mt-1 flex-row items-center">
                                        <Phone size={14} color="#6B7280" />
                                        <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                            {item.phone}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    !loading ? (
                        showSearchEmpty ? (
                            <AppStateCard
                                title="No customers match this search"
                                description="Try a different name or email address."
                                tone="empty"
                            />
                        ) : (
                            <AppStateCard
                                title="No customers yet"
                                description="Add your first customer so follow-up and invoicing become easier."
                                tone="empty"
                                actionLabel="Add first customer"
                                actionHref="/crm/new"
                            />
                        )
                    ) : null
                }
            />
        </SafeAreaView>
    );
}
