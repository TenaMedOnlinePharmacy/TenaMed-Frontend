import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, FileText, Lock, Mail, Upload, User } from 'lucide-react';
import {
    authRegister,
    authRegisterAthlete,
    authRegisterHospitalOwner,
    authRegisterPharmacy,
    invitationGetByToken,
    pharmacistCreateFromInvite,
} from '../api/axios';

const roles = ['customer', 'pharmacy', 'hospital'];

const roleNamesByRole = {
    customer: ['PATIENT'],
    hospital: ['HOSPITAL_OWNER'],
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const { token: tokenFromPath } = useParams();
    const [searchParams] = useSearchParams();
    const invitationToken = searchParams.get('token') || searchParams.get('invitationToken') || tokenFromPath || '';
    const isInviteFlow = Boolean(invitationToken);

    const [role, setRole] = useState(isInviteFlow ? 'pharmacist' : 'customer');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        pharmacistAddressLine1: '',
        city: '',
        region: '',
        hospitalName: '',
        hospitalLicenseNumber: '',
        pharmacyName: '',
        pharmacyLegalName: '',
        pharmacyLicenseNumber: '',
        pharmacyEmail: '',
        pharmacyPhone: '',
        pharmacyWebsite: '',
        pharmacyAddressLine1: '',
        pharmacyCity: '',
        pharmacyRegion: '',
        pharmacyType: '',
        pharmacyOperatingHours: '',
        pharmacyIs24Hours: false,
        pharmacyHasDelivery: false,
        isAthlete: false,
        inviteLicenseNumber: '',
        inviteLicenseExpiry: '',
        inviteCanVerifyPrescriptions: false,
        inviteCanManageInventory: false,
        legalFile: null,
    });
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [inviteStatus, setInviteStatus] = useState(isInviteFlow ? 'loading' : 'idle');

    useEffect(() => {
        if (!isInviteFlow) {
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

                if (inviteRole !== 'PHARMACIST') {
                    setInviteStatus('invalid');
                    setErrorMsg('This invitation is not for pharmacist onboarding.');
                    return;
                }

                if (inviteState !== 'PENDING') {
                    setInviteStatus('invalid');
                    setErrorMsg('This invitation is no longer valid.');
                    return;
                }

                setRole('pharmacist');
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
                setErrorMsg('Invalid or expired invitation link.');
            });

        return () => {
            isMounted = false;
        };
    }, [invitationToken, isInviteFlow]);

    const roleTitle = useMemo(() => role.charAt(0).toUpperCase() + role.slice(1), [role]);
    const requiresLegalFile = role === 'pharmacy' || role === 'hospital';

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (event) => {
        setFormData((prev) => ({ ...prev, legalFile: event.target.files?.[0] || null }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMsg('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Passwords do not match.');
            setStatus('error');
            return;
        }

        if (!isInviteFlow && requiresLegalFile && !formData.legalFile) {
            setErrorMsg('Please upload required legal credentials for this role.');
            setStatus('error');
            return;
        }

        if ((role === 'hospital' || role === 'pharmacy' || role === 'pharmacist') && !formData.phone.trim()) {
            setErrorMsg('Phone number is required for this role.');
            setStatus('error');
            return;
        }
        if (role === 'customer' && formData.isAthlete && !formData.phone.trim()) {
            setErrorMsg('Phone number is required for athlete registration.');
            setStatus('error');
            return;
        }

        if (role === 'hospital' && !formData.hospitalLicenseNumber.trim()) {
            setErrorMsg('Hospital license number is required.');
            setStatus('error');
            return;
        }

        if (role === 'pharmacy') {
            if (!formData.pharmacyName.trim() || !formData.pharmacyLegalName.trim()) {
                setErrorMsg('Pharmacy name and legal name are required.');
                setStatus('error');
                return;
            }

            if (!formData.pharmacyLicenseNumber.trim()) {
                setErrorMsg('Pharmacy license number is required.');
                setStatus('error');
                return;
            }

            if (!formData.pharmacyEmail.trim() || !formData.pharmacyPhone.trim()) {
                setErrorMsg('Pharmacy email and phone are required.');
                setStatus('error');
                return;
            }
        }

        const firstName = formData.firstName.trim();
        const lastName = formData.lastName.trim();
        const email = formData.email.trim();
        const phone = formData.phone.trim();
        const address = role === 'pharmacist'
            ? {
                additionalProp1: formData.pharmacistAddressLine1.trim(),
            }
            : {
                city: formData.city.trim(),
                region: formData.region.trim(),
            };
        const hasAddressValue = Object.values(address).some((value) => value.length > 0);
        if (!firstName || !lastName) {
            setErrorMsg('First name and last name are required.');
            setStatus('error');
            return;
        }

        if (!email) {
            setErrorMsg('Email is required.');
            setStatus('error');
            return;
        }

        setStatus('loading');

        try {
            if (role === 'pharmacist') {
                if (!invitationToken) {
                    setErrorMsg('Pharmacist registration requires an invitation link token in the URL.');
                    setStatus('error');
                    return;
                }
                await pharmacistCreateFromInvite(invitationToken, {
                    user: {
                        email,
                        password: formData.password,
                        firstName,
                        lastName,
                        phone,
                        address: hasAddressValue ? address : {},
                    },
                    pharmacist: {
                        licenseNumber: formData.inviteLicenseNumber.trim() || null,
                        licenseExpiry: formData.inviteLicenseExpiry || null,
                        canVerifyPrescriptions: Boolean(formData.inviteCanVerifyPrescriptions),
                        canManageInventory: Boolean(formData.inviteCanManageInventory),
                    },
                });
            } else if (role === 'hospital') {
                const payload = new FormData();
                payload.append('owner.email', email);
                payload.append('owner.password', formData.password);
                payload.append('owner.firstName', firstName);
                payload.append('owner.lastName', lastName);
                payload.append('owner.phone', phone);
                payload.append('hospital.name', formData.hospitalName.trim());
                payload.append('hospital.licenseNumber', formData.hospitalLicenseNumber.trim());
                payload.append('hospital.licenseImage', formData.legalFile);
                await authRegisterHospitalOwner(payload);
            } else if (role === 'pharmacy') {
                const payload = new FormData();
                payload.append('pharmacist.email', email);
                payload.append('pharmacist.password', formData.password);
                payload.append('pharmacist.firstName', firstName);
                payload.append('pharmacist.lastName', lastName);
                payload.append('pharmacist.phone', phone);
                payload.append('pharmacy.name', formData.pharmacyName.trim());
                payload.append('pharmacy.legalName', formData.pharmacyLegalName.trim());
                payload.append('pharmacy.licenseNumber', formData.pharmacyLicenseNumber.trim());
                payload.append('pharmacy.email', formData.pharmacyEmail.trim());
                payload.append('pharmacy.phone', formData.pharmacyPhone.trim());
                payload.append('pharmacy.website', formData.pharmacyWebsite.trim());
                payload.append('pharmacy.addressLine1', formData.pharmacyAddressLine1.trim());
                payload.append('pharmacy.city', formData.pharmacyCity.trim());
                payload.append('pharmacy.region', formData.pharmacyRegion.trim());
                payload.append('pharmacy.pharmacyType', formData.pharmacyType.trim());
                payload.append('pharmacy.operatingHours', formData.pharmacyOperatingHours.trim());
                payload.append('pharmacy.is24Hours', String(formData.pharmacyIs24Hours));
                payload.append('pharmacy.hasDelivery', String(formData.pharmacyHasDelivery));
                payload.append('pharmacy.licenseImage', formData.legalFile);
                await authRegisterPharmacy(payload);
            } else {
                if (formData.isAthlete) {
                    await authRegisterAthlete({
                        email,
                        password: formData.password,
                        firstName,
                        lastName,
                        phone,
                        address: hasAddressValue ? address : {},
                        advisorEnabled: true,
                    });
                } else {
                    await authRegister({
                        email,
                        password: formData.password,
                        firstName,
                        lastName,
                        phone,
                        address: hasAddressValue ? address : {},
                        roleNames: roleNamesByRole[role] || ['PATIENT'],
                    });
                }
            }

            navigate(`/login?role=${role}`);
        } catch (error) {
            const message = error?.response?.data?.message || 'Registration failed. Please try again.';
            setErrorMsg(message);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4.25rem)] flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors">
            <div className="max-w-3xl w-full space-y-8 bg-[var(--surface)] p-10 rounded-2xl border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="font-syne text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight">Create Account</h2>
                    <p className="mt-2 text-[var(--text2)] font-light text-sm">
                        {isInviteFlow ? 'Complete pharmacist onboarding from your invitation link.' : `Join TenaMed as a ${roleTitle}`}
                    </p>
                </div>

                {isInviteFlow ? (
                    <div className="rounded-lg border border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.05)] px-4 py-3 text-sm text-[var(--accent)]">
                        Invitation mode: role is locked to pharmacist and your invited email is prefilled.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 bg-[var(--bg2)] p-1 rounded-xl gap-1 border border-[var(--border2)]">
                        {roles.map((entry) => (
                            <button
                                key={entry}
                                type="button"
                                onClick={() => setRole(entry)}
                                className={`py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 capitalize font-mono tracking-tight ${role === entry ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm border border-[var(--border)]' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'}`}
                            >
                                {entry}
                            </button>
                        ))}
                    </div>
                )}

                {isInviteFlow && inviteStatus === 'loading' && (
                    <div className="rounded-lg border border-blue-200 bg-[rgba(59,130,246,0.1)] px-4 py-3 text-sm text-blue-400">
                        Validating invitation token...
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text2)] mb-1.5">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-[var(--text3)]" />
                                    </div>
                                    <input id="firstName" name="firstName" type="text" required className="block w-full pl-10 pr-3 py-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" placeholder="John" value={formData.firstName} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Last Name</label>
                                <input id="lastName" name="lastName" type="text" required className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-[var(--text3)]" />
                                </div>
                                <input id="email" name="email" type="email" required disabled={isInviteFlow} className="block w-full pl-10 pr-3 py-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Phone Number</label>
                            <input id="phone" name="phone" type="tel" required={role === 'hospital' || role === 'pharmacy' || role === 'pharmacist'} className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.phone} onChange={handleChange} placeholder="+251 9..." />
                        </div>

                        {role === 'customer' && !isInviteFlow && (
                            <div className="space-y-4">
                                <label htmlFor="isAthlete" className="flex items-center gap-2 rounded-xl border border-[var(--border2)] p-4 text-sm text-[var(--text)] bg-[var(--bg)] hover:border-[var(--accent)] transition-colors cursor-pointer">
                                    <input
                                        id="isAthlete"
                                        name="isAthlete"
                                        type="checkbox"
                                        checked={formData.isAthlete}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-[var(--accent)] bg-[var(--surface2)] border-[var(--border)] rounded focus:ring-[var(--accent)]"
                                    />
                                    I am an athlete
                                </label>
                                <h3 className="text-sm font-semibold text-[var(--text)] mt-4">Address (Optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-[var(--text2)] mb-1.5">City</label>
                                        <input id="city" name="city" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.city} onChange={handleChange} placeholder="Addis Ababa" />
                                    </div>
                                    <div>
                                        <label htmlFor="region" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Region</label>
                                        <input id="region" name="region" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.region} onChange={handleChange} placeholder="Oromia" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {role === 'hospital' && !isInviteFlow && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 outline outline-[1px] outline-[var(--border2)] p-4 rounded-xl bg-[var(--surface2)] mt-2">
                                <div className="col-span-1 md:col-span-2">
                                <h3 className="text-sm font-semibold text-[var(--text)] mb-2">Hospital Detail</h3>
                                </div>
                                <div>
                                    <label htmlFor="hospitalName" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Hospital Name</label>
                                    <input id="hospitalName" name="hospitalName" type="text" required className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.hospitalName} onChange={handleChange} placeholder="Hospital legal name" />
                                </div>
                                <div>
                                    <label htmlFor="hospitalLicenseNumber" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Hospital License Number</label>
                                    <input id="hospitalLicenseNumber" name="hospitalLicenseNumber" type="text" required className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.hospitalLicenseNumber} onChange={handleChange} placeholder="LIC-..." />
                                </div>
                            </div>
                        )}

                        {role === 'pharmacy' && !isInviteFlow && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 outline outline-[1px] outline-[var(--border2)] p-4 rounded-xl bg-[var(--surface2)] mt-2">
                                <div className="col-span-1 md:col-span-2">
                                    <h3 className="text-sm font-semibold text-[var(--text)] mb-2">Pharmacy Detail</h3>
                                </div>
                                <div>
                                    <label htmlFor="pharmacyName" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Pharmacy Name</label>
                                    <input id="pharmacyName" name="pharmacyName" type="text" required className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyName} onChange={handleChange} placeholder="City Pharmacy" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyLegalName" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Pharmacy Legal Name</label>
                                    <input id="pharmacyLegalName" name="pharmacyLegalName" type="text" required className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyLegalName} onChange={handleChange} placeholder="City Pharmacy PLC" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyLicenseNumber" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Pharmacy License Number</label>
                                    <input id="pharmacyLicenseNumber" name="pharmacyLicenseNumber" type="text" required className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyLicenseNumber} onChange={handleChange} placeholder="PH-..." />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyEmail" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Pharmacy Email</label>
                                    <input id="pharmacyEmail" name="pharmacyEmail" type="email" required className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyEmail} onChange={handleChange} placeholder="pharmacy@example.com" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyPhone" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Pharmacy Phone</label>
                                    <input id="pharmacyPhone" name="pharmacyPhone" type="tel" required className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyPhone} onChange={handleChange} placeholder="+251 9..." />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyWebsite" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Website</label>
                                    <input id="pharmacyWebsite" name="pharmacyWebsite" type="url" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyWebsite} onChange={handleChange} placeholder="https://example.com" />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                     <h3 className="text-sm font-semibold text-[var(--text)] mb-2 mt-2">Location & Details</h3>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="pharmacyAddressLine1" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Address Line 1</label>
                                    <input id="pharmacyAddressLine1" name="pharmacyAddressLine1" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyAddressLine1} onChange={handleChange} placeholder="Street and building" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyRegion" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Region</label>
                                    <input id="pharmacyRegion" name="pharmacyRegion" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyRegion} onChange={handleChange} placeholder="Oromia" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyCity" className="block text-sm font-medium text-[var(--text2)] mb-1.5">City</label>
                                    <input id="pharmacyCity" name="pharmacyCity" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyCity} onChange={handleChange} placeholder="Addis Ababa" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyType" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Pharmacy Type</label>
                                    <input id="pharmacyType" name="pharmacyType" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyType} onChange={handleChange} placeholder="Retail" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyOperatingHours" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Operating Hours</label>
                                    <input id="pharmacyOperatingHours" name="pharmacyOperatingHours" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" value={formData.pharmacyOperatingHours} onChange={handleChange} placeholder="Mon-Sat 8:00-20:00" />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label htmlFor="pharmacyIs24Hours" className="flex items-center gap-2 rounded-xl border border-[var(--border2)] p-3 text-sm text-[var(--text)] bg-[var(--bg)] hover:border-[var(--accent)] cursor-pointer">
                                        <input
                                            id="pharmacyIs24Hours"
                                            name="pharmacyIs24Hours"
                                            type="checkbox"
                                            checked={formData.pharmacyIs24Hours}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[var(--accent)] bg-[var(--surface2)] border-[var(--border)] rounded focus:ring-[var(--accent)]"
                                        />
                                        Open 24 hours
                                    </label>
                                    <label htmlFor="pharmacyHasDelivery" className="flex items-center gap-2 rounded-xl border border-[var(--border2)] p-3 text-sm text-[var(--text)] bg-[var(--bg)] hover:border-[var(--accent)] cursor-pointer">
                                        <input
                                            id="pharmacyHasDelivery"
                                            name="pharmacyHasDelivery"
                                            type="checkbox"
                                            checked={formData.pharmacyHasDelivery}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[var(--accent)] bg-[var(--surface2)] border-[var(--border)] rounded focus:ring-[var(--accent)]"
                                        />
                                        Offers delivery
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-[var(--text3)]" />
                                    </div>
                                    <input id="password" name="password" type="password" minLength={8} required className="block w-full pl-10 pr-3 py-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-[var(--text3)]" />
                                    </div>
                                    <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required className="block w-full pl-10 pr-3 py-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {role === 'pharmacist' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-[var(--border)] p-5 bg-[var(--surface2)] mt-4">
                                <div className="col-span-1 md:col-span-2"><h3 className="text-sm font-semibold text-[var(--text)] mb-2">Pharmacist Details</h3></div>
                                <div>
                                    <label htmlFor="pharmacistAddressLine1" className="block text-sm font-medium text-[var(--text2)] mb-1.5">Address (additionalProp1)</label>
                                    <input id="pharmacistAddressLine1" name="pharmacistAddressLine1" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)]" value={formData.pharmacistAddressLine1} onChange={handleChange} placeholder="Address Info" />
                                </div>
                                <div>
                                    <label htmlFor="inviteLicenseNumber" className="block text-sm font-medium text-[var(--text2)] mb-1.5">License Number</label>
                                    <input id="inviteLicenseNumber" name="inviteLicenseNumber" type="text" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)]" value={formData.inviteLicenseNumber} onChange={handleChange} placeholder="LIC-..." />
                                </div>
                                <div>
                                    <label htmlFor="inviteLicenseExpiry" className="block text-sm font-medium text-[var(--text2)] mb-1.5">License Expiry</label>
                                    <input id="inviteLicenseExpiry" name="inviteLicenseExpiry" type="date" className="w-full p-3 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)]" value={formData.inviteLicenseExpiry} onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label htmlFor="inviteCanVerifyPrescriptions" className="flex items-center gap-2 rounded-xl border border-[var(--border2)] p-3 text-sm text-[var(--text)] bg-[var(--bg)] hover:border-[var(--accent)] cursor-pointer">
                                        <input
                                            id="inviteCanVerifyPrescriptions"
                                            name="inviteCanVerifyPrescriptions"
                                            type="checkbox"
                                            checked={formData.inviteCanVerifyPrescriptions}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[var(--accent)] bg-[var(--surface2)] border-[var(--border)] rounded focus:ring-[var(--accent)]"
                                        />
                                        Can verify prescriptions
                                    </label>
                                    <label htmlFor="inviteCanManageInventory" className="flex items-center gap-2 rounded-xl border border-[var(--border2)] p-3 text-sm text-[var(--text)] bg-[var(--bg)] hover:border-[var(--accent)] cursor-pointer">
                                        <input
                                            id="inviteCanManageInventory"
                                            name="inviteCanManageInventory"
                                            type="checkbox"
                                            checked={formData.inviteCanManageInventory}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[var(--accent)] bg-[var(--surface2)] border-[var(--border)] rounded focus:ring-[var(--accent)]"
                                        />
                                        Can manage inventory
                                    </label>
                                </div>
                                {!invitationToken && (
                                    <div className="md:col-span-2 rounded-lg border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.05)] px-4 py-3 text-xs text-amber-500 font-mono">
                                        Open this page from invitation URL with token to complete pharmacist registration.
                                    </div>
                                )}
                            </div>
                        )}

                        {!isInviteFlow && requiresLegalFile && (
                            <div className="bg-[rgba(var(--accent-rgb),0.02)] p-5 rounded-xl border border-[rgba(var(--accent-rgb),0.1)] mt-4">
                                <label className="block text-sm font-medium text-[var(--accent)] mb-3">Legal / Credential Documents</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--border2)] border-dashed rounded-xl bg-[var(--surface2)] relative hover:border-[var(--accent)] transition-colors">
                                    <div className="space-y-2 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-[var(--accent)] opacity-60" />
                                        <div className="flex text-sm text-[var(--text)] justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-[var(--accent)] hover:text-[var(--accent2)]">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-[var(--text3)]">PDF, PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                                {formData.legalFile && (
                                    <div className="mt-3 text-sm text-[var(--accent2)] flex items-center font-mono">
                                        <FileText className="w-4 h-4 mr-1" />
                                        {formData.legalFile.name}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center pt-2">
                            <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-[var(--accent)] bg-[var(--surface2)] border-[var(--border2)] rounded focus:ring-[var(--accent)]" />
                            <label htmlFor="terms" className="ml-2 block text-sm text-[var(--text2)] hover:text-[var(--text)] cursor-pointer transition-colors">
                                I declare consent and agree to Terms and Privacy Policy.
                            </label>
                        </div>
                    </div>

                    {errorMsg && <div className="rounded-lg border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] px-4 py-3 text-sm text-[var(--danger)] font-medium">{errorMsg}</div>}

                    <button
                        type="submit"
                        disabled={status === 'loading' || (isInviteFlow && inviteStatus !== 'ready')}
                        className={`btn-primary w-full py-3.5 text-base rounded-xl ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {status === 'loading' ? 'Creating Account...' : isInviteFlow ? 'Complete Pharmacist Onboarding' : `Create ${roleTitle} Account`}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform flex-shrink-0" />
                    </button>
                </form>

                <div className="text-center border-t border-[var(--border2)] pt-6">
                    <p className="text-sm text-[var(--text3)]">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
