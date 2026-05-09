import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Briefcase, Crosshair, FileText, Mail, MapPin, Megaphone, Users } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { AIWorkflowHero } from '../components/ai/AIWorkflowHero';
import { AISectionCard } from '../components/ai/AISectionCard';
import { AIStateCard } from '../components/ai/AIStateCard';
import { AppFormField } from '../components/ui/AppFormField';
import { AppScreenHeader } from '../components/ui/AppScreenHeader';
import { AppStateCard } from '../components/ui/AppStateCard';
import { consumeFlashMessage, FlashMessage, setFlashMessage } from '../services/flashMessage';
import {
    hasCompletedOnboarding,
    getRecommendedActionLabel,
    OnboardingGoal,
    saveOnboardingSetup,
} from '../services/onboarding';
import { formatGpsLocation, GpsLocation, requestCurrentGpsLocation } from '../services/location';

const inputClassName =
    'rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

const goals: Array<{
    id: OnboardingGoal;
    title: string;
    description: string;
    icon: typeof Users;
    iconColor: string;
    iconBgClassName: string;
}> = [
    {
        id: 'get_paid_faster',
        title: 'Get paid faster',
        description: 'Start invoicing and keep track of payments clearly.',
        icon: FileText,
        iconColor: '#2563EB',
        iconBgClassName: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
        id: 'manage_customers',
        title: 'Manage customers',
        description: 'Organize customer records and follow-up activity.',
        icon: Users,
        iconColor: '#059669',
        iconBgClassName: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
        id: 'write_business_plan',
        title: 'Write business plans',
        description: 'Use AI to turn your business ideas into clear plans.',
        icon: Briefcase,
        iconColor: '#7C3AED',
        iconBgClassName: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
        id: 'create_marketing',
        title: 'Create marketing',
        description: 'Generate useful promotional messages faster.',
        icon: Megaphone,
        iconColor: '#D97706',
        iconBgClassName: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
        id: 'draft_email',
        title: 'Draft emails',
        description: 'Write professional business emails with AI guidance.',
        icon: Mail,
        iconColor: '#16A34A',
        iconBgClassName: 'bg-green-100 dark:bg-green-900/30',
    },
];

