import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, ClipboardList, CheckCircle, XCircle, Plus, Trash2, Edit, Users, Send, Truck } from 'lucide-react';
import {
    deliveryDispatch,
    deliveryListByStatus,
    deliveryListFailed,
    deliveryMarkDelivered,
    deliveryMarkFailed,
    inventoryDeleteBatch,
    inventoryList,
    orderAccept,
    orderReject,
    pharmacyGetIncomingOrders,
    pharmacyInvitePharmacist,
    pharmacyListStaff,
    pharmacyVerifyStaff,
} from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { resolveApiImageUrl } from '../utils/imageUrl';

const PharmacistDashboard = () => {
    const { userRole } = useAuth();
    const isPharmacyOwner = userRole === 'pharmacy';
    const isAdminPharmacist = ['ADMIN_PHARMACIST', 'admin_pharmacist', 'admin-pharmacist'].includes(userRole);
    const canManageDeliveries = ['pharmacy', 'pharmacist', 'PHARMACIST', 'ADMIN_PHARMACIST', 'admin_pharmacist', 'admin-pharmacist'].includes(userRole);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState(() => {
        if (requestedTab === 'team' && isPharmacyOwner) {
            return 'team';
        }
        if (['orders', 'inventory', 'deliveries'].includes(requestedTab)) {
            return requestedTab;
        }
        return 'orders';
    });
    const [inventory, setInventory] = useState([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [inventoryErrorMsg, setInventoryErrorMsg] = useState('');
    const [batchActionLoadingById, setBatchActionLoadingById] = useState({});
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [ordersErrorMsg, setOrdersErrorMsg] = useState('');
    const [actionLoadingByOrderId, setActionLoadingByOrderId] = useState({});
    const [deliveries, setDeliveries] = useState([]);
    const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
    const [deliveriesErrorMsg, setDeliveriesErrorMsg] = useState('');
    const [deliveryActionLoadingById, setDeliveryActionLoadingById] = useState({});
    const [activeDeliveryStatus, setActiveDeliveryStatus] = useState('READY_FOR_DELIVERY');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatusMsg, setInviteStatusMsg] = useState('');
    const [inviteErrorMsg, setInviteErrorMsg] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [staffRows, setStaffRows] = useState([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);
    const [staffErrorMsg, setStaffErrorMsg] = useState('');
    const [actionLoadingByUserId, setActionLoadingByUserId] = useState({});

    useEffect(() => {
        const isTeamRequested = requestedTab === 'team';
        if (isTeamRequested && isPharmacyOwner) {
            setActiveTab('team');
            return;
        }
        if (isTeamRequested && !isPharmacyOwner) {
            setSearchParams({ tab: 'orders' }, { replace: true });
            setActiveTab('orders');
            return;
        }
        if (['orders', 'inventory', 'deliveries'].includes(requestedTab) && requestedTab !== activeTab) {
            setActiveTab(requestedTab);
            return;
        }
        if (requestedTab && !['orders', 'inventory', 'deliveries', 'team'].includes(requestedTab)) {
            setSearchParams({ tab: 'orders' }, { replace: true });
            setActiveTab('orders');
        }
    }, [activeTab, isPharmacyOwner, requestedTab, setSearchParams]);

    useEffect(() => {
        if (!isPharmacyOwner) {
            return;
        }

        setIsLoadingStaff(true);
        setStaffErrorMsg('');
        pharmacyListStaff()
            .then((response) => {
                setStaffRows(Array.isArray(response?.data) ? response.data : []);
            })
            .catch(() => {
                setStaffErrorMsg('Failed to load staff list.');
            })
            .finally(() => {
                setIsLoadingStaff(false);
            });
    }, [isPharmacyOwner]);

    const loadIncomingOrders = async () => {
        setIsLoadingOrders(true);
        setOrdersErrorMsg('');

        try {
            const response = await pharmacyGetIncomingOrders();
            setOrders(Array.isArray(response?.data) ? response.data : []);
        } catch {
            setOrdersErrorMsg('Failed to load incoming orders.');
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const loadInventory = async () => {
        setIsLoadingInventory(true);
        setInventoryErrorMsg('');

        try {
            const response = await inventoryList();
            setInventory(Array.isArray(response?.data) ? response.data : []);
        } catch {
            setInventoryErrorMsg('Failed to load inventory list.');
        } finally {
            setIsLoadingInventory(false);
        }
    };

    const loadDeliveries = async (status) => {
        setIsLoadingDeliveries(true);
        setDeliveriesErrorMsg('');

        try {
            const response = status === 'FAILED'
                ? await deliveryListFailed()
                : await deliveryListByStatus(status);
            setDeliveries(Array.isArray(response?.data) ? response.data : []);
        } catch {
            setDeliveriesErrorMsg('Failed to load deliveries.');
        } finally {
            setIsLoadingDeliveries(false);
        }
    };

    useEffect(() => {
        loadIncomingOrders();
    }, []);

    useEffect(() => {
        if (activeTab !== 'inventory') {
            return;
        }
        loadInventory();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'deliveries') {
            return;
        }
        loadDeliveries(activeDeliveryStatus);
    }, [activeDeliveryStatus, activeTab]);

    const pendingStaff = useMemo(() => {
        return staffRows.filter((row) => row?.staffRole === 'PHARMACIST' && !Boolean(row?.isVerified));
    }, [staffRows]);

    const verifiedStaff = useMemo(() => {
        return staffRows.filter((row) => row?.staffRole === 'PHARMACIST' && Boolean(row?.isVerified));
    }, [staffRows]);

    const incomingOrders = useMemo(() => {
        return orders.map((order) => ({
            orderId: order?.orderId || order?.id || 'UNKNOWN',
            prescriptionImage: order?.prescriptionImage || '',
            orderItems: Array.isArray(order?.orderItems) ? order.orderItems : [],
            type: order?.type || 'UNKNOWN',
            highRisk: order?.highRisk === true,
            status: order?.status || 'UNKNOWN',
            confidenceScore: typeof order?.confidenceScore === 'number' ? order.confidenceScore : null,
            totalAmount: typeof order?.totalAmount === 'number' ? order.totalAmount : 0,
        }));
    }, [orders]);

    const incomingOrderCount = incomingOrders.length;
    const highRiskOrderCount = incomingOrders.filter((order) => order.highRisk).length;
    const ordersWithImages = incomingOrders.filter((order) => Boolean(order.prescriptionImage)).length;
    const totalOrderAmount = incomingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const outOfStockCount = inventory.filter((item) => Number(item?.remainingQuantity ?? 0) <= 0).length;

    const setTab = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab }, { replace: true });
    };

    const handleSendInvitation = async (event) => {
        event.preventDefault();
        setInviteStatusMsg('');
        setInviteErrorMsg('');

        if (!inviteEmail.trim()) {
            setInviteErrorMsg('Enter pharmacist email address.');
            return;
        }

        setIsInviting(true);
        try {
            const ownerPharmacyId = pendingStaff[0]?.pharmacyId || staffRows[0]?.pharmacyId;
            if (!ownerPharmacyId) {
                throw new Error('Pharmacy context not found for current owner account.');
            }
            await pharmacyInvitePharmacist(ownerPharmacyId, { email: inviteEmail.trim() });
            setInviteEmail('');
            setInviteStatusMsg('Invitation email sent successfully.');

            const staffResponse = await pharmacyListStaff();
            setStaffRows(Array.isArray(staffResponse?.data) ? staffResponse.data : []);
        } catch (error) {
            const message = error?.response?.data?.error || error?.response?.data?.message || 'Failed to send invitation.';
            setInviteErrorMsg(message);
        } finally {
            setIsInviting(false);
        }
    };

    const updateActionLoading = (userId, value) => {
        setActionLoadingByUserId((prev) => ({
            ...prev,
            [userId]: value,
        }));
    };

    const updateOrderActionLoading = (orderId, value) => {
        setActionLoadingByOrderId((prev) => ({
            ...prev,
            [orderId]: value,
        }));
    };

    const updateBatchActionLoading = (batchId, value) => {
        setBatchActionLoadingById((prev) => ({
            ...prev,
            [batchId]: value,
        }));
    };

    const updateDeliveryActionLoading = (deliveryId, value) => {
        setDeliveryActionLoadingById((prev) => ({
            ...prev,
            [deliveryId]: value,
        }));
    };

    const handleDeleteBatch = async (batchId) => {
        if (!batchId) {
            setInventoryErrorMsg('Missing batch id for deletion.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this batch?')) {
            return;
        }

        updateBatchActionLoading(batchId, true);
        setInventoryErrorMsg('');
        try {
            await inventoryDeleteBatch(batchId);
            await loadInventory();
        } catch (error) {
            setInventoryErrorMsg(error?.response?.data?.error || 'Failed to delete batch.');
        } finally {
            updateBatchActionLoading(batchId, false);
        }
    };

    const handleEditBatch = async (batchId) => {
        if (!batchId) {
            setInventoryErrorMsg('Missing batch id for editing.');
            return;
        }

        navigate(`/pharmacist/inventory/batch/new?batchId=${batchId}`);
    };

    const handleAcceptOrder = async (orderId) => {
        if (!orderId || orderId === 'UNKNOWN') {
            setOrdersErrorMsg('Missing order id for acceptance.');
            return;
        }

        updateOrderActionLoading(orderId, true);
        setOrdersErrorMsg('');
        try {
            await orderAccept(orderId);
            await loadIncomingOrders();
        } catch (error) {
            setOrdersErrorMsg(error?.response?.data?.error || 'Failed to accept order.');
        } finally {
            updateOrderActionLoading(orderId, false);
        }
    };

    const handleRejectOrder = async (orderId) => {
        if (!orderId || orderId === 'UNKNOWN') {
            setOrdersErrorMsg('Missing order id for rejection.');
            return;
        }

        const rejectionReason = window.prompt('Enter rejection reason');
        if (!rejectionReason || !rejectionReason.trim()) {
            return;
        }

        updateOrderActionLoading(orderId, true);
        setOrdersErrorMsg('');
        try {
            await orderReject(orderId, { rejectionReason: rejectionReason.trim() });
            await loadIncomingOrders();
        } catch (error) {
            setOrdersErrorMsg(error?.response?.data?.error || 'Failed to reject order.');
        } finally {
            updateOrderActionLoading(orderId, false);
        }
    };

    const handleDispatchDelivery = async (deliveryId) => {
        if (!deliveryId) {
            setDeliveriesErrorMsg('Missing delivery id for dispatch.');
            return;
        }

        updateDeliveryActionLoading(deliveryId, true);
        setDeliveriesErrorMsg('');
        try {
            await deliveryDispatch(deliveryId);
            await loadDeliveries(activeDeliveryStatus);
        } catch (error) {
            setDeliveriesErrorMsg(error?.response?.data?.error || 'Failed to dispatch delivery.');
        } finally {
            updateDeliveryActionLoading(deliveryId, false);
        }
    };

    const handleMarkDelivered = async (deliveryId) => {
        if (!deliveryId) {
            setDeliveriesErrorMsg('Missing delivery id for completion.');
            return;
        }

        updateDeliveryActionLoading(deliveryId, true);
        setDeliveriesErrorMsg('');
        try {
            await deliveryMarkDelivered(deliveryId);
            await loadDeliveries(activeDeliveryStatus);
        } catch (error) {
            setDeliveriesErrorMsg(error?.response?.data?.error || 'Failed to mark delivery as delivered.');
        } finally {
            updateDeliveryActionLoading(deliveryId, false);
        }
    };

    const handleMarkFailed = async (deliveryId) => {
        if (!deliveryId) {
            setDeliveriesErrorMsg('Missing delivery id for failure update.');
            return;
        }

        const failureReason = window.prompt('Enter failure reason');
        if (!failureReason || !failureReason.trim()) {
            return;
        }

        updateDeliveryActionLoading(deliveryId, true);
        setDeliveriesErrorMsg('');
        try {
            await deliveryMarkFailed(deliveryId, { reason: failureReason.trim() });
            await loadDeliveries(activeDeliveryStatus);
        } catch (error) {
            setDeliveriesErrorMsg(error?.response?.data?.error || 'Failed to mark delivery as failed.');
        } finally {
            updateDeliveryActionLoading(deliveryId, false);
        }
    };

    const handleApproveStaff = async (staff) => {
        const userId = staff?.userId;
        const pharmacyId = staff?.pharmacyId;
        if (!userId || !pharmacyId) {
            setStaffErrorMsg('Missing staff identifiers for approval.');
            return;
        }
        updateActionLoading(userId, true);
        setStaffErrorMsg('');
        try {
            await pharmacyVerifyStaff(pharmacyId, userId);
            const staffResponse = await pharmacyListStaff();
            setStaffRows(Array.isArray(staffResponse?.data) ? staffResponse.data : []);
        } catch (error) {
            setStaffErrorMsg(error?.response?.data?.error || 'Failed to approve pharmacist.');
        } finally {
            updateActionLoading(userId, false);
        }
    };

    const deliveryStatusTabs = useMemo(() => ([
        { key: 'READY_FOR_DELIVERY', label: 'Ready' },
        { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
        { key: 'DELIVERED', label: 'Delivered' },
        { key: 'FAILED', label: 'Failed' },
    ]), []);

    const deliveryStatusLabels = useMemo(() => ({
        READY_FOR_DELIVERY: 'Ready for Delivery',
        OUT_FOR_DELIVERY: 'Out for Delivery',
        DELIVERED: 'Delivered',
        FAILED: 'Failed',
    }), []);

    const deliveryStatusClassMap = useMemo(() => ({
        READY_FOR_DELIVERY: 'bg-[rgba(234,179,8,0.1)] text-yellow-500 border-[rgba(234,179,8,0.2)]',
        OUT_FOR_DELIVERY: 'bg-[rgba(59,130,246,0.1)] text-blue-500 border-[rgba(59,130,246,0.2)]',
        DELIVERED: 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]',
        FAILED: 'bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)] border-[var(--danger-border)]',
    }), []);

    const normalizedDeliveries = useMemo(() => {
        return deliveries.map((delivery) => ({
            id: delivery?.id || 'UNKNOWN',
            orderId: delivery?.orderId || 'UNKNOWN',
            status: delivery?.status || 'READY_FOR_DELIVERY',
            deliveryAddress: delivery?.deliveryAddress || 'N/A',
            dispatchedAt: delivery?.dispatchedAt || null,
            deliveredAt: delivery?.deliveredAt || null,
            failureReason: delivery?.failureReason || 'N/A',
            createdAt: delivery?.createdAt || null,
            customerPhone: delivery?.customerPhone || 'N/A',
        }));
    }, [deliveries]);

    const formatTimestamp = (value) => {
        if (!value) {
            return 'N/A';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleString();
    };

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] relative z-10 transition-colors">
            <div className="bg-[var(--surface)] shadow-[var(--glow)] border-b border-[var(--border2)] sticky top-0 z-20">
                <div className="nova-main py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="font-syne text-xl md:text-2xl font-bold text-[var(--text)] tracking-tight">{isPharmacyOwner ? 'Pharmacy Owner Dashboard' : 'Pharmacist Dashboard'}</h1>
                        <p className="text-sm text-[var(--text2)] font-light mt-1">City Pharmacy</p>
                    </div>
                    <div className="flex bg-[var(--surface2)] p-1 rounded-xl border border-[var(--border2)]">
                        <button
                            onClick={() => setTab('orders')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'orders' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)]'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setTab('inventory')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'inventory' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)]'}`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setTab('deliveries')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'deliveries' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)]'}`}
                        >
                            Deliveries
                        </button>
                        {isPharmacyOwner && (
                            <button
                                onClick={() => setTab('team')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'team' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)]'}`}
                            >
                                Team Invitations
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="nova-main py-8">
                {isPharmacyOwner ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-xs text-[var(--text2)] font-medium uppercase tracking-wider">Incoming Orders</p>
                            <p className="text-2xl font-bold text-yellow-500 mt-1">{incomingOrderCount}</p>
                        </div>
                        <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: "100ms"}}>
                            <p className="text-xs text-[var(--text2)] font-medium uppercase tracking-wider">High Risk Orders</p>
                            <p className="text-2xl font-bold text-[var(--danger)] mt-1">{highRiskOrderCount}</p>
                        </div>
                        <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: "200ms"}}>
                            <p className="text-xs text-[var(--text2)] font-medium uppercase tracking-wider">Rx Images</p>
                            <p className="text-2xl font-bold text-[var(--accent)] mt-1">{ordersWithImages}</p>
                        </div>
                        <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: "300ms"}}>
                            <p className="text-xs text-[var(--text2)] font-medium uppercase tracking-wider">Total Amount</p>
                            <p className="text-2xl font-bold text-[var(--text)] mt-1">${totalOrderAmount.toFixed(2)}</p>
                        </div>
                        <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: "400ms"}}>
                            <p className="text-xs text-[var(--text2)] font-medium uppercase tracking-wider">Out of Stock</p>
                            <p className="text-2xl font-bold text-[var(--danger)] mt-1">{outOfStockCount}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-xs text-[var(--text2)] font-medium uppercase tracking-wider">Incoming Orders</p>
                            <p className="text-2xl font-bold text-[var(--accent)] mt-1">{incomingOrderCount}</p>
                        </div>
                        <div className="nova-card p-5 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: "100ms"}}>
                            <p className="text-xs text-[var(--text2)] font-medium uppercase tracking-wider">Out of Stock</p>
                            <p className="text-2xl font-bold text-[var(--danger)] mt-1">{outOfStockCount}</p>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to="/pharmacist/prescription-review" className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
                            Open Prescription Review Queue
                        </Link>
                        {isAdminPharmacist ? (
                            <Link to="/pharmacist/manual-review/tasks" className="inline-flex items-center gap-2 btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold">
                                Open Manual Review Tasks
                            </Link>
                        ) : null}
                    </div>
                </div>

                {activeTab === 'orders' ? (
                    <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 relative z-0">
                        <div className="p-6 border-b border-[var(--border2)] flex justify-between items-center bg-[var(--surface2)]">
                            <h2 className="font-syne text-lg font-bold text-[var(--text)] flex items-center gap-2 tracking-tight">
                                <ClipboardList className="text-[var(--accent)]" /> Incoming Orders
                            </h2>
                        </div>
                        {ordersErrorMsg && <div className="px-6 pt-4 text-sm text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border-b border-[var(--danger-border)] p-3">{ordersErrorMsg}</div>}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                    <tr>
                                        <th className="p-4 font-medium tracking-wide">Prescription Image</th>
                                        <th className="p-4 font-medium tracking-wide">Medicine Names</th>
                                        <th className="p-4 font-medium tracking-wide">Risk Type</th>
                                        <th className="p-4 font-medium tracking-wide">Status</th>
                                        <th className="p-4 font-medium tracking-wide">Confidence Score</th>
                                        <th className="p-4 font-medium tracking-wide">Total Amount</th>
                                        <th className="p-4 font-medium tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border2)]">
                                    {isLoadingOrders ? (
                                        <tr>
                                            <td className="p-8 text-sm text-[var(--text3)] text-center" colSpan={7}>Loading incoming orders...</td>
                                        </tr>
                                    ) : incomingOrders.length === 0 ? (
                                        <tr>
                                            <td className="p-8 text-sm text-[var(--text3)] text-center" colSpan={7}>No incoming orders found.</td>
                                        </tr>
                                    ) : (
                                        incomingOrders.map((order) => {
                                            const medicineNames = order.orderItems.length > 0
                                                ? order.orderItems.map((item) => item?.medicineName || 'Unnamed medicine').join(', ')
                                                : 'No items provided';

                                            return (
                                                <tr key={order.orderId} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors align-top text-sm">
                                                    <td className="p-4">
                                                        {order.prescriptionImage ? (
                                                            <a href={resolveApiImageUrl(order.prescriptionImage, order.prescriptionImage)} target="_blank" rel="noreferrer" className="inline-block relative group">
                                                                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="text-white text-xs font-semibold">View</span>
                                                                </div>
                                                                <img
                                                                    src={resolveApiImageUrl(order.prescriptionImage, order.prescriptionImage)}
                                                                    alt="Prescription"
                                                                    className="h-16 w-16 rounded-lg object-cover border border-[var(--border2)]"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <span className="text-sm text-[var(--text3)] italic">No image</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-[var(--text2)]">
                                                        {order.orderItems.map((item, index) => (
                                                            <div key={`${order.orderId}-${index}`} className="mb-1.5 last:mb-0">
                                                                <span className="font-semibold text-[var(--text)]">{item?.medicineName || 'Unnamed medicine'}</span>
                                                                <span className="text-[var(--text3)]"> x{item?.quantity ?? 0}</span>
                                                            </div>
                                                        ))}
                                                        {order.orderItems.length === 0 && <span className="text-[var(--text3)]">{medicineNames}</span>}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-semibold border ${order.highRisk ? 'bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)] border-[var(--danger-border)]' : 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]'}`}>
                                                                {order.highRisk ? 'High Risk' : 'Standard'}
                                                            </span>
                                                            <span className="text-xs font-mono text-[var(--text3)]">Type: {order.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold border ${order.status === 'PENDING_REVIEW' ? 'bg-[rgba(234,179,8,0.1)] text-yellow-500 border-[rgba(234,179,8,0.2)]' : order.status === 'ACCEPTED' ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]' : order.status === 'REJECTED' ? 'bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)] border-[var(--danger-border)]' : 'bg-[var(--surface2)] text-[var(--text)] border-[var(--border2)]'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-[var(--text)] font-semibold">
                                                        {order.confidenceScore === null ? 'N/A' : `${Math.round(order.confidenceScore * 100)}%`}
                                                    </td>
                                                    <td className="p-4 font-semibold text-[var(--accent)] font-mono">${order.totalAmount.toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAcceptOrder(order.orderId)}
                                                                disabled={Boolean(actionLoadingByOrderId[order.orderId])}
                                                                className="p-2 text-emerald-500 hover:bg-[rgba(16,185,129,0.1)] rounded-xl disabled:opacity-60 transition-colors border border-transparent hover:border-[rgba(16,185,129,0.2)]"
                                                                title="Accept order"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRejectOrder(order.orderId)}
                                                                disabled={Boolean(actionLoadingByOrderId[order.orderId])}
                                                                className="p-2 text-[var(--danger)] hover:bg-[rgba(var(--danger-rgb),0.1)] rounded-xl disabled:opacity-60 transition-colors border border-transparent hover:border-[var(--danger-border)]"
                                                                title="Reject order"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'inventory' ? (
                    <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 relative z-0">
                        <div className="p-6 border-b border-[var(--border2)] flex justify-between items-center bg-[var(--surface2)]">
                            <h2 className="font-syne text-lg font-bold text-[var(--text)] flex items-center gap-2 tracking-tight">
                                <Package className="text-[var(--accent)]" /> Inventory Management
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigate('/pharmacist/inventory/batch/new')}
                                className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>
                        {inventoryErrorMsg && <div className="px-6 pt-4 text-sm text-[var(--danger)]">{inventoryErrorMsg}</div>}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                    <tr>
                                        <th className="p-4 font-medium tracking-wide">Image</th>
                                        <th className="p-4 font-medium tracking-wide">Medicine Name</th>
                                        <th className="p-4 font-medium tracking-wide">Brand</th>
                                        <th className="p-4 font-medium tracking-wide">Manufacturer</th>
                                        <th className="p-4 font-medium tracking-wide">Total Qty</th>
                                        <th className="p-4 font-medium tracking-wide">Remaining Qty</th>
                                        <th className="p-4 font-medium tracking-wide">Batch Prices</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border2)]">
                                    {isLoadingInventory ? (
                                        <tr>
                                            <td className="p-8 text-sm text-[var(--text3)] text-center" colSpan={7}>Loading inventory...</td>
                                        </tr>
                                    ) : inventory.length === 0 ? (
                                        <tr>
                                            <td className="p-8 text-sm text-[var(--text3)] text-center" colSpan={7}>No inventory items found.</td>
                                        </tr>
                                    ) : (
                                        inventory.map((item) => (
                                            <tr key={item.inventoryId || item.productId} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors align-top text-sm">
                                                <td className="p-4">
                                                    {item?.imageUrl ? (
                                                        <a href={resolveApiImageUrl(item.imageUrl, item.imageUrl)} target="_blank" rel="noreferrer" className="inline-block relative group">
                                                            <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white text-xs font-semibold">View</span>
                                                            </div>
                                                            <img
                                                                src={resolveApiImageUrl(item.imageUrl, item.imageUrl)}
                                                                alt={item?.medicineName || 'Medicine image'}
                                                                className="h-14 w-14 rounded-lg object-cover border border-[var(--border2)]"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-[var(--text3)] italic">No image</span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-semibold text-[var(--text)]">{item?.medicineName || 'N/A'}</td>
                                                <td className="p-4 text-[var(--text2)]">{item?.brand || 'N/A'}</td>
                                                <td className="p-4 text-[var(--text2)]">{item?.manufacturer || 'N/A'}</td>
                                                <td className="p-4 text-[var(--text)] font-semibold">{item?.totalQuantity ?? 0}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${Number(item?.remainingQuantity ?? 0) > 0 ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]' : 'bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)] border-[var(--danger-border)]'}`}>
                                                        {item?.remainingQuantity ?? 0}
                                                    </span>
                                                </td>
                                                <td className="p-4 min-w-[340px]">
                                                    {Array.isArray(item?.batchPrices) && item.batchPrices.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {item.batchPrices.map((batch) => {
                                                                const batchId = batch?.batchId;
                                                                const isBatchActionLoading = Boolean(batchActionLoadingById[batchId]);
                                                                return (
                                                                    <div key={batchId || `${item?.inventoryId}-batch`} className="rounded-xl border border-[var(--border2)] p-4 bg-[var(--surface2)] hover:border-[var(--accent)] transition-colors">
                                                                        <div className="text-xs text-[var(--text3)] mb-3 font-mono">Batch Number: {batch?.batchNumber || 'N/A'}</div>
                                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                                            <div className="text-sm text-[var(--text2)]">
                                                                                <span className="mr-4">Unit: <span className="font-semibold text-[var(--text)]">${Number(batch?.unitPrice ?? 0).toFixed(2)}</span></span>
                                                                                <span>Sell: <span className="font-semibold text-[var(--accent)]">${Number(batch?.sellingPrice ?? 0).toFixed(2)}</span></span>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleEditBatch(batchId)}
                                                                                    disabled={isBatchActionLoading}
                                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)] disabled:opacity-60 transition-colors"
                                                                                >
                                                                                    <Edit className="w-3.5 h-3.5" /> Edit
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteBatch(batchId)}
                                                                                    disabled={isBatchActionLoading}
                                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] hover:bg-[rgba(var(--danger-rgb),0.15)] disabled:opacity-60 transition-colors"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-[var(--text3)] italic">No batch prices</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'deliveries' ? (
                    <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 relative z-0">
                        <div className="p-6 border-b border-[var(--border2)] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--surface2)]">
                            <div>
                                <h2 className="font-syne text-lg font-bold text-[var(--text)] flex items-center gap-2 tracking-tight">
                                    <Truck className="text-[var(--accent)]" /> Delivery Management
                                </h2>
                                <p className="text-xs text-[var(--text3)] mt-1">Manage dispatches, confirmations, and failed drops.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {deliveryStatusTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveDeliveryStatus(tab.key)}
                                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeDeliveryStatus === tab.key ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)] border border-[var(--border2)]'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {deliveriesErrorMsg && (
                            <div className="px-6 pt-4 text-sm text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border-b border-[var(--danger-border)] p-3">
                                {deliveriesErrorMsg}
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                    <tr>
                                        <th className="p-4 font-medium tracking-wide">Delivery ID</th>
                                        <th className="p-4 font-medium tracking-wide">Order ID</th>
                                        <th className="p-4 font-medium tracking-wide">Address</th>
                                        <th className="p-4 font-medium tracking-wide">Customer Phone</th>
                                        <th className="p-4 font-medium tracking-wide">Created</th>
                                        <th className="p-4 font-medium tracking-wide">Dispatched</th>
                                        <th className="p-4 font-medium tracking-wide">Delivered</th>
                                        <th className="p-4 font-medium tracking-wide">Status</th>
                                        {activeDeliveryStatus === 'FAILED' && (
                                            <th className="p-4 font-medium tracking-wide">Failure Reason</th>
                                        )}
                                        {canManageDeliveries && (
                                            <th className="p-4 font-medium tracking-wide">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border2)]">
                                    {isLoadingDeliveries ? (
                                        <tr>
                                            <td
                                                className="p-8 text-sm text-[var(--text3)] text-center"
                                                colSpan={8 + (activeDeliveryStatus === 'FAILED' ? 1 : 0) + (canManageDeliveries ? 1 : 0)}
                                            >
                                                Loading deliveries...
                                            </td>
                                        </tr>
                                    ) : normalizedDeliveries.length === 0 ? (
                                        <tr>
                                            <td
                                                className="p-8 text-sm text-[var(--text3)] text-center"
                                                colSpan={8 + (activeDeliveryStatus === 'FAILED' ? 1 : 0) + (canManageDeliveries ? 1 : 0)}
                                            >
                                                No deliveries found for {deliveryStatusLabels[activeDeliveryStatus] || 'this status'}.
                                            </td>
                                        </tr>
                                    ) : (
                                        normalizedDeliveries.map((delivery) => {
                                            const isDeliveryActionLoading = Boolean(deliveryActionLoadingById[delivery.id]);
                                            const canDispatch = ['READY_FOR_DELIVERY', 'FAILED'].includes(delivery.status);
                                            const canMarkDelivered = delivery.status === 'OUT_FOR_DELIVERY';
                                            const canMarkFailed = delivery.status === 'OUT_FOR_DELIVERY';

                                            return (
                                                <tr key={delivery.id} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors align-top text-sm">
                                                    <td className="p-4 font-mono text-[var(--accent)] break-all">{delivery.id}</td>
                                                    <td className="p-4 text-[var(--text2)] font-mono break-all">{delivery.orderId}</td>
                                                    <td className="p-4 text-[var(--text)] font-medium min-w-[220px]">{delivery.deliveryAddress}</td>
                                                    <td className="p-4">
                                                        <span className={`text-sm ${delivery.customerPhone === 'N/A' ? 'text-[var(--text3)]' : 'text-[var(--text)] font-semibold'}`}>
                                                            {delivery.customerPhone}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-[var(--text2)]">{formatTimestamp(delivery.createdAt)}</td>
                                                    <td className="p-4 text-[var(--text2)]">{formatTimestamp(delivery.dispatchedAt)}</td>
                                                    <td className="p-4 text-[var(--text2)]">{formatTimestamp(delivery.deliveredAt)}</td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold border ${deliveryStatusClassMap[delivery.status] || 'bg-[var(--surface2)] text-[var(--text)] border-[var(--border2)]'}`}>
                                                            {deliveryStatusLabels[delivery.status] || delivery.status}
                                                        </span>
                                                    </td>
                                                    {activeDeliveryStatus === 'FAILED' && (
                                                        <td className="p-4 text-[var(--text2)] min-w-[200px]">{delivery.failureReason}</td>
                                                    )}
                                                    {canManageDeliveries && (
                                                        <td className="p-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                {canDispatch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDispatchDelivery(delivery.id)}
                                                                        disabled={isDeliveryActionLoading}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-500 bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.15)] disabled:opacity-60 transition-colors"
                                                                    >
                                                                        <Truck className="w-3.5 h-3.5" /> Dispatch
                                                                    </button>
                                                                )}
                                                                {canMarkDelivered && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleMarkDelivered(delivery.id)}
                                                                        disabled={isDeliveryActionLoading}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)] disabled:opacity-60 transition-colors"
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                                                                    </button>
                                                                )}
                                                                {canMarkFailed && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleMarkFailed(delivery.id)}
                                                                        disabled={isDeliveryActionLoading}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] hover:bg-[rgba(var(--danger-rgb),0.15)] disabled:opacity-60 transition-colors"
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" /> Mark Failed
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!canManageDeliveries && (
                            <div className="px-6 py-4 text-xs text-[var(--text3)] bg-[var(--surface2)] border-t border-[var(--border2)]">
                                Delivery actions require pharmacist permissions.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 relative z-0">
                        <div className="p-6 border-b border-[var(--border2)] flex justify-between items-center bg-[var(--surface2)]">
                            <h2 className="font-syne text-lg font-bold text-[var(--text)] flex items-center gap-2 tracking-tight">
                                <Users className="text-[var(--accent)]" /> Team Invitations
                            </h2>
                        </div>

                        <div className="p-6 border-b border-[var(--border2)] space-y-4">
                            <form onSubmit={handleSendInvitation} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(event) => setInviteEmail(event.target.value)}
                                    placeholder="pharmacist@example.com"
                                    className="md:col-span-2 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent)] focus:border-[var(--accent)] outline-none transition-colors placeholder-[var(--text3)]"
                                />
                                <button
                                    type="submit"
                                    disabled={isInviting}
                                    className="inline-flex items-center justify-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 transition"
                                >
                                    <Send className="w-4 h-4" />
                                    {isInviting ? 'Sending...' : 'Send Invitation'}
                                </button>
                            </form>

                            {inviteStatusMsg && <p className="text-sm text-emerald-500 font-medium">{inviteStatusMsg}</p>}
                            {inviteErrorMsg && <p className="text-sm text-[var(--danger)]">{inviteErrorMsg}</p>}
                        </div>

                        <div className="p-6">
                            <h3 className="font-syne text-lg font-bold text-[var(--text)] mb-4 tracking-tight">Pending Pharmacist Requests</h3>
                            {isLoadingStaff ? (
                                <p className="text-sm text-[var(--text3)]">Loading pending staff...</p>
                            ) : pendingStaff.length === 0 ? (
                                <p className="text-sm text-[var(--text3)]">No pending pharmacist invitations found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingStaff.map((staff) => {
                                        const userId = staff.userId;
                                        const isActionLoading = Boolean(actionLoadingByUserId[userId]);
                                        return (
                                            <div key={staff.id} className="border border-[var(--border2)] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors">
                                                <div>
                                                    <p className="text-base font-semibold text-[var(--text)]">{staff.firstName} {staff.lastName}</p>
                                                    <p className="text-xs text-[var(--text2)] mt-1">Employment: {staff.employmentStatus || 'ACTIVE'} | Verified: {staff.isVerified ? 'YES' : 'NO'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproveStaff(staff)}
                                                        disabled={isActionLoading}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.15)] disabled:opacity-60 transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Accept
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        title="Reject is not available in current backend staff API"
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text3)] bg-[var(--surface3)] border border-[var(--border3)] cursor-not-allowed"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-8">
                                <h3 className="font-syne text-lg font-bold text-[var(--text)] mb-4 tracking-tight">Verified Pharmacists</h3>
                                {isLoadingStaff ? (
                                    <p className="text-sm text-[var(--text3)]">Loading verified staff...</p>
                                ) : verifiedStaff.length === 0 ? (
                                    <p className="text-sm text-[var(--text3)]">No verified pharmacists found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {verifiedStaff.map((staff) => (
                                            <div key={staff.id} className="border border-[var(--border2)] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors">
                                                <div>
                                                    <p className="text-base font-semibold text-[var(--text)]"> {staff.firstName} {staff.lastName}</p>
                                                    <p className="text-xs text-[var(--text2)] mt-1">Verified: {staff.verifiedAt ? new Date(staff.verifiedAt).toLocaleDateString() : 'Yes'}</p>
                                                </div>
                                                <div className="text-xs font-semibold text-emerald-500 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] px-4 py-1.5 rounded-full">Active</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {staffErrorMsg && <p className="mt-4 text-sm text-[var(--danger)] bg-[rgba(var(--danger-rgb),0.1)] border border-[var(--danger-border)] p-3 rounded-xl">{staffErrorMsg}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacistDashboard;
