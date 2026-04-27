import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { authLogin, authSendOtp, authVerifyOtp } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const OTP_TYPE = 'doctor_login';

const DoctorLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleEmailChange = (event) => {
        const nextEmail = event.target.value;
        setEmail(nextEmail);
        if (otpVerified && verifiedEmail && nextEmail.trim().toLowerCase() !== verifiedEmail.toLowerCase()) {
            setOtpVerified(false);
            setVerifiedEmail('');
        }
    };

    const submitCredentials = async (event) => {
        event.preventDefault();
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        setError('');

        if (otpVerified && verifiedEmail && verifiedEmail.toLowerCase() === email.trim().toLowerCase()) {
            setIsVerifyingOtp(true);
            try {
                const loginResponse = await authLogin({
                    email: email.trim(),
                    password,
                });
                const accessToken = loginResponse?.data?.accessToken;
                if (!accessToken) {
                    throw new Error('Missing access token in login response.');
                }
                login(accessToken, email.trim(), 'doctor');
                navigate('/doctor/prescriptions/new');
            } catch (err) {
                const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Login failed.';
                setError(message);
            } finally {
                setIsVerifyingOtp(false);
            }
            return;
        }

        setIsSendingOtp(true);
        try {
            await authSendOtp({
                email: email.trim(),
                type: OTP_TYPE,
            });
            setStep(2);
        } catch (err) {
            const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to send OTP. Please try again.';
            setError(message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const submitOtp = async (event) => {
        event.preventDefault();
        if (otp.trim().length !== 6) {
            setError('Enter a valid 6-digit OTP code.');
            return;
        }

        setError('');
        setIsVerifyingOtp(true);
        try {
            await authVerifyOtp({
                email: email.trim(),
                type: OTP_TYPE,
                otp: otp.trim(),
            });

            setOtpVerified(true);
            setVerifiedEmail(email.trim());

            const loginResponse = await authLogin({
                email: email.trim(),
                password,
            });
            const accessToken = loginResponse?.data?.accessToken;
            if (!accessToken) {
                throw new Error('Missing access token in login response.');
            }

            login(accessToken, email.trim(), 'doctor');
            navigate('/doctor/prescriptions/new');
        } catch (err) {
            const status = err?.response?.status;
            const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'OTP verification failed.';
            const normalized = message.toLowerCase();
            const isCredentialError = status === 401 || status === 403 || normalized.includes('invalid') || normalized.includes('credential');

            if (isCredentialError) {
                setError('Email or password is incorrect. Please enter your credentials again.');
                setStep(1);
                setOtp('');
                setPassword('');
            } else {
                setError(message);
            }
        } finally {
            setIsVerifyingOtp(false);
        }
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
                        <input type="email" value={email} onChange={handleEmailChange} placeholder="doctor@hospital.org" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <button
                            disabled={isSendingOtp}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {isSendingOtp ? 'Sending OTP...' : 'Continue to OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={submitOtp} className="space-y-4">
                        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <button
                            disabled={isVerifyingOtp}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {isVerifyingOtp ? 'Verifying...' : 'Verify and Sign In'}
                        </button>
                    </form>
                )}

                {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            </div>
        </div>
    );
};

export default DoctorLoginPage;
