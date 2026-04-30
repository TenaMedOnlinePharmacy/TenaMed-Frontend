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
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-12 relative z-10 transition-colors">
            <div className="nova-main">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-syne text-3xl md:text-3xl font-bold text-[var(--text)] tracking-tight">E-Prescription Management</h1>
                        <p className="text-sm text-[var(--text2)] font-light mt-1">Issue digital prescriptions and manage existing ones.</p>
                    </div>
                    <div className="flex bg-[var(--surface2)] p-1 rounded-xl border border-[var(--border2)]">
                        <button
                            onClick={() => { setActiveTab('create'); setErrorMsg(''); setSuccessMsg(''); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'create' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)]'}`}
                        >
                            <Plus className="w-4 h-4" /> Create New
                        </button>
                        <button
                            onClick={() => { setActiveTab('list'); setErrorMsg(''); setSuccessMsg(''); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)]'}`}
                        >
                            <List className="w-4 h-4" /> View All
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-6 text-sm text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] rounded-xl px-4 py-3">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-6 text-sm text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-xl px-4 py-3 font-medium">
                        {successMsg}
                    </div>
                )}

                {activeTab === 'create' ? (
                    <form onSubmit={submitPrescription} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="nova-card p-6 animate-in fade-in slide-in-from-bottom-2">
                            <label className="block font-syne text-xl font-bold text-[var(--text)] tracking-tight mb-4">Patient Information</label>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        required
                                        className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div>
                                    <input
                                        value={patientPhone}
                                        onChange={(e) => setPatientPhone(e.target.value)}
                                        required
                                        className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--text2)] mb-1.5 flex justify-between">Expiry date <span className="text-[var(--text3)] font-normal text-xs">(optional)</span></label>
                                        <input
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            required
                                            className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--text2)] mb-1.5">Max Refills</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={maxRefillsAllowed}
                                            onChange={(e) => setMaxRefillsAllowed(e.target.value)}
                                            required
                                            className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
                                            placeholder="Ex: 0 or 3"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="inline-flex items-center gap-3 cursor-pointer mt-2 group">
                                        <div className="relative flex items-center justify-center w-5 h-5 border border-[var(--border2)] rounded-md bg-[var(--bg)] group-hover:border-[var(--accent)] transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={highRisk}
                                                onChange={(e) => setHighRisk(e.target.checked)}
                                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                            />
                                            {highRisk && <CheckCircle className="w-4 h-4 text-[var(--danger)]" />}
                                        </div>
                                        <span className={`text-sm font-semibold ${highRisk ? 'text-[var(--danger)]' : 'text-[var(--text)]'}`}>High-risk medication</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="nova-card p-6 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: '100ms'}}>
                            <label className="block font-syne text-xl font-bold text-[var(--text)] tracking-tight mb-4">Medication Search</label>
                            <div className="relative mb-4">
                                <Search className="w-5 h-5 text-[var(--text3)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-11 pr-3 py-3.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
                                    placeholder="Search by medicine name or category"
                                />
                            </div>
                            {isSearching && (
                                <p className="text-xs text-[var(--text3)] mb-2">Searching...</p>
                            )}
                            <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border2)] border border-[var(--border2)] bg-[var(--surface2)] rounded-xl">
                                {filtered.slice(0, 8).map((medicine) => (
                                    <button
                                        type="button"
                                        key={medicine.medicineId || medicine.productId || medicine.id}
                                        onClick={() => addMedication(medicine)}
                                        className="w-full text-left p-4 hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors"
                                    >
                                        <p className="font-semibold text-[var(--text)]">{medicine.medicineName || medicine.name}</p>
                                        <p className="text-xs text-[var(--text3)] mt-0.5">{medicine.medicineCategory || medicine.category || 'General'} • {medicine.pharmacyLegalName || medicine.pharmacyName || 'Partner Pharmacy'}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="nova-card p-6 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: '150ms'}}>
                            <h2 className="font-syne text-xl font-bold text-[var(--text)] tracking-tight mb-4">Selected Medications</h2>
                            {selectedMeds.length === 0 ? (
                                <p className="text-sm text-[var(--text3)] text-center py-6 bg-[var(--surface2)] rounded-xl border border-[var(--border2)] border-dashed">No medication selected yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {selectedMeds.map((item) => (
                                        <div key={item.medicineId} className="border border-[var(--border2)] bg-[var(--surface2)] rounded-xl p-4 transition-colors hover:border-[var(--accent)]">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-[var(--text)]">{item.name}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedication(item.medicineId)}
                                                    className="text-xs font-semibold text-[var(--danger)] hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                <input
                                                    value={item.form}
                                                    onChange={(e) => handleMedicationFieldChange(item.medicineId, 'form', e.target.value)}
                                                    required
                                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
                                                    placeholder="Form (e.g., Tablet)"
                                                />
                                                <input
                                                    value={item.strength}
                                                    onChange={(e) => handleMedicationFieldChange(item.medicineId, 'strength', e.target.value)}
                                                    required
                                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
                                                    placeholder="Strength (e.g., 500mg)"
                                                />
                                            </div>
                                            <textarea
                                                value={item.instruction}
                                                onChange={(e) => handleMedicationFieldChange(item.medicineId, 'instruction', e.target.value)}
                                                required
                                                className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)] min-h-[80px] text-sm mb-3"
                                                placeholder="Instructions"
                                            />
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleMedicationFieldChange(item.medicineId, 'quantity', e.target.value)}
                                                required
                                                className="w-full md:w-1/2 p-2.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
                                                placeholder="Quantity"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="nova-card p-6 animate-in fade-in slide-in-from-bottom-2 space-y-4" style={{animationDelay: '200ms'}}>
                            <button
                                disabled={isSubmitting}
                                className="w-full btn-primary py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 group disabled:opacity-60 transition"
                            >
                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> {isSubmitting ? 'Submitting...' : 'Submit Digital Prescription'}
                            </button>
                        </div>

                        {generatedCode && (
                            <div className="animate-in fade-in zoom-in text-sm text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-xl px-4 py-3 flex items-center gap-2">
                                <span className="font-semibold text-emerald-400">Generated code:</span> <span className="font-mono text-white tracking-widest">{generatedCode}</span>
                            </div>
                        )}
                    </div>
                </form>
                ) : (
                    <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 relative z-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                    <tr>
                                        <th className="p-4 font-medium tracking-wide">Patient Name</th>
                                        <th className="p-4 font-medium tracking-wide">Unique Code</th>
                                        <th className="p-4 font-medium tracking-wide">Expiry Date</th>
                                        <th className="p-4 font-medium tracking-wide">Items</th>
                                        <th className="p-4 font-medium tracking-wide text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border2)]">
                                    {isLoadingList ? (
                                        <tr>
                                            <td className="p-8 text-sm text-[var(--text3)] text-center" colSpan={5}>Loading prescriptions...</td>
                                        </tr>
                                    ) : prescriptions.length === 0 ? (
                                        <tr>
                                            <td className="p-8 text-sm text-[var(--text3)] text-center" colSpan={5}>No prescriptions found.</td>
                                        </tr>
                                    ) : (
                                        prescriptions.map((px) => (
                                            <tr key={px.id || px.prescriptionId} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors align-middle text-sm border-b border-[var(--border2)]">
                                                <td className="p-4 font-semibold text-[var(--text)]">
                                                    {px.patientFullName || px.fullName || 'N/A'}
                                                </td>
                                                <td className="p-4 text-[var(--text2)] font-mono">
                                                    {px.uniqueCode || px.uniquwcode || '-'}
                                                </td>
                                                <td className="p-4 text-[var(--text2)]">
                                                    {px.expiryDate
                                                        ? new Date(px.expiryDate).toLocaleDateString()
                                                        : px.createdAt
                                                            ? new Date(px.createdAt).toLocaleDateString()
                                                            : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface3)] text-[var(--text)] border border-[var(--border3)]">
                                                        {px.prescriptionItems?.length || px.items?.length || 0} items
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(px)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)] transition-colors"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(px.id || px.prescriptionId)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] hover:bg-[rgba(var(--danger-rgb),0.15)] transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingPrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[var(--surface)] border border-[var(--border2)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                        <div className="p-6 border-b border-[var(--border2)] flex items-center justify-between bg-[var(--surface2)] rounded-t-2xl">
                            <div>
                                <h3 className="font-syne text-xl font-bold text-[var(--text)] tracking-tight">
                                    Edit Prescription
                                </h3>
                                <p className="text-sm text-[var(--text2)] mt-1">
                                    Patient: <span className="font-medium text-[var(--text)]">{editingPrescription.patientFullName || editingPrescription.fullName}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingPrescription(null)}
                                className="text-[var(--text3)] hover:text-[var(--text)] bg-[var(--surface3)] hover:bg-[var(--border2)] p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-[var(--bg)]">
                            {editingItems.length === 0 ? (
                                <p className="text-sm text-[var(--text3)] p-4 text-center">No items to edit or failed to load.</p>
                            ) : (
                                editingItems.map((item, idx) => (
                                    <div key={item.medicineId || idx} className="bg-[var(--surface2)] border border-[var(--border2)] rounded-xl p-5 shadow-sm">
                                        <div className="font-semibold text-[var(--text)] mb-4 border-b border-[var(--border2)] pb-2 flex justify-between items-center">
                                            <span>Item {idx + 1}</span>
                                            {item.medicineName && <span className="text-xs font-normal text-[var(--text3)]">{item.medicineName}</span>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Form</label>
                                                <input
                                                    value={item.form || ''}
                                                    onChange={(e) => handleEditItemChange(idx, 'form', e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Strength</label>
                                                <input
                                                    value={item.strength || ''}
                                                    onChange={(e) => handleEditItemChange(idx, 'strength', e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Instruction</label>
                                            <textarea
                                                value={item.instruction || ''}
                                                onChange={(e) => handleEditItemChange(idx, 'instruction', e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] rounded-lg text-sm min-h-[80px] outline-none focus:border-[var(--accent)] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Quantity</label>
                                            <input
                                                type="number"
                                                value={item.quantity || 0}
                                                onChange={(e) => handleEditItemChange(idx, 'quantity', Number(e.target.value))}
                                                className="w-full md:w-1/2 px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-5 border-t border-[var(--border2)] flex items-center justify-end gap-3 bg-[var(--surface2)] rounded-b-2xl">
                            <button
                                onClick={() => setEditingPrescription(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-[var(--text)] bg-[var(--surface3)] border border-[var(--border3)] rounded-xl hover:bg-[var(--border2)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEditedItems}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition"
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
