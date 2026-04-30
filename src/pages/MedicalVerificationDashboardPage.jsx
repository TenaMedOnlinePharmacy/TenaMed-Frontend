import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const initialQueue = [
    { id: 'HV-301', name: 'Saint Mark Hospital', type: 'Hospital', docs: 3, status: 'Pending' },
    { id: 'DV-178', name: 'Dr. Hana M.', type: 'Doctor', docs: 2, status: 'Pending' },
    { id: 'DV-179', name: 'Dr. Solomon R.', type: 'Doctor', docs: 2, status: 'Pending' },
];

const MedicalVerificationDashboardPage = () => {
    const [queue, setQueue] = useState(initialQueue);

    const updateStatus = (id, status) => {
        setQueue((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    };

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-12 relative z-10 transition-colors">
            <div className="nova-main">
                <div className="mb-8">
                    <h1 className="font-syne text-3xl font-bold text-[var(--text)] tracking-tight">Medical Verification Dashboard</h1>
                    <p className="text-sm text-[var(--text2)] font-light mt-1">Review hospital and doctor credentials and mark as verified or rejected.</p>
                </div>

                <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 relative z-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                <tr>
                                    <th className="p-4 font-medium tracking-wide">Queue ID</th>
                                    <th className="p-4 font-medium tracking-wide">Applicant</th>
                                    <th className="p-4 font-medium tracking-wide">Type</th>
                                    <th className="p-4 font-medium tracking-wide">Uploaded Docs</th>
                                    <th className="p-4 font-medium tracking-wide">Status</th>
                                    <th className="p-4 font-medium tracking-wide">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border2)]">
                                {queue.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors text-sm border-b border-[var(--border2)]">
                                        <td className="p-4 font-mono font-semibold text-emerald-500">{entry.id}</td>
                                        <td className="p-4 font-semibold text-[var(--text)]">{entry.name}</td>
                                        <td className="p-4 text-[var(--text2)]">{entry.type}</td>
                                        <td className="p-4 text-[var(--text2)]">{entry.docs} docs</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${entry.status === 'Verified' ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]' : entry.status === 'Rejected' ? 'bg-[rgba(239,68,68,0.1)] text-red-500 border-[rgba(239,68,68,0.2)]' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {entry.status === 'Pending' ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateStatus(entry.id, 'Verified')} className="inline-flex items-center gap-1 text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                                                    </button>
                                                    <button onClick={() => updateStatus(entry.id, 'Rejected')} className="inline-flex items-center gap-1 text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] hover:bg-[rgba(var(--danger-rgb),0.15)] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[var(--text3)] font-semibold">Resolved</span>
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

export default MedicalVerificationDashboardPage;
