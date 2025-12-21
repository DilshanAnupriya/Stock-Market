import api from "./api";

export const accountService = {
    // Step 1: Personal Details
    submitPersonalDetails: async (data: any) => {
        return api.post("/account/personal-details", data);
    },

    // Step 2: NIC Upload
    uploadNIC: async (formData: FormData) => {
        return api.post("/account/upload-nic", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Step 3: Bank Details
    submitBankDetails: async (data: any) => {
        return api.post("/account/bank-details", data);
    },

    // Step 4: Bank Book Upload
    uploadBankBook: async (formData: FormData) => {
        return api.post("/account/upload-bank-book", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Step 5: Billing Proof Upload
    uploadBillingProof: async (formData: FormData) => {
        return api.post("/account/upload-billing-proof", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Step 6: Employment Details
    submitEmploymentDetails: async (data: any) => {
        return api.post("/account/employment-details", data);
    },

    // Step 7: Nominee Details
    addNominee: async (data: any) => {
        return api.post("/account/nominee", data);
    },

    // Step 8: Video KYC Upload
    uploadVideoKYC: async (formData: FormData) => {
        return api.post("/account/video-kyc", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Step 9: Declaration
    submitDeclaration: async (data: any) => {
        return api.post("/account/declaration", data);
    },

    // Get Status
    getAccountStatus: async () => {
        return api.get("/account/status");
    },
};
