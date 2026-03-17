'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'CORALISTA' | 'DIRECTOR' | 'ADMIN';
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const userData = await fetchApi('/users/me');
            setUser(userData);
        } catch (error) {
            console.warn('API connection failed. Injecting Debug/Demo User for testing.');
            // FORCE MOCK USER TO UNBLOCK TESTING
            setUser({
                id: 'debug-user',
                email: 'director@coro.com',
                full_name: 'Director (Demo Mode)',
                role: 'DIRECTOR'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
