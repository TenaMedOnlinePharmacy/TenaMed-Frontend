import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    FileSearch,
    Package2,
    ScanSearch,
    ShieldAlert,
    Store,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import {
    adminApproveHospital,
    adminApprovePharmacy,
    adminGetAuditLogs,
    adminGetDashboard,
    adminGetOcrStats,
    adminGetPrescriptions,
    adminRejectHospital,
    adminRejectPharmacy,
    adminSuspendHospital,
    adminSuspendPharmacy,
    adminUnsuspendHospital,
    adminUnsuspendPharmacy,
} from '../api/axios';

const workflowStyles = {
    PENDING: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    UNDER_REVIEW: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    REJECTED: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
};

const SectionCard = ({ title, icon: Icon, children, action }) => (
    <section className="rounded-2xl border border-[var(--border2)] bg-[linear-gradient(145deg,rgba(var(--accent-rgb),0.08),rgba(17,24,39,0.35))] shadow-[0_0_0_1px_rgba(var(--accent-rgb),0.08),0_12px_50px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border2)] px-6 py-4">
            <div className="flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(var(--accent-rgb),0.14)]">
                    <Icon className="h-4 w-4 text-[var(--accent)]" />
                </div>
                <h2 className="font-syne text-lg font-bold tracking-tight text-[var(--text)]">{title}</h2>
            </div>
            {action}
        </div>
        <div className="px-6 py-5">{children}</div>
    </section>
);

