const ROLE_PRIORITY = [
    'ADMIN',
    'ADMINPHARMACIST',
    'PHARMACYOWNER',
    'PHARMACY',
    'PHARMACIST',
    'HOSPITALOWNER',
    'HOSPITAL',
    'DOCTOR',
    'PATIENT',
    'CUSTOMER',
];

const FRONTEND_ROLE_MAP = {
    ADMIN: 'admin',
    ADMINPHARMACIST: 'ADMIN_PHARMACIST',
    PHARMACYOWNER: 'pharmacy',
    PHARMACY: 'pharmacy',
    PHARMACIST: 'pharmacist',
    HOSPITALOWNER: 'hospital',
    HOSPITAL: 'hospital',
    DOCTOR: 'doctor',
    PATIENT: 'customer',
    CUSTOMER: 'customer',
};

const normalizeRole = (role) => String(role || '')
    .trim()
    .replace(/^ROLE_/i, '')
    .replace(/[\s_-]/g, '')
    .toUpperCase();

export const resolveFrontendRoleFromClaims = (claimsRoles = [], fallbackRole = 'customer') => {
    if (!Array.isArray(claimsRoles) || claimsRoles.length === 0) {
        return fallbackRole;
    }

    const normalized = claimsRoles.map(normalizeRole).filter(Boolean);
    const bestMatch = ROLE_PRIORITY.find((role) => normalized.includes(role));
    if (bestMatch && FRONTEND_ROLE_MAP[bestMatch]) {
        return FRONTEND_ROLE_MAP[bestMatch];
    }

    return fallbackRole;
};

export const getAccessTokenFromLoginResponse = (responseData) => {
    return responseData?.accessToken
        || responseData?.token
        || responseData?.jwt
        || '';
};

const decodeJwtPayload = (token) => {
    if (!token || typeof token !== 'string') {
        return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
        return null;
    }

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
        const json = atob(padded);
        return JSON.parse(json);
    } catch {
        return null;
    }
};

export const getRolesFromAuthResponse = (responseData) => {
    if (Array.isArray(responseData?.roles) && responseData.roles.length > 0) {
        return responseData.roles;
    }

    const token = getAccessTokenFromLoginResponse(responseData);
    const tokenPayload = decodeJwtPayload(token);
    if (Array.isArray(tokenPayload?.roles)) {
        return tokenPayload.roles;
    }

    return [];
};

export const getDefaultRedirectByRole = (role) => {
    const redirectByRole = {
        customer: '/',
        pharmacy: '/pharmacist/dashboard',
        pharmacist: '/pharmacist/dashboard',
        ADMIN_PHARMACIST: '/pharmacist/manual-review/tasks',
        hospital: '/hospital/dashboard',
        doctor: '/doctor/prescriptions/new',
        admin: '/admin/dashboard',
    };
    return redirectByRole[role] || '/';
};

