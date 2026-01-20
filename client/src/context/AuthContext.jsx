import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            // Stop loading immediately so app renders
            setLoading(false);

            // Background verification
            if (storedUser) {
                try {
                    const res = await api.get('/auth/profile');
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (error) {
                    console.error("Failed to refresh profile in background", error);
                    // Optional: If 401, you might want to logout, but for network errors keep local data
                }
            }
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
    };

    const register = async (email, password, name, purpose) => {
        const res = await api.post('/auth/register', { email, password, name, purpose });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
