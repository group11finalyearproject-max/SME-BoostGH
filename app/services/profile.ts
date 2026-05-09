import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { GpsLocation } from './location';

export interface StoredProfile {
    id: string;
    full_name?: string;
    phone?: string;
    business_name?: string;
    industry?: string;
    goals?: string[];
    image_uri?: string;
    business_location?: string;
    gps_location?: GpsLocation | null;
    business_registration_number?: string;
    tin_number?: string;
    updated_at?: string;
    [key: string]: unknown;
}

const profileKey = (userId: string) => `@profile_${userId}`;
const profileImageDirectory = FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}profile-images/`
    : null;

const getFileExtension = (uri: string) => {
    const cleanUri = uri.split('?')[0];
    const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
    return match?.[1]?.toLowerCase() || 'jpg';
};

const isManagedProfileImage = (uri?: string | null) =>
    Boolean(uri && profileImageDirectory && uri.startsWith(profileImageDirectory));

const ensureProfileImageDirectory = async () => {
    if (!profileImageDirectory) {
        throw new Error('Profile image storage is not available on this device.');
    }

    await FileSystem.makeDirectoryAsync(profileImageDirectory, { intermediates: true });
};

export const getStoredProfile = async (userId: string): Promise<StoredProfile | null> => {
    const stored = await AsyncStorage.getItem(profileKey(userId));
    return stored ? (JSON.parse(stored) as StoredProfile) : null;
};

export const saveProfileUpdates = async (
    userId: string,
    updates: Partial<StoredProfile>
): Promise<StoredProfile> => {
    const existing = await getStoredProfile(userId);
    const nextProfile: StoredProfile = {
        ...(existing ?? { id: userId }),
        ...updates,
        id: userId,
        updated_at: new Date().toISOString(),
    };

    await AsyncStorage.setItem(profileKey(userId), JSON.stringify(nextProfile));
    return nextProfile;
};

export const prepareProfileImageForSave = async (
    userId: string,
    sourceUri: string,
    previousTemporaryUri?: string | null
) => {
    await ensureProfileImageDirectory();

    const extension = getFileExtension(sourceUri);
    const destinationUri = `${profileImageDirectory}${userId}-${Date.now()}.${extension}`;

    await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
    });

    if (previousTemporaryUri && previousTemporaryUri !== destinationUri && isManagedProfileImage(previousTemporaryUri)) {
        await FileSystem.deleteAsync(previousTemporaryUri, { idempotent: true });
    }

    return destinationUri;
};

export const deleteProfileImageFile = async (uri?: string | null) => {
    if (!uri || !isManagedProfileImage(uri)) return;

    await FileSystem.deleteAsync(uri, { idempotent: true });
};

export const getAvatarInitials = ({
    fullName,
    businessName,
    email,
}: {
    fullName?: string | null;
    businessName?: string | null;
    email?: string | null;
}) => {
    const source = fullName?.trim() || businessName?.trim() || email?.trim() || 'U';
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return source.charAt(0).toUpperCase();
};
