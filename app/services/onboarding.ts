import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredProfile, saveProfileUpdates } from './profile';
import { getCustomers, getInvoices } from './businessData';

export type OnboardingGoal =
    | 'get_paid_faster'
    | 'manage_customers'
    | 'write_business_plan'
    | 'create_marketing'
    | 'draft_email';

export interface OnboardingState {
    completed: boolean;
    goals: OnboardingGoal[];
    recommendedAction: string;
    completedAt: string;
}

interface StoredOnboardingProfile {
    onboarding_completed?: boolean;
    onboarding_completed_at?: string;
    recommended_action?: string;
    business_name?: string;
    industry?: string;
    full_name?: string;
    goals?: string[];
}

const validGoals: OnboardingGoal[] = [
    'get_paid_faster',
    'manage_customers',
    'write_business_plan',
    'create_marketing',
    'draft_email',
];

export interface ProfileSetupInput {
    userId: string;
    fullName: string;
    businessName: string;
    phone: string;
    industry: string;
    goals: OnboardingGoal[];
}

const onboardingKey = (userId: string) => `@onboarding_${userId}`;

export const getProfileSetup = async (userId: string) => {
    return getStoredProfile(userId);
};

export const getOnboardingState = async (userId: string): Promise<OnboardingState | null> => {
    const stored = await AsyncStorage.getItem(onboardingKey(userId));
    if (stored) {
        return JSON.parse(stored);
    }

    const profile = (await getStoredProfile(userId)) as StoredOnboardingProfile | null;
    const goals = Array.isArray(profile?.goals)
        ? profile.goals.filter((goal): goal is OnboardingGoal => validGoals.includes(goal as OnboardingGoal))
        : [];

    const hasStrongProfileSignal = Boolean(
        profile?.onboarding_completed === true ||
        (profile?.business_name?.trim() && profile?.industry?.trim()) ||
        goals.length > 0
    );

    let hasExistingBusinessData = false;

    if (!hasStrongProfileSignal) {
        const [customers, invoices] = await Promise.all([
            getCustomers(userId),
            getInvoices(userId),
        ]);
        hasExistingBusinessData = customers.length > 0 || invoices.length > 0;
    }

    if (!hasStrongProfileSignal && !hasExistingBusinessData) return null;

    const recoveredState: OnboardingState = {
        completed: true,
        goals,
        recommendedAction: profile?.recommended_action || getRecommendedFirstAction(goals),
        completedAt: profile?.onboarding_completed_at || new Date().toISOString(),
    };

    await AsyncStorage.setItem(onboardingKey(userId), JSON.stringify(recoveredState));

    if (profile) {
        await saveProfileUpdates(userId, {
            onboarding_completed: true,
            onboarding_completed_at: recoveredState.completedAt,
            recommended_action: recoveredState.recommendedAction,
        });
    }

    return recoveredState;
};

export const hasCompletedOnboarding = async (userId: string) => {
    const onboarding = await getOnboardingState(userId);
    return Boolean(onboarding?.completed);
};

export const getPostAuthRoute = async (userId?: string | null) => {
    if (!userId) return '/onboarding';

    const completed = await hasCompletedOnboarding(userId);
    return completed ? '/(dashboard)' : '/onboarding';
};

export const getRecommendedFirstAction = (goals: OnboardingGoal[]) => {
    if (goals.includes('manage_customers')) return '/crm/new';
    if (goals.includes('get_paid_faster')) return '/invoices/new';
    if (goals.includes('write_business_plan')) return '/ai-tools/business-plan';
    if (goals.includes('create_marketing')) return '/ai-tools/marketing';
    if (goals.includes('draft_email')) return '/ai-tools/email';
    return '/(dashboard)';
};

export const getRecommendedActionLabel = (route: string) => {
    switch (route) {
        case '/crm/new':
            return 'Add First Customer';
        case '/invoices/new':
            return 'Create First Invoice';
        case '/ai-tools/business-plan':
            return 'Start Business Plan';
        case '/ai-tools/marketing':
            return 'Create Marketing Draft';
        case '/ai-tools/email':
            return 'Draft First Email';
        default:
            return 'Open Dashboard';
    }
};

export const saveOnboardingSetup = async (input: ProfileSetupInput) => {
    const recommendedAction = getRecommendedFirstAction(input.goals);

    const profile = {
        full_name: input.fullName,
        phone: input.phone,
        business_name: input.businessName,
        industry: input.industry,
        goals: input.goals,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        recommended_action: recommendedAction,
    };

    const onboarding: OnboardingState = {
        completed: true,
        goals: input.goals,
        recommendedAction,
        completedAt: profile.onboarding_completed_at,
    };

    await saveProfileUpdates(input.userId, profile);
    await AsyncStorage.setItem(onboardingKey(input.userId), JSON.stringify(onboarding));

    return onboarding;
};
