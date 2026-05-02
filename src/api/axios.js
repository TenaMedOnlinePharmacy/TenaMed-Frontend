import axios from 'axios';

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

const getStoredAccessToken = () => localStorage.getItem('tenamed_access_token') || '';

const attachAuthHeader = (config) => {
    config.headers = config.headers || {};
    const hasAuthorizationHeader = Boolean(config.headers?.Authorization || config.headers?.authorization);
    const token = getStoredAccessToken();
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

const buildAuthHeaders = () => ({
    headers: {
        'ngrok-skip-browser-warning': 'true',
        ...(getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : {}),
    },
});

const withAuthHeaders = (config = {}) => ({
    ...config,
    headers: {
        ...buildAuthHeaders().headers,
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
export const authRegister = (payload) => api.post('/auth/register', payload, buildAuthHeaders());
export const authRegisterHospitalOwner = (payload) => apiFormData.post('/auth/register-hospital-owner', payload, buildAuthHeaders());
export const authRegisterPharmacy = (payload) => apiFormData.post('/auth/register-pharmacist', payload, buildAuthHeaders());
export const authRegisterAthlete = (payload) => api.post('/auth/register-athlete', payload, buildAuthHeaders());
export const authLogin = (payload) => api.post('/auth/login', payload, buildAuthHeaders());
export const authRefresh = () => api.post('/auth/refresh', null, buildAuthHeaders());
export const authLogout = () => api.post('/auth/logout', null, buildAuthHeaders());
export const authLogoutAll = () => api.post('/auth/logout-all', null, buildAuthHeaders());
export const authSendOtp = (payload) => api.post('/auth/otp/send', payload, buildAuthHeaders());
export const authVerifyOtp = (payload) => api.post('/auth/otp/verify', payload, buildAuthHeaders());

// Identity
export const identityRegister = (payload) => api.post('/identity/register', payload, buildAuthHeaders());
export const identityLogin = (payload) => api.post('/identity/login', payload, buildAuthHeaders());

// Admin users
export const adminGetUser = (id) => api.get(`/admin/users/${id}`, buildAuthHeaders());
export const adminGetUserRoles = (id) => api.get(`/admin/users/${id}/roles`, buildAuthHeaders());
export const adminAddRoles = (id, payload) => api.post(`/admin/users/${id}/roles`, payload, buildAuthHeaders());
export const adminRemoveRole = (id, roleName) => api.delete(`/admin/users/${id}/roles/${roleName}`, buildAuthHeaders());
export const adminPopulateRoles = () => api.post('/admin/users/roles/populate', null, buildAuthHeaders());
export const adminGetDashboard = () => api.get('/admin/dashboard', buildAuthHeaders());
export const adminGetOcrStats = () => api.get('/admin/ocr/stats', buildAuthHeaders());
export const adminGetAuditLogs = (params = {}) => api.get('/admin/audit-logs', withAuthHeaders({ params: sanitizeParams(params) }));
export const adminGetPrescriptions = (params = {}) => api.get('/admin/prescriptions', withAuthHeaders({ params: sanitizeParams(params) }));
export const adminApprovePharmacy = (id) => api.post(`/admin/pharmacies/${id}/approve`, null, buildAuthHeaders());
export const adminRejectPharmacy = (id) => api.post(`/admin/pharmacies/${id}/reject`, null, buildAuthHeaders());
export const adminSuspendPharmacy = (id) => api.post(`/admin/pharmacies/${id}/suspend`, null, buildAuthHeaders());
export const adminUnsuspendPharmacy = (id) => api.post(`/admin/pharmacies/${id}/unsuspend`, null, buildAuthHeaders());
export const adminApproveHospital = (id) => api.post(`/admin/hospitals/${id}/approve`, null, buildAuthHeaders());
export const adminRejectHospital = (id) => api.post(`/admin/hospitals/${id}/reject`, null, buildAuthHeaders());
export const adminSuspendHospital = (id) => api.post(`/admin/hospitals/${id}/suspend`, null, buildAuthHeaders());
export const adminUnsuspendHospital = (id) => api.post(`/admin/hospitals/${id}/unsuspend`, null, buildAuthHeaders());

// Payments
export const paymentTest = () => api.get('/payments/test', buildAuthHeaders());
export const paymentInitialize = (orderId = '6169471a-bb60-4887-b5c3-66fffeaa5d2e') => api.post(
    '/payments/initialize',
    {
        orderId,
    },
    buildAuthHeaders(),
);
export const paymentCancel = (txRef) => api.put(`/payments/cancel/${txRef}`, null, buildAuthHeaders());
export const paymentWebhookGet = (txRef) => api.get('/payments/webhook', withAuthHeaders({ params: { tx_ref: txRef } }));
export const paymentWebhookPost = (payload) => api.post('/payments/webhook', payload, buildAuthHeaders());


// Medicines
export const medicineCreate = (payload) => api.post('/medicines', payload, buildAuthHeaders());
export const medicineGetAll = () => api.get('/medicines', buildAuthHeaders());
export const medicineGetById = (id) => api.get(`/medicines/${id}`, buildAuthHeaders());
export const medicineSearch = (params = {}) => api.get('/medicines/search', withAuthHeaders({ params: sanitizeParams(params) }));
export const medicineSearchByNameCategory = (keyword) => api.get(
    '/medicines/search/name-category',
    withAuthHeaders({ params: sanitizeParams({ keyword }) }),
);
export const medicineUpdate = (id, payload) => api.put(`/medicines/${id}`, payload, buildAuthHeaders());
export const medicineDelete = (id) => api.delete(`/medicines/${id}`, buildAuthHeaders());
export const medicineAddAllergen = (medicineId, allergenId) => api.post(`/medicines/${medicineId}/allergens/${allergenId}`, null, buildAuthHeaders());
export const medicineRemoveAllergen = (medicineId, allergenId) => api.delete(`/medicines/${medicineId}/allergens/${allergenId}`, buildAuthHeaders());
export const medicineAddDopingRule = (medicineId, payload) => api.post(`/medicines/${medicineId}/doping-rules`, payload, buildAuthHeaders());
export const medicineRemoveDopingRule = (medicineId, ruleId) => api.delete(`/medicines/${medicineId}/doping-rules/${ruleId}`, buildAuthHeaders());

// Inventory
export const inventoryCreate = (payload) => api.post('/inventory', payload, buildAuthHeaders());
export const inventoryAddBatch = (payload, file) => {
    const formData = new FormData();

    if (file) {
        formData.append('image', file);
    }

    formData.append(
        'batch',
        new Blob([JSON.stringify(payload)], {
            type: 'application/json',
        }),
    );

    return apiFormData.post('/inventory/batch', formData, buildAuthHeaders());
};
export const inventoryList = () => api.get('/inventory/list', buildAuthHeaders());
export const inventoryGetBatchForEdit = (batchId) => api.get(`/inventory/batch/${batchId}`, buildAuthHeaders());
export const inventoryEditBatch = (batchId, payload, file) => {
    const formData = new FormData();

    formData.append(
        'batch',
        new Blob([JSON.stringify(payload)], {
            type: 'application/json',
        }),
    );

    if (file) {
        formData.append('image', file);
    }

    return apiFormData.put(`/inventory/batch/edit/${batchId}`, formData, buildAuthHeaders());
};
export const inventoryDeleteBatch = (batchId) => api.delete(`/inventory/batch/delete/${batchId}`, buildAuthHeaders());
export const inventoryGet = (params) => api.get('/inventory', withAuthHeaders({ params }));
export const inventoryCheckAvailability = (params) => api.get('/inventory/check', withAuthHeaders({ params }));
export const inventoryReserve = (payload) => api.post('/inventory/reserve', payload, buildAuthHeaders());
export const inventoryConfirm = (payload) => api.post('/inventory/confirm', payload, buildAuthHeaders());
export const inventoryRelease = (payload) => api.post('/inventory/release', payload, buildAuthHeaders());

// Verification
export const verificationProcess = (id) => api.post(`/v1/verification/${id}/process`, null, buildAuthHeaders());
export const verificationApprove = (id) => api.post(`/v1/verification/${id}/approve`, null, buildAuthHeaders());
export const verificationReject = (id, reason) => api.post(`/v1/verification/${id}/reject`, null, withAuthHeaders({ params: { reason } }));

// OCR
export const ocrTest = () => api.get('/ocr/upload', buildAuthHeaders());
export const ocrUploadPrescription = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFormData.post('/ocr/upload', formData, buildAuthHeaders());
};
export const ocrGetPipelineStatus = (prescriptionId) => api.get(`/ocr/pipeline/${prescriptionId}/status`, buildAuthHeaders());

// Invitations
export const invitationGetByToken = (token) => api.get(`/invitations/${token}`, buildAuthHeaders());

// Anti-doping
export const antiDopingCheck = (payload) => api.post('/anti-doping/check', payload, buildAuthHeaders());
export const antiDopingAthleteProfileExists = () => api.get('/anti-doping/athlete-profile/exists', buildAuthHeaders());

// Hospitals
export const hospitalCreate = (payload) => api.post('/hospitals/', payload, buildAuthHeaders());
export const hospitalGetById = (id) => api.get(`/hospitals/${id}`, buildAuthHeaders());
export const hospitalUpdate = (id, payload) => api.put(`/hospitals/${id}`, payload, buildAuthHeaders());
export const hospitalVerify = (id) => api.patch(`/hospitals/${id}/verify`, null, buildAuthHeaders());
export const hospitalGetDoctors = (id) => api.get(`/hospitals/${id}/doctors`, buildAuthHeaders());
export const hospitalGetDoctorsManagement = () => api.get('/hospitals/doctors/management', buildAuthHeaders());
export const hospitalAcceptDoctor = (doctorId) => api.patch(`/hospitals/doctors/${doctorId}/accept`, null, buildAuthHeaders());
export const hospitalRejectDoctor = (doctorId) => api.patch(`/hospital/doctors/${doctorId}/reject`, null, buildAuthHeaders());
export const hospitalGetStatistics = () => api.get('/hospitals/statistics', buildAuthHeaders());
export const hospitalInviteDoctor = (idOrPayload, maybePayload) => {
    if (typeof idOrPayload === 'object' && idOrPayload !== null) {
        return api.post('/hospitals/invite-doctor', idOrPayload, buildAuthHeaders());
    }
    return api.post(`/hospitals/${idOrPayload}/invite-doctor`, maybePayload, buildAuthHeaders());
};

// Doctors
export const doctorCreateFromInvite = (token, payload) => api.post('/doctors/create', payload, withAuthHeaders({ params: { token } }));
export const doctorGetMe = () => api.get('/doctors/me', buildAuthHeaders());
export const doctorGetById = (id) => api.get(`/doctors/${id}`, buildAuthHeaders());
export const doctorVerify = (id) => api.patch(`/doctors/${id}/verify`, null, buildAuthHeaders());

// Pharmacies and Staff
export const pharmacyCreate = (payload) => api.post('/pharmacies', payload, buildAuthHeaders());
export const pharmacyGetById = (id) => api.get(`/pharmacies/${id}`, buildAuthHeaders());
export const pharmacyVerify = (id) => api.post(`/pharmacies/${id}/verify`, null, buildAuthHeaders());
export const pharmacyInvitePharmacist = (id, payload) => api.post(`/pharmacies/invite-pharmacist`, payload, buildAuthHeaders());
export const pharmacyAddStaff = (id, payload) => api.post(`/pharmacies/staff`, payload, buildAuthHeaders());
export const pharmacyListStaff = () => api.get('/pharmacies/staff', buildAuthHeaders());
export const pharmacyVerifyStaff = (id, userId) => api.post(`/pharmacies/staff/${userId}/verify`, null, buildAuthHeaders());
export const pharmacistCreateFromInvite = (token, payload) => api.post('/pharmacists/create', payload, withAuthHeaders({ params: { token } }));

// Orders
export const orderCreate = (payload) => api.post('/orders', payload, buildAuthHeaders());
export const orderAccept = (id) => api.post('/orders/accept', { orderId: id }, buildAuthHeaders());
export const orderReject = (id, payload = {}) => api.post('/orders/reject', { orderId: id, ...payload }, buildAuthHeaders());
export const orderUpdatePaymentStatus = (id, payload) => api.post(`/orders/${id}/payment-status`, payload, buildAuthHeaders());
export const pharmacyGetIncomingOrders = () => api.get('/orders/pharmacyOrders', buildAuthHeaders());

// Prescription inventory matching
export const prescriptionGetInventoryMatches = (prescriptionId) => api.get(`/pharmacy/prescriptions/${prescriptionId}/inventory-matches`, buildAuthHeaders());

// Prescriptions
export const doctorGetPrescriptions = () => api.get('/doctors/prescriptions', buildAuthHeaders());
export const doctorUpdatePrescription = (id, payload) => api.patch(`/doctors/prescriptions/${id}`, payload, buildAuthHeaders());
export const doctorDeletePrescription = (id) => api.delete(`/doctors/prescriptions/${id}`, buildAuthHeaders());
export const prescriptionGetHospitalIssued = (params = {}) => api.get(
    '/prescriptions/hospital-issued',
    withAuthHeaders({ params: sanitizeParams(params) }),
);

// Patient profile
export const patientCreateProfile = (payload) => api.post('/patient/profile', payload, buildAuthHeaders());
export const patientGetProfile = () => api.get('/patient/profile', buildAuthHeaders());
export const patientUpdateProfile = (payload) => api.put('/patient/profile', payload, buildAuthHeaders());
export const patientGenerateUniqueCode = () => api.post('/patient/generate-unique-code', null, buildAuthHeaders());
export const patientCreatePrescription = (payload) => api.post('/doctors/prescriptions', payload, buildAuthHeaders());
export const patientConvertTemporary = (patientId) => api.post(`/patient/convert/${patientId}`, null, buildAuthHeaders());
export const patientCreateTemporary = (payload) => api.post('/patient/temporary', payload, buildAuthHeaders());
export const patientDeleteTemporary = (patientId) => api.delete(`/patient/temporary/${patientId}`, buildAuthHeaders());

// Patient allergies
export const patientAddAllergy = (payload) => api.post('/patient/allergies', payload, buildAuthHeaders());
export const patientGetAllergies = () => api.get('/patient/allergies', buildAuthHeaders());
export const patientUpdateAllergy = (id, payload) => api.put(`/patient/allergies/${id}`, payload, buildAuthHeaders());
export const patientDeleteAllergy = (id) => api.delete(`/patient/allergies/${id}`, buildAuthHeaders());

// Cart (explicit /api path strategy)
export const cartAddItem = (payload) => apiRoot.post('/api/cart/items', payload, buildAuthHeaders());
export const cartGet = () => apiRoot.get('/api/cart', buildAuthHeaders());
export const cartUpdateItemQuantity = (itemId, payload) => apiRoot.put(`/api/cart/items/${itemId}`, payload, buildAuthHeaders());
export const cartRemoveItem = (itemId) => apiRoot.delete(`/api/cart/items/${itemId}`, buildAuthHeaders());
export const cartClear = () => apiRoot.delete('/api/cart/clear', buildAuthHeaders());
export const cartCheckout = () => apiRoot.post('/api/cart/checkout', null, buildAuthHeaders());

// Manual review (explicit /api path strategy)
export const manualReviewGetTasks = (status) => apiRoot.get('/api/pharmacist/tasks', withAuthHeaders({ params: status ? { status } : {} }));
export const manualReviewGetMyTasks = () => apiRoot.get('/api/pharmacist/tasks/my', buildAuthHeaders());
export const manualReviewClaimTask = (id) => apiRoot.post(`/api/pharmacist/tasks/${id}/claim`, null, buildAuthHeaders());
export const manualReviewCompleteTask = (id, payload) => apiRoot.post(`/api/pharmacist/tasks/${id}/complete`, payload, buildAuthHeaders());


export default api;

