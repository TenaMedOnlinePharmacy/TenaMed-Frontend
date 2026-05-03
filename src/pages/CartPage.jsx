import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cartItems, refreshCart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [checkoutWarning, setCheckoutWarning] = useState('');

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const subtotal = getCartTotal();
    const shipping = subtotal > 50 ? 0 : 5.00;
    const total = subtotal + shipping;
    const uniquePharmacies = useMemo(() => (
        [...new Set(
            cartItems
                .map((item) => String(item?.pharmacy || '').trim().toLowerCase())
                .filter(Boolean),
        )]
    ), [cartItems]);
    const hasMixedPharmacies = uniquePharmacies.length > 1;

    const handleProceedToCheckout = (event) => {
        event.preventDefault();
        if (hasMixedPharmacies) {
            setCheckoutWarning('Your cart has medicines from different pharmacies. Please keep only one pharmacy before checkout.');
            return;
        }
        setCheckoutWarning('');
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <div className="text-center nova-empty">
                    <div className="nova-empty-icon">🛒</div>
                    <h2 className="text-2xl font-bold text-[var(--text)] mb-2 mt-4">Your cart is empty</h2>
                    <p className="text-[var(--text2)] mb-8">Looks like you haven't added any medicines yet.</p>
                    <Link
                        to="/products"
                        className="btn-primary"
                    >
                        Start Shopping
                        <ArrowRight className="ml-2 w-5 h-5 flex-shrink-0" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-transparent min-h-screen py-10">
            <div className="nova-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-[var(--text)] mb-8 tracking-tight">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3">
                        <div className="bg-[var(--surface)] rounded-xl shadow-[var(--glow)] border border-[var(--border)] overflow-hidden">
                            <div className="p-6 border-b border-[var(--border2)] flex justify-between items-center bg-[var(--surface2)]">
                                <h2 className="font-semibold text-[var(--text)] text-lg tracking-tight">Items ({cartItems.length})</h2>
                                <button
                                    onClick={clearCart}
                                    className="text-sm text-[var(--danger)] hover:text-red-400 transition hover:underline"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="divide-y divide-[var(--border2)]">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6 flex gap-6 hover:bg-[var(--surface2)] transition-colors">
                                        <div className="w-24 h-24 bg-[var(--bg)] rounded-xl flex-shrink-0 border border-[var(--border)] p-2">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain filter drop-shadow-sm"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="nova-badge nova-badge-otc" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>{item.category}</span>
                                                        <h3 className="font-bold text-[var(--text)] mt-2">{item.name}</h3>
                                                        <p className="text-xs text-[var(--text3)] mt-1">Sold by: {item.pharmacy}</p>
                                                    </div>
                                                    <span className="font-bold text-[var(--text)] text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex items-center border border-[var(--border)] rounded-lg bg-[var(--surface3)] overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 px-3 text-[var(--text2)] hover:text-[var(--accent)] hover:bg-[var(--surface2)] transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-3 font-medium text-[var(--text)] text-sm w-10 text-center border-l border-r border-[var(--border)]">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 px-3 text-[var(--text2)] hover:text-[var(--accent)] hover:bg-[var(--surface2)] transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="nova-icon-btn"
                                                    style={{ color: 'var(--danger)', borderColor: 'rgba(var(--danger-rgb), 0.3)' }}
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-[var(--surface)] rounded-xl shadow-[var(--glow)] border border-[var(--border)] p-6 sticky top-24">
                            <h2 className="font-bold text-[var(--text)] text-xl mb-6 tracking-tight">Order Summary</h2>

                            <div className="space-y-4 mb-6 text-sm">
                                <div className="flex justify-between text-[var(--text2)]">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-[var(--text)]">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text2)]">
                                    <span>Shipping</span>
                                    {shipping === 0 ? (
                                        <span className="text-[var(--accent2)] font-medium">Free</span>
                                    ) : (
                                        <span className="font-medium text-[var(--text)]">${shipping.toFixed(2)}</span>
                                    )}
                                </div>
                                {shipping > 0 && (
                                    <p className="text-xs text-[var(--text3)] italic">Free shipping on orders over $50</p>
                                )}
                            </div>

                            <div className="border-t border-[var(--border2)] pt-6 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-[var(--text)]">Total</span>
                                    <span className="text-2xl font-bold text-[var(--accent)]">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button onClick={handleProceedToCheckout} className="btn-primary w-full text-center py-4 text-base block">
                                Proceed to Checkout
                            </button>
                            {checkoutWarning ? (
                                <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                                    {checkoutWarning}
                                </p>
                            ) : null}

                            <div className="mt-6 text-center">
                                <Link to="/products" className="text-sm text-[var(--text3)] hover:text-[var(--accent)] font-medium transition-colors">
                                    or Continue Shopping
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6 bg-[rgba(var(--accent2-rgb),0.05)] p-4 rounded-xl border border-[rgba(var(--accent2-rgb),0.3)] text-sm text-[var(--text)]">
                            <p className="flex gap-2 font-light">
                                <span className="font-semibold text-[var(--accent2)]">Note:</span>
                                Some medicines may require a valid prescription upload before checkout.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
