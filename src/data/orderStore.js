import { mockOrders } from './mockOrders';

const STORAGE_KEY = 'tenamed_orders';

const parseStoredOrders = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const getOrders = () => {
    const stored = parseStoredOrders();
    return [...stored, ...mockOrders];
};

export const saveOrder = (order) => {
    const current = parseStoredOrders();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...current]));
};
