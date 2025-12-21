import api from './api';

export const fundService = {
    getAllFunds: async (params?: { type?: string; isActive?: boolean }) => {
        const response = await api.get('/funds', { params });
        return response.data;
    },

    getFundDetails: async (id: string) => {
        const response = await api.get(`/funds/${id}`);
        return response.data;
    },

    createFund: async (fundData: any) => {
        const response = await api.post('/funds', fundData);
        return response.data;
    },

    updateFund: async (id: string, fundData: any) => {
        const response = await api.put(`/funds/${id}`, fundData);
        return response.data;
    }
};
