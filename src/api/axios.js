import axios from 'axios';

const HARDCODED_AUTH_TOKEN = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI4MzI4MDhhNi00OTQ5LTRlYzUtYWFmYS01OGYzM2JlN2I1MmUiLCJqdGkiOiIzZTNkOWUyOS1hYWU2LTQ0NzgtOTkyNy04OGQzNDZjNmE5MjUiLCJzaWQiOiJjMTZkYjFkZi05MjY5LTQ5OTYtOTZhYi1mNDE5MzZiMmFmNTkiLCJ0eXBlIjoiQUNDRVNTIiwiaWF0IjoxNzc1NzI1NTQ5LCJleHAiOjI2NzU3MjU1NDl9.DkT0f_qq7_5P1NN6ZGtesyVRDJAUEzp-6RvVOwGNukcaAY1_Tlhzme8eJaB4hH1D';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://nonobediently-nonperishing-hilda.ngrok-free.dev/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a separate instance for form data if needed (e.g., file uploads)
export const apiFormData = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://nonobediently-nonperishing-hilda.ngrok-free.dev/api',
});

const attachAuthHeader = (config) => {
    const hasAuthorizationHeader = Boolean(config.headers?.Authorization || config.headers?.authorization);
    const token = localStorage.getItem('tenamed_access_token') || HARDCODED_AUTH_TOKEN;
    if (!hasAuthorizationHeader && token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

api.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error));
apiFormData.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error));

// Auth
export const authRegister = (payload) => api.post('/auth/register', payload);
export const authLogin = (payload) => api.post('/auth/login', payload);
export const authRefresh = () => api.post('/auth/refresh');
export const authLogout = () => api.post('/auth/logout');
export const authLogoutAll = () => api.post('/auth/logout-all');

// Identity
export const identityRegister = (payload) => api.post('/identity/register', payload);
export const identityLogin = (payload) => api.post('/identity/login', payload);

// Admin users
export const adminGetUser = (id) => api.get(`/admin/users/${id}`);
export const adminGetUserRoles = (id) => api.get(`/admin/users/${id}/roles`);
export const adminAddRoles = (id, payload) => api.post(`/admin/users/${id}/roles`, payload);
export const adminRemoveRole = (id, roleName) => api.delete(`/admin/users/${id}/roles/${roleName}`);
export const adminPopulateRoles = () => api.post('/admin/users/roles/populate');

// Payments
export const paymentTest = () => api.get('/payments');
export const paymentInitialize = (payload = {}) => api.post(
    '/payments/initialize',
    {
        orderId: '6169471a-bb60-4887-b5c3-66fffeaa5d2e',
    },
    {
        headers: {
            Authorization: `Bearer ${HARDCODED_AUTH_TOKEN}`,
            'ngrok-skip-browser-warning': 'true',
        },
    },
);
export const paymentCancel = (txRef) => api.put(`/payments/cancel/${txRef}`);


// Medicines
export const medicineGetById = (id) => api.get(`/medicines/${id}`);
export const medicineSearch = (params) => api.get('/medicines/search', { params });
export const medicineUpdate = (id, payload) => api.put(`/medicines/${id}`, payload);
export const medicineDelete = (id) => api.delete(`/medicines/${id}`);
export const medicineAddAllergen = (medicineId, allergenId) => api.post(`/medicines/${medicineId}/allergens/${allergenId}`);
export const medicineRemoveAllergen = (medicineId, allergenId) => api.delete(`/medicines/${medicineId}/allergens/${allergenId}`);
export const medicineAddDopingRule = (medicineId, payload) => api.post(`/medicines/${medicineId}/doping-rules`, payload);
export const medicineRemoveDopingRule = (medicineId, ruleId) => api.delete(`/medicines/${medicineId}/doping-rules/${ruleId}`);

// Verification
export const verificationProcess = (id) => api.post(`/v1/verification/${id}/process`);
export const verificationApprove = (id) => api.post(`/v1/verification/${id}/approve`);
export const verificationReject = (id, reason) => api.post(`/v1/verification/${id}/reject`, null, { params: { reason } });

// OCR
export const ocrTest = () => api.get('/ocr/upload');
export const ocrUploadPrescription = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFormData.post('/ocr/upload', formData, {
        headers: {
            Authorization: `Bearer ${HARDCODED_AUTH_TOKEN}`,
            'ngrok-skip-browser-warning': 'true',
        },
    });
};


export default api;
