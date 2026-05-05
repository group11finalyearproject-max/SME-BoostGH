import { useEffect, useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Clock, Mail, QrCode, Trash2, AlertTriangle, Share2, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { QRPaymentModal } from '../../components/shared/QRPaymentModal';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { AppScreenHeader } from '../../components/ui/AppScreenHeader';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { confirmDestructiveAction } from '../../services/confirm';
import { setFlashMessage } from '../../services/flashMessage';
import { getInvoices, saveInvoices, updateInvoice } from '../../services/businessData';
import { shareInvoice } from '../../services/invoiceShare';
import { Analytics } from '../../services/analytics';
import { syncInvoiceNotifications } from '../../services/notifications';
import { InvoiceStatus } from '../../types/invoice';

const formatMoney = (amount: number) =>
    `GHS ${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function InvoiceDetail() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    useEffect(() => {
        fetchInvoice();
    }, [id, user]);

    const fetchInvoice = async () => {
        if (!user) return;
        try {
            setErrorMessage('');
            const invoices = await getInvoices(user.id);
            const data = invoices.find((item: any) => item.id === id);
            if (data) {
                setInvoice(data);
            } else {
                setErrorMessage('This invoice could not be found.');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('Could not fetch invoice details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: InvoiceStatus) => {
        if (!user || !invoice) return;
        try {
            const updated = await updateInvoice(user.id, String(id), (current) => ({
                ...current,
                status: newStatus,
            }));
            if (updated) {
                setInvoice(updated);
                setFeedbackMessage(`Invoice status updated to ${newStatus}.`);
                await syncInvoiceNotifications(user.id);
                await Analytics.logEvent('invoice_status_updated', { status: newStatus });
            }
        } catch (error) {
            setErrorMessage('Failed to update invoice status.');
        }
    };

    const handleDelete = () => {
        confirmDestructiveAction({
            title: 'Delete invoice',
            message: 'This will remove the invoice from SME Boost GH. You cannot undo this action.',
            confirmLabel: 'Delete',
            onConfirm: async () => {
                if (!user) return;
                try {
                    const invoices = await getInvoices(user.id);
                    await saveInvoices(user.id, invoices.filter((item: any) => item.id !== id));
                    await syncInvoiceNotifications(user.id);
                    await Analytics.logEvent('invoice_deleted');

                    setFlashMessage({
                        title: 'Invoice deleted',
                        description: 'The invoice was removed successfully.',
                        tone: 'success',
                    });
                    router.back();
                } catch (error) {
                    setErrorMessage('Failed to delete invoice. Please try again.');
                }
            },
        });
    };

    const handleShare = async (channel: 'general' | 'email' | 'whatsapp') => {
        if (!user?.id || !invoice) return;

        try {
            const updated = await shareInvoice(user.id, invoice, channel);
            if (updated) {
                setInvoice(updated);
            }
            setFeedbackMessage(
                channel === 'email'
                    ? 'Invoice details shared in an email-friendly format.'
                    : channel === 'whatsapp'
                        ? 'Invoice details shared in a WhatsApp-friendly format.'
                        : 'Invoice summary shared successfully.'
            );
            await Analytics.logEvent('invoice_shared', { channel });
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Could not share this invoice right now.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
                <View className="px-5 pt-10">
                    <AppStateCard
                        title="Loading invoice"
                        description="SME Boost GH is preparing the invoice details for you."
                        tone="loading"
                    />
                </View>
            </SafeAreaView>
        );
    }

    if (!invoice) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />
                <AppScreenHeader title="Invoice" onBack={() => router.back()} />
                <View className="px-5 pt-6">
                    <AppStateCard
                        title="Invoice not available"
                        description={errorMessage || 'The invoice could not be found.'}
                        tone="empty"
                        actionLabel="Back to invoices"
                        actionHref="/invoices"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <AppScreenHeader
                title="Invoice"
                subtitle="Review status, amount, and customer details in one place."
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
                            title="Invoice needs attention"
                            description={errorMessage}
                            tone="error"
                        />
                    ) : null}

                    {feedbackMessage ? (
                        <AppStateCard
                            title="Invoice updated"
                            description={feedbackMessage}
                            tone="success"
                        />
                    ) : null}

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Status
                                </Text>
                                <Text className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                                    {invoice.customer_name}
                                </Text>
                            </View>
                            <StatusBadge status={invoice.status} />
                        </View>

                        <View className="mt-5 flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => updateStatus('paid')}
                                className={`flex-1 rounded-2xl border px-3 py-3 ${
                                    invoice.status === 'paid'
                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                }`}
                            >
                                <View className="items-center">
                                    <CheckCircle size={20} color={invoice.status === 'paid' ? '#15803d' : '#9CA3AF'} />
                                    <Text className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Paid</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateStatus('pending')}
                                className={`flex-1 rounded-2xl border px-3 py-3 ${
                                    invoice.status === 'pending'
                                        ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                }`}
                            >
                                <View className="items-center">
                                    <Clock size={20} color={invoice.status === 'pending' ? '#D97706' : '#9CA3AF'} />
                                    <Text className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Pending</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateStatus('overdue')}
                                className={`flex-1 rounded-2xl border px-3 py-3 ${
                                    invoice.status === 'overdue'
                                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                }`}
                            >
                                <View className="items-center">
                                    <AlertTriangle size={20} color={invoice.status === 'overdue' ? '#DC2626' : '#9CA3AF'} />
                                    <Text className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Overdue</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        {invoice.taxBreakdown ? (
                            <View>
                                <Text className="text-sm text-gray-500 dark:text-gray-400">Subtotal</Text>
                                <Text className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                                    {formatMoney(invoice.subtotal || 0)}
                                </Text>

                                <View className="mt-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
                                    <Text className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        GRA taxes
                                    </Text>
                                    <View className="gap-2">
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500 dark:text-gray-400">NHIL</Text>
                                            <Text className="text-gray-800 dark:text-gray-200">{formatMoney(invoice.taxBreakdown.nhil)}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500 dark:text-gray-400">GETFund</Text>
                                            <Text className="text-gray-800 dark:text-gray-200">{formatMoney(invoice.taxBreakdown.getfund)}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500 dark:text-gray-400">COVID-19</Text>
                                            <Text className="text-gray-800 dark:text-gray-200">{formatMoney(invoice.taxBreakdown.covid)}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-500 dark:text-gray-400">VAT</Text>
                                            <Text className="text-gray-800 dark:text-gray-200">{formatMoney(invoice.taxBreakdown.vat)}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        <View className={`${invoice.taxBreakdown ? 'mt-4' : ''} rounded-2xl bg-primary-50 p-4 dark:bg-primary-900/20`}>
                            <Text className="text-sm font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                                Total amount
                            </Text>
                            <Text className="mt-2 text-2xl font-bold text-primary-900 dark:text-primary-100">
                                {formatMoney(invoice.amount || 0)}
                            </Text>
                        </View>

                        <View className="mt-5 gap-4">
                            <View className="flex-row justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                                <Text className="text-gray-500 dark:text-gray-400">Invoice ID</Text>
                                <Text className="font-semibold text-gray-900 dark:text-white">{invoice.id}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                                <Text className="text-gray-500 dark:text-gray-400">Customer</Text>
                                <Text className="font-semibold text-gray-900 dark:text-white">{invoice.customer_name}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                                <Text className="text-gray-500 dark:text-gray-400">Created</Text>
                                <Text className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(invoice.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View className="flex-row justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                                <Text className="text-gray-500 dark:text-gray-400">Due date</Text>
                                <Text className="font-semibold text-gray-900 dark:text-white">
                                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                                <Text className="text-gray-500 dark:text-gray-400">Share activity</Text>
                                <Text className="font-semibold text-gray-900 dark:text-white">
                                    {invoice.share_count ? `${invoice.share_count} share${invoice.share_count === 1 ? '' : 's'}` : 'Not shared yet'}
                                </Text>
                            </View>
                            <View>
                                <Text className="mb-2 text-gray-500 dark:text-gray-400">Description</Text>
                                <View className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
                                    <Text className="text-gray-800 dark:text-gray-200">
                                        {invoice.description || 'No description added'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                            Share or resend invoice
                        </Text>
                        <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Share a customer-friendly invoice summary using the format that fits your next follow-up.
                        </Text>

                        <View className="mt-4 gap-3">
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-3xl bg-primary-600 px-4 py-4"
                                onPress={() => void handleShare('general')}
                            >
                                <Share2 color="white" size={20} />
                                <Text className="ml-2 font-bold text-white">Share Invoice Summary</Text>
                            </TouchableOpacity>

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-3xl border border-primary-600 bg-white px-4 py-4 dark:bg-gray-800"
                                    onPress={() => void handleShare('email')}
                                >
                                    <Mail color="#2E7D32" size={18} />
                                    <Text className="ml-2 font-bold text-primary-600 dark:text-primary-400">Email Style</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-3xl border border-emerald-600 bg-white px-4 py-4 dark:bg-gray-800"
                                    onPress={() => void handleShare('whatsapp')}
                                >
                                    <MessageCircle color="#059669" size={18} />
                                    <Text className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">WhatsApp Style</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center rounded-3xl border-2 border-primary-600 bg-white px-4 py-4 dark:bg-gray-800"
                            onPress={() => setShowQRModal(true)}
                        >
                            <QrCode color="#2E7D32" size={20} />
                            <Text className="ml-2 font-bold text-primary-600 dark:text-primary-400">Show QR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center rounded-3xl bg-primary-600 px-4 py-4"
                            onPress={() => void handleShare('email')}
                        >
                            <Mail color="white" size={20} />
                            <Text className="ml-2 font-bold text-white">Resend Email</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <QRPaymentModal
                visible={showQRModal}
                onClose={() => setShowQRModal(false)}
                invoice={invoice}
                onPaymentSuccess={() => updateStatus('paid')}
            />
        </SafeAreaView>
    );
}
