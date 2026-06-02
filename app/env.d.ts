/// <reference types="nativewind/types" />

declare module "firebase/auth/react-native" {
  import type { Auth, Persistence } from "firebase/auth";

  export { initializeAuth } from "firebase/auth";

  export function getReactNativePersistence(
    storage: unknown
  ): Persistence;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string;
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?: string;
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?: string;
  }
}
