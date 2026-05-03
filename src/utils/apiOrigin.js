/** Same base resolution as `api/axios.js` so WS and HTTP hit the same host. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nonobediently-nonperishing-hilda.ngrok-free.dev/api';

export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * WebSocket URL for Spring-style broker at `/ws`.
 * Optional override: VITE_WS_URL (full ws:// or wss:// URL).
 */
export const getBackendWebSocketUrl = (path = '/ws') => {
    const explicit = import.meta.env.VITE_WS_URL;
    if (explicit && typeof explicit === 'string') {
        return explicit.trim();
    }

    const url = new URL(API_ROOT_URL);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = path.startsWith('/') ? path : `/${path}`;
    url.search = '';
    url.hash = '';
    return url.toString();
};
