import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const UploadPrescriptionPage = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [errorMsg, setErrorMsg] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
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

    const handleUpload = () => {
        if (!file) return;

        setStatus('uploading');
        // Simulate upload
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    };

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

                {status === 'success' ? (
                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Prescription Uploaded!</h2>
                        <p className="text-gray-600 mb-8">
                            Your prescription ID is <span className="font-semibold">#PRE-9921</span>.
                            We will notify you once verified.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => { setFile(null); setStatus('idle'); }} className="text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-full font-medium transition">
                                Upload Another
                            </button>
                            <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <FileText className="w-16 h-16 text-blue-500 mb-4" />
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
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
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
