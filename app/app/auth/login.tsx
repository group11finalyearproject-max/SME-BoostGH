import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, router } from 'expo-router';
import { getPostAuthRoute } from '../../services/onboarding';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        const { error, userId } = await signIn(email, password);
        setLoading(false);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            Alert.alert('Login Failed', errorMessage || 'An unexpected error occurred');
        } else {
            const route = await getPostAuthRoute(userId);
            router.replace(route as never);
        }
    };

    const handleGoogleAuthenticated = async (userId?: string) => {
        const route = await getPostAuthRoute(userId);
        router.replace(route as never);
    };

    return (
        <View className="flex-1 justify-center px-8 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
                <Text className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">Welcome Back</Text>
                <Text className="text-gray-500 dark:text-gray-400 mb-8">Sign in to continue with SME Boost GH</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            placeholder="you@company.com"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            placeholder="********"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-primary-600 py-3 rounded-lg items-center mt-4 active:bg-primary-700"
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View className="mt-5 flex-row items-center">
                        <View className="h-px flex-1 bg-emerald-100 dark:bg-emerald-900" />
                        <Text className="mx-3 text-sm font-medium text-gray-400 dark:text-gray-500">or continue with</Text>
                        <View className="h-px flex-1 bg-emerald-100 dark:bg-emerald-900" />
                    </View>

                    <GoogleAuthButton
                        label="Continue with Google"
                        onAuthenticated={handleGoogleAuthenticated}
                    />
                </View>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-600 dark:text-gray-400">Don't have an account? </Text>
                    <Link href="/auth/signup" asChild>
                        <TouchableOpacity>
                            <Text className="text-primary-600 dark:text-primary-400 font-semibold">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <View className="items-center mt-4">
                    <Link href="/auth/reset-password" asChild>
                        <TouchableOpacity>
                            <Text className="text-gray-500 dark:text-gray-500 text-sm">Forgot Password?</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}
