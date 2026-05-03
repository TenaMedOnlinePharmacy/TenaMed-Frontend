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

const buildMetadataKey = (medicineName, pharmacyName) => {
    const medicine = String(medicineName || '').trim().toLowerCase();
    const pharmacy = String(pharmacyName || '').trim().toLowerCase();
    if (!medicine && !pharmacy) {
        return '';
    }
    return `${medicine}::${pharmacy}`;
};

const mapServerCartToUi = (serverCart, metadataByProductId = {}) => {
    const items = Array.isArray(serverCart?.items) ? serverCart.items : [];

    return items.map((item) => {
        const productId = item?.productId || null;
        const serverName = item?.brandName || item?.medicineName || '';
        const metadataById = productId ? metadataByProductId[productId] : null;
        const metadataByName = metadataByProductId[buildMetadataKey(serverName, item?.pharmacyName)] || null;
        const metadata = metadataById || metadataByName;
        const unitPrice = Number(item?.unitPrice || 0);
        const totalPrice = Number(item?.totalPrice || 0);
        const quantity = Number(item?.quantity || 1);
        const hasUnitPrice = Number.isFinite(unitPrice);
        const hasTotalPrice = Number.isFinite(totalPrice) && quantity > 0;
        const effectiveUnitPrice = hasUnitPrice ? unitPrice : (hasTotalPrice ? totalPrice / quantity : 0);

        return {
            id: item?.id || productId || serverName,
            cartItemId: item?.id,
            productId,
            pharmacyId: item?.pharmacyId,
            prescriptionId: item?.prescriptionId || null,
            quantity,
            price: effectiveUnitPrice,
            name: serverName || metadata?.name || 'Medicine',
            category: metadata?.category || 'General',
            pharmacy: item?.pharmacyName || metadata?.pharmacy || 'TenaMED Partner Pharmacy',
            image: metadata?.image || FALLBACK_IMAGE,
            inStock: true,
        };
    });
};

const toMetadata = (product) => {
    const productId = product?.productId || product?.medicineId || null;
    const medicineName = product?.name || product?.medicineName || '';
    const pharmacyName = product?.pharmacy || product?.pharmacyName || '';
    const metadataKey = buildMetadataKey(medicineName, pharmacyName);

    if (!productId && !metadataKey) {
        return null;
    }

    return {
        key: metadataKey,
        productId,
        name: medicineName,
        category: product?.category,
        pharmacy: pharmacyName,
        image: product?.image,
    };
};

const buildCartAddPayload = (product, quantity) => ({
    productId: product?.productId || product?.medicineId,
    pharmacyName: product?.pharmacyName || product?.pharmacy || '',
    quantity: Number(quantity) > 0 ? Number(quantity) : 1,
    prescriptionId: product?.prescriptionId || product?.prescription?.id || null,
});

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

    const addToCart = async (product, quantity = 1) => {
        const metadata = toMetadata(product);
        if (metadata) {
            setCartMetadata((prev) => ({
                ...prev,
                ...(metadata.productId ? { [metadata.productId]: metadata } : {}),
                ...(metadata.key ? { [metadata.key]: metadata } : {}),
            }));
        }

        if (!product?.productId && !product?.medicineId) {
            throw new Error('Missing product identifier');
        }

        try {
            const response = await cartAddItem(buildCartAddPayload(product, quantity));
            const mapped = mapServerCartToUi(response?.data, {
                ...cartMetadata,
                ...(metadata?.productId ? { [metadata.productId]: metadata } : {}),
            });
            setCartItems(mapped);
            return response;
        } catch (error) {
            throw error;
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
            refreshCart: syncCartFromServer,
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
