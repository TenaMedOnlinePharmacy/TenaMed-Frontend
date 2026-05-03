import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { manualReviewCompleteTask, manualReviewGetMyTasks, manualReviewRejectTask } from '../api/axios';
import { resolveApiImageUrl } from '../utils/imageUrl';

const getTasksArray = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.content)) return responseData.content;
    return [];
};

const ManualReviewTaskPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [submitErrorMsg, setSubmitErrorMsg] = useState('');
    const [formData, setFormData] = useState({
        decision: 'APPROVED',
        medicineName: '',
        quantity: '',
        strength: '',
        form: '',
        instructions: '',
        rejectReason: '',
    });

    useEffect(() => {
        const loadTask = async () => {
            if (!id) return;
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await manualReviewGetMyTasks();
                const myTasks = getTasksArray(response?.data);
                const matched = myTasks.find((entry) => String(entry?.id) === String(id));
                if (!matched) {
                    setErrorMsg('Task not found in your assigned queue. It may have been reassigned or completed.');
                    setTask(null);
                    return;
                }
                setTask(matched);
            } catch (error) {
                setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load task details.');
            } finally {
                setIsLoading(false);
            }
        };

        loadTask();
    }, [id]);

    const imageUrl = useMemo(() => resolveApiImageUrl(task?.imageUrl, task?.imageUrl || ''), [task?.imageUrl]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!id) return;

        setSubmitErrorMsg('');
        setIsSubmitting(true);
        try {
            if (formData.decision === 'REJECTED') {
                const reason = formData.rejectReason.trim();
                if (!reason) {
                    setSubmitErrorMsg('Please enter a rejection reason.');
                    setIsSubmitting(false);
                    return;
                }
                await manualReviewRejectTask(id, { reason });
            } else {
                const quantityRaw = String(formData.quantity || '').trim();
                const quantityNum = Number.parseInt(quantityRaw, 10);
                if (!formData.medicineName.trim()) {
                    setSubmitErrorMsg('Medicine name is required.');
                    setIsSubmitting(false);
                    return;
                }
                if (Number.isNaN(quantityNum) || quantityNum < 1) {
                    setSubmitErrorMsg('Quantity must be a positive whole number.');
                    setIsSubmitting(false);
                    return;
                }
                // Backend expects List<PrescriptionItemRequestDto> — a JSON array, not one object.
                await manualReviewCompleteTask(id, [
                    {
                        medicineName: formData.medicineName.trim(),
                        quantity: quantityNum,
                        strength: String(formData.strength || '').trim(),
                        form: String(formData.form || '').trim(),
                        instructions: String(formData.instructions || '').trim(),
                    },
                ]);
            }
            navigate('/pharmacist/manual-review/tasks');
        } catch (error) {
            setSubmitErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to submit manual review decision.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-10 relative z-10">
            <div className="nova-main max-w-6xl">
                <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-syne text-3xl font-bold text-[var(--text)] tracking-tight">Review Task #{id}</h1>
                        <p className="text-sm text-[var(--text2)] mt-1">Inspect prescription image and submit medicine details.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/pharmacist/manual-review/tasks" className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold">
                            Task List
                        </Link>
                        <Link to="/pharmacist/manual-review/my-tasks" className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold">
                            My Tasks
                        </Link>
                    </div>
                </div>

                {errorMsg ? (
                    <div className="rounded-lg border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] px-4 py-3 text-sm text-[var(--danger)]">
                        {errorMsg}
                    </div>
                ) : null}

                {isLoading ? (
                    <div className="nova-card p-6 text-sm text-[var(--text3)] flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading task details...
                    </div>
                ) : task ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section className="nova-card p-4">
                            <h2 className="font-semibold text-[var(--text)] mb-3">Prescription Image</h2>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Prescription"
                                    className="w-full rounded-lg border border-[var(--border2)] object-contain max-h-[520px] bg-[var(--surface2)]"
                                />
                            ) : (
                                <div className="text-sm text-[var(--text3)] rounded-lg border border-[var(--border2)] p-6">
                                    No prescription image available for this task.
                                </div>
                            )}
                        </section>

                        <section className="nova-card p-5">
                            <h2 className="font-semibold text-[var(--text)] mb-3">Manual Review Decision</h2>
                            <p className="text-sm text-[var(--text2)] mb-4">
                                <span className="text-[var(--text3)]">Reason:</span> {task?.reason || 'N/A'}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--text2)] mb-1">Decision</label>
                                    <select
                                        value={formData.decision}
                                        onChange={(event) => handleChange('decision', event.target.value)}
                                        className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                    >
                                        <option value="APPROVED">Approve (complete)</option>
                                        <option value="REJECTED">Reject</option>
                                    </select>
                                </div>

                                {formData.decision === 'APPROVED' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm text-[var(--text2)] mb-1">Medicine name</label>
                                            <input
                                                type="text"
                                                value={formData.medicineName}
                                                onChange={(event) => handleChange('medicineName', event.target.value)}
                                                required
                                                className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm text-[var(--text2)] mb-1">Quantity</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    value={formData.quantity}
                                                    onChange={(event) => handleChange('quantity', event.target.value)}
                                                    required
                                                    className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--text2)] mb-1">Strength</label>
                                                <input
                                                    type="text"
                                                    value={formData.strength}
                                                    onChange={(event) => handleChange('strength', event.target.value)}
                                                    placeholder="e.g. 500mg"
                                                    className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-[var(--text2)] mb-1">Form</label>
                                            <input
                                                type="text"
                                                value={formData.form}
                                                onChange={(event) => handleChange('form', event.target.value)}
                                                placeholder="e.g. Tablet"
                                                className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-[var(--text2)] mb-1">Instructions</label>
                                            <textarea
                                                value={formData.instructions}
                                                onChange={(event) => handleChange('instructions', event.target.value)}
                                                rows={3}
                                                className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-sm text-[var(--text2)] mb-1">Rejection reason</label>
                                        <textarea
                                            value={formData.rejectReason}
                                            onChange={(event) => handleChange('rejectReason', event.target.value)}
                                            rows={4}
                                            required
                                            placeholder="e.g. Prescription unreadable"
                                            className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                        />
                                    </div>
                                )}

                                {submitErrorMsg ? (
                                    <div className="rounded-lg border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] px-3 py-2 text-sm text-[var(--danger)]">
                                        {submitErrorMsg}
                                    </div>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Submitting...' : formData.decision === 'REJECTED' ? 'Submit rejection' : 'Submit approval'}
                                </button>
                            </form>
                        </section>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ManualReviewTaskPage;
