import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'appwrite';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const accountDetails = await account.get();
            setUser(accountDetails);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        await account.createEmailSession(email, password);
        await checkUserStatus();
    };

    const register = async (email, password, name) => {
        await account.create(ID.unique(), email, password, name);
        await login(email, password);
    };

    const logout = async () => {
        await account.deleteSession('current');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkUserStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
