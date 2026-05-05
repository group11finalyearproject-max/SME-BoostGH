import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getPostAuthRoute } from '../services/onboarding';

export default function HomeScreen() {
    const { user, loading } = useAuth();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const redirectSignedInUser = async () => {
            if (loading) return;

            if (!user?.id) {
                setChecking(false);
                return;
            }

            const route = await getPostAuthRoute(user.id);
            router.replace(route as never);
        };

        redirectSignedInUser();
    }, [user?.id, loading]);

    if (loading || checking) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Text className="mb-4 text-3xl font-bold text-primary-600">SME Boost GH</Text>
            <Text className="mb-8 px-10 text-center text-lg text-gray-600 dark:text-gray-300">
                Business tools and AI guidance for Ghanaian SMEs
            </Text>

            <Link href="/auth/login" asChild>
                <TouchableOpacity className="bg-primary-500 py-3 px-6 rounded-lg shadow-md active:bg-primary-600">
                    <Text className="text-white font-semibold text-lg">Get Started</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}
