import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    return (
        <div className="min-h-[calc(100vh-4.25rem)] flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors">
            <div className="max-w-md w-full space-y-8 bg-[var(--surface)] p-10 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] backdrop-blur-xl">
                {status === 'success' ? (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-2">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h2 className="font-syne text-2xl font-bold text-[var(--text)] mb-2">Check your email</h2>
                        <p className="text-[var(--text2)] mb-8 font-light leading-relaxed">
                            We have sent a password reset link to <br/><span className="font-medium text-[var(--text)]">{email}</span>.
                        </p>
                        <Link to="/login" className="btn-ghost w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <h2 className="font-syne text-3xl md:text-3xl font-bold text-[var(--text)] tracking-tight">Reset Password</h2>
                            <p className="mt-2 text-sm text-[var(--text2)] font-light">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-[var(--text3)]" />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-[var(--bg)] border border-[var(--border2)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none text-[var(--text)] transition-colors sm:text-sm placeholder-[var(--text3)]"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className={`btn-primary w-full py-3.5 text-base rounded-xl ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>

                            <div className="flex items-center justify-center pt-2">
                                <Link to="/login" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-2 transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </Link>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
