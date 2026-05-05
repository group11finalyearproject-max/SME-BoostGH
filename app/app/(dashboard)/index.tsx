import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import {
    FileText,
    Landmark,
    MessageSquare,
    TrendingUp,
    Users,
    UserPlus,
    Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar';
import { AssistantSupportCard } from '../../components/dashboard/AssistantSupportCard';
import { DashboardHero } from '../../components/dashboard/DashboardHero';
import { GettingStartedCard } from '../../components/dashboard/GettingStartedCard';
import { InsightCard } from '../../components/dashboard/InsightCard';
import { PrimaryActionCard } from '../../components/dashboard/PrimaryActionCard';
import { RecentActivityCard } from '../../components/dashboard/RecentActivityCard';
import { SectionHeader } from '../../components/dashboard/SectionHeader';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { loadDrafts } from '../../services/drafts';
import { consumeFlashMessage, FlashMessage } from '../../services/flashMessage';
import { getOnboardingState } from '../../services/onboarding';
import { getStoredProfile, StoredProfile } from '../../services/profile';
import { syncInvoiceNotifications } from '../../services/notifications';
import { Analytics } from '../../services/analytics';
import { Invoice } from '../../types/invoice';

const formatMoney = (amount: number) =>
    `GHS ${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getDashboardSummary = (
    customerCount: number,
    invoiceCount: number,
    pendingInvoices: number
) => {
    if (customerCount === 0 && invoiceCount === 0) {
        return 'Start with one customer record, then create your first invoice to track sales with confidence.';
    }

    if (customerCount > 0 && invoiceCount === 0) {
        return 'Your customer list is ready. Create your first invoice to begin tracking payments and revenue.';
    }

    if (pendingInvoices > 0) {
        return `${pendingInvoices} ${pendingInvoices === 1 ? 'invoice is' : 'invoices are'} waiting for payment. Review recent activity and follow up quickly.`;
    }

    return 'Your business snapshot is up to date. Review recent activity or use AI for your next business task.';
};

export default function Dashboard() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<FlashMessage | null>(null);

    const [revenue, setRevenue] = useState(0);
    const [pendingInvoices, setPendingInvoices] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [invoiceCount, setInvoiceCount] = useState(0);
    const [draftCount, setDraftCount] = useState(0);
    const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
    const [recommendedNextAction, setRecommendedNextAction] = useState<string | null>(null);
    const [profile, setProfile] = useState<StoredProfile | null>(null);

    const fetchMetrics = async () => {
        if (!user) return;

        try {
            setErrorMessage('');
            const custStored = await AsyncStorage.getItem(`@customers_${user.id}`);
            const customers = custStored ? JSON.parse(custStored) : [];
            setCustomerCount(customers.length);

            const invStored = await AsyncStorage.getItem(`@invoices_${user.id}`);
            const invoices: Invoice[] = invStored ? JSON.parse(invStored) : [];
            setInvoiceCount(invoices.length);

            const drafts = await loadDrafts();
            setDraftCount(drafts.length);

            const onboarding = await getOnboardingState(user.id);
            setRecommendedNextAction(onboarding?.recommendedAction ?? null);

            const storedProfile = await getStoredProfile(user.id);
            setProfile(storedProfile);
            await syncInvoiceNotifications(user.id);
            await Analytics.logEvent('dashboard_viewed');

            if (invoices.length > 0) {
                invoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setRecentInvoices(invoices.slice(0, 3));

                const totalRevenue = invoices
                    .filter((inv) => inv.status === 'paid')
                    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

                const pending = invoices.filter((inv) => inv.status === 'pending').length;

                setRevenue(totalRevenue);
                setPendingInvoices(pending);
            } else {
                setRevenue(0);
                setPendingInvoices(0);
                setRecentInvoices([]);
            }
        } catch (error) {
            console.error('Error fetching metrics', error);
            setErrorMessage('We could not refresh your dashboard right now. Pull down to try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const flash = consumeFlashMessage();
            setFeedbackMessage(flash);
            fetchMetrics();
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMetrics();
    };

    const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
    const firstName = displayName.split(' ')[0] || 'User';
    const hasCustomers = customerCount > 0;
    const hasInvoices = invoiceCount > 0;
    const hasDrafts = draftCount > 0;
    const dashboardSummary = getDashboardSummary(customerCount, invoiceCount, pendingInvoices);
    const snapshotSummary = hasInvoices
        ? 'A quick view of revenue, unpaid invoices, and customer growth.'
        : 'Your first numbers will appear here as soon as you start creating records.';
    const activitySummary = hasInvoices
        ? 'Your latest invoices stay here so you can continue where you left off.'
        : 'When you start invoicing, your latest business activity will appear here.';
    const userStage = !hasCustomers
        ? 'no_customers'
        : !hasInvoices
            ? 'no_invoices'
            : !hasDrafts
                ? 'no_ai'
                : 'active';

    const normalizedRecommendedAction =
        recommendedNextAction === '/crm/new'
            ? '/crm/new'
            : recommendedNextAction === '/invoices/new'
                ? '/invoices/new'
                : recommendedNextAction?.startsWith('/ai-tools/')
                    ? '/ai-tools'
                    : null;

    const recommendedActionLabel =
        normalizedRecommendedAction === '/crm/new'
            ? 'Add your first customer'
            : normalizedRecommendedAction === '/invoices/new'
                ? 'Create your first invoice'
                : normalizedRecommendedAction === '/ai-tools'
                    ? 'Use AI tools'
                    : null;

    const recommendedActionDescription =
        normalizedRecommendedAction === '/crm/new'
            ? 'Start by saving one customer so invoicing and follow-up become easier.'
            : normalizedRecommendedAction === '/invoices/new'
                ? 'Create your first invoice so you can begin tracking sales and payments.'
                : normalizedRecommendedAction === '/ai-tools'
                    ? 'Open the AI workspace and choose the guided tool that fits your next task.'
                    : null;

    const shouldSubordinateSetupFeedback =
        feedbackMessage?.title === 'Setup complete' && Boolean(normalizedRecommendedAction);

    useEffect(() => {
        if (!shouldSubordinateSetupFeedback) return;

        const timer = setTimeout(() => {
            setFeedbackMessage((current) =>
                current?.title === 'Setup complete' ? null : current
            );
        }, 5000);

        return () => clearTimeout(timer);
    }, [shouldSubordinateSetupFeedback]);

    const featuredStartAction = normalizedRecommendedAction
        ? {
            title: recommendedActionLabel || 'Open dashboard',
            description:
                recommendedActionDescription ||
                'Start with the next guided action for your business.',
            href: normalizedRecommendedAction,
            icon:
                normalizedRecommendedAction === '/crm/new'
                    ? UserPlus
                    : normalizedRecommendedAction === '/invoices/new'
                        ? FileText
                        : Sparkles,
            tone: (normalizedRecommendedAction === '/crm/new' ? 'secondary' : 'primary') as
                | 'primary'
                | 'secondary',
        }
        : userStage === 'no_customers'
            ? {
                title: 'Add Your First Customer',
                description:
                    'Start with one customer record so you can invoice, follow up, and track work with confidence.',
                href: '/crm/new',
                icon: UserPlus,
                tone: 'secondary' as const,
            }
            : userStage === 'no_invoices'
                ? {
                    title: 'Create Your First Invoice',
                    description:
                        'Turn your customer records into visible sales activity and payment tracking.',
                    href: '/invoices/new',
                    icon: FileText,
                    tone: 'primary' as const,
                }
                : userStage === 'no_ai'
                    ? {
                        title: 'Try AI For Business Tasks',
                        description:
                            'Use SME Boost GH to draft emails, marketing content, and practical business plans faster.',
                        href: '/ai-tools',
                        icon: Sparkles,
                        tone: 'primary' as const,
                    }
                    : {
                        title:
                            pendingInvoices > 0
                                ? 'Follow Up On Pending Invoices'
                                : 'Create Your Next Invoice',
                        description:
                            pendingInvoices > 0
                                ? 'Review unpaid invoices and keep cash flow moving.'
                                : 'Raise a new invoice when you complete work for a customer.',
                        href: pendingInvoices > 0 ? '/invoices' : '/invoices/new',
                        icon: pendingInvoices > 0 ? Landmark : FileText,
                        tone: 'primary' as const,
                    };

    const heroPrimaryAction =
        userStage === 'no_customers'
            ? { label: 'Add First Customer', href: '/crm/new' }
            : userStage === 'no_invoices'
                ? { label: 'Create First Invoice', href: '/invoices/new' }
                : userStage === 'no_ai'
                    ? { label: 'Try AI Tools', href: '/ai-tools' }
                    : pendingInvoices > 0
                        ? { label: 'Review Invoices', href: '/invoices' }
                        : { label: 'Create Invoice', href: '/invoices/new' };

    const heroSecondaryAction =
        userStage === 'no_ai'
            ? { label: 'Ask Advisor', href: '/ai-tools/chat' }
            : { label: 'Open AI Tools', href: '/ai-tools' };

    const startHereTitle =
        normalizedRecommendedAction
            ? 'Recommended Next Step'
            : userStage === 'no_customers'
            ? 'Start Here'
            : userStage === 'no_invoices'
                ? 'Next Step'
                : userStage === 'no_ai'
                    ? 'Grow With AI'
                    : 'Keep Momentum';

    const startHereSubtitle =
        normalizedRecommendedAction
            ? 'Your setup is complete. Start with this focused action from your dashboard.'
            : userStage === 'no_customers'
            ? 'Set up your first customer record so invoicing and follow-up become easier.'
            : userStage === 'no_invoices'
                ? 'Your customer records are ready. The next best step is to raise your first invoice.'
                : userStage === 'no_ai'
                    ? 'You already have business data. Now try the AI tools that save time on writing and planning.'
                    : 'Choose the next action that helps you keep the business moving today.';

    return (
        <ScrollView
            className="flex-1 bg-gray-50 dark:bg-gray-900"
            contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View className="px-5">
                {feedbackMessage ? (
                    <View className="mb-4">
                        {shouldSubordinateSetupFeedback ? (
                            <View className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/20">
                                <Text className="text-sm font-semibold text-primary-800 dark:text-primary-200">
                                    {feedbackMessage.title}
                                </Text>
                                <Text className="mt-1 text-sm leading-5 text-primary-700 dark:text-primary-300">
                                    {feedbackMessage.description}
                                </Text>
                            </View>
                        ) : (
                            <AppStateCard
                                title={feedbackMessage.title}
                                description={feedbackMessage.description}
                                tone={feedbackMessage.tone ?? 'success'}
                            />
                        )}
                    </View>
                ) : null}

                {errorMessage ? (
                    <View className="mb-4">
                        <AppStateCard
                            title="Dashboard needs another try"
                            description={errorMessage}
                            tone="error"
                        />
                    </View>
                ) : null}

                <DashboardHero
                    firstName={firstName}
                    summary={dashboardSummary}
                    customerCount={customerCount}
                    invoiceCount={invoiceCount}
                    primaryActionLabel={heroPrimaryAction.label}
                    primaryActionHref={heroPrimaryAction.href}
                    secondaryActionLabel={heroSecondaryAction.label}
                    secondaryActionHref={heroSecondaryAction.href}
                />

                <View className="mt-6">
                    <SectionHeader
                        title={startHereTitle}
                        subtitle={startHereSubtitle}
                    />

                    <View className="gap-3">
                        <PrimaryActionCard
                            title={featuredStartAction.title}
                            description={featuredStartAction.description}
                            href={featuredStartAction.href}
                            icon={featuredStartAction.icon}
                            tone={featuredStartAction.tone}
                            featured
                        />

                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <PrimaryActionCard
                                    title={userStage === 'no_ai' ? 'Open AI Tools' : 'Add Customer'}
                                    description={
                                        userStage === 'no_ai'
                                            ? 'Choose the workflow for planning, marketing, email, or advisor help.'
                                            : 'Save a customer before you invoice or follow up.'
                                    }
                                    href={userStage === 'no_ai' ? '/ai-tools' : '/crm/new'}
                                    icon={userStage === 'no_ai' ? MessageSquare : UserPlus}
                                    tone={userStage === 'no_ai' ? 'neutral' : 'secondary'}
                                />
                            </View>
                            <View className="flex-1">
                                <PrimaryActionCard
                                    title={userStage === 'no_customers' ? 'Open AI Tools' : userStage === 'no_invoices' ? 'Open Customers' : 'Write Faster'}
                                    description={
                                        userStage === 'no_customers'
                                            ? 'Explore guided AI workflows for planning, messages, and advice.'
                                            : userStage === 'no_invoices'
                                                ? 'Review your saved customer records before invoicing.'
                                                : 'Use AI to draft messages, emails, and marketing content.'
                                    }
                                    href={
                                        userStage === 'no_customers'
                                            ? '/ai-tools'
                                            : userStage === 'no_invoices'
                                                ? '/crm'
                                                : '/ai-tools/email'
                                    }
                                    icon={
                                        userStage === 'no_customers'
                                            ? MessageSquare
                                            : userStage === 'no_invoices'
                                                ? Users
                                                : Sparkles
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mt-8">
                    <SectionHeader
                        title="Business Snapshot"
                        subtitle={snapshotSummary}
                        actionLabel="Tax report"
                        actionHref="/tax-report"
                    />

                    <View className="gap-3">
                        <InsightCard
                            title="Revenue Collected"
                            value={formatMoney(revenue)}
                            helper="Based on invoices marked paid."
                            icon={TrendingUp}
                            accentClassName="bg-green-100 dark:bg-green-900/30"
                            iconColor="#15803D"
                            loading={loading}
                            actionLabel={hasInvoices ? 'View invoices' : 'Create first invoice'}
                            actionHref={hasInvoices ? '/invoices' : '/invoices/new'}
                        />

                        <View className="flex-row gap-3">
                            <InsightCard
                                title="Pending Invoices"
                                value={pendingInvoices.toString()}
                                helper={
                                    pendingInvoices > 0
                                        ? 'These invoices may need a reminder.'
                                        : 'No invoice is currently waiting for payment.'
                                }
                                icon={Landmark}
                                accentClassName="bg-amber-100 dark:bg-amber-900/30"
                                iconColor="#B45309"
                                loading={loading}
                                className="flex-1"
                                actionLabel={pendingInvoices > 0 ? 'Review pending' : 'Create invoice'}
                                actionHref={pendingInvoices > 0 ? '/invoices' : '/invoices/new'}
                            />
                            <InsightCard
                                title="Customers"
                                value={customerCount.toString()}
                                helper={
                                    hasCustomers
                                        ? 'Your saved customer records.'
                                        : 'Add customers to unlock invoicing.'
                                }
                                icon={Users}
                                accentClassName="bg-blue-100 dark:bg-blue-900/30"
                                iconColor="#2563EB"
                                loading={loading}
                                className="flex-1"
                                actionLabel={hasCustomers ? 'Open customers' : 'Add customer'}
                                actionHref={hasCustomers ? '/crm' : '/crm/new'}
                            />
                        </View>
                    </View>
                </View>

                <View className="mt-8">
                    <SectionHeader
                        title="Latest Activity"
                        subtitle={activitySummary}
                        actionLabel={hasInvoices ? 'View all' : undefined}
                        actionHref={hasInvoices ? '/invoices' : undefined}
                    />

                    {hasInvoices ? (
                        <View className="gap-3">
                            {recentInvoices.map((invoice) => (
                                <RecentActivityCard invoice={invoice} key={invoice.id} />
                            ))}
                        </View>
                    ) : (
                        <GettingStartedCard
                            hasCustomers={hasCustomers}
                            customerCount={customerCount}
                        />
                    )}
                </View>

                <View className="mt-8">
                    <AssistantSupportCard />
                </View>

                <View className="mt-8 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <View className="flex-row items-start justify-between">
                        <View className="mr-3 flex-1">
                            <Text className="text-base font-bold text-gray-900 dark:text-white">
                                Your profile and settings
                            </Text>
                            <Text className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                Keep your business details current and switch preferences like dark mode whenever you need to.
                            </Text>
                        </View>

                        <Link href="/profile" asChild>
                            <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                                <ProfileAvatar
                                    imageUri={typeof profile?.image_uri === 'string' ? profile.image_uri : null}
                                    fullName={profile?.full_name || user?.user_metadata?.full_name}
                                    businessName={profile?.business_name}
                                    email={user?.email}
                                    size={44}
                                />
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
