import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const subtotal = getCartTotal();
    const shipping = subtotal > 50 ? 0 : 5.00;
    const total = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Looks like you haven't added any medicines yet.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
                    >
                        Start Shopping
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="font-semibold text-gray-800">Items ({cartItems.length})</h2>
                                <button
                                    onClick={clearCart}
                                    className="text-sm text-red-500 hover:text-red-700 transition"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6 flex gap-6">
                                        <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.category}</span>
                                                        <h3 className="font-bold text-gray-900 mt-1">{item.name}</h3>
                                                        <p className="text-sm text-gray-500">Sold by: {item.pharmacy}</p>
                                                    </div>
                                                    <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:bg-gray-50 transition text-gray-600"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-3 font-medium text-gray-900 text-sm w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:bg-gray-50 transition text-gray-600"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="font-bold text-gray-900 text-lg mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    {shipping === 0 ? (
                                        <span className="text-green-600 font-medium">Free</span>
                                    ) : (
                                        <span className="font-medium">${shipping.toFixed(2)}</span>
                                    )}
                                </div>
                                {shipping > 0 && (
                                    <p className="text-xs text-gray-500 italic">Free shipping on orders over $50</p>
                                )}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Link to="/checkout" className="block w-full text-center bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                Proceed to Checkout
                            </Link>

                            <div className="mt-6 text-center">
                                <Link to="/products" className="text-sm text-gray-500 hover:text-blue-600 font-medium">
                                    or Continue Shopping
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                            <p className="flex gap-2">
                                <span className="font-bold">Note:</span>
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
