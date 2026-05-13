import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { complaintCreate } from '../api/axios';

const CreateComplaint = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Default orderId if passed from some other page via state
    const defaultOrderId = location.state?.orderId || '';

    const [formData, setFormData] = useState({
        orderId: defaultOrderId,
        category: 'PRODUCT_ISSUE',
        subject: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.orderId || !formData.subject || !formData.description) {
            setError('Please fill in all required fields.');
            return;
        }

        setIsLoading(true);
        try {
            await complaintCreate(formData);
            navigate('/complaints', { state: { message: 'Complaint submitted successfully.' } });
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to submit complaint. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-[var(--surface)] text-[var(--text)] mt-8 rounded-xl shadow border border-[var(--border)]">
            <h1 className="text-2xl font-bold mb-6 text-[var(--text)]">Submit a Complaint</h1>
            
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text2)]">Order ID *</label>
                    <input
                        type="text"
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleChange}
                        className="w-full p-2 bg-[var(--surface2)] border border-[var(--border)] rounded focus:border-[var(--accent)] outline-none text-[var(--text)]"
                        placeholder="Enter your Order ID"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text2)]">Category *</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-2 bg-[var(--surface2)] border border-[var(--border)] rounded focus:border-[var(--accent)] outline-none text-[var(--text)]"
                        required
                    >
                        <option value="PRODUCT_ISSUE">Product Issue</option>
                        <option value="DELIVERY_ISSUE">Delivery Issue</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text2)]">Subject *</label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-2 bg-[var(--surface2)] border border-[var(--border)] rounded focus:border-[var(--accent)] outline-none text-[var(--text)]"
                        placeholder="Brief subject of your complaint"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text2)]">Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="w-full p-2 bg-[var(--surface2)] border border-[var(--border)] rounded focus:border-[var(--accent)] outline-none text-[var(--text)]"
                        placeholder="Detailed description of the issue"
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link to="/complaints" className="px-4 py-2 border border-[var(--border)] text-[var(--text)] rounded hover:bg-[var(--surface2)] transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-[var(--accent)] text-[#000] font-semibold rounded hover:brightness-110 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateComplaint;
