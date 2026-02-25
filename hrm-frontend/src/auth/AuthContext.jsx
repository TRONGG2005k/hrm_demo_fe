/**
 * ============================================================
 * AUTH CONTEXT - HRM Frontend
 * ============================================================
 * Quản lý authentication state toàn ứng dụng
 * - Login / Logout
 * - Lưu trữ user info và token
 * - Kiểm tra quyền truy cập
 * ============================================================
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../api/axios';

// Tạo Context
const AuthContext = createContext(null);

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
    // State
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Kiểm tra token khi mount
    useEffect(() => {
        const initAuth = () => {
            const storedToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (e) {
                    // Invalid user data → logout
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    // ============================================
    // LOGIN
    // ============================================
    const login = useCallback(async (username, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/api/v1/auth/login', {
                username,
                password,
            });

            const { accessToken, ...userData } = response.data;

            // Lưu vào localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Cập nhật state
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // LOGOUT
    // ============================================
    const logout = useCallback(async () => {
        setIsLoading(true);

        try {
            // Gọi API logout (optional)
            await apiClient.delete('/api/v1/auth/logout');
        } catch (err) {
            // Ignore logout API errors
            console.warn('Logout API error:', err);
        } finally {
            // Xóa localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            // Reset state
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // LOGOUT ALL DEVICES
    // ============================================
    const logoutAll = useCallback(async () => {
        setIsLoading(true);

        try {
            await apiClient.delete('/api/v1/auth/logoutAll');
        } catch (err) {
            console.warn('LogoutAll API error:', err);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // UPDATE USER INFO
    // ============================================
    const updateUser = useCallback((newUserData) => {
        const updatedUser = { ...user, ...newUserData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    }, [user]);

    // ============================================
    // CHECK ROLE
    // ============================================
    const hasRole = useCallback((requiredRoles) => {
        if (!user || !user.roles) return false;

        // Đảm bảo user.roles là một mảng (nếu là chuỗi thì tách bằng dấu cách)
        const userRoles = Array.isArray(user.roles)
            ? user.roles
            : (typeof user.roles === 'string' ? user.roles.split(' ') : [user.roles]);
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        return userRoles.some(role => roles.includes(role));
    }, [user]);

    const isAdmin = useCallback(() => {
        return hasRole('ROLE_ADMIN');
    }, [hasRole]);

    const isHRManager = useCallback(() => {
        return hasRole(['ROLE_HR_MANAGER', 'ROLE_ADMIN']);
    }, [hasRole]);

    const isHRStaff = useCallback(() => {
        return hasRole(['ROLE_HR_STAFF', 'ROLE_HR_MANAGER', 'ROLE_ADMIN']);
    }, [hasRole]);

    const isManager = useCallback(() => {
        return hasRole(['ROLE_MANAGER', 'ROLE_HR_MANAGER', 'ROLE_ADMIN']);
    }, [hasRole]);

    const isEmployee = useCallback(() => {
        return hasRole('ROLE_EMPLOYEE');
    }, [hasRole]);

    // Context value
    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        logoutAll,
        updateUser,
        hasRole,
        isAdmin,
        isHRManager,
        isHRStaff,
        isManager,
        isEmployee,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
