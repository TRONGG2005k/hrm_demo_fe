/**
 * ============================================================
 * AXIOS CONFIGURATION - HRM Frontend
 * ============================================================
 * - Base URL từ biến môi trường
 * - withCredentials: true
 * - Tự động thêm Authorization header
 * - Interceptor xử lý 401 → refresh token → retry
 * ============================================================
 */

import axios from 'axios';

// Tạo axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true, // Gửi cookies cho refresh token
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
apiClient.interceptors.request.use(
    (config) => {
        // Lấy accessToken từ localStorage
        const accessToken = localStorage.getItem('accessToken');

        // Thêm Authorization header nếu có token
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Log request cho development
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// ============================================
// RESPONSE INTERCEPTOR với REFRESH TOKEN LOGIC
// ============================================

// Biến để tránh multiple refresh token requests
let isRefreshing = false;
let refreshSubscribers = [];

// Hàm để thêm request vào hàng đợi chờ refresh token
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

// Hàm để thực hiện các request đang chờ với token mới
const onTokenRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

// Hàm refresh token
const refreshAccessToken = async () => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}api/v1/auth/refresh`,
            {},
            { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
    } catch (error) {
        // Refresh token failed → logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw error;
    }
};

apiClient.interceptors.response.use(
    // Response thành công
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.url}`, response.data);
        }
        return response;
    },

    // Xử lý lỗi
    async (error) => {
        const originalRequest = error.config;

        // Nếu không phải lỗi 401 hoặc đã retry → reject
        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Nếu đang refresh token → đợi
        if (isRefreshing) {
            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(apiClient(originalRequest));
                });
            });
        }

        // Bắt đầu refresh token
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            onTokenRefreshed(newToken);

            // Retry request ban đầu với token mới
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;