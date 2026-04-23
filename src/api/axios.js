import axios from 'axios';

const HARDCODED_AUTH_TOKEN = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI4MzI4MDhhNi00OTQ5LTRlYzUtYWFmYS01OGYzM2JlN2I1MmUiLCJqdGkiOiIzZTNkOWUyOS1hYWU2LTQ0NzgtOTkyNy04OGQzNDZjNmE5MjUiLCJzaWQiOiJjMTZkYjFkZi05MjY5LTQ5OTYtOTZhYi1mNDE5MzZiMmFmNTkiLCJ0eXBlIjoiQUNDRVNTIiwiaWF0IjoxNzc1NzI1NTQ5LCJleHAiOjI2NzU3MjU1NDl9.DkT0f_qq7_5P1NN6ZGtesyVRDJAUEzp-6RvVOwGNukcaAY1_Tlhzme8eJaB4hH1D';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nonobediently-nonperishing-hilda.ngrok-free.dev/api';
const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Use this instance for paths that must include /api directly in the route string.
const apiRoot = axios.create({
    baseURL: API_ROOT_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a separate instance for form data if needed (e.g., file uploads)
export const apiFormData = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const apiFormDataRoot = axios.create({
    baseURL: API_ROOT_URL,
    withCredentials: true,
});

const attachAuthHeader = (config) => {
    config.headers = config.headers || {};
    const hasAuthorizationHeader = Boolean(config.headers?.Authorization || config.headers?.authorization);
    const token = localStorage.getItem('tenamed_access_token') || HARDCODED_AUTH_TOKEN;
    if (!hasAuthorizationHeader && token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers['ngrok-skip-browser-warning']) {
        config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    return config;
};

api.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error));
apiFormData.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error));
apiRoot.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error));
apiFormDataRoot.interceptors.request.use(attachAuthHeader, (error) => Promise.reject(error));

const buildHardcodedAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${HARDCODED_AUTH_TOKEN}`,
        'ngrok-skip-browser-warning': 'true',
    },
});

const withHardcodedAuthHeaders = (config = {}) => ({
    ...config,
    headers: {
        ...buildHardcodedAuthHeaders().headers,
        ...(config.headers || {}),
    },
});

const sanitizeParams = (params = {}) => {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => {
            if (value === undefined || value === null) {
                return false;
            }
            if (typeof value === 'string') {
                return value.trim() !== '';
            }
            return true;
        }),
    );
};

// Auth
export const authRegister = (payload) => api.post('/auth/register', payload, buildHardcodedAuthHeaders());
export const authRegisterHospitalOwner = (payload) => apiFormData.post('/auth/register-hospital-owner', payload, buildHardcodedAuthHeaders());
export const authRegisterPharmacy = (payload) => apiFormData.post('/auth/register-pharmacist', payload, buildHardcodedAuthHeaders());
export const authRegisterAthlete = (payload) => api.post('/auth/register-athlete', payload, buildHardcodedAuthHeaders());
export const authLogin = (payload) => api.post('/auth/login', payload, buildHardcodedAuthHeaders());
export const authRefresh = () => api.post('/auth/refresh', null, buildHardcodedAuthHeaders());
export const authLogout = () => api.post('/auth/logout', null, buildHardcodedAuthHeaders());
export const authLogoutAll = () => api.post('/auth/logout-all', null, buildHardcodedAuthHeaders());

// Identity
export const identityRegister = (payload) => api.post('/identity/register', payload, buildHardcodedAuthHeaders());
export const identityLogin = (payload) => api.post('/identity/login', payload, buildHardcodedAuthHeaders());

// Admin users
export const adminGetUser = (id) => api.get(`/admin/users/${id}`, buildHardcodedAuthHeaders());
export const adminGetUserRoles = (id) => api.get(`/admin/users/${id}/roles`, buildHardcodedAuthHeaders());
export const adminAddRoles = (id, payload) => api.post(`/admin/users/${id}/roles`, payload, buildHardcodedAuthHeaders());
export const adminRemoveRole = (id, roleName) => api.delete(`/admin/users/${id}/roles/${roleName}`, buildHardcodedAuthHeaders());
export const adminPopulateRoles = () => api.post('/admin/users/roles/populate', null, buildHardcodedAuthHeaders());

// Payments
export const paymentTest = () => api.get('/payments/test', buildHardcodedAuthHeaders());
export const paymentInitialize = (orderId = '6169471a-bb60-4887-b5c3-66fffeaa5d2e') => api.post(
    '/payments/initialize',
    {
        orderId,
    },
    buildHardcodedAuthHeaders(),
);
export const paymentCancel = (txRef) => api.put(`/payments/cancel/${txRef}`, null, buildHardcodedAuthHeaders());
export const paymentWebhookGet = (txRef) => api.get('/payments/webhook', withHardcodedAuthHeaders({ params: { tx_ref: txRef } }));
export const paymentWebhookPost = (payload) => api.post('/payments/webhook', payload, buildHardcodedAuthHeaders());


// Medicines
export const medicineCreate = (payload) => api.post('/medicines', payload, buildHardcodedAuthHeaders());
export const medicineGetAll = () => api.get('/medicines', buildHardcodedAuthHeaders());
export const medicineGetById = (id) => api.get(`/medicines/${id}`, buildHardcodedAuthHeaders());
export const medicineSearch = (params = {}) => api.get('/medicines/search', withHardcodedAuthHeaders({ params: sanitizeParams(params) }));
export const medicineUpdate = (id, payload) => api.put(`/medicines/${id}`, payload, buildHardcodedAuthHeaders());
export const medicineDelete = (id) => api.delete(`/medicines/${id}`, buildHardcodedAuthHeaders());
export const medicineAddAllergen = (medicineId, allergenId) => api.post(`/medicines/${medicineId}/allergens/${allergenId}`, null, buildHardcodedAuthHeaders());
export const medicineRemoveAllergen = (medicineId, allergenId) => api.delete(`/medicines/${medicineId}/allergens/${allergenId}`, buildHardcodedAuthHeaders());
export const medicineAddDopingRule = (medicineId, payload) => api.post(`/medicines/${medicineId}/doping-rules`, payload, buildHardcodedAuthHeaders());
export const medicineRemoveDopingRule = (medicineId, ruleId) => api.delete(`/medicines/${medicineId}/doping-rules/${ruleId}`, buildHardcodedAuthHeaders());

// Inventory
export const inventoryCreate = (payload) => api.post('/inventory', payload, buildHardcodedAuthHeaders());
export const inventoryAddBatch = (payload) => api.post('/inventory/batch', payload, buildHardcodedAuthHeaders());
export const inventoryGet = (params) => api.get('/inventory', withHardcodedAuthHeaders({ params }));
export const inventoryCheckAvailability = (params) => api.get('/inventory/check', withHardcodedAuthHeaders({ params }));
export const inventoryReserve = (payload) => api.post('/inventory/reserve', payload, buildHardcodedAuthHeaders());
export const inventoryConfirm = (payload) => api.post('/inventory/confirm', payload, buildHardcodedAuthHeaders());
export const inventoryRelease = (payload) => api.post('/inventory/release', payload, buildHardcodedAuthHeaders());

// Verification
export const verificationProcess = (id) => api.post(`/v1/verification/${id}/process`, null, buildHardcodedAuthHeaders());
export const verificationApprove = (id) => api.post(`/v1/verification/${id}/approve`, null, buildHardcodedAuthHeaders());
export const verificationReject = (id, reason) => api.post(`/v1/verification/${id}/reject`, null, withHardcodedAuthHeaders({ params: { reason } }));

// OCR
export const ocrTest = () => api.get('/ocr/upload', buildHardcodedAuthHeaders());
export const ocrUploadPrescription = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFormData.post('/ocr/upload', formData, buildHardcodedAuthHeaders());
};
export const ocrGetPipelineStatus = (prescriptionId) => api.get(`/ocr/pipeline/${prescriptionId}/status`, buildHardcodedAuthHeaders());

// Invitations
export const invitationGetByToken = (token) => api.get(`/invitations/${token}`, buildHardcodedAuthHeaders());

// Anti-doping
export const antiDopingCheck = (payload) => api.post('/anti-doping/check', payload, buildHardcodedAuthHeaders());

// Hospitals
export const hospitalCreate = (payload) => api.post('/hospitals/', payload, buildHardcodedAuthHeaders());
export const hospitalGetById = (id) => api.get(`/hospitals/${id}`, buildHardcodedAuthHeaders());
export const hospitalUpdate = (id, payload) => api.put(`/hospitals/${id}`, payload, buildHardcodedAuthHeaders());
export const hospitalVerify = (id) => api.patch(`/hospitals/${id}/verify`, null, buildHardcodedAuthHeaders());
export const hospitalGetDoctors = (id) => api.get(`/hospitals/${id}/doctors`, buildHardcodedAuthHeaders());
export const hospitalInviteDoctor = (id, payload) => api.post(`/hospitals/${id}/invite-doctor`, payload, buildHardcodedAuthHeaders());

// Doctors
export const doctorCreateFromInvite = (token, payload) => api.post('/doctors/create', payload, withHardcodedAuthHeaders({ params: { token } }));
export const doctorGetMe = () => api.get('/doctors/me', buildHardcodedAuthHeaders());
export const doctorGetById = (id) => api.get(`/doctors/${id}`, buildHardcodedAuthHeaders());
export const doctorVerify = (id) => api.patch(`/doctors/${id}/verify`, null, buildHardcodedAuthHeaders());

// Pharmacies and Staff
export const pharmacyCreate = (payload) => api.post('/pharmacies', payload, buildHardcodedAuthHeaders());
export const pharmacyGetById = (id) => api.get(`/pharmacies/${id}`, buildHardcodedAuthHeaders());
export const pharmacyVerify = (id) => api.post(`/pharmacies/${id}/verify`, null, buildHardcodedAuthHeaders());
export const pharmacyInvitePharmacist = (id, payload) => api.post(`/pharmacies/${id}/invite-pharmacist`, payload, buildHardcodedAuthHeaders());
export const pharmacyAddStaff = (id, payload) => api.post(`/pharmacies/${id}/staff`, payload, buildHardcodedAuthHeaders());
export const pharmacyListStaff = (id) => api.get(`/pharmacies/${id}/staff`, buildHardcodedAuthHeaders());
export const pharmacyVerifyStaff = (id, userId) => api.post(`/pharmacies/${id}/staff/${userId}/verify`, null, buildHardcodedAuthHeaders());
export const pharmacistCreateFromInvite = (token, payload) => api.post('/pharmacists/create', payload, withHardcodedAuthHeaders({ params: { token } }));

// Orders
export const orderCreate = (payload) => api.post('/orders', payload, buildHardcodedAuthHeaders());
export const orderAccept = (id) => api.post(`/orders/${id}/accept`, null, buildHardcodedAuthHeaders());
export const orderReject = (id, payload) => api.post(`/orders/${id}/reject`, payload, buildHardcodedAuthHeaders());
export const orderUpdatePaymentStatus = (id, payload) => api.post(`/orders/${id}/payment-status`, payload, buildHardcodedAuthHeaders());

// Prescription inventory matching
export const prescriptionGetInventoryMatches = (prescriptionId) => api.get(`/pharmacy/prescriptions/${prescriptionId}/inventory-matches`, buildHardcodedAuthHeaders());

// Patient profile
export const patientCreateProfile = (payload) => api.post('/patient/profile', payload, buildHardcodedAuthHeaders());
export const patientGetProfile = () => api.get('/patient/profile', buildHardcodedAuthHeaders());
export const patientUpdateProfile = (payload) => api.put('/patient/profile', payload, buildHardcodedAuthHeaders());
export const patientConvertTemporary = (patientId) => api.post(`/patient/convert/${patientId}`, null, buildHardcodedAuthHeaders());
export const patientCreateTemporary = (payload) => api.post('/patient/temporary', payload, buildHardcodedAuthHeaders());
export const patientDeleteTemporary = (patientId) => api.delete(`/patient/temporary/${patientId}`, buildHardcodedAuthHeaders());

// Patient allergies
export const patientAddAllergy = (payload) => api.post('/patient/allergies', payload, buildHardcodedAuthHeaders());
export const patientGetAllergies = () => api.get('/patient/allergies', buildHardcodedAuthHeaders());
export const patientUpdateAllergy = (id, payload) => api.put(`/patient/allergies/${id}`, payload, buildHardcodedAuthHeaders());
export const patientDeleteAllergy = (id) => api.delete(`/patient/allergies/${id}`, buildHardcodedAuthHeaders());

// Cart (explicit /api path strategy)
export const cartAddItem = (payload) => apiRoot.post('/api/cart/items', payload, buildHardcodedAuthHeaders());
///export const cartGet = () => apiRoot.get('/api/cart', buildHardcodedAuthHeaders());
export const cartUpdateItemQuantity = (itemId, payload) => apiRoot.put(`/api/cart/items/${itemId}`, payload, buildHardcodedAuthHeaders());
export const cartRemoveItem = (itemId) => apiRoot.delete(`/api/cart/items/${itemId}`, buildHardcodedAuthHeaders());
export const cartClear = () => apiRoot.delete('/api/cart/clear', buildHardcodedAuthHeaders());
export const cartCheckout = () => apiRoot.post('/api/cart/checkout', null, buildHardcodedAuthHeaders());

// Manual review (explicit /api path strategy)
export const manualReviewGetTasks = (status) => apiRoot.get('/api/pharmacist/tasks', withHardcodedAuthHeaders({ params: status ? { status } : {} }));
export const manualReviewGetMyTasks = () => apiRoot.get('/api/pharmacist/tasks/my', buildHardcodedAuthHeaders());
export const manualReviewClaimTask = (id) => apiRoot.post(`/api/pharmacist/tasks/${id}/claim`, null, buildHardcodedAuthHeaders());
export const manualReviewCompleteTask = (id, payload) => apiRoot.post(`/api/pharmacist/tasks/${id}/complete`, payload, buildHardcodedAuthHeaders());


export default api;
