import api from "./api";

export const adminService = {
    // Dashboard Stats
    getStats: async () => {
        return api.get("/admin/stats");
    },

    // User Management
    getAllUsers: async (params?: any) => {
        return api.get("/admin/users", { params });
    },

    createUser: async (data: any) => {
        return api.post("/admin/users", data);
    },

    getUserDetails: async (id: string) => {
        return api.get(`/admin/users/${id}`);
    },

    updateUserStatus: async (id: string, status: string) => {
        return api.put(`/admin/users/${id}/status`, { status });
    },

    // KYC Management
    getPendingKYC: async (params?: any) => {
        return api.get("/admin/kyc/pending", { params });
    },

    getKYCDetails: async (id: string) => {
        return api.get(`/admin/kyc/${id}`);
    },

    reviewKYC: async (id: string, data: { action: 'approve' | 'reject' | 'request-changes', reviewNotes?: string, rejectionReason?: string }) => {
        return api.put(`/admin/kyc/${id}/review`, data);
    },

    // Transaction Management
    getAllTransactions: async (params?: any) => {
        return api.get("/admin/transactions", { params });
    },

    processTransaction: async (id: string, data: { action: 'complete' | 'fail', processingNotes?: string, failureReason?: string }) => {
        return api.put(`/admin/transactions/${id}/process`, data);
    },
};
