export interface GpsLocation {
    latitude: number;
    longitude: number;
}

interface RequestCurrentGpsLocationResult {
    gpsLocation: GpsLocation | null;
    errorMessage?: string;
}

export const formatGpsLocation = (gpsLocation?: GpsLocation | null) => {
    if (!gpsLocation) return '';

    return `${gpsLocation.latitude.toFixed(6)}, ${gpsLocation.longitude.toFixed(6)}`;
};

export const requestCurrentGpsLocation = async (): Promise<RequestCurrentGpsLocationResult> => {
    try {
        const locationModule = require('expo-location');

        if (
            !locationModule?.requestForegroundPermissionsAsync ||
            !locationModule?.getCurrentPositionAsync
        ) {
            return {
                gpsLocation: null,
                errorMessage:
                    'Location support is not available yet on this build. You can still type your business location manually.',
            };
        }

        const permission = await locationModule.requestForegroundPermissionsAsync();

        if (!permission?.granted) {
            return {
                gpsLocation: null,
                errorMessage:
                    'Location permission was denied. You can continue with your typed business location instead.',
            };
        }

        const position = await locationModule.getCurrentPositionAsync({
            accuracy: locationModule.Accuracy?.Balanced,
        });

        const latitude = position?.coords?.latitude;
        const longitude = position?.coords?.longitude;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return {
                gpsLocation: null,
                errorMessage:
                    'We could not read your current GPS location. Please try again or keep entering your business location manually.',
            };
        }

        return {
            gpsLocation: {
                latitude,
                longitude,
            },
        };
    } catch (error) {
        console.error('Error requesting current GPS location:', error);
        return {
            gpsLocation: null,
            errorMessage:
                'We could not capture your GPS location right now. Please try again or keep using the typed business location field.',
        };
    }
};
