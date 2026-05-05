export interface AppConfig {
    payments: {
        enabled: boolean;
        provider: 'paystack' | 'flutterwave' | 'none';
        publicKey?: string;
    };
    tax: {
        enabled: boolean;
        standardRate: number; // e.g., 0.15 for 15% VAT
        calculationMethod: 'inclusive' | 'exclusive';
    };
    analytics: {
        enabled: boolean;
        trackingId?: string;
    };
    sync: {
        offlineEnabled: boolean;
        autoSyncInterval: number; // ms
    };
    notifications: {
        enabled: boolean;
        pushTokensEnabled: boolean;
    };
}
