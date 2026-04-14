import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Lock, Mail, Upload, User } from 'lucide-react';
import { authRegister } from '../api/axios';

const roles = ['customer', 'pharmacist', 'hospital', 'doctor'];

const roleNamesByRole = {
    customer: ['PATIENT'],
    pharmacist: ['PHARMACIST'],
    hospital: ['HOSPITAL_ADMIN'],
    doctor: ['DOCTOR'],
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('customer');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        hospitalName: '',
        specialty: '',
        legalFile: null,
    });
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const roleTitle = useMemo(() => role.charAt(0).toUpperCase() + role.slice(1), [role]);
    const requiresLegalFile = role === 'pharmacist' || role === 'hospital' || role === 'doctor';

    const handleChange = (event) => {
        setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
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

        if (requiresLegalFile && !formData.legalFile) {
            setErrorMsg('Please upload required legal credentials for this role.');
            setStatus('error');
            return;
        }

        const nameParts = formData.name.trim().split(' ').filter(Boolean);
        if (nameParts.length < 2) {
            setErrorMsg('Please enter your first and last name.');
            setStatus('error');
            return;
        }

        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        setStatus('loading');

        try {
            await authRegister({
                email: formData.email,
                password: formData.password,
                firstName,
                lastName,
                phone: '',
                address: {},
                roleNames: roleNamesByRole[role] || ['PATIENT'],
            });

            navigate(`/login?role=${role}`);
        } catch (error) {
            if (role !== 'customer') {
                // Frontend-only role onboarding for flows not fully backed by current API.
                navigate(`/login?role=${role}`);
                return;
            }

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
                    <p className="mt-2 text-sm text-gray-600">Join TenaMed as a {roleTitle}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-100 p-1 rounded-lg gap-1">
                    {roles.map((entry) => (
                        <button
                            key={entry}
                            type="button"
                            onClick={() => setRole(entry)}
                            className={`py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 capitalize ${role === entry ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {entry}
                        </button>
                    ))}
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input id="name" name="name" type="text" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input id="email" name="email" type="email" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        {role === 'hospital' && (
                            <div>
                                <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                                <input id="hospitalName" name="hospitalName" type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.hospitalName} onChange={handleChange} placeholder="Hospital legal name" />
                            </div>
                        )}

                        {role === 'doctor' && (
                            <div>
                                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">Medical Specialty</label>
                                <input id="specialty" name="specialty" type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.specialty} onChange={handleChange} placeholder="Cardiology, Internal Medicine, ..." />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="password" name="password" type="password" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="confirmPassword" name="confirmPassword" type="password" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {requiresLegalFile && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <label className="block text-sm font-medium text-blue-900 mb-2">Legal / Credential Documents</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-blue-300 border-dashed rounded-md bg-white relative">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-blue-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
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
                            <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                I declare consent and agree to Terms and Privacy Policy.
                            </label>
                        </div>
                    </div>

                    {errorMsg && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all shadow-md hover:shadow-lg ${status === 'loading' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {status === 'loading' ? 'Creating Account...' : `Create ${roleTitle} Account`}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
