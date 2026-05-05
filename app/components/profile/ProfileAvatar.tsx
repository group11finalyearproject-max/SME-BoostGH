import { Image, Text, View } from 'react-native';
import { getAvatarInitials } from '../../services/profile';

interface ProfileAvatarProps {
    imageUri?: string | null;
    fullName?: string | null;
    businessName?: string | null;
    email?: string | null;
    size?: number;
}

export function ProfileAvatar({
    imageUri,
    fullName,
    businessName,
    email,
    size = 64,
}: ProfileAvatarProps) {
    const initials = getAvatarInitials({ fullName, businessName, email });
    const fontSize = Math.max(16, Math.floor(size * 0.38));

    return (
        <View
            className="items-center justify-center overflow-hidden rounded-full bg-primary-100"
            style={{ width: size, height: size }}
        >
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: size, height: size }}
                    resizeMode="cover"
                />
            ) : (
                <Text style={{ fontSize }} className="font-bold text-primary-700">
                    {initials}
                </Text>
            )}
        </View>
    );
}
