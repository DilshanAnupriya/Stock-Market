import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
// Create Axios instance
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Adjust base URL as needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized (e.g., token expired)
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            // Optional: Redirect to login page or show a toast
        }
        return Promise.reject(error);
    }
);

export default api;
