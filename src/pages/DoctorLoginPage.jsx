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
        <div className="min-h-[calc(100vh-4.25rem)] flex items-center justify-center bg-transparent px-4 py-12 relative z-10 transition-colors">
            <div className="max-w-md w-full bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow)] p-8 space-y-6 backdrop-blur-xl">
                <div className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[rgba(var(--accent-rgb),0.1)] text-[var(--accent)] border border-[rgba(var(--accent-rgb),0.2)] flex items-center justify-center mb-5 shadow-[var(--glow)]">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold font-syne text-[var(--text)] tracking-tight">Doctor Secure Login</h1>
                    <p className="text-sm text-[var(--text2)] font-light mt-2">Strict authentication required before patient access.</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={submitCredentials} className="space-y-4">
                        <input type="email" value={email} onChange={handleEmailChange} placeholder="doctor@hospital.org" className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" required />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" required />
                        <button
                            disabled={isSendingOtp}
                            className={`btn-primary w-full py-3.5 text-base rounded-xl ${isSendingOtp ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSendingOtp ? 'Sending OTP...' : 'Continue to OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={submitOtp} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors tracking-widest text-center text-lg" required />
                        <button
                            disabled={isVerifyingOtp}
                            className={`btn-primary w-full py-3.5 text-base rounded-xl ${isVerifyingOtp ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isVerifyingOtp ? 'Verifying...' : 'Verify and Sign In'}
                        </button>
                    </form>
                )}

                {error && <div className="text-sm text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] rounded-lg px-4 py-3">{error}</div>}
            </div>
        </div>
    );
};

export default DoctorLoginPage;
