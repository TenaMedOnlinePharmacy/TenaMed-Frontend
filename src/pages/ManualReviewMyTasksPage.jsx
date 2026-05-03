import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, UserCheck } from 'lucide-react';
import { manualReviewGetMyTasks } from '../api/axios';

const getTasksArray = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.content)) return responseData.content;
    return [];
};

const formatDateTime = (value) => {
    if (!value) return 'Unknown time';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
};

const statusClassMap = {
    IN_PROGRESS: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    COMPLETED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    PENDING: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
};

const ManualReviewMyTasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadMyTasks = async () => {
            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await manualReviewGetMyTasks();
                setTasks(getTasksArray(response?.data));
            } catch (error) {
                setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load your assigned tasks.');
            } finally {
                setIsLoading(false);
            }
        };

        loadMyTasks();
    }, []);

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-10 relative z-10">
            <div className="nova-main max-w-6xl">
                <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-syne text-3xl font-bold text-[var(--text)] tracking-tight">My Manual Review Tasks</h1>
                        <p className="text-sm text-[var(--text2)] mt-1">Tasks currently assigned to your account.</p>
                    </div>
                    <Link to="/pharmacist/manual-review/tasks" className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold">
                        Back to Task List
                    </Link>
                </div>

                {errorMsg ? (
                    <div className="mb-4 rounded-lg border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.1)] px-4 py-3 text-sm text-[var(--danger)]">
                        {errorMsg}
                    </div>
                ) : null}

                <div className="nova-card p-6">
                    {isLoading ? (
                        <div className="text-sm text-[var(--text3)] flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading your tasks...
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-sm text-[var(--text3)] flex items-center gap-2">
                            <UserCheck className="w-4 h-4" /> You have no assigned tasks right now.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tasks.map((task) => {
                                const status = String(task?.status || 'PENDING').toUpperCase();
                                return (
                                    <article key={task?.id} className="rounded-xl border border-[var(--border2)] bg-[var(--surface2)] p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-[var(--text)]">Task #{task?.id}</p>
                                            <span className={`text-xs px-2.5 py-1 rounded-full border ${statusClassMap[status] || 'border-[var(--border2)] bg-[var(--surface3)] text-[var(--text2)]'}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text2)]">
                                            <span className="text-[var(--text3)]">Reason:</span> {task?.reason || 'N/A'}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text3)]">Created: {formatDateTime(task?.createdAt)}</p>
                                        <div className="mt-4">
                                            <Link
                                                to={`/pharmacist/manual-review/tasks/${task?.id}`}
                                                className="btn-primary inline-flex px-4 py-2 rounded-lg text-sm font-semibold"
                                            >
                                                Open Review
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualReviewMyTasksPage;
