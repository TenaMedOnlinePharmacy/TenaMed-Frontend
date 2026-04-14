import React, { useState } from 'react';

const HospitalRegistrationPage = () => {
    const [files, setFiles] = useState({
        license: null,
        institutionalId: null,
        compliance: null,
    });
    const [submitted, setSubmitted] = useState(false);

    const onFile = (field, event) => {
        setFiles((prev) => ({ ...prev, [field]: event.target.files?.[0] || null }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Hospital Registration & Credentialing</h1>
                    <p className="text-gray-500 mt-1">Submit institutional details and required legal documents for verification.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                            <input required className="w-full p-3 border border-gray-300 rounded-lg" placeholder="St. Gabriel Medical Center" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Contact Email</label>
                            <input required type="email" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="admin@hospital.org" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Address</label>
                        <input required className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Addis Ababa, Ethiopia" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Operating License</label>
                            <input required type="file" onChange={(e) => onFile('license', e)} className="w-full text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Institutional ID</label>
                            <input required type="file" onChange={(e) => onFile('institutionalId', e)} className="w-full text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Document</label>
                            <input required type="file" onChange={(e) => onFile('compliance', e)} className="w-full text-sm" />
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Submit for Verification</button>

                    {submitted && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            Registration submitted successfully. Your hospital is now in the verification queue.
                        </div>
                    )}

                    <div className="text-xs text-gray-500">
                        Uploaded files: {Object.values(files).filter(Boolean).length} / 3
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HospitalRegistrationPage;
