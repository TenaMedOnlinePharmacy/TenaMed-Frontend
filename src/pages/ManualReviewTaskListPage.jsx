import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellRing, ClipboardList, Loader2 } from 'lucide-react';
import { manualReviewClaimTask, manualReviewGetTasks } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getBackendWebSocketUrl } from '../utils/apiOrigin';

const getTasksArray = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.content)) return responseData.content;
    return [];
};

const normalizeServerEvent = (raw) => {
    if (!raw || typeof raw !== 'object') return null;
    const eventType = raw.type || raw.eventType || raw.action;
    const taskPayload = raw.task || raw.payload || raw.data || raw;
    if (!eventType || !taskPayload) return null;
    return {
        type: String(eventType).toUpperCase(),
        task: taskPayload,
    };
};

const formatDateTime = (value) => {
    if (!value) return 'Unknown time';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
};

const ManualReviewTaskListPage = () => {
    const navigate = useNavigate();
    const { userEmail } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [claimLoadingById, setClaimLoadingById] = useState({});

    const pendingTasks = useMemo(
        () => tasks.filter((task) => String(task?.status || '').toUpperCase() === 'PENDING'),
        [tasks],
    );

    const loadTasks = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const response = await manualReviewGetTasks();
            const fetched = getTasksArray(response?.data);
            setTasks(fetched);
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Failed to load pending manual review tasks.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        let socket;
        try {
            socket = new WebSocket(getBackendWebSocketUrl('/ws'));
        } catch {
            return undefined;
        }

        socket.onopen = () => {
            try {
                socket.send(JSON.stringify({ action: 'SUBSCRIBE', topic: '/topic/tasks' }));
            } catch {
                // Keep listening even if server does not require explicit subscribe payload.
            }
        };

        socket.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                const normalized = normalizeServerEvent(parsed);
                if (!normalized) return;

                if (normalized.type === 'TASK_CREATED') {
                    const incoming = normalized.task;
                    const incomingId = incoming?.id;
                    if (!incomingId) return;
                    setTasks((prev) => {
                        const exists = prev.some((task) => task?.id === incomingId);
                        if (exists) {
                            return prev.map((task) => (task?.id === incomingId ? { ...task, ...incoming } : task));
                        }
                        return [incoming, ...prev];
                    });
                    return;
                }

                if (normalized.type === 'TASK_CLAIMED') {
                    const claimedTask = normalized.task;
                    const claimedId = claimedTask?.id;
                    if (!claimedId) return;

                    const assignedTo = String(claimedTask?.assignedTo || '').toLowerCase();
                    const isCurrentUserClaim = assignedTo && assignedTo === String(userEmail || '').toLowerCase();
                    if (isCurrentUserClaim) {
                        setTasks((prev) => prev.map((task) => (task?.id === claimedId ? { ...task, ...claimedTask } : task)));
                    } else {
                        setTasks((prev) => prev.filter((task) => task?.id !== claimedId));
                    }
                    return;
                }

                if (normalized.type === 'TASK_COMPLETED') {
                    const completedId = normalized.task?.id;
                    if (!completedId) return;
                    setTasks((prev) => prev.filter((task) => task?.id !== completedId));
                }
            } catch {
                // Ignore malformed WS payloads so UI stays usable.
            }
        };

        return () => {
            try {
                socket?.close();
            } catch {
                // ignore
            }
        };
    }, [userEmail]);

    const handleClaim = async (taskId) => {
        if (!taskId) return;
        setErrorMsg('');
        setClaimLoadingById((prev) => ({ ...prev, [taskId]: true }));
        try {
            await manualReviewClaimTask(taskId);
            navigate(`/pharmacist/manual-review/tasks/${taskId}`);
        } catch (error) {
            setErrorMsg(error?.response?.data?.error || error?.response?.data?.message || 'Unable to claim this task.');
        } finally {
            setClaimLoadingById((prev) => ({ ...prev, [taskId]: false }));
        }
    };

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-10 relative z-10">
            <div className="nova-main max-w-6xl">
                <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-syne text-3xl font-bold text-[var(--text)] tracking-tight">Manual Review Tasks</h1>
                        <p className="text-sm text-[var(--text2)] mt-1">Pending prescription reviews for pharmacist admins.</p>
                    </div>
                    <Link to="/pharmacist/manual-review/my-tasks" className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold">
                        My Tasks
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
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading pending tasks...
                        </div>
                    ) : pendingTasks.length === 0 ? (
                        <div className="text-sm text-[var(--text3)] flex items-center gap-2">
                            <BellRing className="w-4 h-4" /> No pending manual review tasks.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingTasks.map((task) => {
                                const taskId = task?.id;
                                const isClaiming = Boolean(claimLoadingById[taskId]);
                                return (
                                    <article key={taskId} className="rounded-xl border border-[var(--border2)] bg-[var(--surface2)] p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-[var(--text)] flex items-center gap-2">
                                                <ClipboardList className="w-4 h-4 text-[var(--accent)]" />
                                                Task #{taskId}
                                            </p>
                                            <span className="text-xs px-2.5 py-1 rounded-full border border-[rgba(234,179,8,0.3)] text-yellow-400 bg-[rgba(234,179,8,0.12)]">
                                                {task?.priority || 'NORMAL'}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm text-[var(--text2)]">
                                            <span className="text-[var(--text3)]">Reason:</span> {task?.reason || 'N/A'}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text3)]">
                                            Created: {formatDateTime(task?.createdAt)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleClaim(taskId)}
                                            disabled={isClaiming}
                                            className="mt-4 btn-primary px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                                        >
                                            {isClaiming ? 'Claiming...' : 'Claim'}
                                        </button>
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

export default ManualReviewTaskListPage;
