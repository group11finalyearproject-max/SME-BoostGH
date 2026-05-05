import { AppConfig } from '../types/config';

export const featuresConfig: AppConfig = {
    payments: {
        enabled: true,
        provider: 'paystack', 
        publicKey: process.env.EXPO_PUBLIC_PAYSTACK_KEY,
    },
    tax: {
        enabled: true,
        standardRate: 0.15, // e.g. 15% Standard GRA Rate
        calculationMethod: 'exclusive',
    },
    analytics: {
        enabled: process.env.NODE_ENV === 'production',
        trackingId: process.env.EXPO_PUBLIC_ANALYTICS_ID,
    },
    sync: {
        offlineEnabled: true,
        autoSyncInterval: 60000 * 5, // Every 5 minutes
    },
    notifications: {
        enabled: true,
        pushTokensEnabled: true,
    }
};

export default featuresConfig;
