import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_EVENTS_KEY = '@analytics_events';
const ANALYTICS_PROFILE_KEY = '@analytics_profile';
const MAX_STORED_EVENTS = 40;

export interface AnalyticsEvent {
    name: string;
    timestamp: string;
    params?: Record<string, string | number | boolean | undefined>;
}

export const Analytics = {
    logEvent: async (
        eventName: string,
        params?: Record<string, string | number | boolean | undefined>
    ) => {
        try {
            const stored = await AsyncStorage.getItem(ANALYTICS_EVENTS_KEY);
            const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];

            const nextEvents = [
                {
                    name: eventName,
                    timestamp: new Date().toISOString(),
                    params,
                },
                ...events,
            ].slice(0, MAX_STORED_EVENTS);

            await AsyncStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(nextEvents));
        } catch (error) {
            console.warn('Could not store analytics event', error);
        }

        if (__DEV__) {
            console.log(`[Analytics] ${eventName}`, params);
        }
    },
    setUserProperties: async (properties: Record<string, string>) => {
        try {
            await AsyncStorage.setItem(ANALYTICS_PROFILE_KEY, JSON.stringify(properties));
        } catch (error) {
            console.warn('Could not store analytics profile', error);
        }

        if (__DEV__) {
            console.log(`[Analytics] Set Properties`, properties);
        }
    },
    getRecentEvents: async (): Promise<AnalyticsEvent[]> => {
        const stored = await AsyncStorage.getItem(ANALYTICS_EVENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    },
};
