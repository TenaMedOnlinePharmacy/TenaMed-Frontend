import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, Shield, User } from 'lucide-react';
import { antiDopingAthleteProfileExists, authLogin, pharmacyListStaff } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getDevBypassRole, isBuilderMode, SUPPORTED_ROLES } from '../config/devBuilderMode';

const roles = SUPPORTED_ROLES;
const ATHLETE_FLAG_KEY = 'tenamed_is_athlete';

const redirectByRole = {
    customer: '/',
    pharmacy: '/pharmacist/dashboard',
    pharmacist: '/pharmacist/dashboard',
    hospital: '/hospital/dashboard',
};

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role');
    const builderModeEnabled = isBuilderMode();
    const builderRole = getDevBypassRole();
    const defaultRole = builderModeEnabled ? builderRole : (roles.includes(initialRole) ? initialRole : 'customer');

    const { login } = useAuth();
    const [role, setRole] = useState(defaultRole);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const roleTitle = useMemo(() => role.charAt(0).toUpperCase() + role.slice(1), [role]);

    const handleChange = (event) => {
        setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        const activeRole = builderModeEnabled ? builderRole : role;

        try {
            const response = await authLogin({
                email: formData.email,
                password: formData.password,
            });

            const accessToken = response?.data?.accessToken;
            if (!accessToken) {
                throw new Error('Missing access token in login response.');
            }

            // Temporarily persist token so role validation calls use the same auth context.
            localStorage.setItem('tenamed_access_token', accessToken);

            if (activeRole === 'pharmacy') {
                try {
                    await pharmacyListStaff();
                } catch {
                    localStorage.removeItem('tenamed_access_token');
                    throw new Error('This account is not authorized as a pharmacy owner. Use pharmacist login instead.');
                }
            }

            if (activeRole === 'customer') {
                let isAthlete = false;
                try {
                    const athleteProfileResponse = await antiDopingAthleteProfileExists();
                    const responseData = athleteProfileResponse?.data;
                    if (typeof responseData === 'boolean') {
                        isAthlete = responseData;
                    } else if (typeof responseData?.exists === 'boolean') {
                        isAthlete = responseData.exists;
                    } else if (typeof responseData?.isAthlete === 'boolean') {
                        isAthlete = responseData.isAthlete;
                    }
                } catch {
                    isAthlete = false;
                }
                localStorage.setItem(ATHLETE_FLAG_KEY, String(isAthlete));
            } else {
                localStorage.removeItem(ATHLETE_FLAG_KEY);
            }

            login(accessToken, formData.email, activeRole, activeRole === 'customer' ? localStorage.getItem(ATHLETE_FLAG_KEY) === 'true' : false);
            navigate(redirectByRole[activeRole] || '/');
        } catch (error) {
            if (builderModeEnabled) {
                login(`mock-${activeRole}-token`, formData.email, activeRole);
                navigate(redirectByRole[activeRole] || '/');
                return;
            }

            const message = error?.message || error?.response?.data?.message || 'Something went wrong. Please try again later.';
            setErrorMsg(message);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4.25rem)] flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors">
            <div className="max-w-2xl w-full space-y-8 bg-[var(--surface)] p-10 rounded-2xl border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-xl">
                <div className="text-center">
                    <div className="mx-auto h-14 w-14 bg-[rgba(var(--accent-rgb),0.1)] border border-[rgba(var(--accent-rgb),0.2)] rounded-2xl flex items-center justify-center mb-6 shadow-[var(--glow)]">
                        {role === 'admin' || role === 'doctor' ? <Shield className="h-6 w-6 text-[var(--accent)]" /> : <User className="h-6 w-6 text-[var(--accent)]" />}
                    </div>
                    <h2 className="font-syne text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-[var(--text2)] font-light text-sm">Sign in to your <span className="font-medium text-[var(--text)]">{roleTitle}</span> account</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 bg-[var(--bg2)] p-1 rounded-xl gap-1 border border-[var(--border2)]">
                    {roles.map((entry) => (
                        <button
                            key={entry}
                            type="button"
                            disabled={builderModeEnabled}
                            onClick={() => setRole(entry)}
                            className={`py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 capitalize font-mono tracking-tight ${role === entry ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm border border-[var(--border)]' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'} ${builderModeEnabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {entry}
                        </button>
                    ))}
                </div>

                {builderModeEnabled && (
                    <p className="text-xs text-amber-500 bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)] rounded-md px-3 py-2 font-mono">
                        Builder mode is enabled. Role is locked to <span className="font-semibold capitalize text-[var(--accent)]">{builderRole}</span> from VITE_DEV_BYPASS_ROLE.
                    </p>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-[var(--text3)]" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 bg-[var(--bg)] border border-[var(--border2)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none text-[var(--text)] transition-colors sm:text-sm placeholder-[var(--text3)]"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-[var(--text2)]">Password</label>
                                <Link to="/forgot-password" className="text-sm text-[var(--accent)] hover:text-[var(--accent2)] font-medium transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[var(--text3)]" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 bg-[var(--bg)] border border-[var(--border2)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none text-[var(--text)] transition-colors sm:text-sm placeholder-[var(--text3)]"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {errorMsg && <div className="rounded-lg border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] px-4 py-3 text-sm text-[var(--danger)] font-medium">{errorMsg}</div>}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className={`btn-primary w-full py-3.5 text-base rounded-xl ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {status === 'loading' ? 'Signing in...' : `Sign in as ${roleTitle}`}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform flex-shrink-0" />
                    </button>
                </form>

                <div className="text-center border-t border-[var(--border2)] pt-6">
                    <p className="text-sm text-[var(--text3)]">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
