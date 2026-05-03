import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const result = location.state || {};

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-rose-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Not Successful</h1>
                    <p className="text-gray-600 mb-6">
                        {result.message || 'Payment verification failed or was cancelled.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="bg-[var(--accent)] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/cart')}
                            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition"
                        >
                            Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailedPage;
