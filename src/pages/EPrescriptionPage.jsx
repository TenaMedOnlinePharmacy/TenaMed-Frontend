import React, { useMemo, useState, useEffect } from 'react';
import { Search, Send, List, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { 
    medicineSearchByNameCategory, 
    patientCreatePrescription, 
    patientGenerateUniqueCode,
    doctorGetPrescriptions,
    doctorUpdatePrescription,
    doctorDeletePrescription
} from '../api/axios';

const EPrescriptionPage = () => {
    // Tabs
    const [activeTab, setActiveTab] = useState('create'); // 'create' | 'list'

    // List State
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState(null);
    const [editingItems, setEditingItems] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    // Create Form State
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
    const [generatedCode, setGeneratedCode] = useState('');

    const filtered = useMemo(() => searchResults, [searchResults]);

    const fetchPrescriptions = async () => {
        setIsLoadingList(true);
        try {
            const resp = await doctorGetPrescriptions();
            setPrescriptions(resp.data?.content || resp.data || []);
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error);
            setErrorMsg('Failed to fetch prescriptions.');
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'list') {
            fetchPrescriptions();
        }
    }, [activeTab]);

    const handleEditClick = (prescription) => {
        setEditingPrescription(prescription);
        const items = prescription?.prescriptionItems || prescription?.items || [];
        setEditingItems(items.map((item) => ({ ...item })));
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            try {
                await doctorDeletePrescription(id);
                fetchPrescriptions();
            } catch (error) {
                console.error('Failed to delete prescription:', error);
                setErrorMsg('Failed to delete prescription.');
            }
        }
    };

    const handleEditItemChange = (index, field, value) => {
        setEditingItems((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const saveEditedItems = async () => {
        setIsUpdating(true);
        try {
            const id = editingPrescription.id || editingPrescription.prescriptionId;
            const payload = {
                items: editingItems.map((item) => ({
                    medicineId: item.medicineId,
                    form: item.form || '',
                    instruction: item.instruction || '',
                    strength: item.strength || '',
                    quantity: Number(item.quantity) || 0,
                })),
            };
            await doctorUpdatePrescription(id, payload);
            setEditingPrescription(null);
            fetchPrescriptions();
        } catch (error) {
            console.error('Failed to update prescription:', error);
            setErrorMsg('Failed to update prescription.');
        } finally {
             setIsUpdating(false);
        }
    };

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
            setGeneratedCode(uniqueCode);
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
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">E-Prescription Management</h1>
                        <p className="text-gray-500 mt-1">Issue digital prescriptions and manage existing ones.</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        <button
                            onClick={() => { setActiveTab('create'); setErrorMsg(''); setSuccessMsg(''); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Plus className="w-4 h-4" /> Create New
                        </button>
                        <button
                            onClick={() => { setActiveTab('list'); setErrorMsg(''); setSuccessMsg(''); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <List className="w-4 h-4" /> View All
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        {successMsg}
                    </div>
                )}

                {activeTab === 'create' ? (
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
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Expiry date</label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                </div>
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

                        {generatedCode && (
                            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                <span className="font-semibold">Generated code:</span> {generatedCode}
                            </div>
                        )}
                    </div>
                </form>
                ) : (
                    /* The List tab UI goes here */
                    <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-x-auto shadow-sm">
                        {isLoadingList ? (
                            <p className="text-gray-500 p-4 text-center">Loading prescriptions...</p>
                        ) : prescriptions.length === 0 ? (
                            <p className="text-gray-500 p-4 text-center">No prescriptions found.</p>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-gray-100 text-sm text-gray-500">
                                        <th className="py-3 px-4 font-medium">Patient Name</th>
                                        <th className="py-3 px-4 font-medium">Unique Code</th>
                                        <th className="py-3 px-4 font-medium">Expiry Date</th>
                                        <th className="py-3 px-4 font-medium">Items</th>
                                        <th className="py-3 px-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {prescriptions.map((px) => (
                                        <tr key={px.id || px.prescriptionId} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                {px.patientFullName || px.fullName || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {px.uniqueCode || px.uniquwcode || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {px.expiryDate
                                                    ? new Date(px.expiryDate).toLocaleDateString()
                                                    : px.createdAt
                                                        ? new Date(px.createdAt).toLocaleDateString()
                                                        : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {px.prescriptionItems?.length || px.items?.length || 0}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(px)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100"
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(px.id || px.prescriptionId)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingPrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Edit Prescription
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Patient: {editingPrescription.patientFullName || editingPrescription.fullName}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingPrescription(null)}
                                className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-gray-50/50">
                            {editingItems.length === 0 ? (
                                <p className="text-sm text-gray-500 p-4 text-center">No items to edit or failed to load.</p>
                            ) : (
                                editingItems.map((item, idx) => (
                                    <div key={item.medicineId || idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <div className="font-medium text-gray-900 mb-3 border-b border-gray-100 pb-2">Item {idx + 1}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Form</label>
                                                <input
                                                    value={item.form || ''}
                                                    onChange={(e) => handleEditItemChange(idx, 'form', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Strength</label>
                                                <input
                                                    value={item.strength || ''}
                                                    onChange={(e) => handleEditItemChange(idx, 'strength', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Instruction</label>
                                            <textarea
                                                value={item.instruction || ''}
                                                onChange={(e) => handleEditItemChange(idx, 'instruction', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[60px]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                value={item.quantity || 0}
                                                onChange={(e) => handleEditItemChange(idx, 'quantity', Number(e.target.value))}
                                                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl">
                            <button
                                onClick={() => setEditingPrescription(null)}
                                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEditedItems}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                            >
                                <Save className="w-4 h-4" /> {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EPrescriptionPage;
