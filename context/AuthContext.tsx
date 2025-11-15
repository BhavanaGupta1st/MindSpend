import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for an existing session
        const storedUser = localStorage.getItem('mindspend-user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = () => {
        setLoading(true);
        // Simulate a successful Google Sign-In
        const mockUser: User = {
            uid: '12345-mock-uid',
            displayName: 'Bhavana Gupta',
            email: 'gupta.bhavana6@gmail.com',
            photoURL: 'https://picsum.photos/seed/bhavana/100/100',
        };
        localStorage.setItem('mindspend-user', JSON.stringify(mockUser));
        setUser(mockUser);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('mindspend-user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
