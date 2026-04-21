/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    cartAddItem,
    cartClear,
    cartGet,
    cartRemoveItem,
    cartUpdateItemQuantity,
} from '../api/axios';

const CartContext = createContext();
const STORAGE_KEY = 'tenamed_cart';
const CART_META_KEY = 'tenamed_cart_meta';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=60';

const readJson = (key, fallbackValue) => {
    const raw = localStorage.getItem(key);
    if (!raw) {
        return fallbackValue;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return fallbackValue;
    }
};

const mapServerCartToUi = (serverCart, metadataByMedicineId = {}) => {
    const items = Array.isArray(serverCart?.items) ? serverCart.items : [];

    return items.map((item) => {
        const medicineId = item?.medicineId;
        const metadata = medicineId ? metadataByMedicineId[medicineId] : null;
        const unitPrice = Number(item?.unitPrice || 0);

        return {
            id: item?.id || medicineId,
            cartItemId: item?.id,
            medicineId,
            pharmacyId: item?.pharmacyId,
            quantity: Number(item?.quantity || 1),
            price: Number.isFinite(unitPrice) ? unitPrice : 0,
            name: metadata?.name || `Medicine ${String(medicineId || '').slice(0, 8)}`,
            category: metadata?.category || 'General',
            pharmacy: metadata?.pharmacy || 'TenaMED Partner Pharmacy',
            image: metadata?.image || FALLBACK_IMAGE,
            inStock: true,
        };
    });
};

const toMetadata = (product) => {
    const medicineId = product?.medicineId || product?.id;
    if (!medicineId) {
        return null;
    }

    return {
        medicineId,
        name: product?.name,
        category: product?.category,
        pharmacy: product?.pharmacy,
        image: product?.image,
    };
};

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        return readJson(STORAGE_KEY, []);
    });

    const [cartMetadata, setCartMetadata] = useState(() => readJson(CART_META_KEY, {}));

    const syncCartFromServer = useCallback(async () => {
        try {
            const response = await cartGet();
            const mapped = mapServerCartToUi(response?.data, cartMetadata);
            setCartItems(mapped);
        } catch {
            // Keep local cart data when backend cart is unavailable.
        }
    }, [cartMetadata]);

    useEffect(() => {
        syncCartFromServer();
    }, [syncCartFromServer]);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem(CART_META_KEY, JSON.stringify(cartMetadata));
    }, [cartMetadata]);

    const addToCart = (product, quantity = 1) => {
        const metadata = toMetadata(product);
        if (metadata) {
            setCartMetadata((prev) => ({ ...prev, [metadata.medicineId]: metadata }));
        }

        const medicineId = product?.medicineId || product?.id;

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id || item.medicineId === medicineId);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id || item.medicineId === medicineId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevItems, { ...product, medicineId, quantity }];
            }
        });

        const pharmacyId = product?.pharmacyId;

        if (medicineId && pharmacyId) {
            cartAddItem({
                medicineId,
                pharmacyId,
                quantity,
                prescriptionId: product?.prescriptionId,
            })
                .then((response) => {
                    const mapped = mapServerCartToUi(response?.data, {
                        ...cartMetadata,
                        ...(metadata ? { [metadata.medicineId]: metadata } : {}),
                    });
                    setCartItems(mapped);
                })
                .catch(() => {
                    // Keep local optimistic state if API call fails.
                });
        }
    };

    const removeFromCart = (productId) => {
        const existing = cartItems.find((item) => item.id === productId || item.cartItemId === productId);

        setCartItems(prevItems => prevItems.filter(item => item.id !== productId && item.cartItemId !== productId));

        if (existing?.cartItemId) {
            cartRemoveItem(existing.cartItemId)
                .then((response) => {
                    const mapped = mapServerCartToUi(response?.data, cartMetadata);
                    setCartItems(mapped);
                })
                .catch(() => {
                    // Keep local state when API fails.
                });
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        const existing = cartItems.find((item) => item.id === productId || item.cartItemId === productId);

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId || item.cartItemId === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );

        if (existing?.cartItemId) {
            cartUpdateItemQuantity(existing.cartItemId, { quantity: newQuantity })
                .then((response) => {
                    const mapped = mapServerCartToUi(response?.data, cartMetadata);
                    setCartItems(mapped);
                })
                .catch(() => {
                    // Keep optimistic state when API fails.
                });
        }
    };

    const clearCart = () => {
        setCartItems([]);

        cartClear().catch(() => {
            // Local clear is still respected when API fails.
        });
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
