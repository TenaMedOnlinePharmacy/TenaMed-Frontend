import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, PackagePlus, Save, X } from 'lucide-react';
import { inventoryAddBatch, inventoryEditBatch, inventoryGetBatchForEdit } from '../api/axios';
import { resolveApiImageUrl } from '../utils/imageUrl';

const initialFormState = {
    imageFile: null,
    imagePreview: '',
    productId: '',
    medicineName: '',
    brandName: '',
    manufacturer: '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    quantity: '',
    unitCost: '',
    sellingPrice: '',
    reorderLevel: '',
};
const InventoryBatchCreatePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const batchId = searchParams.get('batchId');
    const isEditMode = Boolean(batchId);
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingBatch, setIsLoadingBatch] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const asText = (value) => (typeof value === 'string' ? value : '');
    const asTrimmedOrNull = (value) => {
        const normalized = asText(value).trim();
        return normalized || null;
    };

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        if (name === 'imageFile') {
            const selectedFile = files?.[0] || null;

            if (!selectedFile) {
                setFormData((prev) => ({
                    ...prev,
                    imageFile: null,
                    imagePreview: '',
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                imageFile: selectedFile,
                imagePreview: URL.createObjectURL(selectedFile),
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        return () => {
            if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(formData.imagePreview);
            }
        };
    }, [formData.imagePreview]);

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        const loadBatch = async () => {
            setIsLoadingBatch(true);
            setErrorMsg('');
            try {
                const response = await inventoryGetBatchForEdit(batchId);
                const loadedBatch = response?.data?.batch;
                if (!loadedBatch) {
                    throw new Error('Batch details not found.');
                }

                setFormData((prev) => ({
                    ...prev,
                    productId: loadedBatch.productId || '',
                    medicineName: loadedBatch.medicineName || '',
                    brandName: loadedBatch.brandName || '',
                    manufacturer: loadedBatch.manufacturer || '',
                    batchNumber: loadedBatch.batchNumber || '',
                    manufacturingDate: loadedBatch.manufacturingDate || '',
                    expiryDate: loadedBatch.expiryDate || '',
                    quantity: loadedBatch.quantity?.toString() || '',
                    unitCost: loadedBatch.unitCost?.toString() || '',
                    sellingPrice: loadedBatch.sellingPrice?.toString() || '',
                    reorderLevel: loadedBatch.reorderLevel?.toString() || '',
                    imageFile: null,
                    imagePreview: response?.data?.imageUrl ? resolveApiImageUrl(response.data.imageUrl, response.data.imageUrl) : '',
                }));
            } catch (error) {
                setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to load batch details.');
            } finally {
                setIsLoadingBatch(false);
            }
        };

        loadBatch();
    }, [batchId, isEditMode]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');

        const payload = {
            productId: asTrimmedOrNull(formData.productId),
            medicineName: asTrimmedOrNull(formData.medicineName),
            brandName: asTrimmedOrNull(formData.brandName),
            manufacturer: asTrimmedOrNull(formData.manufacturer),
            batchNumber: asTrimmedOrNull(formData.batchNumber),
            manufacturingDate: formData.manufacturingDate || null,
            expiryDate: formData.expiryDate || null,
            quantity: Number(formData.quantity),
            unitCost: formData.unitCost === '' ? null : Number(formData.unitCost),
            sellingPrice: formData.sellingPrice === '' ? null : Number(formData.sellingPrice),
            reorderLevel: formData.reorderLevel === '' ? null : Number(formData.reorderLevel),
        };

        try {
            if (isEditMode) {
                await inventoryEditBatch(batchId, payload, formData.imageFile);
                setSuccessMsg('Batch updated successfully.');
            } else {
                await inventoryAddBatch(payload, formData.imageFile);
                setSuccessMsg('Batch created successfully.');
            }
            setFormData(initialFormState);
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || (isEditMode ? 'Failed to update batch.' : 'Failed to create batch.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-6">
                    <Link to="/pharmacist/dashboard?tab=inventory" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-700 transition">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Inventory
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-5 flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <PackagePlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Inventory Batch' : 'Create Inventory Batch'}</h1>
                            <p className="text-sm text-gray-500">{isEditMode ? 'Edit existing batch details and save changes.' : 'Enter batch details and submit them to the inventory batch API.'}</p>
                        </div>
                    </div>

                    {isLoadingBatch && (
                        <div className="px-6 pt-4 text-sm text-gray-500">Loading batch details...</div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Batch Image</span>
                                <input
                                    name="imageFile"
                                    type="file"
                                    accept="image/*"
                                    required={!isEditMode}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                                <p className="mt-2 text-xs text-gray-500">Choose an image from the device. {isEditMode ? 'Leave empty to keep current image.' : 'The form is sent as multipart/form-data.'}</p>
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Batch Number</span>
                                <input
                                    name="batchNumber"
                                    type="text"
                                    value={formData.batchNumber ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="BN-9988"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Product ID (optional)</span>
                                <input
                                    name="productId"
                                    type="text"
                                    value={formData.productId ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="UUID"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</span>
                                <input
                                    name="medicineName"
                                    type="text"
                                    value={formData.medicineName ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="Feso4"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Brand Name</span>
                                <input
                                    name="brandName"
                                    type="text"
                                    value={formData.brandName ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="Paracetamol 500mg"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</span>
                                <input
                                    name="manufacturer"
                                    type="text"
                                    value={formData.manufacturer ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="Addis Pharma Inc."
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Quantity</span>
                                <input
                                    name="quantity"
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.quantity ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="50"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Date</span>
                                <input
                                    name="manufacturingDate"
                                    type="date"
                                    value={formData.manufacturingDate ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</span>
                                <input
                                    name="expiryDate"
                                    type="date"
                                    value={formData.expiryDate ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</span>
                                <input
                                    name="unitCost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.unitCost ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="8.00"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Selling Price</span>
                                <input
                                    name="sellingPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.sellingPrice ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="12.00"
                                />
                            </label>

                            <label className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</span>
                                <input
                                    name="reorderLevel"
                                    type="number"
                                    min="0"
                                    value={formData.reorderLevel ?? ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    placeholder="15"
                                />
                            </label>
                        </div>

                        {formData.imagePreview && (
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Image Preview</p>
                                        <p className="text-xs text-gray-500">{formData.imageFile?.name}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, imageFile: null, imagePreview: '' }))}
                                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                                    >
                                        <X className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                    <img src={formData.imagePreview} alt="Batch preview" className="h-56 w-full object-contain" />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-gray-100 pt-6">
                            <p className="text-sm text-gray-500">
                                Image is selected from the device and the batch data is sent to <span className="font-medium text-gray-700">/inventory/batch</span>.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/pharmacist/dashboard?tab=inventory')}
                                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 transition"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Batch' : 'Save Batch'}
                                </button>
                            </div>
                        </div>

                        {successMsg && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">{successMsg}</p>}
                        {errorMsg && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{errorMsg}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InventoryBatchCreatePage;