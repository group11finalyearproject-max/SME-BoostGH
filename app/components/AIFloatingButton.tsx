import { TouchableOpacity, View } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';

const VISIBLE_AI_PATHS = new Set([
    '/',
    '/invoices',
    '/crm',
    '/profile',
]);

export default function AIFloatingButton() {
    const pathname = usePathname();

    // Only show on the primary dashboard tabs to keep the rest of the app focused.
    if (!VISIBLE_AI_PATHS.has(pathname)) {
        return null;
    }

    return (
        <View className="absolute bottom-32 right-6 z-50">
            <TouchableOpacity
                className="bg-primary-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:bg-primary-700"
                onPress={() => router.push('/ai-tools')}
            >
                <MessageSquare color="white" size={28} />
            </TouchableOpacity>
        </View>
    );
}
