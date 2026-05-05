import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Moon, Bell, HelpCircle, ChevronRight, CloudUpload } from 'lucide-react-native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { confirmDestructiveAction } from '../../services/confirm';
import { consumeFlashMessage, FlashMessage } from '../../services/flashMessage';
import { getStoredProfile, StoredProfile } from '../../services/profile';
import { useTheme } from '../../contexts/ThemeContext';
import { getUnreadNotificationCount } from '../../services/notifications';

export default function Profile() {
    const { signOut, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [feedbackMessage, setFeedbackMessage] = useState<FlashMessage | null>(null);
    const [profile, setProfile] = useState<StoredProfile | null>(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setFeedbackMessage(consumeFlashMessage());
            let isMounted = true;

            const loadProfile = async () => {
                if (!user?.id) {
                    if (isMounted) {
                        setProfile(null);
                    }
                    return;
                }

                const storedProfile = await getStoredProfile(user.id);
                if (isMounted) {
                    setProfile(storedProfile);
                    setUnreadNotifications(await getUnreadNotificationCount(user.id));
                }
            };

            void loadProfile();

            return () => {
                isMounted = false;
            };
        }, [])
    );

    const handleSignOut = async () => {
        confirmDestructiveAction({
            title: 'Sign out',
            message: 'You are about to sign out of SME Boost GH on this device.',
            confirmLabel: 'Sign out',
            onConfirm: async () => {
                await signOut();
                router.replace('/auth/login');
            },
        });
    };

    const MenuLink = ({ icon: Icon, label, onPress, value, isSwitch }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
            disabled={isSwitch}
        >
            <View className="flex-row items-center">
                <View className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3">
                    <Icon size={20} color={theme === 'dark' ? '#E5E7EB' : '#374151'} />
                </View>
                <Text className="text-gray-700 dark:text-gray-200 font-medium">{label}</Text>
            </View>
            {isSwitch ? (
                <Switch value={value} onValueChange={onPress} trackColor={{ false: '#767577', true: '#2E7D32' }} thumbColor={value ? '#f4f3f4' : '#f4f3f4'} />
            ) : (
                <View className="flex-row items-center">
                    {typeof value === 'string' ? (
                        <Text className="mr-2 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                            {value}
                        </Text>
                    ) : null}
                    <ChevronRight size={20} color="#9CA3AF" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <View className="bg-white dark:bg-gray-800 p-6 flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <View className="mr-4">
                    <ProfileAvatar
                        imageUri={typeof profile?.image_uri === 'string' ? profile.image_uri : null}
                        fullName={profile?.full_name || user?.user_metadata?.full_name}
                        businessName={profile?.business_name}
                        email={user?.email}
                        size={64}
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">{profile?.full_name || user?.user_metadata?.full_name || 'User'}</Text>
                    <Text className="text-gray-500 dark:text-gray-400">{user?.email}</Text>
                    {profile?.business_name ? (
                        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {profile.business_name}
                        </Text>
                    ) : null}
                </View>
            </View>

            {feedbackMessage ? (
                <View className="px-4 pt-4">
                    <AppStateCard
                        title={feedbackMessage.title}
                        description={feedbackMessage.description}
                        tone={feedbackMessage.tone ?? 'success'}
                    />
                </View>
            ) : null}

            <View className="mt-6 border-t border-b border-gray-100 dark:border-gray-700">
                <MenuLink icon={User} label="Edit Profile" onPress={() => router.push('/profile/edit')} />
                <MenuLink
                    icon={Moon}
                    label="Dark Mode"
                    isSwitch
                    value={theme === 'dark'}
                    onPress={() => {
                        void toggleTheme();
                    }}
                />
                <MenuLink
                    icon={Bell}
                    label="Notifications"
                    value={unreadNotifications > 0 ? `${unreadNotifications} new` : undefined}
                    onPress={() => router.push('/notifications')}
                />
                <MenuLink
                    icon={HelpCircle}
                    label="Help & Support"
                    onPress={() => router.push('/help')}
                />
                <MenuLink
                    icon={CloudUpload}
                    label="Backup & Sync"
                    onPress={() => router.push('/backup-sync')}
                />
            </View>

            <View className="mt-6 px-4">
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex-row items-center justify-center"
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="text-red-500 font-bold ml-2">Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