export default function OnboardingScreen() {
    const { user, loading: authLoading } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showValidation, setShowValidation] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<FlashMessage | null>(null);

    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [industry, setIndustry] = useState('');
    const [businessLocation, setBusinessLocation] = useState('');
    const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
    const [tinNumber, setTinNumber] = useState('');
    const [gpsLocation, setGpsLocation] = useState<GpsLocation | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationMessage, setLocationMessage] = useState('');
    const [selectedGoals, setSelectedGoals] = useState<OnboardingGoal[]>([]);
    const [recommendedAction, setRecommendedAction] = useState('/(dashboard)');

    const canContinueSetup =
        fullName.trim().length > 0 &&
        businessName.trim().length > 0 &&
        industry.trim().length > 0 &&
        businessLocation.trim().length > 0;

    const fullNameError =
        showValidation && !fullName.trim()
            ? 'Add your name so the app can personalize your setup.'
            : '';
    const businessNameError =
        showValidation && !businessName.trim()
            ? 'Add your business name so your dashboard and profile feel complete.'
            : '';
    const industryError =
        showValidation && !industry.trim()
            ? 'Add your industry so SME Boost GH can tailor guidance more accurately.'
            : '';
    const businessLocationError =
        showValidation && !businessLocation.trim()
            ? 'Add your business location so your profile reflects where the business operates.'
            : '';

    const stepTitle = useMemo(() => {
        if (step === 0) return 'Welcome';
        if (step === 1) return 'Setup';
        if (step === 2) return 'Goals';
        return 'Start';
    }, [step]);

    const toggleGoal = (goalId: OnboardingGoal) => {
        setSelectedGoals((prev) =>
            prev.includes(goalId)
                ? prev.filter((item) => item !== goalId)
                : prev.length >= 2
                    ? [...prev.slice(1), goalId]
                    : [...prev, goalId]
        );
    };

    useFocusEffect(
        useCallback(() => {
            setFeedbackMessage(consumeFlashMessage());
        }, [])
    );

    useEffect(() => {
        if (!authLoading && !user?.id) {
            router.replace('/auth/login');
        }
    }, [authLoading, user?.id]);

    useEffect(() => {
        if (authLoading || !user?.id) return;

        let isMounted = true;

        const redirectCompletedUsers = async () => {
            const completed = await hasCompletedOnboarding(user.id);
            if (completed && isMounted) {
                router.replace('/(dashboard)');
            }
        };

        void redirectCompletedUsers();

        return () => {
            isMounted = false;
        };
    }, [authLoading, user?.id]);

    const handleFinish = async () => {
        if (!user?.id) return;

        setLoading(true);
        setErrorMessage('');

        try {
            const onboarding = await saveOnboardingSetup({
                userId: user.id,
                fullName,
                businessName,
                phone,
                industry,
                businessLocation,
                gpsLocation,
                businessRegistrationNumber,
                tinNumber,
                goals: selectedGoals,
            });

            setFlashMessage({
                title: 'Setup complete',
                description: `Your dashboard is ready. Start with: ${getRecommendedActionLabel(onboarding.recommendedAction)}.`,
                tone: 'success',
            });
            router.replace('/(dashboard)');
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Could not complete setup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && !canContinueSetup) {
            setShowValidation(true);
            setErrorMessage('Add your name, business name, business location, and industry so SME Boost GH can personalize your setup.');
            return;
        }

        setErrorMessage('');
        setShowValidation(false);

        if (step === 2) {
            const route =
                selectedGoals.includes('manage_customers')
                    ? '/crm/new'
                    : selectedGoals.includes('get_paid_faster')
                        ? '/invoices/new'
                        : selectedGoals.includes('write_business_plan')
                            ? '/ai-tools/business-plan'
                            : selectedGoals.includes('create_marketing')
                                ? '/ai-tools/marketing'
                                : selectedGoals.includes('draft_email')
                                    ? '/ai-tools/email'
                                    : '/(dashboard)';
            setRecommendedAction(route);
        }

        setStep((prev) => Math.min(prev + 1, 3));
    };

    const handleUseCurrentLocation = async () => {
        setLocationLoading(true);
        setLocationMessage('');
        setErrorMessage('');

        const result = await requestCurrentGpsLocation();

        if (result.gpsLocation) {
            setGpsLocation(result.gpsLocation);
            setLocationMessage('Current GPS location added. You can still type the business location in words below.');
        } else if (result.errorMessage) {
            setLocationMessage(result.errorMessage);
        }

        setLocationLoading(false);
    };

    if (authLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900" edges={['top']}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </SafeAreaView>
        );
    }

    if (!user?.id) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
                <View className="flex-1 items-center justify-center px-5">
                    <AppStateCard
                        title="Sign in to continue setup"
                        description="Your onboarding setup is tied to your account. Sign in again to continue."
                        tone="neutral"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <AppScreenHeader
                title="Get Started"
                subtitle={`Step ${step + 1} of 4 • ${stepTitle}`}
                onBack={step > 0 ? () => setStep((prev) => Math.max(prev - 1, 0)) : undefined}
            />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={8}
            >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-5 pb-12 pt-6">
                    {feedbackMessage ? (
                        <View className="mb-4">
                            <AppStateCard
                                title={feedbackMessage.title}
                                description={feedbackMessage.description}
                                tone={feedbackMessage.tone ?? 'success'}
                            />
                        </View>
                    ) : null}

                    {step === 0 ? (
                        <>
                            <AIWorkflowHero
                                eyebrow="Welcome To SME Boost GH"
                                title="A calmer way to run your business"
                                description="SME Boost GH helps Ghanaian SMEs manage customers, create invoices, and use AI for planning, marketing, and professional communication."
                            />

                            <View className="mt-6 gap-4">
                                <AISectionCard
                                    title="What you can do here"
                                    description="The app is designed to help you move from setup to action with less stress and more clarity."
                                >
                                    <View className="gap-3">
                                        <View className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                                            <Text className="font-semibold text-gray-900 dark:text-white">Track customers and invoices</Text>
                                            <Text className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Keep business records simple and easy to find.</Text>
                                        </View>
                                        <View className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                                            <Text className="font-semibold text-gray-900 dark:text-white">Use AI for practical business tasks</Text>
                                            <Text className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Create plans, marketing content, emails, and next-step guidance.</Text>
                                        </View>
                                        <View className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                                            <Text className="font-semibold text-gray-900 dark:text-white">Start with one small win</Text>
                                            <Text className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">We will guide you to the best first action after setup.</Text>
                                        </View>
                                    </View>
                                </AISectionCard>
                            </View>
                        </>
                    ) : null}

                    {step === 1 ? (
                        <View className="gap-4">
                            <AIWorkflowHero
                                eyebrow="Business Setup"
                                title="Tell us the basics"
                                description="A few details help SME Boost GH personalize your dashboard and make the first recommendations more useful."
                            />

                            <AISectionCard
                                title="Business basics"
                                description="Keep this simple. You can edit everything later."
                            >
                                <AppFormField
                                    label="Your name"
                                    helper="Use the name you want shown inside the app."
                                    example="Kwame Mensah"
                                    error={fullNameError}
                                    required
                                >
                                    <TextInput
                                        className={inputClassName}
                                        value={fullName}
                                        onChangeText={(text) => {
                                            setFullName(text);
                                            setErrorMessage('');
                                        }}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </AppFormField>

                                <AppFormField
                                    label="Business name"
                                    helper="Use the business name customers know."
                                    example="Mensah Farms"
                                    error={businessNameError}
                                    required
                                >
                                    <TextInput
                                        className={inputClassName}
                                        value={businessName}
                                        onChangeText={(text) => {
                                            setBusinessName(text);
                                            setErrorMessage('');
                                        }}
                                        placeholder="Enter your business name"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </AppFormField>

                                <AppFormField
                                    label="Phone number"
                                    helper="Optional, but useful for your profile and customer communication."
                                    example="+233..."
                                >
                                    <TextInput
                                        className={inputClassName}
                                        value={phone}
                                        onChangeText={(text) => {
                                            setPhone(text);
                                            setErrorMessage('');
                                        }}
                                        placeholder="Enter phone number"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                    />
                                </AppFormField>

                                <AppFormField
                                    label="Business location"
                                    helper="Enter the place customers know or where the business operates."
                                    example="Accra Central, Kumasi, Takoradi Market Circle"
                                    error={businessLocationError}
                                    required
                                >
                                    <TextInput
                                        className={inputClassName}
                                        value={businessLocation}
                                        onChangeText={(text) => {
                                            setBusinessLocation(text);
                                            setErrorMessage('');
                                        }}
                                        placeholder="Enter your business location"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </AppFormField>

                                <View className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/70 p-4 dark:border-primary-800 dark:bg-primary-900/10">
                                    <View className="flex-row items-start justify-between gap-3">
                                        <View className="flex-1">
                                            <View className="flex-row items-center">
                                                <MapPin size={16} color="#2E7D32" />
                                                <Text className="ml-2 text-sm font-semibold text-primary-800 dark:text-primary-200">
                                                    GPS location
                                                </Text>
                                            </View>
                                            <Text className="mt-2 text-sm leading-6 text-primary-700 dark:text-primary-300">
                                                Optional. Add your device location to improve business context while keeping the written business location as the main visible address.
                                            </Text>
                                            {gpsLocation ? (
                                                <Text className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary-800 dark:text-primary-200">
                                                    Saved: {formatGpsLocation(gpsLocation)}
                                                </Text>
                                            ) : null}
                                            {locationMessage ? (
                                                <Text className="mt-3 text-sm leading-5 text-primary-700 dark:text-primary-300">
                                                    {locationMessage}
                                                </Text>
                                            ) : null}
                                        </View>

                                        <TouchableOpacity
                                            onPress={handleUseCurrentLocation}
                                            disabled={locationLoading}
                                            className={`min-h-[44px] min-w-[132px] flex-row items-center justify-center rounded-2xl bg-primary-600 px-4 py-3 ${
                                                locationLoading ? 'opacity-70' : 'active:opacity-90'
                                            }`}
                                        >
                                            {locationLoading ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <>
                                                    <Crosshair size={16} color="#FFFFFF" />
                                                    <Text className="ml-2 text-sm font-semibold text-white">
                                                        {gpsLocation ? 'Refresh GPS' : 'Use Current'}
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <AppFormField
                                    label="Business registration number"
                                    helper="Optional. Add the official registration number if your business has one."
                                >
                                    <TextInput
                                        className={inputClassName}
                                        value={businessRegistrationNumber}
                                        onChangeText={(text) => {
                                            setBusinessRegistrationNumber(text);
                                            setErrorMessage('');
                                        }}
                                        placeholder="Enter registration number"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="characters"
                                    />
                                </AppFormField>

                                <AppFormField
                                    label="TIN number"
                                    helper="Optional. Add your tax identification number for future business records."
                                >
                                    <TextInput
                                        className={inputClassName}
                                        value={tinNumber}
                                        onChangeText={(text) => {
                                            setTinNumber(text);
                                            setErrorMessage('');
                                        }}
                                        placeholder="Enter TIN number"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="characters"
                                    />
                                </AppFormField>

                                <AppFormField
                                    label="Business type or industry"
                                    helper="This helps the app and AI tools use more relevant language."
                                    example="Retail, catering, fashion, farming, logistics"
                                    error={industryError}
                                    required
                                >
                                    <TextInput
                                        className={inputClassName}
                                        value={industry}
                                        onChangeText={(text) => {
                                            setIndustry(text);
                                            setErrorMessage('');
                                        }}
                                        placeholder="What kind of business do you run?"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </AppFormField>
                            </AISectionCard>
                        </View>
                    ) : null}

                    {step === 2 ? (
                        <View className="gap-4">
                            <AIWorkflowHero
                                eyebrow="Your Goals"
                                title="Choose what matters most right now"
                                description="Pick up to two goals. This helps us recommend your best first step without making setup feel heavy."
                            />

                            <AISectionCard
                                title="What do you want help with first?"
                                description="Choose one or two. You can always use every feature later."
                            >
                                <View className="gap-3">
                                    {goals.map((goal) => {
                                        const isSelected = selectedGoals.includes(goal.id);
                                        const Icon = goal.icon;

                                        return (
                                            <TouchableOpacity
                                                key={goal.id}
                                                onPress={() => toggleGoal(goal.id)}
                                                className={`rounded-3xl border p-4 ${
                                                    isSelected
                                                        ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                                                        : 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                                                }`}
                                            >
                                                <View className="flex-row items-start">
                                                    <View className={`mr-3 h-11 w-11 items-center justify-center rounded-2xl ${goal.iconBgClassName}`}>
                                                        <Icon size={20} color={goal.iconColor} />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {goal.title}
                                                        </Text>
                                                        <Text className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                                            {goal.description}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </AISectionCard>
                        </View>
                    ) : null}

                    {step === 3 ? (
                        <View className="gap-4">
                            <AIWorkflowHero
                                eyebrow="First Success"
                                title="Here is the best first action for you"
                                description="SME Boost GH will take you to your dashboard next, where this recommended action will appear as your clearest next step."
                            />

                            <AISectionCard
                                title="Recommended next step"
                                description="This recommendation is based on the goals you selected during setup and will be shown on your dashboard after setup."
                            >
                                <View className="rounded-3xl bg-primary-50 p-5 dark:bg-primary-900/20">
                                    <Text className="text-lg font-bold text-primary-900 dark:text-primary-100">
                                        {getRecommendedActionLabel(recommendedAction)}
                                    </Text>
                                    <Text className="mt-2 text-sm leading-6 text-primary-700 dark:text-primary-200">
                                        {recommendedAction === '/crm/new'
                                            ? 'Start by adding one customer so invoices and follow-up become easier.'
                                            : recommendedAction === '/invoices/new'
                                                ? 'Create your first invoice and begin tracking payments from day one.'
                                                : recommendedAction === '/ai-tools/business-plan'
                                                    ? 'Use the guided AI workflow to turn your business idea into a clear plan.'
                                                    : recommendedAction === '/ai-tools/marketing'
                                                        ? 'Generate your first marketing message and test how quickly you can create useful content.'
                                                        : recommendedAction === '/ai-tools/email'
                                                            ? 'Draft a professional email with AI support and get comfortable with the assistant.'
                                                            : 'Open the dashboard and explore the command center for your business.'}
                                    </Text>
                                </View>

                                <View className="mt-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
                                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Your dashboard comes next
                                    </Text>
                                    <Text className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                        You will land in the business command center first, then start this recommended action from there.
                                    </Text>
                                </View>
                            </AISectionCard>
                        </View>
                    ) : null}

                    {errorMessage ? (
                        <View className="mt-4">
                            <AIStateCard
                                title="Could not continue setup"
                                description={errorMessage}
                                tone="error"
                            />
                        </View>
                    ) : null}

                    <View className="mt-6">
                        {step < 3 ? (
                            <TouchableOpacity
                                onPress={handleNext}
                                className="min-h-[56px] items-center justify-center rounded-3xl bg-primary-600 px-4 py-4 active:opacity-90"
                            >
                                <Text className="text-base font-bold text-white">
                                    {step === 0 ? 'Start Setup' : step === 2 ? 'See Recommendation' : 'Continue'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={handleFinish}
                                disabled={loading}
                                className={`min-h-[56px] items-center justify-center rounded-3xl bg-primary-600 px-4 py-4 ${
                                    loading ? 'opacity-70' : 'active:opacity-90'
                                }`}
                            >
                                <Text className="text-base font-bold text-white">
                                    {loading ? 'Finishing Setup...' : 'Open Dashboard'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {step === 3 ? (
                            <TouchableOpacity
                                onPress={() => router.replace('/(dashboard)')}
                                className="mt-3 min-h-[52px] items-center justify-center rounded-3xl border border-gray-200 bg-white px-4 py-4 active:opacity-90 dark:border-gray-700 dark:bg-gray-800"
                            >
                                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Go To Dashboard Instead
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
