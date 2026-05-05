import { Tabs } from 'expo-router';
import { LayoutDashboard, FileText, Users, BarChart3, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';

export default function DashboardLayout() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const activeColor = isDark ? '#4BB37E' : '#2E7D32'; // Primary 500
    const inactiveColor = isDark ? '#9CA3AF' : '#6B7280';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarStyle: {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderTopColor: isDark ? '#374151' : '#E5E7EB',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="invoices"
                options={{
                    title: 'Invoices',
                    tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="crm"
                options={{
                    title: 'Customers',
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
