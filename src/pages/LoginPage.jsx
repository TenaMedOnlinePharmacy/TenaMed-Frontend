import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, Shield, User } from 'lucide-react';
import { authLogin } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getDevBypassRole, isBuilderMode, SUPPORTED_ROLES } from '../config/devBuilderMode';

const roles = SUPPORTED_ROLES;

const redirectByRole = {
    customer: '/',
    pharmacy: '/pharmacist/dashboard',
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

            login(accessToken, formData.email, activeRole);
            navigate(redirectByRole[activeRole] || '/');
        } catch (error) {
            if (builderModeEnabled) {
                login(`mock-${activeRole}-token`, formData.email, activeRole);
                navigate(redirectByRole[activeRole] || '/');
                return;
            }

            const message = error?.response?.data?.message || 'Login failed. Please check your credentials.';
            setErrorMsg(message);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        {role === 'admin' || role === 'doctor' ? <Shield className="h-6 w-6 text-blue-600" /> : <User className="h-6 w-6 text-blue-600" />}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign in to your {roleTitle} account</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 bg-gray-100 p-1 rounded-lg gap-1">
                    {roles.map((entry) => (
                        <button
                            key={entry}
                            type="button"
                            disabled={builderModeEnabled}
                            onClick={() => setRole(entry)}
                            className={`py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 capitalize ${role === entry ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${builderModeEnabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {entry}
                        </button>
                    ))}
                </div>

                {builderModeEnabled && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                        Builder mode is enabled. Role is locked to <span className="font-semibold capitalize">{builderRole}</span> from VITE_DEV_BYPASS_ROLE.
                    </p>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {errorMsg && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all shadow-md hover:shadow-lg ${status === 'loading' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {status === 'loading' ? 'Signing in...' : `Sign in as ${roleTitle}`}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Do not have an account?{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
