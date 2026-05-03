import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentWebhookGet } from '../api/axios';

const PENDING_PAYMENT_KEY = 'tenamed_pending_payment';

const PaymentCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        let isMounted = true;

        const finalize = async () => {
            const txRef = searchParams.get('tx_ref') || searchParams.get('trx_ref') || '';
            const providerStatus = (searchParams.get('status') || '').toLowerCase();
            const pendingPaymentRaw = localStorage.getItem(PENDING_PAYMENT_KEY) || '{}';
            const pendingPayment = (() => { try { return JSON.parse(pendingPaymentRaw); } catch { return {}; } })();

            if (!txRef) {
                if (isMounted) navigate('/payment-failed', { state: { status: 'failed', message: 'Missing payment reference from Chapa callback.' }, replace: true });
                return;
            }

            if (providerStatus && providerStatus !== 'success') {
                localStorage.removeItem(PENDING_PAYMENT_KEY);
                if (isMounted) navigate('/payment-failed', { state: { status: 'failed', message: `Payment status: ${providerStatus.toUpperCase()}` }, replace: true });
                return;
            }

            try {
                const response = await paymentWebhookGet(txRef);
                localStorage.removeItem(PENDING_PAYMENT_KEY);
                
                if (isMounted) {
                    const responseData = response?.data || {};
                    const normalizedStatus = String(responseData.status || '').toLowerCase();
                    
                    if (normalizedStatus === 'success') {
                        navigate('/payment-success', { 
                            state: { ...responseData, total: pendingPayment?.total },
                            replace: true 
                        });
                    } else {
                        navigate('/payment-failed', { 
                            state: { ...responseData },
                            replace: true 
                        });
                    }
                }
            } catch (error) {
                localStorage.removeItem(PENDING_PAYMENT_KEY);
                if (isMounted) {
                    navigate('/payment-failed', { 
                        state: {
                            status: 'failed',
                            message: error?.response?.data?.message || error?.response?.data?.error || 'Unable to verify payment result.'
                        },
                        replace: true 
                    });
                }
            }
        };

        finalize();
        return () => { isMounted = false; };
    }, [navigate, searchParams]);

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
                <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-700 font-medium">Finalizing your payment...</p>
            </div>
        </div>
    );
};

export default PaymentCallbackPage;
