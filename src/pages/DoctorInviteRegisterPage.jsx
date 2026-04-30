import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { doctorCreateFromInvite, invitationGetByToken } from '../api/axios';

const initialFormState = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    licenseNumber: '',
    specialization: '',
};

const DoctorInviteRegisterPage = () => {
    const navigate = useNavigate();
    const { token: tokenFromPath } = useParams();
    const [searchParams] = useSearchParams();

    const invitationToken = searchParams.get('token') || searchParams.get('invitationToken') || tokenFromPath || '';

    const [formData, setFormData] = useState(initialFormState);
    const [status, setStatus] = useState('idle');
    const [inviteStatus, setInviteStatus] = useState('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!invitationToken) {
            setInviteStatus('invalid');
            setErrorMsg('Doctor invitation token is missing in the URL.');
            return;
        }

        let isMounted = true;
        setInviteStatus('loading');
        setErrorMsg('');

        invitationGetByToken(invitationToken)
            .then((response) => {
                if (!isMounted) {
                    return;
                }

                const invitation = response?.data || {};
                const inviteRole = String(invitation.role || '').toUpperCase();
                const inviteState = String(invitation.status || '').toUpperCase();

                if (inviteRole !== 'DOCTOR') {
                    setInviteStatus('invalid');
                    setErrorMsg('This invitation is not for doctor onboarding.');
                    return;
                }

                if (inviteState !== 'PENDING') {
                    setInviteStatus('invalid');
                    setErrorMsg('This invitation is no longer valid.');
                    return;
                }

                setFormData((prev) => ({
                    ...prev,
                    email: invitation.email || prev.email,
                }));
                setInviteStatus('ready');
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }
                setInviteStatus('invalid');
                setErrorMsg('Invalid or expired doctor invitation link.');
            });

        return () => {
            isMounted = false;
        };
    }, [invitationToken]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMsg('');

        if (inviteStatus !== 'ready') {
            setErrorMsg('Invitation is not ready for registration.');
            return;
        }

        if (!formData.email.trim()) {
            setErrorMsg('Email is required.');
            return;
        }

        if (formData.password.length < 8) {
            setErrorMsg('Password must be at least 8 characters.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setErrorMsg('First name and last name are required.');
            return;
        }

        if (!formData.licenseNumber.trim()) {
            setErrorMsg('License number is required.');
            return;
        }

        setStatus('loading');
        try {
            await doctorCreateFromInvite(invitationToken, {
                user: {
                    email: formData.email.trim(),
                    password: formData.password,
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    phone: formData.phone.trim(),
                    address: {
                        additionalProp1: formData.addressLine1.trim(),
                    },
                },
                doctor: {
                    licenseNumber: formData.licenseNumber.trim(),
                    specialization: formData.specialization.trim(),
                },
            });

            navigate('/login?role=doctor');
        } catch (error) {
            const message = error?.response?.data?.message || error?.response?.data?.error || 'Doctor registration failed. Please try again.';
            setErrorMsg(message);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4.25rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors">
            <div className="nova-card max-w-2xl w-full p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-center">
                    <h2 className="font-syne text-3xl md:text-3xl font-bold text-[var(--text)] tracking-tight">Doctor Invitation Registration</h2>
                    <p className="mt-2 text-sm text-[var(--text2)] font-light">Complete your doctor account setup from invitation.</p>
                </div>

                <div className="rounded-xl border border-[rgba(var(--accent-rgb),0.3)] bg-[rgba(var(--accent-rgb),0.1)] px-4 py-3 text-sm text-[var(--accent)]">
                    Invitation mode: email is prefilled from your invitation token.
                </div>

                {inviteStatus === 'loading' && (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-500">
                        Validating invitation token...
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-[var(--accent)]" />
                                    </div>
                                    <input id="firstName" name="firstName" type="text" required className="block w-full pl-11 pr-3 py-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.firstName} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">Last Name</label>
                                <input id="lastName" name="lastName" type="text" required className="w-full p-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-[var(--accent)]" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    disabled
                                    className="block w-full pl-11 pr-3 py-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text2)] rounded-xl cursor-not-allowed opacity-70"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">Phone Number</label>
                            <input id="phone" name="phone" type="tel" className="w-full p-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.phone} onChange={handleChange} placeholder="+251 9..." />
                        </div>

                        <div>
                            <label htmlFor="addressLine1" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">Address</label>
                            <input id="addressLine1" name="addressLine1" type="text" className="w-full p-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.addressLine1} onChange={handleChange} placeholder="Street and building" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">License Number</label>
                                <input id="licenseNumber" name="licenseNumber" type="text" required className="w-full p-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.licenseNumber} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="specialization" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">Specialization</label>
                                <input id="specialization" name="specialization" type="text" className="w-full p-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.specialization} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[var(--accent)]" />
                                </div>
                                <input id="password" name="password" type="password" required minLength={8} className="block w-full pl-11 pr-3 py-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.password} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--text2)] mb-1.5">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className="w-full p-3.5 bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>

                    {errorMsg && <div className="rounded-xl border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] px-4 py-3 text-sm text-[var(--danger)]">{errorMsg}</div>}

                    <button
                        type="submit"
                        disabled={status === 'loading' || inviteStatus !== 'ready'}
                        className={`btn-primary w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 group ${status === 'loading' || inviteStatus !== 'ready' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {status === 'loading' ? 'Creating doctor account...' : 'Create Doctor Account'}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="text-center text-sm text-[var(--text2)]">
                    Already registered? <Link to="/login?role=doctor" className="font-semibold text-[var(--accent)] hover:underline">Sign in as Doctor</Link>
                </div>
            </div>
        </div>
    );
};

export default DoctorInviteRegisterPage;
