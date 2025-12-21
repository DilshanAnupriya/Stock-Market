import api from './api';

export interface RegisterData {
    nic: string;
    email: string;
    mobile: string;
    password: string;
    accountType: string;
    username?: string;
}

export interface LoginCredentials {
    identifier: string; // NIC, email, or mobile
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: any;
}

export const authService = {
    // Register a new user
    register: async (data: RegisterData) => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (credentials: LoginCredentials) => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    // Verify OTP
    verifyOTP: async (otpId: string, otpCode: string, userId: string) => {
        const response = await api.post<AuthResponse>('/auth/verify-otp', { otpId, otpCode, userId });
        return response.data;
    },

    // Resend OTP
    resendOTP: async (data: { userId: string; purpose: string; sentTo: string; sentVia: string }) => {
        const response = await api.post<AuthResponse>('/auth/resend-otp', data);
        return response.data;
    },

    // Logout user
    logout: async () => {
        const response = await api.post<AuthResponse>('/auth/logout');
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get<AuthResponse>('/auth/me');
        return response.data;
    }
};
