import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminComplaintGetDetails, adminComplaintUpdateStatus, adminComplaintAddNote } from '../api/axios';

const AdminComplaintDetails = () => {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [updatingStatus, setUpdatingStatus] = useState(false);
    
    // Note state
    const [adminNote, setAdminNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    const fetchDetails = async () => {
        try {
            setIsLoading(true);
            const response = await adminComplaintGetDetails(id);
            setComplaint(response?.data);
            setAdminNote(response?.data?.adminNote || '');
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to load complaint details.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        if (!newStatus || newStatus === complaint.status) return;
        
        setError('');
        setSuccessMsg('');
        setUpdatingStatus(true);
        
        try {
            const response = await adminComplaintUpdateStatus(id, { status: newStatus });
            setComplaint(response.data);
            setSuccessMsg(`Status successfully updated to ${newStatus.replace('_', ' ')}`);
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to update status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleNoteSave = async () => {
        setError('');
        setSuccessMsg('');
        setSavingNote(true);
        
        try {
            const response = await adminComplaintAddNote(id, { adminNote });
            setComplaint(response.data);
            setSuccessMsg('Admin note updated successfully.');
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to sync admin note.');
        } finally {
            setSavingNote(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-20 text-[var(--text2)]">Loading complaint data...</div>;
    }

    if (error && !complaint) {
        return (
            <div className="max-w-2xl mx-auto p-6 mt-8">
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                    {error}
                </div>
                <Link to="/admin/complaints" className="text-[var(--accent)] hover:underline">← Back to complaints dashboard</Link>
            </div>
        );
    }

    const { status, subject, description, category, customerId, orderId, createdAt, updatedAt } = complaint;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 mt-4 pb-20">
            <Link to="/admin/complaints" className="text-[var(--text2)] hover:text-[var(--accent)] transition-colors mb-6 inline-block font-medium">
                ← Back to Complaints Dashboard
            </Link>

            <div className="flex gap-6 items-start flex-col xl:flex-row">
                
                {/* Left side: Complaint Info */}
                <div className="flex-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 md:p-8">
                    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[var(--border)] pb-6 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{subject}</h1>
                            <p className="text-sm text-[var(--text2)] font-mono tracking-wide">Complaint ID: {id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-[var(--surface2)] rounded-lg border border-[var(--border)] p-4">
                        <div>
                            <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Customer ID</p>
                            <p className="font-medium text-[var(--text)] font-mono text-sm">{customerId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Order ID</p>
                            <p className="font-medium text-[var(--text)] font-mono text-sm">{orderId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Category</p>
                            <p className="font-medium text-[var(--text)]">{category?.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Created</p>
                            <p className="font-medium text-[var(--text)]">{new Date(createdAt).toLocaleString()}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs text-[var(--text3)] uppercase tracking-wider mb-1">Last Update</p>
                            <p className="font-medium text-[var(--text)]">{new Date(updatedAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-[var(--text)] font-semibold uppercase tracking-wider mb-3">Customer Description</p>
                        <div className="bg-[var(--surface2)] border border-[var(--border)] p-5 rounded-lg text-[var(--text)] whitespace-pre-wrap leading-relaxed text-sm">
                            {description}
                        </div>
                    </div>
                </div>

                {/* Right side: Management Actions */}
                <div className="w-full xl:w-80 flex flex-col gap-6">
                    
                    {/* Feedback Messages */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded text-sm">
                            {successMsg}
                        </div>
                    )}

                    {/* Status Management */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                        <h3 className="font-bold text-[var(--text)] mb-4">Set Status</h3>
                        {updatingStatus ? (
                            <div className="text-sm text-[var(--text2)] animate-pulse">Updating...</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <label className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg border ${status === 'PENDING' ? 'border-yellow-500 bg-yellow-500/10' : 'border-[var(--border)] hover:bg-[var(--surface2)]'}`}>
                                    <input type="radio" value="PENDING" checked={status === 'PENDING'} onChange={() => handleStatusUpdate('PENDING')} className="accent-yellow-500" />
                                    <span className={status === 'PENDING' ? 'text-yellow-500 font-semibold' : 'text-[var(--text2)]'}>Pending</span>
                                </label>
                                <label className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg border ${status === 'UNDER_REVIEW' ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border)] hover:bg-[var(--surface2)]'}`}>
                                    <input type="radio" value="UNDER_REVIEW" checked={status === 'UNDER_REVIEW'} onChange={() => handleStatusUpdate('UNDER_REVIEW')} className="accent-blue-500" />
                                    <span className={status === 'UNDER_REVIEW' ? 'text-blue-500 font-semibold' : 'text-[var(--text2)]'}>Under Review</span>
                                </label>
                                <label className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg border ${status === 'RESOLVED' ? 'border-green-500 bg-green-500/10' : 'border-[var(--border)] hover:bg-[var(--surface2)]'}`}>
                                    <input type="radio" value="RESOLVED" checked={status === 'RESOLVED'} onChange={() => handleStatusUpdate('RESOLVED')} className="accent-green-500" />
                                    <span className={status === 'RESOLVED' ? 'text-green-500 font-semibold' : 'text-[var(--text2)]'}>Resolved</span>
                                </label>
                                <label className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg border ${status === 'REJECTED' ? 'border-red-500 bg-red-500/10' : 'border-[var(--border)] hover:bg-[var(--surface2)]'}`}>
                                    <input type="radio" value="REJECTED" checked={status === 'REJECTED'} onChange={() => handleStatusUpdate('REJECTED')} className="accent-red-500" />
                                    <span className={status === 'REJECTED' ? 'text-red-500 font-semibold' : 'text-[var(--text2)]'}>Rejected</span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Admin Note Management */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col h-full">
                        <h3 className="font-bold text-[var(--accent)] mb-3">Admin Note</h3>
                        <p className="text-xs text-[var(--text3)] mb-3 leading-relaxed">
                            This note will be visible to the customer. Use it to provide resolution details or ask for more information.
                        </p>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Enter notes to the customer..."
                            rows={6}
                            className="w-full bg-[var(--surface2)] border border-[var(--border)] focus:border-[var(--accent)] rounded-lg p-3 text-sm text-[var(--text)] outline-none resize-y mb-4"
                        />
                        <button
                            onClick={handleNoteSave}
                            disabled={savingNote || !adminNote.trim() || adminNote === (complaint.adminNote || '')}
                            className="bg-[var(--accent)] text-[#000] font-semibold py-2 px-4 rounded hover:brightness-110 disabled:opacity-50 transition-colors w-full mt-auto"
                        >
                            {savingNote ? 'Saving...' : 'Save Admin Note'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminComplaintDetails;
