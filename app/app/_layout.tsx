import "./global.css";
import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import AIFloatingButton from "../components/AIFloatingButton";
import { ActivityIndicator, View } from "react-native";

function AppShell() {
    const { ready } = useTheme();

    if (!ready) {
        return (
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: '#F3F4F6' }}
            >
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <Stack>
                <Stack.Screen name="index" options={{ title: "SME Boost", headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
                <Stack.Screen name="backup-sync" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
                <Stack.Screen name="help" options={{ headerShown: false }} />
                <Stack.Screen name="ai-tools" options={{ headerShown: false, presentation: 'modal' }} />
            </Stack>
            <AIFloatingButton />
        </View>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AppShell />
            </ThemeProvider>
        </AuthProvider>
    );
}
