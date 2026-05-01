import React from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    FileSearch,
    Package2,
    Pill,
    ScanSearch,
    Search,
    ShieldAlert,
    Stethoscope,
    Store,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';

const kpiCards = [
    { label: 'Total users', value: '18,420', delta: '+8.2%', icon: Users },
    { label: 'Total hospitals', value: '112', delta: '+3.1%', icon: Building2 },
    { label: 'Total pharmacies', value: '287', delta: '+5.4%', icon: Store },
    { label: 'Total products', value: '9,673', delta: '+11.7%', icon: Package2 },
    { label: 'Orders (completed / rejected)', value: '4,806 / 219', delta: '95.6% success', icon: ClipboardCheck },
    { label: 'Average OCR score', value: '89.4%', delta: '+1.8%', icon: ScanSearch },
];

const ocrStats = [
    { label: 'OCR today', value: '483' },
    { label: 'OCR this month', value: '11,249' },
    { label: 'OCR this year', value: '131,772' },
    { label: 'Pass / fail rate', value: '91.2% / 8.8%' },
];

const hospitals = [
    { name: 'St. Nova Medical Center', status: 'Pending', doctors: 26 },
    { name: 'Alpha Heart Institute', status: 'Verified', doctors: 41 },
    { name: 'Nile Regional Hospital', status: 'Rejected', doctors: 13 },
];

const doctors = [
    { name: 'Dr. Hana M.', hospital: 'St. Nova Medical Center', specialization: 'Cardiology', license: 'ETH-MD-22781', status: 'Pending' },
    { name: 'Dr. Abel K.', hospital: 'Alpha Heart Institute', specialization: 'Neurology', license: 'ETH-MD-34019', status: 'Verified' },
    { name: 'Dr. Saron T.', hospital: 'Nile Regional Hospital', specialization: 'Orthopedics', license: 'ETH-MD-18672', status: 'Flagged' },
];

const pharmacies = [
    { name: 'Aster Pharmacy', status: 'Verified', products: 812, audit: '2 hours ago' },
    { name: 'MedBridge Rx', status: 'Pending', products: 430, audit: '1 day ago' },
    { name: 'Delta Care Drugs', status: 'Suspended', products: 269, audit: '3 days ago' },
];

const prescriptions = [
    { id: 'RX-9011', status: 'PENDING', highRisk: true, manualReview: 'Required' },
    { id: 'RX-9012', status: 'UNDER_REVIEW', highRisk: false, manualReview: 'In progress' },
    { id: 'RX-9013', status: 'APPROVED', highRisk: false, manualReview: 'Completed' },
    { id: 'RX-9014', status: 'REJECTED', highRisk: true, manualReview: 'Completed' },
];

const auditLog = [
    'Admin approved hospital: Alpha Heart Institute',
    'Pharmacist rejected prescription: RX-9014 (low OCR confidence)',
    'Admin verified doctor: Dr. Abel K. (ETH-MD-34019)',
    'Admin suspended pharmacy: Delta Care Drugs',
];

const badgeStyles = {
    Verified: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    Pending: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    Rejected: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    Suspended: 'bg-red-500/10 text-red-300 border border-red-500/30',
    Flagged: 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30',
};

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

