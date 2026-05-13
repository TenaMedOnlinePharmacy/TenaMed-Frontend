import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintGetDetails } from '../api/axios';

const ComplaintDetails = () => {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const response = await complaintGetDetails(id);
                setComplaint(response?.data);
            } catch (err) {
                setError(err?.response?.data?.error || 'Failed to load complaint details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (isLoading) {
        return <div className="text-center py-20 text-[var(--text2)]">Loading complaint details...</div>;
    }

    if (error || !complaint) {
        return (
            <div className="max-w-2xl mx-auto p-6 mt-8">
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                    {error || 'Complaint not found.'}
                </div>
                <Link to="/complaints" className="text-[var(--accent)] hover:underline">← Back to Complaints</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6 mt-6">
            <Link to="/complaints" className="text-[var(--text2)] hover:text-[var(--accent)] transition-colors mb-6 inline-block">
                ← Back to my complaints
            </Link>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 md:p-8">
                <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[var(--border)] pb-6 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{complaint.subject}</h1>
                        <p className="text-sm text-[var(--text2)] font-mono tracking-wide">ID: {complaint.id}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded border text-sm font-bold tracking-wide
                        ${complaint.status === 'PENDING' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 
                          complaint.status === 'UNDER_REVIEW' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                          complaint.status === 'RESOLVED' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                          'text-red-500 bg-red-500/10 border-red-500/20'
                        }`}
                    >
                        {complaint.status?.replace('_', ' ')}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Related Order</p>
                        <p className="font-medium text-[var(--text)]">{complaint.orderId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Category</p>
                        <p className="font-medium text-[var(--text)]">{complaint.category?.replace('_', ' ')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Submitted</p>
                        <p className="font-medium text-[var(--text)]">{new Date(complaint.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Last Updated</p>
                        <p className="font-medium text-[var(--text)]">{new Date(complaint.updatedAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-3">Description</p>
                    <div className="bg-[var(--surface2)] p-4 rounded-lg text-[var(--text)] whitespace-pre-wrap leading-relaxed text-sm">
                        {complaint.description}
                    </div>
                </div>

                {complaint.adminNote && (
                    <div className="mt-8 border-t border-[var(--border)] pt-8">
                        <p className="text-xs text-[var(--accent)] uppercase tracking-wider mb-3 font-semibold">Admin Response</p>
                        <div className="bg-[rgba(var(--accent-rgb),0.05)] border border-[rgba(var(--accent-rgb),0.2)] p-4 rounded-lg text-[var(--text)] whitespace-pre-wrap leading-relaxed text-sm">
                            {complaint.adminNote}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintDetails;
