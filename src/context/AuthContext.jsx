/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getDevBypassEmail, getDevBypassRole, isDevBypassAuthEnabled } from '../config/devBuilderMode';

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = 'tenamed_access_token';
const USER_EMAIL_KEY = 'tenamed_user_email';
const USER_ROLE_KEY = 'tenamed_user_role';

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const isBypassEnabled = isDevBypassAuthEnabled();
    const [accessToken, setAccessToken] = useState(() => {
        if (isBypassEnabled) {
            return 'builder-dev-token';
        }
        return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
    });
    const [userEmail, setUserEmail] = useState(() => {
        if (isBypassEnabled) {
            return getDevBypassEmail();
        }
        return localStorage.getItem(USER_EMAIL_KEY) || '';
    });
    const [userRole, setUserRole] = useState(() => {
        if (isBypassEnabled) {
            return getDevBypassRole();
        }
        return localStorage.getItem(USER_ROLE_KEY) || 'guest';
    });

    const login = (token, email, role = 'customer') => {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        localStorage.setItem(USER_EMAIL_KEY, email);
        localStorage.setItem(USER_ROLE_KEY, role);
        setAccessToken(token);
        setUserEmail(email);
        setUserRole(role);
    };

    const setRole = (role) => {
        localStorage.setItem(USER_ROLE_KEY, role);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_EMAIL_KEY);
        localStorage.removeItem(USER_ROLE_KEY);
        setAccessToken('');
        setUserEmail('');
        setUserRole('guest');
    };

    const hasAnyRole = useCallback((roles = []) => {
        return roles.includes(userRole);
    }, [userRole]);

    const value = useMemo(() => ({
        accessToken,
        userEmail,
        userRole,
        isAuthenticated: Boolean(accessToken),
        login,
        setRole,
        logout,
        hasAnyRole,
    }), [accessToken, userEmail, userRole, hasAnyRole]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
