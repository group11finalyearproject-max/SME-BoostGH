import { useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { AppFormField } from '../../components/ui/AppFormField';
import { AppScreenHeader } from '../../components/ui/AppScreenHeader';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { setFlashMessage } from '../../services/flashMessage';
import { getCustomers, saveCustomers } from '../../services/businessData';
import { Analytics } from '../../services/analytics';

const inputClassName =
    'rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

export default function NewCustomer() {
    const { user } = useAuth();
    const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showValidation, setShowValidation] = useState(false);

    const nameError =
        showValidation && !name.trim()
            ? 'Add the customer name so the record is easy to recognize later.'
            : '';

    const handleCreate = async () => {
        if (!name.trim()) {
            setShowValidation(true);
            setErrorMessage('Add the customer name before saving this record.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const newCustomer = {
                id: Math.random().toString(36).substr(2, 9),
                user_id: user?.id,
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
                created_at: new Date().toISOString(),
            };
            const customers = await getCustomers(user!.id);
            customers.unshift(newCustomer);
            await saveCustomers(user!.id, customers);
            await Analytics.logEvent('customer_created');

            const destination =
                typeof returnTo === 'string' && returnTo.length > 0 ? returnTo : null;

            setFlashMessage({
                title: 'Customer added',
                description: destination
                    ? `${name.trim()} is saved. You can finish creating the invoice now.`
                    : `${name.trim()} is saved. Next, create your first invoice when you are ready.`,
                tone: 'success',
            });

            if (destination) {
                router.replace(destination as never);
            } else {
                router.back();
            }
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to add customer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <AppScreenHeader
                title="Add Customer"
                subtitle="Create one customer record so invoicing and follow-up become easier."
                onBack={() => router.back()}
            />

            <ScrollView className="flex-1">
                <View className="gap-4 px-5 pb-12 pt-6">
                    {errorMessage ? (
                        <AppStateCard
                            title="Customer record needs a quick fix"
                            description={errorMessage}
                            tone="error"
                        />
                    ) : null}

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <AppFormField
                            label="Customer name"
                            helper="Use the name you recognize most easily in the app."
                            example="Ama Salon"
                            error={nameError}
                            required
                        >
                            <TextInput
                                className={inputClassName}
                                placeholder="Enter customer name"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    setErrorMessage('');
                                }}
                            />
                        </AppFormField>

                        <View className="mt-4">
                            <AppFormField
                                label="Phone"
                                helper="Optional, but helpful for reminders and direct follow-up."
                                example="024..."
                            >
                                <TextInput
                                    className={inputClassName}
                                    placeholder="Phone number"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={(text) => {
                                        setPhone(text);
                                        setErrorMessage('');
                                    }}
                                />
                            </AppFormField>
                        </View>

                        <View className="mt-4">
                            <AppFormField
                                label="Email"
                                helper="Optional, useful if you send updates or invoices by email."
                                example="customer@example.com"
                            >
                                <TextInput
                                    className={inputClassName}
                                    placeholder="Email address"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setErrorMessage('');
                                    }}
                                />
                            </AppFormField>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`min-h-[56px] items-center justify-center rounded-3xl bg-secondary-600 px-4 py-4 ${
                            loading ? 'opacity-70' : 'active:opacity-90'
                        }`}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-base font-bold text-white">Save Customer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
