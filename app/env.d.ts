/// <reference types="nativewind/types" />

declare module "firebase/auth/react-native" {
  import type { Auth, Persistence } from "firebase/auth";

  export { initializeAuth } from "firebase/auth";

  export function getReactNativePersistence(
    storage: unknown
  ): Persistence;
}