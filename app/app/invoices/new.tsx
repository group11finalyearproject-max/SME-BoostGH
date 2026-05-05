import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { calculateGhanaTaxes } from '../../services/tax';
import { useAuth } from '../../contexts/AuthContext';
import { AppFormField } from '../../components/ui/AppFormField';
import { AppScreenHeader } from '../../components/ui/AppScreenHeader';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { setFlashMessage } from '../../services/flashMessage';
import { getCustomers, getInvoices, saveInvoices } from '../../services/businessData';
import { syncInvoiceNotifications } from '../../services/notifications';
import { Analytics } from '../../services/analytics';

const inputClassName =
    'rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

const dueDateOptions = [
    { label: 'Today', days: 0 },
    { label: '7 Days', days: 7 },
    { label: '14 Days', days: 14 },
    { label: '30 Days', days: 30 },
];

const buildDueDate = (days: number) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toISOString();
};

export default function NewInvoice() {
    const { user } = useAuth();
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [applyTax, setApplyTax] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showValidation, setShowValidation] = useState(false);
    const [dueInDays, setDueInDays] = useState(7);

    const subtotalNum = parseFloat(amount) || 0;
    const taxData = applyTax ? calculateGhanaTaxes(subtotalNum) : undefined;
    const grandTotal = taxData ? subtotalNum + taxData.totalTax : subtotalNum;
    const dueDate = buildDueDate(dueInDays);

    const customerError =
        showValidation && !customerName.trim()
            ? 'Choose a customer before you create the invoice.'
            : '';
    const amountError =
        showValidation && subtotalNum <= 0
            ? 'Enter a valid amount greater than 0.'
            : '';

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        if (!user) return;
        setCustomers(await getCustomers(user.id));
    };

    const handleCreate = async () => {
        if (!customerName.trim() || subtotalNum <= 0) {
            setShowValidation(true);
            setErrorMessage('Fix the highlighted fields so the invoice is complete and ready to save.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const invoiceId = `INV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

            const newInvoice = {
                id: invoiceId,
                user_id: user?.id,
                customer_id: customerId ?? undefined,
                customer_name: customerName,
                subtotal: subtotalNum,
                taxBreakdown: taxData,
                amount: grandTotal,
                description: desc,
                status: 'pending' as const,
                due_date: dueDate,
                created_at: new Date().toISOString(),
                sync_status: 'pending_sync' as const,
            };

            const invoices = await getInvoices(user!.id);
            invoices.unshift(newInvoice);
            await saveInvoices(user!.id, invoices);
            await syncInvoiceNotifications(user!.id);
            await Analytics.logEvent('invoice_created', {
                has_tax: Boolean(taxData),
                due_in_days: dueInDays,
            });

            setFlashMessage({
                title: 'Invoice created',
                description: `Your invoice for ${customerName} has been saved and is due on ${new Date(dueDate).toLocaleDateString()}.`,
                tone: 'success',
            });
            router.back();
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to create invoice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectCustomer = (customer: any) => {
        setCustomerId(customer.id);
        setCustomerName(customer.name);
        setShowCustomerModal(false);
        setShowValidation(false);
        setErrorMessage('');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <AppScreenHeader
                title="Create Invoice"
                subtitle="Fill in the basics, then save the invoice so you can track payment clearly."
                onBack={() => router.back()}
            />

            <ScrollView className="flex-1">
                <View className="gap-4 px-5 pb-12 pt-6">
                    {customers.length === 0 ? (
                        <AppStateCard
                            title="Add a customer before invoicing"
                            description="Invoices work best when they are linked to a customer record. Add a customer now and SME Boost GH will bring you back here to finish the invoice."
                            tone="warning"
                            actionLabel="Add customer and return"
                            actionHref="/crm/new?returnTo=%2Finvoices%2Fnew"
                        />
                    ) : null}

                    {errorMessage ? (
                        <AppStateCard
                            title="Invoice needs a few fixes"
                            description={errorMessage}
                            tone="error"
                        />
                    ) : null}

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <AppFormField
                            label="Customer"
                            helper="Choose the customer this invoice belongs to."
                            error={customerError}
                            required
                        >
                            <TouchableOpacity
                                onPress={() => setShowCustomerModal(true)}
                                className="min-h-[56px] flex-row items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 dark:border-gray-600 dark:bg-gray-700"
                            >
                                <Text className={customerName ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                                    {customerName || 'Select customer'}
                                </Text>
                                <ChevronDown size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </AppFormField>

                        <View className="mt-4">
                            <AppFormField
                                label="Description"
                                helper="Keep this short and practical so the customer understands what they are being charged for."
                                example="Supply of packaged drinks for April event"
                            >
                                <TextInput
                                    className={`${inputClassName} min-h-[96px]`}
                                    placeholder="Item or service details"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    value={desc}
                                    onChangeText={(text) => {
                                        setDesc(text);
                                        setErrorMessage('');
                                    }}
                                />
                            </AppFormField>
                        </View>

                        <View className="mt-4">
                            <AppFormField
                                label="Subtotal amount"
                                helper="Enter the amount before taxes."
                                example="1500.00"
                                error={amountError}
                                required
                            >
                                <TextInput
                                    className={inputClassName}
                                    placeholder="0.00"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={(text) => {
                                        setAmount(text);
                                        setErrorMessage('');
                                    }}
                                />
                            </AppFormField>
                        </View>

                        <View className="mt-4">
                            <AppFormField
                                label="Payment due"
                                helper="Choose when the invoice should become due so reminders can work properly."
                            >
                                <View className="flex-row flex-wrap gap-2">
                                    {dueDateOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.label}
                                            onPress={() => setDueInDays(option.days)}
                                            className={`rounded-full border px-4 py-2 ${
                                                dueInDays === option.days
                                                    ? 'border-primary-600 bg-primary-600'
                                                    : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700'
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${
                                                    dueInDays === option.days
                                                        ? 'text-white'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                }`}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    Selected due date: {new Date(dueDate).toLocaleDateString()}
                                </Text>
                            </AppFormField>
                        </View>
                    </View>

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <View className="flex-row items-center justify-between">
                            <View className="mr-3 flex-1">
                                <Text className="font-bold text-gray-900 dark:text-white">
                                    Apply GRA taxes
                                </Text>
                                <Text className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                    Add VAT, NHIL, GETFund, and COVID-19 levy automatically.
                                </Text>
                            </View>
                            <Switch
                                value={applyTax}
                                onValueChange={setApplyTax}
                                trackColor={{ false: '#d1d5db', true: '#16a34a' }}
                            />
                        </View>

                        {applyTax && taxData ? (
                            <View className="mt-4 gap-2 rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-500 dark:text-gray-400">NHIL (2.5%)</Text>
                                    <Text className="text-gray-800 dark:text-gray-200">GHS {taxData.nhil.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-500 dark:text-gray-400">GETFund (2.5%)</Text>
                                    <Text className="text-gray-800 dark:text-gray-200">GHS {taxData.getfund.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-500 dark:text-gray-400">COVID-19 (1%)</Text>
                                    <Text className="text-gray-800 dark:text-gray-200">GHS {taxData.covid.toFixed(2)}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-500 dark:text-gray-400">VAT (15%)</Text>
                                    <Text className="text-gray-800 dark:text-gray-200">GHS {taxData.vat.toFixed(2)}</Text>
                                </View>
                            </View>
                        ) : null}
                    </View>

                    <View className="rounded-3xl border border-primary-100 bg-primary-50 p-5 dark:border-primary-800 dark:bg-primary-900/20">
                        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                            Grand total
                        </Text>
                        <Text className="mt-2 text-3xl font-bold text-primary-900 dark:text-primary-100">
                            GHS {grandTotal.toFixed(2)}
                        </Text>
                        <Text className="mt-2 text-sm leading-6 text-primary-700 dark:text-primary-200">
                            This is the total your customer will see on the invoice.
                        </Text>
                    </View>

                    <TouchableOpacity
                        className={`min-h-[56px] items-center justify-center rounded-3xl bg-primary-600 px-4 py-4 ${
                            loading ? 'opacity-70' : 'active:opacity-90'
                        }`}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-base font-bold text-white">Create Invoice</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={showCustomerModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
                    <AppScreenHeader
                        title="Select Customer"
                        subtitle="Choose the customer who should receive this invoice."
                        onBack={() => setShowCustomerModal(false)}
                    />

                    <FlatList
                        data={customers}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="mb-3 rounded-3xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                                onPress={() => selectCustomer(item)}
                            >
                                <Text className="font-bold text-gray-900 dark:text-white">{item.name}</Text>
                                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {item.email || item.phone || 'No contact details'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <AppStateCard
                                title="No customers available"
                                description="Add a customer now and SME Boost GH will bring you back here so you can continue the invoice."
                                tone="empty"
                                actionLabel="Add customer and return"
                                actionHref="/crm/new?returnTo=%2Finvoices%2Fnew"
                            />
                        }
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
