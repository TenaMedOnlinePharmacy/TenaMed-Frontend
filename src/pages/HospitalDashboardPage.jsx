import React, { useMemo, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';

const initialDoctors = [
    { id: 'DOC-201', name: 'Dr. Liya A.', specialty: 'Cardiology', status: 'Verified' },
    { id: 'DOC-202', name: 'Dr. Aman B.', specialty: 'Pediatrics', status: 'Pending' },
];

const HospitalDashboardPage = () => {
    const [doctors, setDoctors] = useState(initialDoctors);
    const [draft, setDraft] = useState({ name: '', specialty: '' });

    const verifiedCount = useMemo(() => doctors.filter((d) => d.status === 'Verified').length, [doctors]);

    const addDoctor = (event) => {
        event.preventDefault();
        if (!draft.name || !draft.specialty) {
            return;
        }

        setDoctors((prev) => [
            {
                id: `DOC-${Math.floor(Math.random() * 900 + 100)}`,
                name: draft.name,
                specialty: draft.specialty,
                status: 'Pending',
            },
            ...prev,
        ]);
        setDraft({ name: '', specialty: '' });
    };

    const removeDoctor = (id) => {
        setDoctors((prev) => prev.filter((doc) => doc.id !== id));
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
                        <p className="text-2xl font-bold text-amber-600">{doctors.length - verifiedCount}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <form onSubmit={addDoctor} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3 h-max">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><UserPlus className="w-4 h-4 text-emerald-600" /> Add Doctor</h2>
                        <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Doctor full name" className="w-full p-2.5 border border-gray-300 rounded-lg" />
                        <input value={draft.specialty} onChange={(e) => setDraft((d) => ({ ...d, specialty: e.target.value }))} placeholder="Specialty" className="w-full p-2.5 border border-gray-300 rounded-lg" />
                        <button className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700">Add to Roster</button>
                    </form>

                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">ID</th>
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Specialty</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {doctors.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-emerald-600">{doc.id}</td>
                                        <td className="p-4 text-gray-800">{doc.name}</td>
                                        <td className="p-4 text-gray-600">{doc.specialty}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => removeDoctor(doc.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
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

export default HospitalDashboardPage;
