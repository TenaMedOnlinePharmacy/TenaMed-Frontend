import React, { useMemo, useState } from 'react';
import { Search, Send } from 'lucide-react';
import { products } from '../data/mockProducts';

const EPrescriptionPage = () => {
    const [patient, setPatient] = useState('');
    const [query, setQuery] = useState('');
    const [dosage, setDosage] = useState('');
    const [instructions, setInstructions] = useState('');
    const [selectedMeds, setSelectedMeds] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const filtered = useMemo(() => {
        return products.filter((product) =>
            `${product.name} ${product.category} ${product.pharmacy}`.toLowerCase().includes(query.toLowerCase())
        );
    }, [query]);

    const addMedication = (medicine) => {
        if (selectedMeds.some((item) => item.id === medicine.id)) {
            return;
        }
        setSelectedMeds((prev) => [...prev, medicine]);
    };

    const submitPrescription = (event) => {
        event.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">E-Prescription Generation</h1>
                    <p className="text-gray-500 mt-1">Search registered patient, select medicines, and issue digital prescription.</p>
                </div>

                <form onSubmit={submitPrescription} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Search</label>
                            <input
                                value={patient}
                                onChange={(e) => setPatient(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="Search patient by MRN, name, or phone"
                            />
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medication Search</label>
                            <div className="relative mb-3">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="Search central inventory" />
                            </div>
                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                                {filtered.slice(0, 8).map((medicine) => (
                                    <button
                                        type="button"
                                        key={medicine.id}
                                        onClick={() => addMedication(medicine)}
                                        className="w-full text-left p-3 hover:bg-gray-50"
                                    >
                                        <p className="font-medium text-gray-900">{medicine.name}</p>
                                        <p className="text-xs text-gray-500">{medicine.category} • {medicine.pharmacy}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h2 className="font-semibold text-gray-900 mb-2">Selected Medications</h2>
                            {selectedMeds.length === 0 ? (
                                <p className="text-sm text-gray-500">No medication selected yet.</p>
                            ) : (
                                <ul className="text-sm text-gray-700 space-y-1">
                                    {selectedMeds.map((item) => (
                                        <li key={item.id}>• {item.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Dosage</label>
                            <input value={dosage} onChange={(e) => setDosage(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Example: 500mg twice daily" />
                            <label className="block text-sm font-medium text-gray-700">Instructions</label>
                            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg min-h-28" placeholder="Usage instructions and precautions" />
                            <button className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700">
                                <Send className="w-4 h-4" /> Submit Digital Prescription
                            </button>
                        </div>

                        {submitted && (
                            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                Prescription submitted to the central database queue.
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EPrescriptionPage;
