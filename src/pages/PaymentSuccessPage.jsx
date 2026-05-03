import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const result = location.state || {};
    const total = result.total;

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">
                        {result.message || `Your payment has been completed successfully${typeof total === 'number' ? ` for ETB ${total.toFixed(2)}` : ''}. We are now processing your order.`}
                    </p>
                    
                    {(result.orderId || result.paymentId) && (
                        <div className="mb-6 rounded-lg bg-green-50 border border-green-100 p-4 text-left text-sm text-green-800">
                            <p><span className="font-semibold">Order ID:</span> {result.orderId || '-'}</p>
                            <p><span className="font-semibold">Transaction Ref:</span> {result.txRef || '-'}</p>
                            <p><span className="font-semibold">Payment ID:</span> {result.paymentId || '-'}</p>
                            <p><span className="font-semibold">Order Status:</span> {result.orderStatus || '-'}</p>
                            <p><span className="font-semibold">Payment Status:</span> {result.orderPaymentStatus || '-'}</p>
                        </div>
                    )}
                    
                    <button
                        onClick={() => navigate('/')}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
