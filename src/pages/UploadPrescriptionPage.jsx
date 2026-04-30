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
        <div className="min-h-[calc(100vh-4.25rem)] bg-transparent py-14 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-2">
                    <h1 className="font-syne text-3xl md:text-4xl font-bold text-[var(--text)] mb-4 tracking-tight">Upload Prescription</h1>
                    <p className="text-[var(--text2)] font-light leading-relaxed max-w-xl mx-auto">
                        Please upload a clear image or PDF of your valid prescription.
                        Our pharmacists will verify it before processing your order.
                    </p>
                </div>

                {(status === 'success' || status === 'manual-review') ? (
                    <div className="nova-card p-10 text-center animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-20 h-20 bg-[rgba(16,185,129,0.1)] rounded-2xl shadow-[var(--glow)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center mx-auto mb-6 text-emerald-500">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="font-syne text-2xl font-bold text-[var(--text)] mb-4 tracking-tight">
                            {isManualReview ? 'Manual Review Started' : 'Upload Processed'}
                        </h2>
                        {isManualReview ? (
                            <div className="mb-8 text-[var(--text2)] font-light leading-relaxed">
                                <p className="mb-4">
                                    Thanks for uploading your prescription. Our pharmacy team is reviewing it manually.
                                    We will notify you by email as soon as the review is complete.
                                </p>
                                {manualReviewMessage && (
                                    <div className="rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)] px-4 py-4 text-sm text-emerald-500 font-medium">
                                        {manualReviewMessage}
                                    </div>
                                )}
                            </div>
                        ) : (
                            matches.length === 0 ? (
                                <p className="text-[var(--text2)] mb-8 font-light">No matches found.</p>
                            ) : (
                                <div className="mb-6 overflow-x-auto rounded-xl border border-[var(--border2)] bg-[var(--surface2)] p-4 text-left text-sm text-[var(--text2)]">
                                    <table className="min-w-full border-collapse">
                                        <thead>
                                            <tr className="text-xs uppercase tracking-wider text-[var(--text3)]">
                                                <th className="px-3 py-2 text-left">Prescription ID</th>
                                                <th className="px-3 py-2 text-left">Prescription Item ID</th>
                                                <th className="px-3 py-2 text-left">Pharmacy ID</th>
                                                <th className="px-3 py-2 text-left">Medicine ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matches.map((match, index) => (
                                                <tr key={`${match.prescriptionItemId || index}`} className="border-t border-[var(--border2)] hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors align-top">
                                                    <td className="px-3 py-3 break-all font-mono">{match.prescriptionId || '-'}</td>
                                                    <td className="px-3 py-3 break-all font-mono">{match.prescriptionItemId || '-'}</td>
                                                    <td className="px-3 py-3 break-all font-mono">{match.pharmacyId || '-'}</td>
                                                    <td className="px-3 py-3 break-all font-mono">{match.medicineId || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={resetUploadState} className="btn-ghost px-8 py-3 rounded-full">
                                Upload Another
                            </button>
                            <Link to="/" className="btn-primary px-8 py-3 rounded-full text-center">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="nova-card p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl btn-secondary"
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
                        <div className="border-2 border-dashed border-[var(--border2)] rounded-2xl p-10 text-center hover:bg-[rgba(var(--accent-rgb),0.02)] hover:border-[rgba(var(--accent-rgb),0.4)] transition-all duration-300 relative group">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <FileText className="w-16 h-16 text-[var(--accent)] mb-4" />
                                    <p className="font-medium text-[var(--text)] text-lg">{file.name}</p>
                                    <p className="text-sm text-[var(--text3)] font-mono mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                                        className="mt-6 text-[var(--danger)] hover:bg-[rgba(var(--danger-rgb),0.1)] border border-transparent hover:border-[var(--danger-border)] px-5 py-2 rounded-xl text-sm font-semibold transition z-30 relative"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center pointer-events-none">
                                    <Upload className="w-16 h-16 text-[var(--text3)] mb-4 group-hover:text-[var(--accent)] group-hover:scale-110 transition-all duration-300" />
                                    <p className="font-medium text-[var(--text)] text-lg mb-2">Click to upload or drag and drop</p>
                                    <p className="text-sm text-[var(--text3)] font-mono">JPG, PNG or PDF (MAX. 5MB)</p>
                                </div>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="mt-5 p-4 bg-[rgba(var(--danger-rgb),0.1)] border border-[rgba(var(--danger-rgb),0.2)] text-[var(--danger)] rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{errorMsg}</span>
                            </div>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={handleUpload}
                                disabled={!file || status === 'uploading'}
                                className={`btn-primary w-full py-4 text-base rounded-xl flex items-center justify-center gap-2 ${(!file || status === 'uploading') ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {status === 'uploading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
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
