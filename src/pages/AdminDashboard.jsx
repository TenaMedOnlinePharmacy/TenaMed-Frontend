import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    ScrollText,
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
    adminGetHospitalStats,
    adminMedicineCreate,
    adminMedicineDelete,
    adminMedicineUpdate,
    adminGetOcrStats,
    adminGetPendingHospitals,
    adminGetPendingPharmacies,
    adminGetPharmacyStats,
    adminGetPrescriptions,
    adminRejectHospital,
    adminRejectPharmacy,
    adminSearchHospitals,
    adminSearchPharmacies,
    adminSuspendHospital,
    adminSuspendPharmacy,
    adminUnsuspendHospital,
    adminUnsuspendPharmacy,
    medicineGetAll,
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
    const [pendingHospitals, setPendingHospitals] = useState([]);
    const [pendingPharmacies, setPendingPharmacies] = useState([]);
    const [hospitalStats, setHospitalStats] = useState(null);
    const [pharmacyStats, setPharmacyStats] = useState(null);
    const [prescriptionStatus, setPrescriptionStatus] = useState('');
    const [prescriptionHighRisk, setPrescriptionHighRisk] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [medicineKeyword, setMedicineKeyword] = useState('');
    const [medicineId, setMedicineId] = useState('');
    const [isMedicineLoading, setIsMedicineLoading] = useState(false);
    const [hospitalSearchName, setHospitalSearchName] = useState('');
    const [pharmacySearchName, setPharmacySearchName] = useState('');
    const [hospitalSearchResults, setHospitalSearchResults] = useState([]);
    const [pharmacySearchResults, setPharmacySearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const hospitalSearchSeq = useRef(0);
    const pharmacySearchSeq = useRef(0);
    const [medicineForm, setMedicineForm] = useState({
        name: '',
        genericName: '',
        category: '',
        dosageForm: '',
        therapeuticClass: '',
        schedule: '',
        needManualReview: false,
        doseValue: '',
        doseUnit: '',
        regulatoryCode: '',
        indications: '',
        contraindications: '',
        sideEffects: '',
        dosageInstructions: '',
        pregnancyCategory: '',
        requiresPrescription: false,
        allergens: '',
    });

    const getPrescriptionQuery = (overrides = {}) => {
        const status = overrides.status !== undefined ? overrides.status : prescriptionStatus;
        const risk = overrides.highRisk !== undefined ? overrides.highRisk : prescriptionHighRisk;
        const params = { page: 0, size: 8 };
        if (String(status).trim()) params.status = String(status).trim();
        if (risk === 'true') params.highRisk = true;
        else if (risk === 'false') params.highRisk = false;
        return params;
    };

    const refreshPrescriptions = async (overrides = {}) => {
        try {
            const res = await adminGetPrescriptions(getPrescriptionQuery(overrides));
            setPrescriptions(Array.isArray(res?.data?.content) ? res.data.content : []);
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Unable to load prescriptions.');
        }
    };

    const loadDashboard = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const [
                dashboardRes,
                ocrRes,
                prescriptionsRes,
                auditRes,
                pendingHRes,
                pendingPRes,
                hospStatsRes,
                pharmStatsRes,
            ] = await Promise.all([
                adminGetDashboard(),
                adminGetOcrStats(),
                adminGetPrescriptions(getPrescriptionQuery()),
                adminGetAuditLogs({ page: 0, size: 8 }),
                adminGetPendingHospitals(),
                adminGetPendingPharmacies(),
                adminGetHospitalStats(),
                adminGetPharmacyStats(),
            ]);

            setDashboard(dashboardRes?.data || {});
            setOcrStats(ocrRes?.data || {});
            setPrescriptions(Array.isArray(prescriptionsRes?.data?.content) ? prescriptionsRes.data.content : []);
            setAuditLogs(Array.isArray(auditRes?.data?.content) ? auditRes.data.content : []);
            setPendingHospitals(Array.isArray(pendingHRes?.data) ? pendingHRes.data : []);
            setPendingPharmacies(Array.isArray(pendingPRes?.data) ? pendingPRes.data : []);
            setHospitalStats(hospStatsRes?.data && typeof hospStatsRes.data === 'object' ? hospStatsRes.data : {});
            setPharmacyStats(pharmStatsRes?.data && typeof pharmStatsRes.data === 'object' ? pharmStatsRes.data : {});
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Unable to load admin dashboard data right now.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadMedicines = async () => {
        setIsMedicineLoading(true);
        try {
            const res = await medicineGetAll();
            setMedicines(Array.isArray(res?.data) ? res.data : []);
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Unable to load medicines.');
        } finally {
            setIsMedicineLoading(false);
        }
    };

    useEffect(() => {
        loadMedicines();
    }, []);

    const filteredMedicines = useMemo(() => {
        const keyword = medicineKeyword.trim().toLowerCase();
        if (!keyword) return medicines;
        return medicines.filter((m) => {
            const name = String(m?.name || '').toLowerCase();
            const category = String(m?.category || '').toLowerCase();
            const genericName = String(m?.genericName || '').toLowerCase();
            return name.includes(keyword) || category.includes(keyword) || genericName.includes(keyword);
        });
    }, [medicines, medicineKeyword]);

    const buildMedicinePayload = () => {
        const normalizeAllergens = (input) => String(input || '')
            .split(/[,\n]/g)
            .map((item) => item.trim())
            .filter(Boolean);

        return {
            name: String(medicineForm.name || '').trim(),
            genericName: String(medicineForm.genericName || '').trim() || null,
            category: String(medicineForm.category || '').trim(),
            dosageForm: String(medicineForm.dosageForm || '').trim(),
            therapeuticClass: String(medicineForm.therapeuticClass || '').trim() || null,
            schedule: String(medicineForm.schedule || '').trim() || null,
            needManualReview: Boolean(medicineForm.needManualReview),
            doseValue: String(medicineForm.doseValue || '').trim() ? Number(medicineForm.doseValue) : null,
            doseUnit: String(medicineForm.doseUnit || '').trim() || null,
            regulatoryCode: String(medicineForm.regulatoryCode || '').trim() || null,
            indications: String(medicineForm.indications || '').trim() || null,
            contraindications: String(medicineForm.contraindications || '').trim() || null,
            sideEffects: String(medicineForm.sideEffects || '').trim() || null,
            dosageInstructions: String(medicineForm.dosageInstructions || '').trim() || null,
            pregnancyCategory: String(medicineForm.pregnancyCategory || '').trim().slice(0, 1) || null,
            requiresPrescription: Boolean(medicineForm.requiresPrescription),
            allergens: normalizeAllergens(medicineForm.allergens),
        };
    };

    const resetMedicineForm = () => {
        setMedicineId('');
        setMedicineForm({
            name: '',
            genericName: '',
            category: '',
            dosageForm: '',
            therapeuticClass: '',
            schedule: '',
            needManualReview: false,
            doseValue: '',
            doseUnit: '',
            regulatoryCode: '',
            indications: '',
            contraindications: '',
            sideEffects: '',
            dosageInstructions: '',
            pregnancyCategory: '',
            requiresPrescription: false,
            allergens: '',
        });
    };

    useEffect(() => {
        const query = hospitalSearchName.trim();
        if (query.length < 2) {
            setHospitalSearchResults([]);
            return;
        }

        const seq = ++hospitalSearchSeq.current;
        const timer = setTimeout(async () => {
            setIsSearchLoading(true);
            try {
                const res = await adminSearchHospitals(query);
                if (seq !== hospitalSearchSeq.current) return;
                setHospitalSearchResults(Array.isArray(res?.data) ? res.data : []);
            } catch (error) {
                if (seq !== hospitalSearchSeq.current) return;
                setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to search hospitals.');
            } finally {
                if (seq === hospitalSearchSeq.current) setIsSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [hospitalSearchName]);

    useEffect(() => {
        const query = pharmacySearchName.trim();
        if (query.length < 2) {
            setPharmacySearchResults([]);
            return;
        }

        const seq = ++pharmacySearchSeq.current;
        const timer = setTimeout(async () => {
            setIsSearchLoading(true);
            try {
                const res = await adminSearchPharmacies(query);
                if (seq !== pharmacySearchSeq.current) return;
                setPharmacySearchResults(Array.isArray(res?.data) ? res.data : []);
            } catch (error) {
                if (seq !== pharmacySearchSeq.current) return;
                setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to search pharmacies.');
            } finally {
                if (seq === pharmacySearchSeq.current) setIsSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [pharmacySearchName]);

    const createMedicine = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        setIsMedicineLoading(true);
        try {
            const payload = buildMedicinePayload();
            const res = await adminMedicineCreate(payload);
            setSuccessMsg(res?.data?.message || 'Medicine created successfully.');
            await loadMedicines();
            resetMedicineForm();
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to create medicine.');
        } finally {
            setIsMedicineLoading(false);
        }
    };

    const updateMedicine = async () => {
        if (!medicineId.trim()) {
            setErrorMsg('Please enter a medicine UUID to update.');
            setSuccessMsg('');
            return;
        }
        setErrorMsg('');
        setSuccessMsg('');
        setIsMedicineLoading(true);
        try {
            const payload = buildMedicinePayload();
            const res = await adminMedicineUpdate(medicineId.trim(), payload);
            setSuccessMsg(res?.data?.message || 'Medicine updated successfully.');
            await loadMedicines();
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to update medicine.');
        } finally {
            setIsMedicineLoading(false);
        }
    };

    const deleteMedicine = async () => {
        if (!medicineId.trim()) {
            setErrorMsg('Please enter a medicine UUID to delete.');
            setSuccessMsg('');
            return;
        }
        setErrorMsg('');
        setSuccessMsg('');
        setIsMedicineLoading(true);
        try {
            const res = await adminMedicineDelete(medicineId.trim());
            setSuccessMsg(res?.data?.message || 'Medicine deleted successfully.');
            await loadMedicines();
            resetMedicineForm();
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to delete medicine.');
        } finally {
            setIsMedicineLoading(false);
        }
    };

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

                <SectionCard title="Facility verification snapshot" icon={ClipboardCheck}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-[var(--text)]">Hospitals</p>
                            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                {['total', 'verified', 'rejected', 'suspended'].map((key) => (
                                    <div key={key} className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2">
                                        <span className="capitalize text-[var(--text2)]">{key}</span>
                                        <span className="font-semibold text-[var(--text)]">{isLoading ? '...' : formatNumber(hospitalStats?.[key])}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text3)]">
                                Pending approval (GET <span className="font-mono">/api/admin/hospitals/pending</span>):{' '}
                                <span className="font-semibold text-amber-300">{isLoading ? '...' : formatNumber(pendingHospitals.length)}</span>
                            </p>
                            <div className="mt-3 rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3">
                                <p className="mb-2 text-xs font-semibold text-[var(--text2)]">Search hospitals by name</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={hospitalSearchName}
                                        onChange={(e) => setHospitalSearchName(e.target.value)}
                                        placeholder="e.g. St Mary"
                                        className="w-full rounded-lg border border-[var(--border2)] bg-transparent px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                                <p className="mt-2 text-[11px] text-[var(--text3)]">
                                    Type 2+ characters to get suggestions. {isSearchLoading ? 'Searching…' : null}
                                </p>
                                {hospitalSearchResults.length ? (
                                    <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm">
                                        {hospitalSearchResults.slice(0, 12).map((h) => (
                                            <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border2)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                                                <span className="text-[var(--text2)]">{h.name || h.id}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setHospitalId(String(h.id));
                                                        setSuccessMsg('Hospital UUID filled in from search.');
                                                        setErrorMsg('');
                                                    }}
                                                    className="shrink-0 rounded-md border border-[rgba(var(--accent-rgb),0.35)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.12)]"
                                                >
                                                    Use ID
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-[var(--text)]">Pharmacies</p>
                            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                {['total', 'verified', 'rejected', 'suspended'].map((key) => (
                                    <div key={key} className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2">
                                        <span className="capitalize text-[var(--text2)]">{key}</span>
                                        <span className="font-semibold text-[var(--text)]">{isLoading ? '...' : formatNumber(pharmacyStats?.[key])}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text3)]">
                                Pending approval (GET <span className="font-mono">/api/admin/pharmacies/pending</span>):{' '}
                                <span className="font-semibold text-amber-300">{isLoading ? '...' : formatNumber(pendingPharmacies.length)}</span>
                            </p>
                            <div className="mt-3 rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3">
                                <p className="mb-2 text-xs font-semibold text-[var(--text2)]">Search pharmacies by name</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={pharmacySearchName}
                                        onChange={(e) => setPharmacySearchName(e.target.value)}
                                        placeholder="e.g. Central Pharmacy"
                                        className="w-full rounded-lg border border-[var(--border2)] bg-transparent px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                                <p className="mt-2 text-[11px] text-[var(--text3)]">
                                    Type 2+ characters to get suggestions. {isSearchLoading ? 'Searching…' : null}
                                </p>
                                {pharmacySearchResults.length ? (
                                    <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm">
                                        {pharmacySearchResults.slice(0, 12).map((p) => (
                                            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border2)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                                                <span className="text-[var(--text2)]">{p.name || p.legalName || p.id}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPharmacyId(String(p.id));
                                                        setSuccessMsg('Pharmacy UUID filled in from search.');
                                                        setErrorMsg('');
                                                    }}
                                                    className="shrink-0 rounded-md border border-[rgba(var(--accent-rgb),0.35)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.12)]"
                                                >
                                                    Use ID
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="mb-2 text-sm font-semibold text-[var(--text)]">Pending hospitals</p>
                            <ul className="max-h-44 space-y-2 overflow-y-auto text-sm">
                                {pendingHospitals.slice(0, 12).map((h) => (
                                    <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2">
                                        <span className="text-[var(--text2)]">{h.name || h.id}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setHospitalId(String(h.id));
                                                setSuccessMsg('Hospital UUID filled in — choose an action below.');
                                                setErrorMsg('');
                                            }}
                                            className="shrink-0 rounded-md border border-[rgba(var(--accent-rgb),0.35)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.12)]"
                                        >
                                            Use ID
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {!pendingHospitals.length && !isLoading ? (
                                <p className="text-sm text-[var(--text2)]">No hospitals awaiting approval.</p>
                            ) : null}
                        </div>
                        <div>
                            <p className="mb-2 text-sm font-semibold text-[var(--text)]">Pending pharmacies</p>
                            <ul className="max-h-44 space-y-2 overflow-y-auto text-sm">
                                {pendingPharmacies.slice(0, 12).map((p) => (
                                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2">
                                        <span className="text-[var(--text2)]">{p.name || p.legalName || p.id}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPharmacyId(String(p.id));
                                                setSuccessMsg('Pharmacy UUID filled in — choose an action below.');
                                                setErrorMsg('');
                                            }}
                                            className="shrink-0 rounded-md border border-[rgba(var(--accent-rgb),0.35)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.12)]"
                                        >
                                            Use ID
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {!pendingPharmacies.length && !isLoading ? (
                                <p className="text-sm text-[var(--text2)]">No pharmacies awaiting approval.</p>
                            ) : null}
                        </div>
                    </div>
                </SectionCard>

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

                <SectionCard
                    title="Medicine Management"
                    icon={Package2}
                    action={(
                        <button
                            type="button"
                            onClick={loadMedicines}
                            className="rounded-xl border border-[rgba(var(--accent-rgb),0.3)] bg-[rgba(var(--accent-rgb),0.08)] px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.12)] disabled:opacity-50"
                            disabled={isMedicineLoading}
                        >
                            Refresh medicines
                        </button>
                    )}
                >
                    <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-200">
                        <div className="font-semibold">Admin write API</div>
                        <div className="mt-1 text-blue-200/80">
                            POST <span className="font-mono text-xs">/api/admin/medicines</span> • PUT <span className="font-mono text-xs">/api/admin/medicines/{'{id}'}</span> • DELETE <span className="font-mono text-xs">/api/admin/medicines/{'{id}'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-[var(--text)]">Medicines</p>
                                <span className="text-xs text-[var(--text3)]">{isMedicineLoading ? 'Loading...' : `${filteredMedicines.length} items`}</span>
                            </div>
                            <input
                                type="text"
                                value={medicineKeyword}
                                onChange={(event) => setMedicineKeyword(event.target.value)}
                                placeholder="Search by name / generic name / category"
                                className="mb-3 w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none transition focus:border-[var(--accent)]"
                            />
                            <ul className="max-h-96 space-y-2 overflow-y-auto text-sm">
                                {filteredMedicines.slice(0, 30).map((m) => (
                                    <li key={m.id} className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-[var(--text)]">{m.name}</p>
                                                <p className="mt-0.5 text-xs text-[var(--text3)]">
                                                    {m.genericName ? `Generic: ${m.genericName} • ` : null}
                                                    {m.category ? `Category: ${m.category} • ` : null}
                                                    {m.dosageForm ? `Form: ${m.dosageForm}` : null}
                                                </p>
                                                <p className="mt-1 break-all font-mono text-[10px] text-[var(--text3)]">{m.id}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMedicineId(String(m.id || ''));
                                                    setMedicineForm((prev) => ({
                                                        ...prev,
                                                        name: m?.name || '',
                                                        genericName: m?.genericName || '',
                                                        category: m?.category || '',
                                                        dosageForm: m?.dosageForm || '',
                                                        therapeuticClass: m?.therapeuticClass || '',
                                                        schedule: m?.schedule || '',
                                                        needManualReview: Boolean(m?.needManualReview),
                                                        doseValue: m?.doseValue ?? '',
                                                        doseUnit: m?.doseUnit || '',
                                                        regulatoryCode: m?.regulatoryCode || '',
                                                        indications: m?.indications || '',
                                                        contraindications: m?.contraindications || '',
                                                        sideEffects: m?.sideEffects || '',
                                                        dosageInstructions: m?.dosageInstructions || '',
                                                        pregnancyCategory: m?.pregnancyCategory || '',
                                                        requiresPrescription: Boolean(m?.requiresPrescription),
                                                        allergens: '',
                                                    }));
                                                    setSuccessMsg('Medicine loaded into form. You can update or delete it.');
                                                    setErrorMsg('');
                                                }}
                                                className="shrink-0 rounded-md border border-[rgba(var(--accent-rgb),0.35)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.12)]"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {!filteredMedicines.length && !isMedicineLoading ? (
                                <div className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text2)]">
                                    No medicines found.
                                </div>
                            ) : null}
                        </div>

                        <div>
                            <p className="mb-3 text-sm font-semibold text-[var(--text)]">Create / update medicine</p>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={medicineId}
                                    onChange={(event) => setMedicineId(event.target.value)}
                                    placeholder="Medicine UUID (needed for update/delete)"
                                    className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none transition focus:border-[var(--accent)]"
                                />

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <input type="text" value={medicineForm.name} onChange={(e) => setMedicineForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name *" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="text" value={medicineForm.genericName} onChange={(e) => setMedicineForm((p) => ({ ...p, genericName: e.target.value }))} placeholder="Generic name" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="text" value={medicineForm.category} onChange={(e) => setMedicineForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category *" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="text" value={medicineForm.dosageForm} onChange={(e) => setMedicineForm((p) => ({ ...p, dosageForm: e.target.value }))} placeholder="Dosage form *" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="text" value={medicineForm.therapeuticClass} onChange={(e) => setMedicineForm((p) => ({ ...p, therapeuticClass: e.target.value }))} placeholder="Therapeutic class" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="text" value={medicineForm.schedule} onChange={(e) => setMedicineForm((p) => ({ ...p, schedule: e.target.value }))} placeholder="Schedule" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="number" value={medicineForm.doseValue} onChange={(e) => setMedicineForm((p) => ({ ...p, doseValue: e.target.value }))} placeholder="Dose value" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="text" value={medicineForm.doseUnit} onChange={(e) => setMedicineForm((p) => ({ ...p, doseUnit: e.target.value }))} placeholder="Dose unit (mg, ml...)" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="text" value={medicineForm.regulatoryCode} onChange={(e) => setMedicineForm((p) => ({ ...p, regulatoryCode: e.target.value }))} placeholder="Regulatory code" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                    <input type="text" maxLength={1} value={medicineForm.pregnancyCategory} onChange={(e) => setMedicineForm((p) => ({ ...p, pregnancyCategory: e.target.value }))} placeholder="Pregnancy category (1 char)" className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <label className="flex items-center gap-2 rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text2)]">
                                        <input type="checkbox" checked={medicineForm.needManualReview} onChange={(e) => setMedicineForm((p) => ({ ...p, needManualReview: e.target.checked }))} />
                                        Need manual review
                                    </label>
                                    <label className="flex items-center gap-2 rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text2)]">
                                        <input type="checkbox" checked={medicineForm.requiresPrescription} onChange={(e) => setMedicineForm((p) => ({ ...p, requiresPrescription: e.target.checked }))} />
                                        Requires prescription
                                    </label>
                                    <button
                                        type="button"
                                        onClick={resetMedicineForm}
                                        className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[rgba(255,255,255,0.04)]"
                                    >
                                        Clear form
                                    </button>
                                </div>

                                <textarea value={medicineForm.indications} onChange={(e) => setMedicineForm((p) => ({ ...p, indications: e.target.value }))} placeholder="Indications" rows={3} className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                <textarea value={medicineForm.contraindications} onChange={(e) => setMedicineForm((p) => ({ ...p, contraindications: e.target.value }))} placeholder="Contraindications" rows={3} className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                <textarea value={medicineForm.sideEffects} onChange={(e) => setMedicineForm((p) => ({ ...p, sideEffects: e.target.value }))} placeholder="Side effects" rows={3} className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />
                                <textarea value={medicineForm.dosageInstructions} onChange={(e) => setMedicineForm((p) => ({ ...p, dosageInstructions: e.target.value }))} placeholder="Dosage instructions" rows={3} className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]" />

                                <input
                                    type="text"
                                    value={medicineForm.allergens}
                                    onChange={(e) => setMedicineForm((p) => ({ ...p, allergens: e.target.value }))}
                                    placeholder="Allergens (comma-separated names)"
                                    className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none focus:border-[var(--accent)]"
                                />

                                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                    <button type="button" disabled={isMedicineLoading} onClick={createMedicine} className="rounded-md border border-emerald-500/40 px-2.5 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50">Create</button>
                                    <button type="button" disabled={isMedicineLoading} onClick={updateMedicine} className="rounded-md border border-blue-500/40 px-2.5 py-2 text-sm font-semibold text-blue-300 hover:bg-blue-500/10 disabled:opacity-50">Update</button>
                                    <button type="button" disabled={isMedicineLoading} onClick={deleteMedicine} className="rounded-md border border-rose-500/40 px-2.5 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <SectionCard title="Prescription Monitoring" icon={FileSearch}>
                        <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-200">
                            <span className="font-semibold">GET /api/admin/prescriptions</span>
                            <span className="text-blue-200/80"> — optional query params: </span>
                            <span className="font-mono text-xs">status</span>
                            <span className="text-blue-200/80">, </span>
                            <span className="font-mono text-xs">highRisk</span>
                            <span className="text-blue-200/80">, pagination</span>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <select
                                value={prescriptionStatus}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setPrescriptionStatus(value);
                                    refreshPrescriptions({ status: value });
                                }}
                                className="min-w-[10rem] rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                            >
                                <option value="">All statuses</option>
                                <option value="PENDING">PENDING</option>
                                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                            <select
                                value={prescriptionHighRisk}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setPrescriptionHighRisk(value);
                                    refreshPrescriptions({ highRisk: value });
                                }}
                                className="min-w-[11rem] rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                            >
                                <option value="">All risk levels</option>
                                <option value="true">High risk only</option>
                                <option value="false">Low risk only</option>
                            </select>
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

                <SectionCard title="Audit Logs" icon={ScrollText}>
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
