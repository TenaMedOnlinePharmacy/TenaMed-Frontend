import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminComplaintGetAll } from '../api/axios';

const AdminComplaintList = () => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                setIsLoading(true);
                const response = await adminComplaintGetAll();
                setComplaints(response?.data || []);
            } catch (err) {
                setError(err?.response?.data?.error || 'Failed to load complaints.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    const filteredComplaints = complaints.filter(
        c => statusFilter === 'ALL' || c.status === statusFilter
    );

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
        <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
            <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Complaint Management Dashboard</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="flex bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)] mb-6 items-center gap-4 flex-wrap">
                <span className="text-[var(--text2)] font-medium">Filter by Status:</span>
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[var(--surface2)] text-[var(--text)] border border-[var(--border)] rounded px-3 py-1.5 outline-none focus:border-[var(--accent)]"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
                <div className="ml-auto text-sm text-[var(--text3)]">
                    Showing {filteredComplaints.length} resulting complaint(s)
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-[var(--text2)]">Loading complaints...</div>
            ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                    <p className="text-[var(--text2)] mb-4">No complaints found matching this criteria.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                            <tr>
                                <th className="p-4 font-semibold text-[var(--text2)]">Complaint ID</th>
                                <th className="p-4 font-semibold text-[var(--text2)]">Subject</th>
                                <th className="p-4 font-semibold text-[var(--text2)]">Category</th>
                                <th className="p-4 font-semibold text-[var(--text2)]">Customer ID</th>
                                <th className="p-4 font-semibold text-[var(--text2)]">Status</th>
                                <th className="p-4 font-semibold text-[var(--text2)]">Created</th>
                                <th className="p-4 text-right font-semibold text-[var(--text2)]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filteredComplaints.map(complaint => (
                                <tr key={complaint.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="p-4 font-mono text-[var(--text3)]" title={complaint.id}>
                                        {complaint.id.split('-')[0]}...
                                    </td>
                                    <td className="p-4 font-medium text-[var(--text)]">{complaint.subject}</td>
                                    <td className="p-4 text-[var(--text2)]">{complaint.category.replace('_', ' ')}</td>
                                    <td className="p-4 font-mono text-[var(--text3)]" title={complaint.customerId}>
                                        {complaint.customerId.split('-')[0]}...
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded inline-block border font-semibold ${getStatusColor(complaint.status)}`}>
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[var(--text2)]">
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link 
                                            to={`/admin/complaints/${complaint.id}`}
                                            className="text-[var(--accent)] hover:underline font-medium"
                                        >
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminComplaintList;
