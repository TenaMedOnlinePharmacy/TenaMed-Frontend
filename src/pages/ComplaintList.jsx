import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintGetMy } from '../api/axios';
import { useLocation } from 'react-router-dom';

const ComplaintList = () => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const message = location.state?.message;

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                setIsLoading(true);
                const response = await complaintGetMy();
                setComplaints(response?.data || []);
            } catch (err) {
                setError(err?.response?.data?.error || 'Failed to load complaints.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'UNDER_REVIEW': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'RESOLVED': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'REJECTED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[var(--text)]">My Complaints</h1>
                <Link to="/complaints/create" className="bg-[var(--accent)] text-[#000] px-4 py-2 rounded font-semibold hover:brightness-110 transition-colors">
                    + New Complaint
                </Link>
            </div>

            {message && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded mb-6">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-10 text-[var(--text2)]">Loading complaints...</div>
            ) : complaints.length === 0 ? (
                <div className="text-center py-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                    <p className="text-[var(--text2)] mb-4">You have no complaints submitted.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {complaints.map(complaint => (
                        <Link 
                            key={complaint.id} 
                            to={`/complaints/${complaint.id}`}
                            className="block p-5 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] rounded-xl transition-all"
                        >
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--text)] mb-1">{complaint.subject}</h2>
                                    <p className="text-sm text-[var(--text2)]">Order ID: {complaint.orderId}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded border font-semibold ${getStatusColor(complaint.status)}`}>
                                    {complaint.status?.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex gap-4 mt-4 text-xs text-[var(--text3)]">
                                <span>Category: {complaint.category?.replace('_', ' ')}</span>
                                <span>Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComplaintList;
