import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import { cartCheckout, paymentInitialize, patientCheckMedicineSafety, patientGetProfiles } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { saveOrder } from '../data/orderStore';
import { shouldUseBuilderFallback } from '../config/devBuilderMode';

const PENDING_PAYMENT_KEY = 'tenamed_pending_payment';
const CART_META_KEY = 'tenamed_cart_meta';

const buildMetadataKey = (medicineName, pharmacyName) => {
    const medicine = String(medicineName || '').trim().toLowerCase();
    const pharmacy = String(pharmacyName || '').trim().toLowerCase();
    if (!medicine && !pharmacy) {
        return '';
    }
    return `${medicine}::${pharmacy}`;
};

const readCartMetadata = () => {
    try {
        const raw = localStorage.getItem(CART_META_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const resolveMedicineId = (item, cartMetadata) => {
    const directId = item?.productId || item?.medicineId;
    if (directId) {
        return directId;
    }

    const metadataKey = buildMetadataKey(item?.name || item?.medicineName, item?.pharmacy || item?.pharmacyName);
    const metadata =
        cartMetadata?.[item?.id] ||
        cartMetadata?.[item?.cartItemId] ||
        cartMetadata?.[metadataKey] ||
        null;

    return metadata?.productId || null;
};

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { userEmail } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [patientProfiles, setPatientProfiles] = useState([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [selectedProfileId, setSelectedProfileId] = useState('');
    const [safetyWarnings, setSafetyWarnings] = useState([]);
    const [safetyError, setSafetyError] = useState('');
    const [isCheckingSafety, setIsCheckingSafety] = useState(false);
    const [safetyApproved, setSafetyApproved] = useState(false);
    const [shippingData, setShippingData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        phone: '',
    });

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems.length, navigate]);

    useEffect(() => {
        if (userEmail && !shippingData.email) {
            setShippingData((prev) => ({ ...prev, email: userEmail }));
        }
    }, [userEmail, shippingData.email]);

    useEffect(() => {
        const fetchProfiles = async () => {
            setIsLoadingProfiles(true);
            setProfileError('');
            try {
                const response = await patientGetProfiles();
                const list = Array.isArray(response?.data) ? response.data : [];
                setPatientProfiles(list);
                if (!selectedProfileId && list.length > 0) {
                    setSelectedProfileId(String(list[0].id));
                }
            } catch (error) {
                console.error('Failed to load patient profiles:', error);
                setProfileError('Unable to load patient profiles.');
            } finally {
                setIsLoadingProfiles(false);
            }
        };

        fetchProfiles();
    }, []);

    useEffect(() => {
        setSafetyWarnings([]);
        setSafetyError('');
        setSafetyApproved(false);
    }, [selectedProfileId, cartItems]);

    if (cartItems.length === 0) {
        return null;
    }

    const subtotal = getCartTotal();
    const shipping = subtotal > 50 ? 0 : 5.00;
    const total = subtotal + shipping;

    const getSelectedProfile = () => {
        return patientProfiles.find((profile) => String(profile.id) === String(selectedProfileId)) || null;
    };

    const buildSafetyCheckItems = () => {
        const cartMetadata = readCartMetadata();

        return cartItems.map((item) => ({
            item,
            medicineId: resolveMedicineId(item, cartMetadata),
        }));
    };

    const runSafetyCheck = async () => {
        if (!selectedProfileId) {
            setSafetyError('Please select a patient profile before continuing.');
            return false;
        }

        const itemsToCheck = buildSafetyCheckItems();
        const missingIds = itemsToCheck.filter((entry) => !entry.medicineId);
        if (missingIds.length > 0) {
            const missingNames = missingIds.map((entry) => entry.item?.name || entry.item?.medicineName || 'Unknown item').join(', ');
            setSafetyError(
                missingIds.length === 1
                    ? `Unable to verify allergy safety for ${missingNames}. Please re-add this item to your cart.`
                    : `Unable to verify allergy safety for ${missingNames}. Please re-add the affected items to your cart.`,
            );
            return false;
        }

        setIsCheckingSafety(true);
        setSafetyError('');
        setSafetyWarnings([]);

        try {
            const results = await Promise.all(itemsToCheck.map(async ({ item, medicineId }) => {
                const response = await patientCheckMedicineSafety(selectedProfileId, medicineId);
                const matches = Array.isArray(response?.data) ? response.data : [];
                return { item, matches };
            }));

            const warnings = results.filter((result) => result.matches.length > 0);
            if (warnings.length > 0) {
                setSafetyWarnings(warnings);
                setSafetyApproved(false);
                setSafetyError('Potential allergens detected. Please review before continuing.');
                return false;
            }

            setSafetyApproved(true);
            return true;
        } catch (error) {
            console.error('Safety check failed:', error);
            setSafetyError('Safety check failed. Please try again.');
            return false;
        } finally {
            setIsCheckingSafety(false);
        }
    };

    const handleContinueToPayment = async (event) => {
        event.preventDefault();
        const safe = await runSafetyCheck();
        if (safe) {
            setStep(2);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!safetyApproved) {
            const safe = await runSafetyCheck();
            if (!safe) {
                setStep(1);
                return;
            }
        }

        if (paymentMethod === 'chapa') {
            setIsProcessing(true);

            try {
                const checkoutResponse = await cartCheckout();
                const checkoutData = checkoutResponse?.data || {};
                const firstOrderId = checkoutData?.orderId
                    || checkoutData?.orderIds?.[0]
                    || checkoutData?.data?.orderId
                    || checkoutData?.data?.orderIds?.[0];
                if (!firstOrderId) {
                    throw new Error('No order id returned from cart checkout');
                }

                const response = await paymentInitialize(firstOrderId);

                const checkoutUrl = response?.data?.checkout_url;
                if (!checkoutUrl || !/^https?:\/\//i.test(checkoutUrl)) {
                    const backendMessage = response?.data?.message || response?.data?.error || response?.data?.checkout_url;
                    throw new Error(backendMessage || 'Payment gateway did not return a valid checkout URL');
                }

                localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({
                    orderId: firstOrderId,
                    total,
                    createdAt: new Date().toISOString(),
                }));
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

                const message = error?.response?.data?.error
                    || error?.response?.data?.message
                    || error?.message
                    || 'Payment initialization failed. Please try again.';
                setErrorMsg(message);
            } finally {
                setIsProcessing(false);
            }

            return;
        }

        setIsProcessing(true);
        try {
            await cartCheckout();
            clearCart();
            navigate('/payment-success', { state: { total } });
        } catch (error) {
            if (shouldUseBuilderFallback(error)) {
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
            } else {
                const message = error?.response?.data?.error || error?.response?.data?.message || 'Checkout failed. Please try again.';
                setErrorMsg(message);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-transparent min-h-screen py-10">
            <div className="nova-main max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-[var(--text)] mb-8 text-center tracking-tight">Checkout</h1>

                {/* Progress Indicators */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 1 ? 'bg-[var(--accent)] text-white shadow-[var(--glow)]' : 'bg-[var(--surface3)] text-[var(--text3)]'}`}>1</div>
                        <div className={`w-20 h-1 mx-2 transition-colors ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--surface3)]'}`}></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 2 ? 'bg-[var(--accent)] text-white shadow-[var(--glow)]' : 'bg-[var(--surface3)] text-[var(--text3)]'}`}>2</div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                        {/* Form Section */}
                        <div className="flex-1 bg-[var(--surface)] p-8 rounded-xl shadow-lg border border-[var(--border)]">
                            {step === 1 ? (
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--text)] mb-6 flex items-center gap-2">
                                        <MapPin className="text-[var(--accent)]" /> Shipping Information
                                    </h2>
                                    <form
                                        className="space-y-4"
                                        onSubmit={handleContinueToPayment}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1">First Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] rounded-lg outline-none text-[var(--text)] focus:border-[var(--accent)] transition-colors"
                                                    placeholder="John"
                                                    value={shippingData.firstName}
                                                    onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] rounded-lg outline-none text-[var(--text)] focus:border-[var(--accent)] transition-colors"
                                                    placeholder="Doe"
                                                    value={shippingData.lastName}
                                                    onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text2)] mb-1">Address</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] rounded-lg outline-none text-[var(--text)] focus:border-[var(--accent)] transition-colors"
                                                placeholder="123 Bole Road"
                                                value={shippingData.address}
                                                onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] rounded-lg outline-none text-[var(--text)] focus:border-[var(--accent)] transition-colors"
                                                    placeholder="Addis Ababa"
                                                    value={shippingData.city}
                                                    onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] rounded-lg outline-none text-[var(--text)] focus:border-[var(--accent)] transition-colors"
                                                    placeholder="you@example.com"
                                                    value={shippingData.email}
                                                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] rounded-lg outline-none text-[var(--text)] focus:border-[var(--accent)] transition-colors"
                                                    placeholder="+251 9..."
                                                    value={shippingData.phone}
                                                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-[var(--border2)] space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base font-semibold text-[var(--text)]">Patient Profile</h3>
                                                    <p className="text-xs text-[var(--text3)]">Select the profile used for allergy safety checks.</p>
                                                </div>
                                                {patientProfiles.length === 0 && !isLoadingProfiles && (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/profile')}
                                                        className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                                                    >
                                                        Add Profile
                                                    </button>
                                                )}
                                            </div>
                                            {isLoadingProfiles ? (
                                                <p className="text-sm text-[var(--text3)]">Loading patient profiles...</p>
                                            ) : profileError ? (
                                                <p className="text-sm text-red-500">{profileError}</p>
                                            ) : patientProfiles.length === 0 ? (
                                                <div className="rounded-lg border border-[var(--border2)] bg-[var(--surface2)] p-4 text-sm text-[var(--text2)]">
                                                    No patient profiles found. Please add one before checkout.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <select
                                                        required
                                                        value={selectedProfileId}
                                                        onChange={(e) => setSelectedProfileId(e.target.value)}
                                                        className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] rounded-lg outline-none text-[var(--text)] focus:border-[var(--accent)] transition-colors"
                                                    >
                                                        {patientProfiles.map((profile) => (
                                                            <option key={profile.id} value={profile.id}>
                                                                {profile.name || 'Patient'} {profile.dateOfBirth ? `• ${profile.dateOfBirth}` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {getSelectedProfile()?.allergies?.length > 0 ? (
                                                        <div className="rounded-lg border border-[var(--border2)] bg-[var(--surface2)] px-4 py-3 text-xs text-[var(--text2)]">
                                                            Allergies: {getSelectedProfile().allergies.map((allergy) => allergy.allergenName).join(', ')}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-lg border border-[var(--border2)] bg-[var(--surface2)] px-4 py-3 text-xs text-[var(--text3)]">
                                                            No known allergies listed for this profile.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {safetyError && (
                                                <div className="rounded-lg border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] px-4 py-3 text-sm text-[var(--danger)]">
                                                    {safetyError}
                                                </div>
                                            )}
                                            {safetyWarnings.length > 0 && (
                                                <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 space-y-2">
                                                    {safetyWarnings.map((warning) => (
                                                        <div key={warning.item.id}>
                                                            <span className="font-semibold">{warning.item.name}:</span>{' '}
                                                            {warning.matches.map((match) => `${match.allergenName} (${match.severity || 'UNKNOWN'})`).join(', ')}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isCheckingSafety || isLoadingProfiles || patientProfiles.length === 0}
                                                className={`w-full py-3 rounded-lg flex items-center justify-center font-semibold transition-colors ${
                                                    isCheckingSafety || isLoadingProfiles || patientProfiles.length === 0
                                                        ? 'bg-[var(--surface3)] text-[var(--text3)] cursor-not-allowed'
                                                        : 'btn-primary'
                                                }`}
                                            >
                                                {isCheckingSafety ? 'Checking safety...' : 'Continue to Payment'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <button onClick={() => setStep(1)} className="text-[var(--text3)] hover:text-[var(--accent)] transition-colors">
                                            <ArrowLeft size={20} />
                                        </button>
                                        <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
                                            <CreditCard className="text-[var(--accent)]" /> Payment Details
                                        </h2>
                                    </div>

                                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                                        <div className="space-y-4">
                                            {/* We use a custom local scoped CSS for checked states or explicit styled */}
                                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.05)]' : 'border-[var(--border2)] bg-[var(--surface2)] hover:border-[var(--border)]'}`}>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="card"
                                                    checked={paymentMethod === 'card'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-4 h-4 text-[var(--accent)] border-[var(--border)] focus:ring-[var(--accent)]"
                                                />
                                                <div className="ml-4 flex-1 flex items-center justify-between">
                                                    <span className="font-semibold text-[var(--text)]">Credit / Debit Card</span>
                                                    <div className="flex gap-2">
                                                        <div className="w-8 h-5 bg-[var(--surface3)] rounded border border-[var(--border2)]"></div>
                                                        <div className="w-8 h-5 bg-[var(--surface3)] rounded border border-[var(--border2)]"></div>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'chapa' ? 'border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.05)]' : 'border-[var(--border2)] bg-[var(--surface2)] hover:border-[var(--border)]'}`}>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="chapa"
                                                    checked={paymentMethod === 'chapa'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-4 h-4 text-[var(--accent)] border-[var(--border)] focus:ring-[var(--accent)]"
                                                />
                                                <div className="ml-4 flex-1">
                                                    <span className="font-semibold text-[var(--text)]">Chapa</span>
                                                    <p className="text-xs text-[var(--text3)]">Pay securely with Telebirr, CBE Birr, and more.</p>
                                                </div>
                                            </label>

                                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.05)]' : 'border-[var(--border2)] bg-[var(--surface2)] hover:border-[var(--border)]'}`}>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="cash"
                                                    checked={paymentMethod === 'cash'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-4 h-4 text-[var(--accent)] border-[var(--border)] focus:ring-[var(--accent)]"
                                                />
                                                <div className="ml-4 flex-1">
                                                    <span className="font-semibold text-[var(--text)]">Cash on Delivery</span>
                                                    <p className="text-xs text-[var(--text3)]">Pay when your order arrives.</p>
                                                </div>
                                            </label>
                                        </div>

                                        {paymentMethod === 'card' && (
                                            <div className="p-4 bg-[var(--surface2)] rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 border border-[var(--border2)]">
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--text2)] mb-1">Card Number</label>
                                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md outline-none focus:border-[var(--accent)] text-[var(--text)]" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-[var(--text2)] mb-1">Expiry Date</label>
                                                        <input type="text" placeholder="MM/YY" className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md outline-none focus:border-[var(--accent)] text-[var(--text)]" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[var(--text2)] mb-1">CVC</label>
                                                        <input type="text" placeholder="123" className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md outline-none focus:border-[var(--accent)] text-[var(--text)]" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {errorMsg && (
                                            <div className="rounded-lg border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] px-4 py-3 text-sm text-[var(--danger)]">
                                                {errorMsg}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className={`w-full py-4 rounded-xl flex items-center justify-center font-bold transition-all shadow-[var(--glow)] mt-6 ${
                                                isProcessing
                                                    ? 'bg-[var(--surface3)] text-[var(--text3)] cursor-not-allowed'
                                                    : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
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
                            <div className="bg-[var(--surface)] p-6 rounded-xl shadow-lg border border-[var(--border)] sticky top-24">
                                <h3 className="font-bold text-[var(--text)] mb-4 pb-2 border-b border-[var(--border2)]">Your Order</h3>
                                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 custom-scrollbar pr-2">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex gap-3 items-center">
                                            <div className="w-12 h-12 bg-[var(--bg)] border border-[var(--border2)] rounded-lg flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1 filter drop-shadow-sm" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-[var(--text3)]">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-[var(--text)]">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-[var(--border2)] pt-4 space-y-3">
                                    <div className="flex justify-between text-sm text-[var(--text2)]">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-[var(--text)]">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-[var(--text2)]">
                                        <span>Shipping</span>
                                        <span className="font-medium text-[var(--text)]">${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-[var(--text)] pt-3 border-t border-[var(--border2)] text-lg">
                                        <span>Total</span>
                                        <span className="text-[var(--accent)]">${total.toFixed(2)}</span>
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
