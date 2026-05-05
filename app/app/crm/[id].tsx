import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AppFormField } from '../../components/ui/AppFormField';
import { AppScreenHeader } from '../../components/ui/AppScreenHeader';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { confirmDestructiveAction } from '../../services/confirm';
import { setFlashMessage } from '../../services/flashMessage';
import { getCustomers, saveCustomers, updateCustomer } from '../../services/businessData';
import { Analytics } from '../../services/analytics';

const inputClassName =
    'rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

export default function CustomerDetail() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [showValidation, setShowValidation] = useState(false);

    const nameError =
        showValidation && !name.trim()
            ? 'Customer name cannot be empty.'
            : '';

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!id || !user) return;

            try {
                setErrorMessage('');
                const customers = await getCustomers(user.id);
                const data = customers.find((customer: any) => customer.id === id);
                if (data) {
                    setName(data.name);
                    setPhone(data.phone || '');
                    setEmail(data.email || '');
                } else {
                    setErrorMessage('This customer record could not be found.');
                }
            } catch (error) {
                console.error('Error fetching customer:', error);
                setErrorMessage('Could not load customer details. Please try again.');
            } finally {
                setFetching(false);
            }
        };

        fetchCustomer();
    }, [id, user]);

    const handleSave = async () => {
        if (!user) return;
        if (!name.trim()) {
            setShowValidation(true);
            setErrorMessage('Add the customer name before saving your changes.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            await updateCustomer(user.id, String(id), (customer) => ({
                ...customer,
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
            }));
            await Analytics.logEvent('customer_updated');

            setFlashMessage({
                title: 'Customer updated',
                description: `${name.trim()} has been updated successfully.`,
                tone: 'success',
            });
            router.back();
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to update customer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        confirmDestructiveAction({
            title: 'Delete customer',
            message: 'This will remove the customer record from SME Boost GH. You cannot undo this action.',
            confirmLabel: 'Delete',
            onConfirm: async () => {
                if (!user) return;

                try {
                    const customers = await getCustomers(user.id);
                    await saveCustomers(user.id, customers.filter((customer: any) => customer.id !== id));
                    await Analytics.logEvent('customer_deleted');

                    setFlashMessage({
                        title: 'Customer deleted',
                        description: 'The customer record has been removed.',
                        tone: 'success',
                    });
                    router.back();
                } catch (error: any) {
                    setErrorMessage(error?.message || 'Failed to delete customer. Please try again.');
                }
            },
        });
    };

    if (fetching) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
                <View className="px-5 pt-10">
                    <AppStateCard
                        title="Loading customer details"
                        description="SME Boost GH is preparing this customer record for you."
                        tone="loading"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <AppScreenHeader
                title="Edit Customer"
                subtitle="Update the customer details you want to keep current."
                onBack={() => router.back()}
                rightAction={(
                    <TouchableOpacity onPress={handleDelete} className="rounded-2xl bg-red-50 p-3 dark:bg-red-900/20">
                        <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                )}
            />

            <ScrollView className="flex-1">
                <View className="gap-4 px-5 pb-12 pt-6">
                    {errorMessage ? (
                        <AppStateCard
                            title="Customer record needs attention"
                            description={errorMessage}
                            tone={!name && !phone && !email ? 'error' : 'warning'}
                        />
                    ) : null}

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <AppFormField
                            label="Customer name"
                            helper="Use the name you want to see in lists, invoices, and reminders."
                            error={nameError}
                            required
                        >
                            <TextInput
                                className={inputClassName}
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    setErrorMessage('');
                                }}
                                placeholder="Enter customer name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </AppFormField>

                        <View className="mt-4">
                            <AppFormField label="Phone" helper="Optional contact number for quick follow-up.">
                                <TextInput
                                    className={inputClassName}
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={(text) => {
                                        setPhone(text);
                                        setErrorMessage('');
                                    }}
                                    placeholder="Phone number"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </AppFormField>
                        </View>

                        <View className="mt-4">
                            <AppFormField label="Email" helper="Optional email for invoices or professional updates.">
                                <TextInput
                                    className={inputClassName}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setErrorMessage('');
                                    }}
                                    placeholder="Email address"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </AppFormField>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`min-h-[56px] items-center justify-center rounded-3xl bg-secondary-600 px-4 py-4 ${
                            loading ? 'opacity-70' : 'active:opacity-90'
                        }`}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-base font-bold text-white">Update Customer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
