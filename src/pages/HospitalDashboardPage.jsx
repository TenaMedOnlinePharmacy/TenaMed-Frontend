import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, UserPlus, XCircle } from 'lucide-react';
import {
    hospitalAcceptDoctor,
    hospitalGetDoctorsManagement,
    hospitalGetStatistics,
    hospitalInviteDoctor,
    hospitalRejectDoctor,
} from '../api/axios';

const HospitalDashboardPage = () => {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatusMsg, setInviteStatusMsg] = useState('');
    const [inviteErrorMsg, setInviteErrorMsg] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
    const [doctorsErrorMsg, setDoctorsErrorMsg] = useState('');
    const [actionLoadingByDoctorId, setActionLoadingByDoctorId] = useState({});
    const [stats, setStats] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [statsErrorMsg, setStatsErrorMsg] = useState('');

    const loadDoctors = async () => {
        setIsLoadingDoctors(true);
        setDoctorsErrorMsg('');
        try {
            const response = await hospitalGetDoctorsManagement();
            setDoctors(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            setDoctorsErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load doctors list.');
        } finally {
            setIsLoadingDoctors(false);
        }
    };

    const loadStatistics = async () => {
        setIsLoadingStats(true);
        setStatsErrorMsg('');
        try {
            const response = await hospitalGetStatistics();
            setStats(response?.data || null);
        } catch (error) {
            setStats(null);
            setStatsErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load statistics.');
        } finally {
            setIsLoadingStats(false);
        }
    };

    useEffect(() => {
        loadDoctors();
        loadStatistics();
    }, []);

    const pendingDoctors = useMemo(() => doctors.filter((doctor) => doctor?.status === 'PENDING'), [doctors]);
    const verifiedDoctors = useMemo(() => doctors.filter((doctor) => doctor?.status === 'ACTIVE'), [doctors]);
    const totalDoctors = typeof stats?.totalDoctors === 'number' ? stats.totalDoctors : doctors.length;
    const verifiedCount = typeof stats?.verifiedDoctors === 'number' ? stats.verifiedDoctors : verifiedDoctors.length;
    const unverifiedCount = typeof stats?.unverifiedDoctors === 'number' ? stats.unverifiedDoctors : pendingDoctors.length;
    const invitedCount = typeof stats?.invitedDoctors === 'number' ? stats.invitedDoctors : 0;
    const totalPrescriptions = typeof stats?.totalPrescriptions === 'number' ? stats.totalPrescriptions : 0;

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
            await Promise.all([loadDoctors(), loadStatistics()]);
        } catch (error) {
            setInviteErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to send invitation.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleAcceptDoctor = async (doctorId) => {
        if (!doctorId) {
            setDoctorsErrorMsg('Missing doctor id for acceptance.');
            return;
        }

        updateActionLoading(doctorId, true);
        setDoctorsErrorMsg('');
        try {
            await hospitalAcceptDoctor(doctorId);
            await Promise.all([loadDoctors(), loadStatistics()]);
        } catch (error) {
            setDoctorsErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to accept doctor.');
        } finally {
            updateActionLoading(doctorId, false);
        }
    };

    const handleRejectDoctor = async (doctorId) => {
        if (!doctorId) {
            setDoctorsErrorMsg('Missing doctor id for rejection.');
            return;
        }

        updateActionLoading(doctorId, true);
        setDoctorsErrorMsg('');
        try {
            await hospitalRejectDoctor(doctorId);
            await Promise.all([loadDoctors(), loadStatistics()]);
        } catch (error) {
            setDoctorsErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to reject doctor.');
        } finally {
            updateActionLoading(doctorId, false);
        }
    };

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-12 relative z-10 transition-colors">
            <div className="nova-main">
                <div className="mb-8">
                    <h1 className="font-syne text-3xl md:text-3xl font-bold text-[var(--text)] tracking-tight">Hospital Management Dashboard</h1>
                    <p className="text-sm text-[var(--text2)] font-light mt-2">Manage affiliated doctors and monitor verification progress.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-sm text-[var(--text2)]">Total Doctors</p>
                        <p className="text-2xl font-bold text-[var(--text)] mt-1">{isLoadingStats ? '...' : totalDoctors}</p>
                    </div>
                    <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: '100ms'}}>
                        <p className="text-sm text-[var(--text2)]">Verified</p>
                        <p className="text-2xl font-bold text-emerald-500 mt-1">{isLoadingStats ? '...' : verifiedCount}</p>
                    </div>
                    <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: '200ms'}}>
                        <p className="text-sm text-[var(--text2)]">Unverified</p>
                        <p className="text-2xl font-bold text-yellow-500 mt-1">{isLoadingStats ? '...' : unverifiedCount}</p>
                    </div>
                    <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: '300ms'}}>
                        <p className="text-sm text-[var(--text2)]">Invited Doctors</p>
                        <p className="text-2xl font-bold text-sky-500 mt-1">{isLoadingStats ? '...' : invitedCount}</p>
                    </div>
                    <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: '400ms'}}>
                        <p className="text-sm text-[var(--text2)]">Total Prescriptions</p>
                        <p className="text-2xl font-bold text-[var(--text)] mt-1">{isLoadingStats ? '...' : totalPrescriptions}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <form onSubmit={handleInviteDoctor} className="nova-card p-6 space-y-4 h-max animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="font-syne text-xl font-bold text-[var(--text)] tracking-tight flex items-center gap-2"><UserPlus className="w-5 h-5 text-[var(--accent)]" /> Invite Doctor</h2>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="doctor@example.com"
                            className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={isInviting}
                            className={`btn-primary w-full py-3.5 rounded-xl font-semibold ${isInviting ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </button>
                        {inviteStatusMsg && <p className="text-sm text-emerald-500 font-medium">{inviteStatusMsg}</p>}
                        {inviteErrorMsg && <p className="text-sm text-[var(--danger)]">{inviteErrorMsg}</p>}
                    </form>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="nova-card p-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="font-syne text-xl font-bold text-[var(--text)] tracking-tight mb-4">Pending Doctors</h2>
                            {isLoadingDoctors ? (
                                <p className="text-sm text-[var(--text3)]">Loading pending doctors...</p>
                            ) : pendingDoctors.length === 0 ? (
                                <p className="text-sm text-[var(--text3)]">No pending doctors found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingDoctors.map((doctor) => {
                                        const doctorId = doctor?.doctorId || doctor?.id;
                                        const isActionLoading = Boolean(actionLoadingByDoctorId[doctorId]);
                                        return (
                                            <div key={doctorId} className="border border-[var(--border2)] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors">
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text)]">{doctor?.name || 'Doctor'}</p>
                                                    <p className="text-xs text-[var(--text2)] mt-1">Specialization: {doctor?.specialization || 'N/A'} | License: {doctor?.licenseNumber || 'N/A'}</p>
                                                    <p className="text-xs text-[var(--text3)] mt-0.5">Status: {doctor?.status || 'PENDING'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAcceptDoctor(doctorId)}
                                                        disabled={isActionLoading}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)] disabled:opacity-60 transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Accept
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectDoctor(doctorId)}
                                                        disabled={isActionLoading}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] hover:bg-[rgba(var(--danger-rgb),0.15)] disabled:opacity-60 transition-colors"
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

                        <div className="nova-card p-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="font-syne text-xl font-bold text-[var(--text)] tracking-tight mb-4">Verified Doctors</h2>
                            {isLoadingDoctors ? (
                                <p className="text-sm text-[var(--text3)]">Loading verified doctors...</p>
                            ) : verifiedDoctors.length === 0 ? (
                                <p className="text-sm text-[var(--text3)]">No verified doctors found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {verifiedDoctors.map((doctor) => {
                                        const doctorId = doctor?.doctorId || doctor?.id;
                                        return (
                                            <div key={doctorId} className="border border-[var(--border2)] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors">
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text)]">{doctor?.name || 'Doctor'}</p>
                                                    <p className="text-xs text-[var(--text2)] mt-1">Specialization: {doctor?.specialization || 'N/A'} | License: {doctor?.licenseNumber || 'N/A'}</p>
                                                </div>
                                                <div className="text-xs font-semibold text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] px-3 py-1 rounded-full">Active</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {doctorsErrorMsg && <p className="text-sm text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] p-3 rounded-lg">{doctorsErrorMsg}</p>}
                        {statsErrorMsg && <p className="text-sm text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] p-3 rounded-lg">{statsErrorMsg}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDashboardPage;
