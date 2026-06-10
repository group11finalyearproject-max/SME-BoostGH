import type { ReactNode } from 'react';
import {
    KeyboardAvoidingView,
    KeyboardAvoidingViewProps,
    Platform,
    ScrollView,
    ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KeyboardAwareScrollViewProps = ScrollViewProps & {
    children: ReactNode;
    className?: string;
    extraBottomPadding?: number;
    keyboardVerticalOffset?: number;
    minBottomPadding?: number;
};

export function KeyboardAwareScrollView({
    children,
    className,
    contentContainerStyle,
    extraBottomPadding = 120,
    keyboardDismissMode,
    keyboardShouldPersistTaps = 'handled',
    keyboardVerticalOffset = 12,
    minBottomPadding = 144,
    showsVerticalScrollIndicator = false,
    ...scrollProps
}: KeyboardAwareScrollViewProps) {
    const insets = useSafeAreaInsets();

    const androidBehavior: KeyboardAvoidingViewProps['behavior'] = 'height';

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : androidBehavior}
            keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : 0}
        >
            <ScrollView
                className={className}
                contentContainerStyle={[
                    {
                        flexGrow: 1,
                        paddingBottom: Math.max(insets.bottom + extraBottomPadding, minBottomPadding),
                    },
                    contentContainerStyle,
                ]}
                keyboardDismissMode={
                    keyboardDismissMode ?? (Platform.OS === 'ios' ? 'interactive' : 'on-drag')
                }
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                {...scrollProps}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
