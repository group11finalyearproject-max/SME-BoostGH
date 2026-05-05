import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

type AppTheme = 'light' | 'dark';

interface ThemeContextType {
    theme: AppTheme;
    ready: boolean;
    toggleTheme: () => Promise<void>;
    setTheme: (theme: AppTheme) => Promise<void>;
}

const THEME_STORAGE_KEY = '@theme_preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { colorScheme, setColorScheme } = useNativeWindColorScheme();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const restoreTheme = async () => {
            try {
                const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (stored === 'light' || stored === 'dark') {
                    setColorScheme(stored);
                } else {
                    setColorScheme('light');
                }
            } finally {
                setReady(true);
            }
        };

        restoreTheme();
    }, [setColorScheme]);

    const setTheme = async (theme: AppTheme) => {
        setColorScheme(theme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    };

    const toggleTheme = async () => {
        const nextTheme: AppTheme = colorScheme === 'dark' ? 'light' : 'dark';
        await setTheme(nextTheme);
    };

    const value = useMemo(
        () => ({
            theme: (colorScheme === 'dark' ? 'dark' : 'light') as AppTheme,
            ready,
            toggleTheme,
            setTheme,
        }),
        [colorScheme, ready]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
