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
        <div className="min-h-[calc(100vh-4.25rem)] flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors">
            <div className="max-w-3xl w-full bg-[var(--surface)] p-10 rounded-2xl border border-[var(--border)] shadow-[var(--shadow)] space-y-8 backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="font-syne text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight">Hospital Registration</h1>
                    <p className="text-sm text-[var(--text2)] font-light mt-2">Submit institutional details and required legal documents for verification.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Hospital Name</label>
                            <input required className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" placeholder="St. Gabriel Medical Center" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Admin Contact Email</label>
                            <input required type="email" className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" placeholder="admin@hospital.org" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Hospital Address</label>
                        <input required className="w-full p-3.5 bg-[var(--bg)] border border-[var(--border2)] outline-none rounded-xl text-[var(--text)] placeholder-[var(--text3)] focus:ring-2 focus:ring-[var(--accent)] transition-colors" placeholder="Addis Ababa, Ethiopia" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 outline outline-[1px] outline-[rgba(var(--accent-rgb),0.1)] p-5 rounded-xl bg-[rgba(var(--accent-rgb),0.02)] mt-4">
                        <div className="col-span-1 md:col-span-3">
                             <h3 className="text-sm font-semibold text-[var(--text)]">Legal Documents</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text2)] mb-2">Operating License</label>
                            <input required type="file" onChange={(e) => onFile('license', e)} className="w-full text-sm text-[var(--text2)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[var(--border2)] file:text-sm file:font-semibold file:bg-[rgba(var(--accent-rgb),0.1)] file:text-[var(--accent)] hover:file:bg-[rgba(var(--accent-rgb),0.15)] file:transition-colors file:cursor-pointer" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text2)] mb-2">Institutional ID</label>
                            <input required type="file" onChange={(e) => onFile('institutionalId', e)} className="w-full text-sm text-[var(--text2)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[var(--border2)] file:text-sm file:font-semibold file:bg-[rgba(var(--accent-rgb),0.1)] file:text-[var(--accent)] hover:file:bg-[rgba(var(--accent-rgb),0.15)] file:transition-colors file:cursor-pointer" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text2)] mb-2">Compliance</label>
                            <input required type="file" onChange={(e) => onFile('compliance', e)} className="w-full text-sm text-[var(--text2)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[var(--border2)] file:text-sm file:font-semibold file:bg-[rgba(var(--accent-rgb),0.1)] file:text-[var(--accent)] hover:file:bg-[rgba(var(--accent-rgb),0.15)] file:transition-colors file:cursor-pointer" />
                        </div>
                    </div>

                    <button className="btn-primary w-full py-3.5 text-base rounded-xl mt-4">Submit for Verification</button>

                    {submitted && (
                        <div className="rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)] px-4 py-4 text-sm text-emerald-500 font-medium">
                            Registration submitted successfully. Your hospital is now in the verification queue.
                        </div>
                    )}

                    <div className="text-xs text-[var(--text3)] text-right pt-2 font-mono">
                        Uploaded files: {Object.values(files).filter(Boolean).length} / 3
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HospitalRegistrationPage;
