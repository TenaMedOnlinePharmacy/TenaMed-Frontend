import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, UserPlus, XCircle } from 'lucide-react';
import { doctorVerify, hospitalGetDoctors, hospitalInviteDoctor } from '../api/axios';

const HOSPITAL_ID_STORAGE_KEY = 'tenamed_hospital_id';

const HospitalDashboardPage = () => {
    const [hospitalId, setHospitalId] = useState(() => localStorage.getItem(HOSPITAL_ID_STORAGE_KEY) || '');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatusMsg, setInviteStatusMsg] = useState('');
    const [inviteErrorMsg, setInviteErrorMsg] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
    const [doctorsErrorMsg, setDoctorsErrorMsg] = useState('');
    const [actionLoadingByDoctorId, setActionLoadingByDoctorId] = useState({});

    const loadDoctors = async () => {
        if (!hospitalId.trim()) {
            setDoctors([]);
            return;
        }

        setIsLoadingDoctors(true);
        setDoctorsErrorMsg('');
        try {
            const response = await hospitalGetDoctors(hospitalId.trim());
            setDoctors(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            setDoctorsErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load doctors list.');
        } finally {
            setIsLoadingDoctors(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, [hospitalId]);

    const pendingDoctors = useMemo(() => doctors.filter((doctor) => doctor?.status === 'PENDING'), [doctors]);
    const verifiedDoctors = useMemo(() => doctors.filter((doctor) => doctor?.status === 'ACTIVE'), [doctors]);
    const verifiedCount = verifiedDoctors.length;

    const updateActionLoading = (doctorId, value) => {
        setActionLoadingByDoctorId((prev) => ({
            ...prev,
            [doctorId]: value,
        }));
    };

    const handleInviteDoctor = async (event) => {
        event.preventDefault();
        setInviteStatusMsg('');
        setInviteErrorMsg('');

        if (!inviteEmail.trim()) {
            setInviteErrorMsg('Enter doctor email address.');
            return;
        }

        setIsInviting(true);
        try {
            await hospitalInviteDoctor({ email: inviteEmail.trim() });
            setInviteEmail('');
            setInviteStatusMsg('Doctor invitation sent successfully.');
            await loadDoctors();
        } catch (error) {
            setInviteErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to send invitation.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleVerifyDoctor = async (doctorId) => {
        if (!doctorId) {
            setDoctorsErrorMsg('Missing doctor id for verification.');
            return;
        }

        updateActionLoading(doctorId, true);
        setDoctorsErrorMsg('');
        try {
            await doctorVerify(doctorId);
            await loadDoctors();
        } catch (error) {
            setDoctorsErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to verify doctor.');
        } finally {
            updateActionLoading(doctorId, false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Hospital Management Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage affiliated doctors and monitor verification progress.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-sm text-gray-500">Total Doctors</p>
                        <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-sm text-gray-500">Verified</p>
                        <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-sm text-gray-500">Pending Review</p>
                        <p className="text-2xl font-bold text-amber-600">{pendingDoctors.length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <form onSubmit={handleInviteDoctor} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3 h-max">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><UserPlus className="w-4 h-4 text-emerald-600" /> Invite Doctor</h2>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="doctor@example.com"
                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                        />
                        <button
                            type="submit"
                            disabled={isInviting}
                            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </button>
                        {inviteStatusMsg && <p className="text-sm text-emerald-700">{inviteStatusMsg}</p>}
                        {inviteErrorMsg && <p className="text-sm text-red-600">{inviteErrorMsg}</p>}
                    </form>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Pending Doctors</h2>
                            {isLoadingDoctors ? (
                                <p className="text-sm text-gray-500">Loading pending doctors...</p>
                            ) : pendingDoctors.length === 0 ? (
                                <p className="text-sm text-gray-500">No pending doctors found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingDoctors.map((doctor) => {
                                        const isActionLoading = Boolean(actionLoadingByDoctorId[doctor?.id]);
                                        return (
                                            <div key={doctor?.id} className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Doctor ID: {doctor?.id}</p>
                                                    <p className="text-xs text-gray-500">Specialization: {doctor?.specialization || 'N/A'} | Status: {doctor?.status || 'PENDING'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerifyDoctor(doctor?.id)}
                                                        disabled={isActionLoading}
                                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-60"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Verify
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        title="Reject endpoint is not available in current backend API"
                                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Verified Doctors</h2>
                            {isLoadingDoctors ? (
                                <p className="text-sm text-gray-500">Loading verified doctors...</p>
                            ) : verifiedDoctors.length === 0 ? (
                                <p className="text-sm text-gray-500">No verified doctors found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {verifiedDoctors.map((doctor) => (
                                        <div key={doctor?.id} className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Doctor ID: {doctor?.id}</p>
                                                <p className="text-xs text-gray-500">Specialization: {doctor?.specialization || 'N/A'} | Status: {doctor?.status || 'ACTIVE'}</p>
                                            </div>
                                            <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Active</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {doctorsErrorMsg && <p className="text-sm text-red-600">{doctorsErrorMsg}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDashboardPage;
