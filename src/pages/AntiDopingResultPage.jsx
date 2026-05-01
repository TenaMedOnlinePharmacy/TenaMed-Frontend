import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AntiDopingResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;

    if (!state || !state.result) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p>No result found.</p>
                <button onClick={() => navigate('/products')} className="mt-4 btn-primary">Go back</button>
            </div>
        );
    }

    const { result, medicineName } = state;
    const { status, matchedSubstances, message } = result;

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <button 
                onClick={() => navigate('/products')} 
                className="flex items-center text-[var(--accent)] hover:text-white transition-colors mb-6 font-medium"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
            </button>

            <div className="bg-[var(--surface2)] rounded-3xl border-2 border-[var(--danger)] p-8 shadow-lg shadow-[var(--danger)]/10">
                <div className="flex flex-col items-center text-center pb-6 border-b border-[var(--border)]">
                    <div className="w-20 h-20 bg-[var(--danger)]/20 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="w-10 h-10 text-[var(--danger)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Banned Substance Detected</h1>
                    <p className="text-lg text-[var(--text2)]">
                        The medicine <strong className="text-[var(--danger)]">{medicineName || 'this product'}</strong> contains substances banned for athletes.
                    </p>
                    <p className="text-md text-[var(--text3)] mt-2 bg-black/40 px-4 py-2 rounded-lg">{message}</p>
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Matched Substances</h3>
                    {matchedSubstances && matchedSubstances.length > 0 ? (
                        <div className="space-y-4">
                            {matchedSubstances.map((sub, idx) => (
                                <div key={idx} className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border2)] flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-[var(--danger)]/50 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg font-bold text-white capitalize">{sub.ingredientName}</span>
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--danger)]/20 text-[var(--danger)]">
                                                {sub.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-[var(--text3)] flex items-center gap-2">
                                            <span>{sub.category}</span>
                                            <span className="w-1 h-1 rounded-full bg-[var(--border2)]"></span>
                                            <span>Rule: {sub.ruleset} ({sub.rulesetYear})</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--text3)]">No specific substance details provided.</p>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <button 
                         onClick={() => navigate('/products')} 
                         className="px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface3)] text-white rounded-xl border border-[var(--border2)] font-semibold transition-all shadow-md"
                    >
                         Search Alternative Medicines
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AntiDopingResultPage;
