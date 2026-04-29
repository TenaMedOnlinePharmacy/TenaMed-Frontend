import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ocrGetPipelineStatus, ocrUploadPrescription } from '../api/axios';
import { shouldUseBuilderFallback } from '../config/devBuilderMode';

const UploadPrescriptionPage = () => {
    const cameraInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, manual-review, error
    const [errorMsg, setErrorMsg] = useState('');
    const [matches, setMatches] = useState([]);
    const [manualReviewMessage, setManualReviewMessage] = useState('');
    const navigate = useNavigate();

    const normalizePipelineStatus = (value) => (
        String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ')
    );

    const isManualReviewStatus = (value) => {
        const normalized = normalizePipelineStatus(value);
        return normalized.includes('manual') && normalized.includes('review');
    };

    const mapPrescriptionMatches = (rows, prescriptionId) => {
        const items = Array.isArray(rows) ? rows : [];
        return items.map((match) => ({
            ...match,
            prescriptionRequired: false,
            prescriptionId: match?.prescriptionId || prescriptionId || null,
        }));
    };

    const delay = (ms) => new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

    const pollPipelineStatus = async (prescriptionId) => {
        const maxAttempts = 60;

        for (let attempt = 0; attempt < maxAttempts; attempt += 20) {
            const response = await ocrGetPipelineStatus(prescriptionId);
            const data = response?.data || {};
            const rawStatus = data.status;
            const normalizedStatus = normalizePipelineStatus(rawStatus);

            if (normalizedStatus === 'finished') {
                return {
                    done: true,
                    status: 'FINISHED',
                    message: data.message || '',
                    matches: Array.isArray(data.inventoryMatches) ? data.inventoryMatches : [],
                };
            }

            if (isManualReviewStatus(rawStatus)) {
                return {
                    done: true,
                    status: 'MANUAL_REVIEW',
                    message: data.message || 'Your prescription is queued for manual review.',
                    matches: [],
                };
            }

            if (normalizedStatus === 'failed' || normalizedStatus === 'not found') {
                return {
                    done: true,
                    status: 'FAILED',
                    error: data.message || 'Prescription pipeline failed.',
                    matches: [],
                };
            }

            await delay(1500);
        }

        return {
            done: true,
            matches: [],
            error: 'Prescription processing is taking longer than expected. Please check again shortly.',
        };
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const handleCameraChange = (e) => {
        const capturedFile = e.target.files[0];
        validateAndSetFile(capturedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        // Validate type
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setErrorMsg('Invalid file type. Please upload JPG, PNG, or PDF.');
            setStatus('error');
            return;
        }

        // Validate size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setErrorMsg('File size too large. Max 5MB allowed.');
            setStatus('error');
            return;
        }

        setStatus('idle');
        setErrorMsg('');
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        setErrorMsg('');
        setMatches([]);
        setManualReviewMessage('');

        try {
            const uploadResponse = await ocrUploadPrescription(file);
            console.log('OCR Upload Response:', uploadResponse);
            const uploadData = uploadResponse?.data;

            if (!uploadData?.prescriptionId) {
                const immediateMatches = Array.isArray(uploadData) ? uploadData : [];
                if (immediateMatches.length > 0) {
                    const normalizedMatches = mapPrescriptionMatches(immediateMatches, null);
                    navigate('/products', {
                        state: {
                            prescriptionMatches: normalizedMatches,
                            fromPrescriptionUpload: true,
                        },
                    });
                    return;
                }

                setMatches(immediateMatches);
                setStatus('success');
                return;
            }

            const pipelineResult = await pollPipelineStatus(uploadData.prescriptionId);
            if (pipelineResult.error) {
                setErrorMsg(pipelineResult.error);
                setStatus('error');
                return;
            }

            if (pipelineResult.status === 'MANUAL_REVIEW') {
                setManualReviewMessage(pipelineResult.message || 'We will notify you by email as soon as the review is complete.');
                setStatus('manual-review');
                return;
            }

            const normalizedMatches = mapPrescriptionMatches(pipelineResult.matches || [], uploadData.prescriptionId);
            navigate('/products', {
                state: {
                    prescriptionMatches: normalizedMatches,
                    prescriptionId: uploadData.prescriptionId,
                    fromPrescriptionUpload: true,
                },
            });
        } catch (error) {
            if (shouldUseBuilderFallback(error)) {
                setMatches([]);
                setStatus('success');
                return;
            }

            const message = error?.response?.data?.message || error?.message || 'Upload failed. Please try again.';
            setErrorMsg(message);
            setStatus('error');
        }
    };

    const resetUploadState = () => {
        setFile(null);
        setMatches([]);
        setStatus('idle');
        setErrorMsg('');
        setManualReviewMessage('');
    };

    const isManualReview = status === 'manual-review';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Prescription</h1>
                    <p className="text-gray-600">
                        Please upload a clear image or PDF of your valid prescription.
                        Our pharmacists will verify it before processing your order.
                    </p>
                </div>

                {(status === 'success' || status === 'manual-review') ? (
                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {isManualReview ? 'Manual Review Started' : 'Upload Processed'}
                        </h2>
                        {isManualReview ? (
                            <div className="mb-8 text-gray-600">
                                <p className="mb-4">
                                    Thanks for uploading your prescription. Our pharmacy team is reviewing it manually.
                                    We will notify you by email as soon as the review is complete.
                                </p>
                                {manualReviewMessage && (
                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                        {manualReviewMessage}
                                    </div>
                                )}
                            </div>
                        ) : (
                            matches.length === 0 ? (
                                <p className="text-gray-600 mb-8">No matches found.</p>
                            ) : (
                                <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm text-gray-700">
                                    <table className="min-w-full border-collapse">
                                        <thead>
                                            <tr className="text-xs uppercase text-gray-500">
                                                <th className="px-3 py-2 text-left">Prescription ID</th>
                                                <th className="px-3 py-2 text-left">Prescription Item ID</th>
                                                <th className="px-3 py-2 text-left">Pharmacy ID</th>
                                                <th className="px-3 py-2 text-left">Medicine ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matches.map((match, index) => (
                                                <tr key={`${match.prescriptionItemId || index}`} className="border-t border-gray-200 align-top">
                                                    <td className="px-3 py-2 break-all">{match.prescriptionId || '-'}</td>
                                                    <td className="px-3 py-2 break-all">{match.prescriptionItemId || '-'}</td>
                                                    <td className="px-3 py-2 break-all">{match.pharmacyId || '-'}</td>
                                                    <td className="px-3 py-2 break-all">{match.medicineId || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                        <div className="flex justify-center gap-4">
                            <button onClick={resetUploadState} className="text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full font-medium transition">
                                Upload Another
                            </button>
                            <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-700 transition">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                            >
                                Take Photo
                            </button>
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleCameraChange}
                            />
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <FileText className="w-16 h-16 text-emerald-500 mb-4" />
                                    <p className="font-medium text-gray-900 text-lg">{file.name}</p>
                                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                                        className="mt-4 text-red-500 hover:bg-red-50 px-4 py-2 rounded-full text-sm font-medium z-10 relative"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                                    <p className="font-medium text-gray-900 text-lg mb-2">Click to upload or drag and drop</p>
                                    <p className="text-sm text-gray-500">JPG, PNG or PDF (MAX. 5MB)</p>
                                </div>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{errorMsg}</span>
                            </div>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={handleUpload}
                                disabled={!file || status === 'uploading'}
                                className={`w-full py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 text-white
                                    ${!file || status === 'uploading'
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                    }`}
                            >
                                {status === 'uploading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    'Submit Prescription'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPrescriptionPage;
