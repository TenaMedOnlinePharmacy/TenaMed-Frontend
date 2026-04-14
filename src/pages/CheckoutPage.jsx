import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import { paymentInitialize } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { saveOrder } from '../data/orderStore';
import { shouldUseBuilderFallback } from '../config/devBuilderMode';

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { userEmail } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [shippingData, setShippingData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        phone: '',
    });

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    const subtotal = getCartTotal();
    const shipping = subtotal > 50 ? 0 : 5.00;
    const total = subtotal + shipping;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (paymentMethod === 'chapa') {
            setIsProcessing(true);

            try {
                const response = await paymentInitialize();

                const checkoutUrl = response?.data?.checkout_url;
                if (!checkoutUrl) {
                    throw new Error('Missing checkout URL');
                }

                window.location.href = checkoutUrl;
                return;
            } catch (error) {
                if (shouldUseBuilderFallback(error)) {
                    saveOrder({
                        id: `ORD-BLD-${Math.floor(Math.random() * 90000 + 10000)}`,
                        customer: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
                        date: new Date().toISOString().slice(0, 10),
                        total,
                        status: 'Pending',
                        items: cartItems.map((item) => ({
                            name: item.name,
                            quantity: item.quantity,
                        })),
                    });
                    clearCart();
                    navigate('/payment-success', { state: { total } });
                    return;
                }

                const message = error?.response?.data?.message || 'Payment initialization failed. Please try again.';
                setErrorMsg(message);
            } finally {
                setIsProcessing(false);
            }

            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            saveOrder({
                id: `ORD-${Math.floor(Math.random() * 90000 + 10000)}`,
                customer: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
                date: new Date().toISOString().slice(0, 10),
                total,
                status: 'Pending',
                items: cartItems.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                })),
            });
            clearCart();
            navigate('/payment-success', { state: { total } });
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>

                {/* Progress Indicators */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`w-20 h-1 bg-gray-200 mx-2 ${step >= 2 ? 'bg-blue-600' : ''}`}></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                        {/* Form Section */}
                        <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            {step === 1 ? (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <MapPin className="text-blue-600" /> Shipping Information
                                    </h2>
                                    <form
                                        className="space-y-4"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            setStep(2);
                                        }}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="John"
                                                    value={shippingData.firstName}
                                                    onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Doe"
                                                    value={shippingData.lastName}
                                                    onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="123 Bole Road"
                                                value={shippingData.address}
                                                onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Addis Ababa"
                                                    value={shippingData.city}
                                                    onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="you@example.com"
                                                    value={shippingData.email}
                                                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="+251 9..."
                                                    value={shippingData.phone}
                                                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                                                Continue to Payment
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 transition">
                                            <ArrowLeft size={20} />
                                        </button>
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <CreditCard className="text-blue-600" /> Payment Details
                                        </h2>
                                    </div>

                                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="flex items-center p-4 border rounded-xl cursor-pointer transition hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="card"
                                                    checked={paymentMethod === 'card'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="ml-4 flex-1 flex items-center justify-between">
                                                    <span className="font-semibold text-gray-900">Credit / Debit Card</span>
                                                    <div className="flex gap-2">
                                                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className="flex items-center p-4 border rounded-xl cursor-pointer transition hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="chapa"
                                                    checked={paymentMethod === 'chapa'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="ml-4 flex-1">
                                                    <span className="font-semibold text-gray-900">Chapa</span>
                                                    <p className="text-xs text-gray-500">Pay securely with Telebirr, CBE Birr, and more.</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center p-4 border rounded-xl cursor-pointer transition hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="cash"
                                                    checked={paymentMethod === 'cash'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="ml-4 flex-1">
                                                    <span className="font-semibold text-gray-900">Cash on Delivery</span>
                                                    <p className="text-xs text-gray-500">Pay when your order arrives.</p>
                                                </div>
                                            </label>
                                        </div>

                                        {paymentMethod === 'card' && (
                                            <div className="p-4 bg-gray-50 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-2 border border-gray-300 rounded outline-none" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                                        <input type="text" placeholder="MM/YY" className="w-full p-2 border border-gray-300 rounded outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                                        <input type="text" placeholder="123" className="w-full p-2 border border-gray-300 rounded outline-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {errorMsg && (
                                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                                {errorMsg}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className={`w-full py-4 rounded-xl font-bold transition shadow-lg mt-6 ${
                                                isProcessing
                                                    ? 'bg-blue-400 text-white cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                            }`}
                                        >
                                            {isProcessing ? 'Processing...' : `Place Order ($${total.toFixed(2)})`}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:w-80">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                                <h3 className="font-bold text-gray-900 mb-4">Your Order</h3>
                                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 custom-scrollbar">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-100 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-900 pt-2 text-lg">
                                        <span>Total</span>
                                        <span className="text-blue-600">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
