import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar';
import { AppFormField } from '../../components/ui/AppFormField';
import { AppScreenHeader } from '../../components/ui/AppScreenHeader';
import { AppStateCard } from '../../components/ui/AppStateCard';
import { setFlashMessage } from '../../services/flashMessage';
import {
    deleteProfileImageFile,
    getStoredProfile,
    prepareProfileImageForSave,
    saveProfileUpdates,
} from '../../services/profile';

const inputClassName =
    'rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

export default function EditProfile() {
    const { user } = useAuth();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [savedAvatarUri, setSavedAvatarUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [showValidation, setShowValidation] = useState(false);

    const nameError =
        showValidation && !fullName.trim()
            ? 'Add your full name so your profile remains complete.'
            : '';

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setFetching(false);
                return;
            }
            try {
                setErrorMessage('');
                const data = await getStoredProfile(user.id);
                if (data) {
                    setFullName(data.full_name || '');
                    setPhone(data.phone || '');
                    setBusinessName(data.business_name || '');
                    setAvatarUri(typeof data.image_uri === 'string' ? data.image_uri : null);
                    setSavedAvatarUri(typeof data.image_uri === 'string' ? data.image_uri : null);
                } else {
                    setFullName(user.user_metadata?.full_name || '');
                    setAvatarUri(null);
                    setSavedAvatarUri(null);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setErrorMessage('We could not load your saved profile details. You can still update the fields below.');
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, [user]);

    useEffect(() => {
        return () => {
            if (avatarUri && avatarUri !== savedAvatarUri) {
                void deleteProfileImageFile(avatarUri);
            }
        };
    }, [avatarUri, savedAvatarUri]);

    const handlePickImage = async () => {
        if (!user?.id) return;

        setImageLoading(true);
        setErrorMessage('');

        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                setErrorMessage('Allow photo library access to choose a logo or profile image from your device.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (result.canceled || !result.assets?.length) {
                return;
            }

            const nextUri = await prepareProfileImageForSave(
                user.id,
                result.assets[0].uri,
                avatarUri && avatarUri !== savedAvatarUri ? avatarUri : undefined
            );

            setAvatarUri(nextUri);
        } catch (error: any) {
            console.error('Error selecting profile image:', error);
            setErrorMessage(error?.message || 'We could not prepare that image. Please try a different one.');
        } finally {
            setImageLoading(false);
        }
    };

    const handleRemoveImage = () => {
        if (!avatarUri) return;

        Alert.alert(
            'Remove image',
            'Your initials will be shown again until you choose another logo or profile image.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        if (avatarUri !== savedAvatarUri) {
                            void deleteProfileImageFile(avatarUri);
                        }
                        setAvatarUri(null);
                    },
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!user?.id) return;

        if (!fullName.trim()) {
            setShowValidation(true);
            setErrorMessage('Add your full name before saving your profile.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const updates = {
                full_name: fullName.trim(),
                phone: phone.trim(),
                business_name: businessName.trim(),
                image_uri: avatarUri ?? undefined,
            };

            await saveProfileUpdates(user.id, updates);
            if (savedAvatarUri && savedAvatarUri !== avatarUri) {
                await deleteProfileImageFile(savedAvatarUri);
            }
            setSavedAvatarUri(avatarUri);

            setFlashMessage({
                title: 'Profile updated',
                description: 'Your business details and logo have been saved for this device.',
                tone: 'success',
            });
            router.back();
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
                <View className="px-5 pt-10">
                    <AppStateCard
                        title="Loading profile"
                        description="SME Boost GH is preparing your saved business details."
                        tone="loading"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <AppScreenHeader
                title="Edit Profile"
                subtitle="Keep your business details current so the app can stay helpful."
                onBack={() => router.back()}
            />

            <ScrollView className="flex-1">
                <View className="gap-4 px-5 pb-12 pt-6">
                    {errorMessage ? (
                        <AppStateCard
                            title="Profile needs attention"
                            description={errorMessage}
                            tone="error"
                        />
                    ) : null}

                    <View className="items-center rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <TouchableOpacity
                            onPress={handlePickImage}
                            disabled={imageLoading}
                            className="items-center"
                            activeOpacity={0.9}
                        >
                            <View className="relative">
                                <ProfileAvatar
                                    imageUri={avatarUri}
                                    fullName={fullName}
                                    businessName={businessName}
                                    email={user?.email}
                                    size={96}
                                />
                                <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-600 dark:border-gray-800">
                                    {imageLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Camera size={16} color="#FFFFFF" />
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                            {fullName || 'Your profile'}
                        </Text>
                        <Text className="mt-2 text-center text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Tap the avatar to choose a logo or profile image from your gallery. Your initials stay in place if no image is set.
                        </Text>

                        <View className="mt-4 flex-row gap-3">
                            <TouchableOpacity
                                onPress={handlePickImage}
                                disabled={imageLoading}
                                className={`min-h-[44px] items-center justify-center rounded-2xl bg-primary-50 px-4 py-3 dark:bg-primary-900/20 ${
                                    imageLoading ? 'opacity-70' : 'active:opacity-90'
                                }`}
                            >
                                <Text className="text-sm font-semibold text-primary-700 dark:text-primary-200">
                                    {avatarUri ? 'Choose Another Image' : 'Choose Image'}
                                </Text>
                            </TouchableOpacity>

                            {avatarUri ? (
                                <TouchableOpacity
                                    onPress={handleRemoveImage}
                                    className="min-h-[44px] flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 active:opacity-90 dark:border-red-900/40 dark:bg-red-900/20"
                                >
                                    <Trash2 size={16} color="#DC2626" />
                                    <Text className="ml-2 text-sm font-semibold text-red-600 dark:text-red-300">
                                        Remove Image
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>

                    <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <AppFormField
                            label="Full name"
                            helper="Use the name you want to see across the app."
                            error={nameError}
                            required
                        >
                            <TextInput
                                className={inputClassName}
                                value={fullName}
                                onChangeText={(text) => {
                                    setFullName(text);
                                    setErrorMessage('');
                                }}
                                placeholder="Full name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </AppFormField>

                        <View className="mt-4">
                            <AppFormField
                                label="Business name"
                                helper="This helps SME Boost GH make your dashboard and AI outputs feel more tailored."
                                example="Your business name"
                            >
                                <TextInput
                                    className={inputClassName}
                                    value={businessName}
                                    onChangeText={(text) => {
                                        setBusinessName(text);
                                        setErrorMessage('');
                                    }}
                                    placeholder="Business name"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </AppFormField>
                        </View>

                        <View className="mt-4">
                            <AppFormField
                                label="Email address"
                                helper="Email is managed through your account and cannot be changed here."
                            >
                                <TextInput
                                    className="rounded-2xl border border-gray-200 bg-gray-100 p-4 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                    value={user?.email}
                                    editable={false}
                                />
                            </AppFormField>
                        </View>

                        <View className="mt-4">
                            <AppFormField
                                label="Phone number"
                                helper="Optional, helpful for customer follow-up and profile completeness."
                                example="+233..."
                            >
                                <TextInput
                                    className={inputClassName}
                                    value={phone}
                                    onChangeText={(text) => {
                                        setPhone(text);
                                        setErrorMessage('');
                                    }}
                                    placeholder="Phone number"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                />
                            </AppFormField>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`min-h-[56px] items-center justify-center rounded-3xl bg-primary-600 px-4 py-4 ${
                            loading ? 'opacity-70' : 'active:opacity-90'
                        }`}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-base font-bold text-white">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