const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [ocrStats, setOcrStats] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [hospitalId, setHospitalId] = useState('');
    const [pharmacyId, setPharmacyId] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    const loadDashboard = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const [dashboardRes, ocrRes, prescriptionsRes, auditRes] = await Promise.all([
                adminGetDashboard(),
                adminGetOcrStats(),
                adminGetPrescriptions({ page: 0, size: 8 }),
                adminGetAuditLogs({ page: 0, size: 8 }),
            ]);

            setDashboard(dashboardRes?.data || {});
            setOcrStats(ocrRes?.data || {});
            setPrescriptions(Array.isArray(prescriptionsRes?.data?.content) ? prescriptionsRes.data.content : []);
            setAuditLogs(Array.isArray(auditRes?.data?.content) ? auditRes.data.content : []);
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Unable to load admin dashboard data right now.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const kpiCards = useMemo(() => ([
        { label: 'Total users', value: formatNumber(dashboard?.totalUsers), icon: Users },
        { label: 'Total hospitals', value: formatNumber(dashboard?.totalHospitals), icon: Building2 },
        { label: 'Total pharmacies', value: formatNumber(dashboard?.totalPharmacies), icon: Store },
        { label: 'Total products', value: formatNumber(dashboard?.totalProducts), icon: Package2 },
        { label: 'Total orders', value: formatNumber(dashboard?.totalOrders), icon: ClipboardCheck },
        { label: 'Average OCR score', value: `${Number(ocrStats?.avgConfidence || 0).toFixed(2)}%`, icon: ScanSearch },
    ]), [dashboard, ocrStats]);

    const ocrStatCards = useMemo(() => ([
        { label: 'Total OCR processed', value: formatNumber(ocrStats?.totalProcessed) },
        { label: 'OCR passed', value: formatNumber(ocrStats?.passedCount) },
        { label: 'OCR failed', value: formatNumber(ocrStats?.failedCount) },
        { label: 'Pass / fail rate', value: `${formatNumber(ocrStats?.passedCount)} / ${formatNumber(ocrStats?.failedCount)}` },
    ]), [ocrStats]);

    const executeAdminAction = async ({ entityType, entityId, actionType }) => {
        if (!entityId.trim()) {
            setErrorMsg(`Please enter a ${entityType} UUID first.`);
            setSuccessMsg('');
            return;
        }

        const actionMap = {
            hospital: {
                approve: adminApproveHospital,
                reject: adminRejectHospital,
                suspend: adminSuspendHospital,
                unsuspend: adminUnsuspendHospital,
            },
            pharmacy: {
                approve: adminApprovePharmacy,
                reject: adminRejectPharmacy,
                suspend: adminSuspendPharmacy,
                unsuspend: adminUnsuspendPharmacy,
            },
        };

        const actionHandler = actionMap[entityType]?.[actionType];
        if (!actionHandler) return;

        setIsActionLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const response = await actionHandler(entityId.trim());
            setSuccessMsg(response?.data?.message || `${entityType} ${actionType} action completed successfully.`);
            await loadDashboard();
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || `Failed to ${actionType} ${entityType}.`);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="relative z-10 min-h-[calc(100vh-4.25rem)] bg-transparent py-10">
            <div className="nova-main space-y-7">
                <div className="rounded-3xl border border-[var(--border2)] bg-[linear-gradient(120deg,rgba(var(--accent-rgb),0.16),rgba(7,10,20,0.85))] p-7 shadow-[0_0_80px_rgba(var(--accent-rgb),0.12)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text3)]">TenaMed Command Center</p>
                            <h1 className="mt-1 font-syne text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl">Admin Dashboard</h1>
                            <p className="mt-2 max-w-2xl text-sm text-[var(--text2)]">
                                Centralized control for platform compliance, OCR monitoring, verification workflows, and operational intelligence.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link to="/admin/medical-verification" className="btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold">
                                Open Verification Queue
                            </Link>
                            <button type="button" onClick={loadDashboard} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold">
                                Refresh Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {errorMsg ? <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{errorMsg}</div> : null}
                {successMsg ? <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{successMsg}</div> : null}

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {kpiCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <article key={card.label} className="rounded-2xl border border-[var(--border2)] bg-[var(--surface)] p-5 shadow-[0_0_0_1px_rgba(var(--accent-rgb),0.06),0_10px_30px_rgba(0,0,0,0.28)]">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-[var(--text2)]">{card.label}</p>
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(var(--accent-rgb),0.25)] bg-[rgba(var(--accent-rgb),0.1)]">
                                        <Icon className="h-4 w-4 text-[var(--accent)]" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-[var(--text)]">{isLoading ? '...' : card.value}</div>
                            </article>
                        );
                    })}
                </section>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <SectionCard title="Hospital Management" icon={Building2}>
                        <div className="space-y-3">
                            <p className="text-sm text-[var(--text2)]">Run backend admin actions by hospital UUID.</p>
                            <input type="text" value={hospitalId} onChange={(event) => setHospitalId(event.target.value)} placeholder="Hospital UUID" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none transition focus:border-[var(--accent)]" />
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" disabled={isActionLoading} onClick={() => executeAdminAction({ entityType: 'hospital', entityId: hospitalId, actionType: 'approve' })} className="rounded-md border border-emerald-500/40 px-2.5 py-2 text-xs text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50">Approve</button>
                                <button type="button" disabled={isActionLoading} onClick={() => executeAdminAction({ entityType: 'hospital', entityId: hospitalId, actionType: 'reject' })} className="rounded-md border border-rose-500/40 px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">Reject</button>
                                <button type="button" disabled={isActionLoading} onClick={() => executeAdminAction({ entityType: 'hospital', entityId: hospitalId, actionType: 'suspend' })} className="rounded-md border border-amber-500/40 px-2.5 py-2 text-xs text-amber-300 hover:bg-amber-500/10 disabled:opacity-50">Suspend</button>
                                <button type="button" disabled={isActionLoading} onClick={() => executeAdminAction({ entityType: 'hospital', entityId: hospitalId, actionType: 'unsuspend' })} className="rounded-md border border-blue-500/40 px-2.5 py-2 text-xs text-blue-300 hover:bg-blue-500/10 disabled:opacity-50">Unsuspend</button>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Pharmacy Management" icon={Store}>
                        <div className="space-y-3">
                            <p className="text-sm text-[var(--text2)]">Run backend admin actions by pharmacy UUID.</p>
                            <input type="text" value={pharmacyId} onChange={(event) => setPharmacyId(event.target.value)} placeholder="Pharmacy UUID" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none transition focus:border-[var(--accent)]" />
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" disabled={isActionLoading} onClick={() => executeAdminAction({ entityType: 'pharmacy', entityId: pharmacyId, actionType: 'approve' })} className="rounded-md border border-emerald-500/40 px-2.5 py-2 text-xs text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50">Approve</button>
                                <button type="button" disabled={isActionLoading} onClick={() => executeAdminAction({ entityType: 'pharmacy', entityId: pharmacyId, actionType: 'reject' })} className="rounded-md border border-rose-500/40 px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">Reject</button>
                                <button type="button" disabled={isActionLoading} onClick={() => executeAdminAction({ entityType: 'pharmacy', entityId: pharmacyId, actionType: 'suspend' })} className="rounded-md border border-amber-500/40 px-2.5 py-2 text-xs text-amber-300 hover:bg-amber-500/10 disabled:opacity-50">Suspend</button>
                                <button type="button" disabled={isActionLoading} onClick={() => executeAdminAction({ entityType: 'pharmacy', entityId: pharmacyId, actionType: 'unsuspend' })} className="rounded-md border border-blue-500/40 px-2.5 py-2 text-xs text-blue-300 hover:bg-blue-500/10 disabled:opacity-50">Unsuspend</button>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <SectionCard title="Prescription Monitoring" icon={FileSearch}>
                        <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-200">
                            Backend source: <span className="font-semibold">GET /admin/prescriptions</span>
                        </div>
                        <div className="space-y-3">
                            {prescriptions.map((entry) => (
                                <article key={entry.id} className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-[var(--text)]">{entry.uniqueCode || entry.id}</p>
                                            <p className="text-xs text-[var(--text3)]">Doctor: {entry.doctorId || 'N/A'} • Hospital: {entry.hospitalId || 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${workflowStyles[entry.status] || workflowStyles.PENDING}`}>{entry.status || 'UNKNOWN'}</span>
                                            {entry.highRisk ? (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-300">
                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                    High risk
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Low risk
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                            {!prescriptions.length && !isLoading ? <div className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text2)]">No prescriptions found.</div> : null}
                        </div>
                    </SectionCard>

                    <SectionCard title="OCR Analytics" icon={ScanSearch}>
                        <div className="space-y-2.5 text-sm">
                            {ocrStatCards.map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5">
                                    <span className="text-[var(--text2)]">{stat.label}</span>
                                    <span className="font-semibold text-[var(--text)]">{isLoading ? '...' : stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <SectionCard title="Audit Logs" icon={FileSearch}>
                    <div className="space-y-2.5">
                        {auditLogs.map((entry) => (
                            <div key={entry.id} className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text2)]">
                                <div className="mb-1 flex items-center gap-2 text-xs text-[var(--text3)]">
                                    <AlertTriangle className="h-3.5 w-3.5 text-[var(--accent)]" />
                                    {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'No timestamp'}
                                </div>
                                <p><span className="font-semibold text-[var(--text)]">{entry.action || 'ACTION'}</span>{' '}on {entry.entityType || 'entity'}</p>
                            </div>
                        ))}
                        {!auditLogs.length && !isLoading ? <div className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text2)]">No audit logs found.</div> : null}
                    </div>
                </SectionCard>

                <section className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border2)] bg-[var(--surface)] p-5 md:grid-cols-3">
                    <div className="flex items-start gap-3">
                        <UserCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text)]">Verification throughput</h3>
                            <p className="text-xs text-[var(--text2)]">Orders tracked by backend: <span className="text-emerald-300">{isLoading ? '...' : formatNumber(dashboard?.totalOrders)}</span></p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-5 w-5 text-rose-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text)]">Rejection volume</h3>
                            <p className="text-xs text-[var(--text2)]">OCR failed: <span className="text-rose-300">{isLoading ? '...' : formatNumber(ocrStats?.failedCount)}</span></p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Activity className="mt-0.5 h-5 w-5 text-blue-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text)]">Compliance status</h3>
                            <p className="text-xs text-[var(--text2)]">Current OCR confidence: <span className="text-blue-300">{isLoading ? '...' : `${Number(ocrStats?.avgConfidence || 0).toFixed(2)}%`}</span></p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
