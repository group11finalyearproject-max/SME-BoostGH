import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut as firebaseSignOut, 
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile,
    User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface User {
    id: string;
    email?: string;
    user_metadata?: {
        full_name?: string;
        [key: string]: any;
    };
}

export interface Session {
    access_token: string;
    user: User;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any; userId?: string }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; userId?: string }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const mapFirebaseUser = async (firebaseUser: FirebaseUser) => {
        const token = await firebaseUser.getIdToken();

        return {
            access_token: token,
            user: {
                id: firebaseUser.uid,
                email: firebaseUser.email || undefined,
                user_metadata: { full_name: firebaseUser.displayName || undefined }
            } satisfies User,
        } satisfies Session;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const mappedSession = await mapFirebaseUser(firebaseUser);
                setSession(mappedSession);
                setUser(mappedSession.user);
            } else {
                setSession(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            return { error: null, userId: credential.user.uid };
        } catch (error: any) {
            console.error('Firebase sign in error:', error);
            return { error: error.message, userId: undefined };
        }
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: fullName });
                await userCredential.user.getIdToken(true);
                const mappedSession = await mapFirebaseUser(userCredential.user);
                setSession(mappedSession);
                setUser(mappedSession.user);
            }
            return { error: null, userId: userCredential.user?.uid };
        } catch (error: any) {
            console.error('Firebase sign up error:', error);
            return { error: error.message, userId: undefined };
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
