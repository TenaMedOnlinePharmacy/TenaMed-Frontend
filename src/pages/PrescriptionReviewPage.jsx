import React, { useState } from 'react';
import { CheckCircle, FileWarning, Search, XCircle } from 'lucide-react';

const initialQueue = [
    {
        id: 'RX-1042',
        patient: 'Marta T.',
        uploadedAt: '2026-04-10 09:32',
        imageQuality: 'Readable',
        risk: 'Critical',
        status: 'Pending',
    },
    {
        id: 'RX-1043',
        patient: 'Daniel A.',
        uploadedAt: '2026-04-10 11:08',
        imageQuality: 'Low quality',
        risk: 'Standard',
        status: 'Pending',
    },
    {
        id: 'RX-1044',
        patient: 'Ruth G.',
        uploadedAt: '2026-04-10 13:20',
        imageQuality: 'Readable',
        risk: 'Critical',
        status: 'Reviewed',
    },
];

const PrescriptionReviewPage = () => {
    const [query, setQuery] = useState('');
    const [queue, setQueue] = useState(initialQueue);

    const filtered = queue.filter((row) =>
        [row.id, row.patient, row.imageQuality, row.risk, row.status]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    const markStatus = (id, status) => {
        setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    };

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-12 relative z-10 transition-colors">
            <div className="nova-main max-w-6xl">
                <div className="mb-8">
                    <h1 className="font-syne text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight">Prescription Review Queue</h1>
                    <p className="text-[var(--text2)] font-light mt-2">Review critical and unreadable prescriptions before medicine release.</p>
                </div>

                <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-5 border-b border-[var(--border2)] flex items-center justify-between gap-4 flex-col sm:flex-row">
                        <h2 className="font-syne font-semibold text-lg text-[var(--text)] tracking-tight">Pending Review</h2>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)]" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search prescriptions..."
                                className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border2)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors placeholder-[var(--text3)]"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                <tr>
                                    <th className="p-4 font-medium tracking-wide">Prescription</th>
                                    <th className="p-4 font-medium tracking-wide">Patient</th>
                                    <th className="p-4 font-medium tracking-wide">Uploaded At</th>
                                    <th className="p-4 font-medium tracking-wide">Quality</th>
                                    <th className="p-4 font-medium tracking-wide">Risk</th>
                                    <th className="p-4 font-medium tracking-wide">Status</th>
                                    <th className="p-4 font-medium tracking-wide">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border2)]">
                                {filtered.map((row) => (
                                    <tr key={row.id} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors text-sm">
                                        <td className="p-4 font-mono font-semibold text-[var(--accent)]">{row.id}</td>
                                        <td className="p-4 font-medium text-[var(--text)]">{row.patient}</td>
                                        <td className="p-4 text-[var(--text3)]">{row.uploadedAt}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${row.imageQuality === 'Readable' ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]' : 'bg-[rgba(234,179,8,0.1)] text-yellow-500 border-[rgba(234,179,8,0.2)]'}`}>
                                                <FileWarning className="w-3.5 h-3.5 flex-shrink-0" />
                                                {row.imageQuality}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${row.risk === 'Critical' ? 'bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)] border-[var(--danger-border)]' : 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]'}`}>
                                                {row.risk}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-[var(--text2)]">{row.status}</td>
                                        <td className="p-4">
                                            {row.status === 'Pending' ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => markStatus(row.id, 'Reviewed')} className="inline-flex items-center gap-1.5 text-emerald-500 border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.1)] hover:bg-[rgba(16,185,129,0.15)] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                    </button>
                                                    <button onClick={() => markStatus(row.id, 'Rejected')} className="inline-flex items-center gap-1.5 text-[var(--danger)] border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] hover:bg-[rgba(var(--danger-rgb),0.15)] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
                                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[var(--text3)]">No action</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionReviewPage;
