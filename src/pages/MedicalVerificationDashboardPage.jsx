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
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Medical Verification Dashboard</h1>
                    <p className="text-gray-500 mt-1">Review hospital and doctor credentials and mark as verified or rejected.</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Queue ID</th>
                                <th className="p-4 font-medium">Applicant</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Uploaded Docs</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {queue.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-semibold text-emerald-600">{entry.id}</td>
                                    <td className="p-4 text-gray-800">{entry.name}</td>
                                    <td className="p-4 text-gray-600">{entry.type}</td>
                                    <td className="p-4 text-gray-600">{entry.docs}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${entry.status === 'Verified' ? 'bg-green-100 text-green-700' : entry.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {entry.status === 'Pending' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => updateStatus(entry.id, 'Verified')} className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Verify
                                                </button>
                                                <button onClick={() => updateStatus(entry.id, 'Rejected')} className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500">Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MedicalVerificationDashboardPage;
