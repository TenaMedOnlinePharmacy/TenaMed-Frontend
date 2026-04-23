import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DoctorLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const submitCredentials = (event) => {
        event.preventDefault();
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        setError('');
        setStep(2);
    };

    const submitOtp = (event) => {
        event.preventDefault();
        if (otp.length < 4) {
            setError('Enter a valid OTP code.');
            return;
        }
        login('mock-doctor-token', email, 'doctor');
        navigate('/doctor/prescriptions/new');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Secure Login</h1>
                    <p className="text-sm text-gray-500 mt-1">Strict authentication required before patient access.</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={submitCredentials} className="space-y-4">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@hospital.org" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700">Continue to OTP</button>
                    </form>
                ) : (
                    <form onSubmit={submitOtp} className="space-y-4">
                        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="One-time passcode" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700">Verify and Sign In</button>
                    </form>
                )}

                {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            </div>
        </div>
    );
};

export default DoctorLoginPage;
