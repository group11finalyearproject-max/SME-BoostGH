import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../contexts/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const googleClientIds = {
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
};

const redirectUri = makeRedirectUri({
    scheme: 'smeboost',
    path: 'oauthredirect',
});

interface GoogleAuthButtonProps {
    label: string;
    onAuthenticated: (userId?: string) => Promise<void> | void;
}

const getMissingConfigMessage = () => {
    if (Platform.OS === 'ios') {
        return 'Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to your app environment before using Google sign-in.';
    }

    if (Platform.OS === 'android') {
        return 'Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID to your app environment before using Google sign-in.';
    }

    return 'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your app environment before using Google sign-in on web.';
};

export function GoogleAuthButton({ label, onAuthenticated }: GoogleAuthButtonProps) {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const handledResponseKeyRef = useRef<string | null>(null);
    const isConfigured = useMemo(() => {
        if (Platform.OS === 'ios') return Boolean(googleClientIds.ios);
        if (Platform.OS === 'android') return Boolean(googleClientIds.android);
        return Boolean(googleClientIds.web);
    }, []);

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        webClientId: googleClientIds.web,
        iosClientId: googleClientIds.ios,
        androidClientId: googleClientIds.android,
        redirectUri,
        selectAccount: true,
    });

    useEffect(() => {
        if (!response) return;

        if (response.type === 'dismiss' || response.type === 'cancel') {
            setLoading(false);
            return;
        }

        if (response.type === 'error') {
            setLoading(false);
            Alert.alert('Google Sign-In Failed', response.error?.message || 'Please try again.');
            return;
        }

        if (response.type !== 'success') return;

        const idToken = response.params?.id_token ?? response.authentication?.idToken;
        const accessToken = response.params?.access_token ?? response.authentication?.accessToken;
        const responseKey = response.params?.state ?? idToken ?? response.authentication?.accessToken ?? null;

        if (!idToken) {
            setLoading(false);
            Alert.alert('Google Sign-In Failed', 'Google did not return an ID token for this request.');
            return;
        }

        if (responseKey && handledResponseKeyRef.current === responseKey) {
            return;
        }

        handledResponseKeyRef.current = responseKey;

        let active = true;

        const finishGoogleSignIn = async () => {
            const { error, userId } = await signInWithGoogle(idToken, accessToken);

            if (!active) return;

            setLoading(false);

            if (error) {
                const errorMessage = typeof error === 'string' ? error : error.message;
                Alert.alert('Google Sign-In Failed', errorMessage || 'Please try again.');
                return;
            }

            await onAuthenticated(userId);
        };

        finishGoogleSignIn();

        return () => {
            active = false;
        };
    }, [onAuthenticated, response, signInWithGoogle]);

    const handlePress = async () => {
        if (!isConfigured) {
            Alert.alert('Google Sign-In Not Configured', getMissingConfigMessage());
            return;
        }

        if (!request) {
            Alert.alert('Google Sign-In Not Ready', 'The Google sign-in request is still loading. Please try again.');
            return;
        }

        setLoading(true);

        try {
            const result = await promptAsync();

            if (result.type !== 'success') {
                setLoading(false);
            }
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Google Sign-In Failed', error?.message || 'Please try again.');
        }
    };

    return (
        <TouchableOpacity
            className="mt-4 flex-row items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-3 active:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-800 dark:active:bg-gray-700"
            onPress={handlePress}
            disabled={loading}
        >
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                <Text className="text-base font-bold text-emerald-700 dark:text-emerald-300">G</Text>
            </View>
            {loading ? (
                <ActivityIndicator color="#2E7D32" />
            ) : (
                <Text className="text-base font-semibold text-gray-900 dark:text-white">{label}</Text>
            )}
        </TouchableOpacity>
    );
}
