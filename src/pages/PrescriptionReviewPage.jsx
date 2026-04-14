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
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Prescription Review Queue</h1>
                    <p className="text-gray-500 mt-1">Review critical and unreadable prescriptions before medicine release.</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-gray-900">Pending Review</h2>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search prescriptions..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">Prescription</th>
                                    <th className="p-4 font-medium">Patient</th>
                                    <th className="p-4 font-medium">Uploaded At</th>
                                    <th className="p-4 font-medium">Quality</th>
                                    <th className="p-4 font-medium">Risk</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-blue-600">{row.id}</td>
                                        <td className="p-4 text-gray-700">{row.patient}</td>
                                        <td className="p-4 text-gray-600">{row.uploadedAt}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${row.imageQuality === 'Readable' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                <FileWarning className="w-3.5 h-3.5" />
                                                {row.imageQuality}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.risk === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {row.risk}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-700">{row.status}</td>
                                        <td className="p-4">
                                            {row.status === 'Pending' ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => markStatus(row.id, 'Reviewed')} className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                    </button>
                                                    <button onClick={() => markStatus(row.id, 'Rejected')} className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">No action</span>
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
