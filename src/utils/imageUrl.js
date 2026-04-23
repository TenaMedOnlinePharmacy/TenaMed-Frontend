const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_ORIGIN = API_BASE_URL ? API_BASE_URL.replace(/\/api\/?$/, '') : '';

const trimString = (value) => (typeof value === 'string' ? value.trim() : '');

const pickImageString = (value) => {
    if (typeof value === 'string') {
        return trimString(value);
    }

    if (value && typeof value === 'object') {
        const candidate =
            value.imageUrl ||
            value.url ||
            value.src ||
            value.path ||
            value.image ||
            value.data;
        return trimString(candidate);
    }

    return '';
};

export const resolveApiImageUrl = (value, fallbackUrl = '') => {
    const raw = pickImageString(value);
    if (!raw) {
        return fallbackUrl;
    }

    const isAbsolute = /^https?:\/\//i.test(raw) || /^data:/i.test(raw) || /^blob:/i.test(raw);
    if (isAbsolute) {
        return raw;
    }

    if (/^\/\//.test(raw)) {
        return `https:${raw}`;
    }

    if (API_ORIGIN) {
        const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
        return `${API_ORIGIN}${normalizedPath}`;
    }

    return fallbackUrl;
};