const AdminDashboard = () => {
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
                            <button type="button" className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold">
                                Export Audit Snapshot
                            </button>
                        </div>
                    </div>
                </div>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {kpiCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <article
                                key={card.label}
                                className="rounded-2xl border border-[var(--border2)] bg-[var(--surface)] p-5 shadow-[0_0_0_1px_rgba(var(--accent-rgb),0.06),0_10px_30px_rgba(0,0,0,0.28)]"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-[var(--text2)]">{card.label}</p>
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(var(--accent-rgb),0.25)] bg-[rgba(var(--accent-rgb),0.1)]">
                                        <Icon className="h-4 w-4 text-[var(--accent)]" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-[var(--text)]">{card.value}</div>
                                <div className="mt-1 text-xs font-medium text-emerald-400">{card.delta}</div>
                            </article>
                        );
                    })}
                </section>

                <SectionCard title="Hospital Management" icon={Building2} action={<button type="button" className="btn-primary rounded-lg px-3 py-1.5 text-xs">View hospital profile</button>}>
                    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3 text-sm text-[var(--text2)]">Total hospitals: <span className="font-semibold text-[var(--text)]">112</span></div>
                        <div className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3 text-sm text-[var(--text2)]">Verified: <span className="font-semibold text-emerald-400">79</span></div>
                        <div className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3 text-sm text-[var(--text2)]">Pending: <span className="font-semibold text-amber-300">21</span></div>
                        <div className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3 text-sm text-[var(--text2)]">Rejected: <span className="font-semibold text-rose-300">12</span></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[var(--text3)]">
                                <tr>
                                    <th className="pb-3">Hospital</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Doctor count</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border2)]">
                                {hospitals.map((hospital) => (
                                    <tr key={hospital.name}>
                                        <td className="py-3 font-semibold text-[var(--text)]">{hospital.name}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${badgeStyles[hospital.status]}`}>{hospital.status}</span>
                                        </td>
                                        <td className="py-3 text-[var(--text2)]">{hospital.doctors}</td>
                                        <td className="py-3 text-right">
                                            <div className="inline-flex gap-2">
                                                <button type="button" className="rounded-md border border-emerald-500/40 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10">Approve</button>
                                                <button type="button" className="rounded-md border border-rose-500/40 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Reject</button>
                                                <button type="button" className="rounded-md border border-amber-500/40 px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-500/10">Suspend / Unsuspend</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="Doctor Management" icon={Stethoscope} action={<button type="button" className="btn-secondary rounded-lg px-3 py-1.5 text-xs">Flag suspicious activity</button>}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[var(--text3)]">
                                <tr>
                                    <th className="pb-3">Doctor</th>
                                    <th className="pb-3">Hospital</th>
                                    <th className="pb-3">Specialization</th>
                                    <th className="pb-3">License</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border2)]">
                                {doctors.map((doctor) => (
                                    <tr key={doctor.license}>
                                        <td className="py-3 font-semibold text-[var(--text)]">{doctor.name}</td>
                                        <td className="py-3 text-[var(--text2)]">{doctor.hospital}</td>
                                        <td className="py-3 text-[var(--text2)]">{doctor.specialization}</td>
                                        <td className="py-3 font-mono text-xs text-[var(--text2)]">{doctor.license}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${badgeStyles[doctor.status] || badgeStyles.Pending}`}>{doctor.status}</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="inline-flex gap-2">
                                                <button type="button" className="rounded-md border border-emerald-500/40 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10">Verify</button>
                                                <button type="button" className="rounded-md border border-rose-500/40 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Reject</button>
                                                <button type="button" className="rounded-md border border-fuchsia-500/40 px-2.5 py-1 text-xs text-fuchsia-300 hover:bg-fuchsia-500/10">Flag</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="Pharmacy Management" icon={Store} action={<button type="button" className="btn-primary rounded-lg px-3 py-1.5 text-xs">View pharmacy details</button>}>
                    <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text3)]" />
                            <input
                                type="text"
                                placeholder="Search pharmacy..."
                                className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--text)] placeholder-[var(--text3)] outline-none transition focus:border-[var(--accent)]"
                            />
                        </div>
                        <button type="button" className="btn-secondary rounded-xl px-4 py-2.5 text-sm">View products + audit history</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[var(--text3)]">
                                <tr>
                                    <th className="pb-3">Pharmacy</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Products</th>
                                    <th className="pb-3">Last audit</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border2)]">
                                {pharmacies.map((pharmacy) => (
                                    <tr key={pharmacy.name}>
                                        <td className="py-3 font-semibold text-[var(--text)]">{pharmacy.name}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${badgeStyles[pharmacy.status] || badgeStyles.Pending}`}>{pharmacy.status}</span>
                                        </td>
                                        <td className="py-3 text-[var(--text2)]">{pharmacy.products}</td>
                                        <td className="py-3 text-[var(--text2)]">{pharmacy.audit}</td>
                                        <td className="py-3 text-right">
                                            <div className="inline-flex gap-2">
                                                <button type="button" className="rounded-md border border-emerald-500/40 px-2.5 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10">Verify</button>
                                                <button type="button" className="rounded-md border border-rose-500/40 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Reject</button>
                                                <button type="button" className="rounded-md border border-amber-500/40 px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-500/10">Suspend / Unsuspend</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <SectionCard title="Prescription Monitoring" icon={FileSearch}>
                        <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-200">
                            Workflow: <span className="font-semibold">PENDING</span> -&gt; <span className="font-semibold">UNDER_REVIEW</span> -&gt; <span className="font-semibold">APPROVED / REJECTED</span>
                        </div>
                        <div className="space-y-3">
                            {prescriptions.map((entry) => (
                                <article key={entry.id} className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-[var(--text)]">{entry.id}</p>
                                            <p className="text-xs text-[var(--text3)]">OCR processed • Manual review: {entry.manualReview}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${workflowStyles[entry.status]}`}>{entry.status}</span>
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
                        </div>
                        <div className="mt-4 grid gap-2 text-xs text-[var(--text2)] sm:grid-cols-3">
                            <div className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] p-2.5">Doctor exists: <span className="text-emerald-300">checked</span></div>
                            <div className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] p-2.5">Doctor belongs hospital: <span className="text-emerald-300">checked</span></div>
                            <div className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] p-2.5">Hospital verified: <span className="text-emerald-300">checked</span></div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Medicine Management" icon={Pill}>
                        <div className="mb-4 grid grid-cols-2 gap-3">
                            <button type="button" className="btn-primary rounded-xl px-4 py-2.5 text-sm">Add medicine</button>
                            <button type="button" className="btn-secondary rounded-xl px-4 py-2.5 text-sm">Edit medicine</button>
                            <button type="button" className="rounded-xl border border-[var(--border2)] bg-[var(--surface2)] px-4 py-2.5 text-sm text-[var(--text2)] hover:text-[var(--text)]">Soft delete</button>
                            <button type="button" className="rounded-xl border border-[var(--border2)] bg-[var(--surface2)] px-4 py-2.5 text-sm text-[var(--text2)] hover:text-[var(--text)]">Ingredient linkage</button>
                        </div>
                        <div className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] p-4 text-sm text-[var(--text2)]">
                            <p className="mb-2 font-semibold text-[var(--text)]">Search & pagination</p>
                            <p>Use medicine search with pagination and role-safe management actions from this panel.</p>
                        </div>
                    </SectionCard>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <SectionCard title="Inventory Insights" icon={Activity}>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5">
                                <span className="text-[var(--text2)]">Total products per pharmacy</span>
                                <span className="font-semibold text-[var(--text)]">Avg 512</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5">
                                <span className="text-[var(--text2)]">Out-of-stock tracking</span>
                                <span className="font-semibold text-rose-300">143 items</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5">
                                <span className="text-[var(--text2)]">Price anomalies</span>
                                <span className="font-semibold text-amber-300">34 alerts</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5">
                                <span className="text-[var(--text2)]">Duplicate detection</span>
                                <span className="font-semibold text-fuchsia-300">21 duplicates</span>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="OCR Analytics" icon={ScanSearch}>
                        <div className="space-y-2.5 text-sm">
                            {ocrStats.map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5">
                                    <span className="text-[var(--text2)]">{stat.label}</span>
                                    <span className="font-semibold text-[var(--text)]">{stat.value}</span>
                                </div>
                            ))}
                            <div className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-[var(--text2)]">
                                Failure reasons: low image quality, mismatched medicine name, missing doctor seal.
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5">
                                <span className="text-[var(--text2)]">Low confidence cases</span>
                                <span className="font-semibold text-amber-300">17.4%</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5">
                                <span className="text-[var(--text2)]">Pharmacist override rate</span>
                                <span className="font-semibold text-blue-300">6.1%</span>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Audit Logs" icon={FileSearch}>
                        <div className="space-y-2.5">
                            {auditLog.map((entry) => (
                                <div key={entry} className="rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text2)]">
                                    <div className="mb-1 flex items-center gap-2 text-xs text-[var(--text3)]">
                                        <AlertTriangle className="h-3.5 w-3.5 text-[var(--accent)]" />
                                        Event timestamped
                                    </div>
                                    <p>{entry}</p>
                                </div>
                            ))}
                            <button type="button" className="w-full rounded-lg border border-[var(--border2)] bg-[var(--surface2)] px-3 py-2 text-sm font-semibold text-[var(--text2)] hover:text-[var(--text)]">
                                View full activity history
                            </button>
                        </div>
                    </SectionCard>
                </div>

                <section className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border2)] bg-[var(--surface)] p-5 md:grid-cols-3">
                    <div className="flex items-start gap-3">
                        <UserCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text)]">Verification throughput</h3>
                            <p className="text-xs text-[var(--text2)]">Hospitals/doctors/pharmacies verified in the last 24h: <span className="text-emerald-300">47</span></p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-5 w-5 text-rose-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text)]">Rejection volume</h3>
                            <p className="text-xs text-[var(--text2)]">Entity and prescription rejections in the last 24h: <span className="text-rose-300">19</span></p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <FileSearch className="mt-0.5 h-5 w-5 text-blue-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text)]">Compliance status</h3>
                            <p className="text-xs text-[var(--text2)]">Current compliance health index: <span className="text-blue-300">92 / 100</span></p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
