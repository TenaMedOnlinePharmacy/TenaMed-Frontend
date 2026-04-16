export const SUPPORTED_ROLES = ['customer', 'pharmacy', 'hospital'];

const BUILDER_ROLE_FALLBACK = 'customer';

const getEnvFlag = (value) => String(value || '').toLowerCase() === 'true';

export const isDevRuntime = () => import.meta.env.DEV;

export const isDevBypassAuthEnabled = () => (
    isDevRuntime() && getEnvFlag(import.meta.env.VITE_DEV_BYPASS_AUTH)
);

export const isDevBypassAllowAllRoles = () => (
    isDevBypassAuthEnabled() && getEnvFlag(import.meta.env.VITE_DEV_BYPASS_ALLOW_ALL_ROLES)
);

export const getDevBypassRole = () => {
    const envRole = String(import.meta.env.VITE_DEV_BYPASS_ROLE || '').trim().toLowerCase();
    if (SUPPORTED_ROLES.includes(envRole)) {
        return envRole;
    }

    if (isDevBypassAuthEnabled() && envRole) {
        // Keep this warning in development to help catch typos in env role values.
        console.warn(`[builder-mode] Unsupported VITE_DEV_BYPASS_ROLE="${envRole}". Falling back to "${BUILDER_ROLE_FALLBACK}".`);
    }

    return BUILDER_ROLE_FALLBACK;
};

export const getDevBypassEmail = () => (
    import.meta.env.VITE_DEV_BUILDER_EMAIL || 'builder@tenamed.local'
);

export const isBuilderMode = () => isDevBypassAuthEnabled();

export const shouldUseBuilderFallback = (error) => {
    if (!isBuilderMode()) {
        return false;
    }

    const status = error?.response?.status;
    return !status || status === 401 || status === 403 || status >= 500;
};
