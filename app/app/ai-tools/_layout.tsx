import { Stack } from 'expo-router';

export default function AIToolsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "AI Tools", headerShown: false }} />
            <Stack.Screen name="business-plan" options={{ title: "Business Plan" }} />
            <Stack.Screen name="marketing" options={{ title: "Marketing Content" }} />
            <Stack.Screen name="email" options={{ title: "Email Draft" }} />
            <Stack.Screen name="chat" options={{ title: "AI Advisor" }} />
            <Stack.Screen name="drafts" options={{ title: "Saved Drafts" }} />
        </Stack>
    );
}
