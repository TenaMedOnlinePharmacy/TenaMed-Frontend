import React, { useMemo, useState } from 'react';
import { Search, Send } from 'lucide-react';
import { medicineSearchByNameCategory, patientCreatePrescription, patientGenerateUniqueCode } from '../api/axios';

const EPrescriptionPage = () => {
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [maxRefillsAllowed, setMaxRefillsAllowed] = useState('');
    const [highRisk, setHighRisk] = useState(false);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMeds, setSelectedMeds] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const filtered = useMemo(() => searchResults, [searchResults]);

    const addMedication = (medicine) => {
        const medicineId = medicine?.medicineId || medicine?.productId || medicine?.id;
        if (!medicineId || selectedMeds.some((item) => item.medicineId === medicineId)) {
            return;
        }
        setSelectedMeds((prev) => [
            ...prev,
            {
                medicineId,
                name: medicine?.medicineName || medicine?.name || 'Unnamed medicine',
                form: medicine?.form || '',
                strength: medicine?.strength || '',
                instruction: '',
                quantity: 1,
            },
        ]);
    };

    const handleMedicationFieldChange = (medicineId, field, value) => {
        setSelectedMeds((prev) =>
            prev.map((item) =>
                item.medicineId === medicineId
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item,
            ),
        );
    };

    const removeMedication = (medicineId) => {
        setSelectedMeds((prev) => prev.filter((item) => item.medicineId !== medicineId));
    };

    const handleSearch = async (keyword) => {
        const trimmed = keyword.trim();
        setQuery(keyword);
        setErrorMsg('');
        setSuccessMsg('');

        if (!trimmed) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await medicineSearchByNameCategory(trimmed);
            const rows = Array.isArray(response?.data) ? response.data : [];
            setSearchResults(rows);
        } catch (error) {
            setSearchResults([]);
            setErrorMsg(error?.response?.data?.error || 'Unable to search medicines right now.');
        } finally {
            setIsSearching(false);
        }
    };

    const buildPayload = (uniqueCode) => ({
        expiryDate,
        maxRefillsAllowed: Number(maxRefillsAllowed),
        highRisk: Boolean(highRisk),
        type: 'DIGITAL',
        fullName: patientName.trim(),
        phone: patientPhone.trim(),
        uniqueCode,
        items: selectedMeds.map((item) => ({
            medicineId: item.medicineId,
            form: item.form.trim(),
            instruction: item.instruction.trim(),
            strength: item.strength.trim(),
            quantity: Number(item.quantity),
        })),
    });

    const submitPrescription = async (event) => {
        event.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (selectedMeds.length === 0) {
            setErrorMsg('Please select at least one medicine.');
            return;
        }

        setIsSubmitting(true);
        try {
            const uniqueResponse = await patientGenerateUniqueCode();
            const uniqueCode = uniqueResponse?.data?.uniqueCode || uniqueResponse?.data?.code || uniqueResponse?.data;
            if (!uniqueCode) {
                throw new Error('Unable to generate a unique code.');
            }

            const payload = buildPayload(uniqueCode);
            await patientCreatePrescription(payload);
            setSuccessMsg('Prescription submitted to the central database queue.');
            setSelectedMeds([]);
            setQuery('');
            setSearchResults([]);
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.message || 'Unable to submit prescription.');
        } finally {
            setIsSubmitting(false);
        }
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Information</label>
                            <input
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="Full name"
                            />
                            <input
                                value={patientPhone}
                                onChange={(e) => setPatientPhone(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg mt-3"
                                placeholder="Phone number"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    value={maxRefillsAllowed}
                                    onChange={(e) => setMaxRefillsAllowed(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    placeholder="Max refills"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-700 mt-3">
                                <input
                                    type="checkbox"
                                    checked={highRisk}
                                    onChange={(e) => setHighRisk(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                High-risk medication
                            </label>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medication Search</label>
                            <div className="relative mb-3">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Search by medicine name or category"
                                />
                            </div>
                            {isSearching && (
                                <p className="text-xs text-gray-500 mb-2">Searching...</p>
                            )}
                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                                {filtered.slice(0, 8).map((medicine) => (
                                    <button
                                        type="button"
                                        key={medicine.medicineId || medicine.productId || medicine.id}
                                        onClick={() => addMedication(medicine)}
                                        className="w-full text-left p-3 hover:bg-gray-50"
                                    >
                                        <p className="font-medium text-gray-900">{medicine.medicineName || medicine.name}</p>
                                        <p className="text-xs text-gray-500">{medicine.medicineCategory || medicine.category || 'General'} • {medicine.pharmacyLegalName || medicine.pharmacyName || 'Partner Pharmacy'}</p>
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
                                <div className="space-y-4">
                                    {selectedMeds.map((item) => (
                                        <div key={item.medicineId} className="border border-gray-100 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedication(item.medicineId)}
                                                    className="text-xs text-red-500 hover:text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 mt-2">
                                                <input
                                                    value={item.form}
                                                    onChange={(e) => handleMedicationFieldChange(item.medicineId, 'form', e.target.value)}
                                                    required
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                                                    placeholder="Form (e.g., Tablet)"
                                                />
                                                <input
                                                    value={item.strength}
                                                    onChange={(e) => handleMedicationFieldChange(item.medicineId, 'strength', e.target.value)}
                                                    required
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                                                    placeholder="Strength (e.g., 500mg)"
                                                />
                                                <textarea
                                                    value={item.instruction}
                                                    onChange={(e) => handleMedicationFieldChange(item.medicineId, 'instruction', e.target.value)}
                                                    required
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg min-h-20"
                                                    placeholder="Instructions"
                                                />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleMedicationFieldChange(item.medicineId, 'quantity', e.target.value)}
                                                    required
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                                                    placeholder="Quantity"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                            <button
                                disabled={isSubmitting}
                                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60"
                            >
                                <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit Digital Prescription'}
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {errorMsg}
                            </div>
                        )}

                        {successMsg && (
                            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                {successMsg}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EPrescriptionPage;
