import { getBusinessMetrics } from './ai_sales';
import { getStoredProfile } from './profile';

export const getAIContext = async (userId?: string | null) => {
    if (!userId) {
        return null;
    }

    const [profile, metrics] = await Promise.all([
        getStoredProfile(userId),
        getBusinessMetrics(userId),
    ]);

    return {
        businessName: profile?.business_name,
        industry: profile?.industry,
        goals: profile?.goals,
        metrics,
    };
};
