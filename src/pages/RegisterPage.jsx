import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, FileText, Lock, Mail, Upload, User } from 'lucide-react';
import {
    authRegister,
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

            navigate(`/login?role=${role}`);
        } catch (error) {
            const message = error?.response?.data?.message || 'Registration failed. Please try again.';
            setErrorMsg(message);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isInviteFlow ? 'Complete pharmacist onboarding from your invitation link.' : `Join TenaMed as a ${roleTitle}`}
                    </p>
                </div>

                {isInviteFlow ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        Invitation mode: role is locked to pharmacist and your invited email is prefilled.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 bg-gray-100 p-1 rounded-lg gap-1">
                        {roles.map((entry) => (
                            <button
                                key={entry}
                                type="button"
                                onClick={() => setRole(entry)}
                                className={`py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 capitalize ${role === entry ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {entry}
                            </button>
                        ))}
                    </div>
                )}

                {isInviteFlow && inviteStatus === 'loading' && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        Validating invitation token...
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="firstName" name="firstName" type="text" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" placeholder="John" value={formData.firstName} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input id="lastName" name="lastName" type="text" required className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input id="email" name="email" type="email" required disabled={isInviteFlow} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input id="phone" name="phone" type="tel" required={role === 'hospital' || role === 'pharmacy' || role === 'pharmacist'} className="w-full p-3 border border-gray-300 rounded-lg" value={formData.phone} onChange={handleChange} placeholder="+251 9..." />
                        </div>

                        {role === 'customer' && !isInviteFlow && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-800">Address (Optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input id="city" name="city" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.city} onChange={handleChange} placeholder="Addis Ababa" />
                                    </div>
                                    <div>
                                        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                        <input id="region" name="region" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.region} onChange={handleChange} placeholder="Oromia" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {role === 'hospital' && !isInviteFlow && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                                    <input id="hospitalName" name="hospitalName" type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.hospitalName} onChange={handleChange} placeholder="Hospital legal name" />
                                </div>
                                <div>
                                    <label htmlFor="hospitalLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">Hospital License Number</label>
                                    <input id="hospitalLicenseNumber" name="hospitalLicenseNumber" type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.hospitalLicenseNumber} onChange={handleChange} placeholder="LIC-..." />
                                </div>
                            </div>
                        )}

                        {role === 'pharmacy' && !isInviteFlow && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="pharmacyName" className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Name</label>
                                    <input id="pharmacyName" name="pharmacyName" type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyName} onChange={handleChange} placeholder="City Pharmacy" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyLegalName" className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Legal Name</label>
                                    <input id="pharmacyLegalName" name="pharmacyLegalName" type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyLegalName} onChange={handleChange} placeholder="City Pharmacy PLC" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">Pharmacy License Number</label>
                                    <input id="pharmacyLicenseNumber" name="pharmacyLicenseNumber" type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyLicenseNumber} onChange={handleChange} placeholder="PH-..." />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyEmail" className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Email</label>
                                    <input id="pharmacyEmail" name="pharmacyEmail" type="email" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyEmail} onChange={handleChange} placeholder="pharmacy@example.com" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyPhone" className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Phone</label>
                                    <input id="pharmacyPhone" name="pharmacyPhone" type="tel" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyPhone} onChange={handleChange} placeholder="+251 9..." />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyWebsite" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input id="pharmacyWebsite" name="pharmacyWebsite" type="url" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyWebsite} onChange={handleChange} placeholder="https://example.com" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyAddressLine1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                                    <input id="pharmacyAddressLine1" name="pharmacyAddressLine1" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyAddressLine1} onChange={handleChange} placeholder="Street and building" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyRegion" className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                    <input id="pharmacyRegion" name="pharmacyRegion" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyRegion} onChange={handleChange} placeholder="Oromia" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input id="pharmacyCity" name="pharmacyCity" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyCity} onChange={handleChange} placeholder="Addis Ababa" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyType" className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Type</label>
                                    <input id="pharmacyType" name="pharmacyType" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyType} onChange={handleChange} placeholder="Retail" />
                                </div>
                                <div>
                                    <label htmlFor="pharmacyOperatingHours" className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                                    <input id="pharmacyOperatingHours" name="pharmacyOperatingHours" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacyOperatingHours} onChange={handleChange} placeholder="Mon-Sat 8:00-20:00" />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label htmlFor="pharmacyIs24Hours" className="flex items-center gap-2 rounded-lg border border-gray-300 p-3 text-sm text-gray-700">
                                        <input
                                            id="pharmacyIs24Hours"
                                            name="pharmacyIs24Hours"
                                            type="checkbox"
                                            checked={formData.pharmacyIs24Hours}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                                        />
                                        Open 24 hours
                                    </label>
                                    <label htmlFor="pharmacyHasDelivery" className="flex items-center gap-2 rounded-lg border border-gray-300 p-3 text-sm text-gray-700">
                                        <input
                                            id="pharmacyHasDelivery"
                                            name="pharmacyHasDelivery"
                                            type="checkbox"
                                            checked={formData.pharmacyHasDelivery}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                                        />
                                        Offers delivery
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="password" name="password" type="password" minLength={8} required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {role === 'pharmacist' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4">
                                <div>
                                    <label htmlFor="pharmacistAddressLine1" className="block text-sm font-medium text-gray-700 mb-1">Address (additionalProp1)</label>
                                    <input id="pharmacistAddressLine1" name="pharmacistAddressLine1" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.pharmacistAddressLine1} onChange={handleChange} placeholder="string" />
                                </div>
                                <div>
                                    <label htmlFor="inviteLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                    <input id="inviteLicenseNumber" name="inviteLicenseNumber" type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.inviteLicenseNumber} onChange={handleChange} placeholder="string" />
                                </div>
                                <div>
                                    <label htmlFor="inviteLicenseExpiry" className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                                    <input id="inviteLicenseExpiry" name="inviteLicenseExpiry" type="date" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.inviteLicenseExpiry} onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label htmlFor="inviteCanVerifyPrescriptions" className="flex items-center gap-2 rounded-lg border border-gray-300 p-3 text-sm text-gray-700">
                                        <input
                                            id="inviteCanVerifyPrescriptions"
                                            name="inviteCanVerifyPrescriptions"
                                            type="checkbox"
                                            checked={formData.inviteCanVerifyPrescriptions}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                                        />
                                        Can verify prescriptions
                                    </label>
                                    <label htmlFor="inviteCanManageInventory" className="flex items-center gap-2 rounded-lg border border-gray-300 p-3 text-sm text-gray-700">
                                        <input
                                            id="inviteCanManageInventory"
                                            name="inviteCanManageInventory"
                                            type="checkbox"
                                            checked={formData.inviteCanManageInventory}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                                        />
                                        Can manage inventory
                                    </label>
                                </div>
                                {!invitationToken && (
                                    <div className="md:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                        Open this page from invitation URL with token to complete pharmacist registration.
                                    </div>
                                )}
                            </div>
                        )}

                        {!isInviteFlow && requiresLegalFile && (
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                <label className="block text-sm font-medium text-emerald-900 mb-2">Legal / Credential Documents</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-emerald-300 border-dashed rounded-md bg-white relative">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-emerald-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                                {formData.legalFile && (
                                    <div className="mt-2 text-sm text-green-600 flex items-center">
                                        <FileText className="w-4 h-4 mr-1" />
                                        {formData.legalFile.name}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center">
                            <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-emerald-600 border-gray-300 rounded" />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                I declare consent and agree to Terms and Privacy Policy.
                            </label>
                        </div>
                    </div>

                    {errorMsg && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>}

                    <button
                        type="submit"
                        disabled={status === 'loading' || (isInviteFlow && inviteStatus !== 'ready')}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all shadow-md hover:shadow-lg ${status === 'loading' ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                        {status === 'loading' ? 'Creating Account...' : isInviteFlow ? 'Complete Pharmacist Onboarding' : `Create ${roleTitle} Account`}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
