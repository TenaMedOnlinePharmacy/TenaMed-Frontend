import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, ClipboardList, CheckCircle, XCircle, Plus, Trash2, Edit, Users, Send } from 'lucide-react';
import { products } from '../data/mockProducts';
import { orderAccept, orderReject, pharmacyGetIncomingOrders, pharmacyInvitePharmacist, pharmacyListStaff, pharmacyVerifyStaff } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { resolveApiImageUrl } from '../utils/imageUrl';

const PharmacistDashboard = () => {
    const { userRole } = useAuth();
    const isPharmacyOwner = userRole === 'pharmacy';
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState(requestedTab === 'team' && isPharmacyOwner ? 'team' : 'orders');
    const [inventory, setInventory] = useState(products);
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [ordersErrorMsg, setOrdersErrorMsg] = useState('');
    const [actionLoadingByOrderId, setActionLoadingByOrderId] = useState({});
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
        }
    }, [isPharmacyOwner, requestedTab, setSearchParams]);

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

    useEffect(() => {
        loadIncomingOrders();
    }, []);

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
    const outOfStockCount = inventory.filter((item) => !item.inStock).length;

    // Inventory Actions (Mock)
    const handleDeleteItem = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setInventory(inventory.filter(item => item.id !== id));
        }
    };

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

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{isPharmacyOwner ? 'Pharmacy Owner Dashboard' : 'Pharmacist Dashboard'}</h1>
                        <p className="text-sm text-gray-500">City Pharmacy</p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setTab('orders')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'orders' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setTab('inventory')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Inventory
                        </button>
                        {isPharmacyOwner && (
                            <button
                                onClick={() => setTab('team')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'team' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Team Invitations
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {isPharmacyOwner ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Incoming Orders</p>
                            <p className="text-2xl font-bold text-amber-600">{incomingOrderCount}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">High Risk Orders</p>
                            <p className="text-2xl font-bold text-red-600">{highRiskOrderCount}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Prescription Images</p>
                            <p className="text-2xl font-bold text-emerald-600">{ordersWithImages}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">${totalOrderAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Incoming Orders</p>
                            <p className="text-2xl font-bold text-emerald-600">{incomingOrderCount}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <Link to="/pharmacist/prescription-review" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                        Open Prescription Review Queue
                    </Link>
                </div>

                {activeTab === 'orders' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="text-emerald-600" /> Incoming Orders
                            </h2>
                        </div>
                        {ordersErrorMsg && <div className="px-6 pt-4 text-sm text-red-600">{ordersErrorMsg}</div>}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-4 font-medium">Prescription Image</th>
                                        <th className="p-4 font-medium">Medicine Names</th>
                                        <th className="p-4 font-medium">Risk Type</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Confidence Score</th>
                                        <th className="p-4 font-medium">Total Amount</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoadingOrders ? (
                                        <tr>
                                            <td className="p-4 text-sm text-gray-500" colSpan={6}>Loading incoming orders...</td>
                                        </tr>
                                    ) : incomingOrders.length === 0 ? (
                                        <tr>
                                            <td className="p-4 text-sm text-gray-500" colSpan={6}>No incoming orders found.</td>
                                        </tr>
                                    ) : (
                                        incomingOrders.map((order) => {
                                            const medicineNames = order.orderItems.length > 0
                                                ? order.orderItems.map((item) => item?.medicineName || 'Unnamed medicine').join(', ')
                                                : 'No items provided';

                                            return (
                                                <tr key={order.orderId} className="hover:bg-gray-50 transition align-top">
                                                    <td className="p-4">
                                                        {order.prescriptionImage ? (
                                                            <a href={resolveApiImageUrl(order.prescriptionImage, order.prescriptionImage)} target="_blank" rel="noreferrer" className="inline-block">
                                                                <img
                                                                    src={resolveApiImageUrl(order.prescriptionImage, order.prescriptionImage)}
                                                                    alt="Prescription"
                                                                    className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">No image</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-gray-600 text-sm">
                                                        {order.orderItems.map((item, index) => (
                                                            <div key={`${order.orderId}-${index}`} className="mb-1 last:mb-0">
                                                                <span className="font-medium text-gray-900">{item?.medicineName || 'Unnamed medicine'}</span>
                                                                <span className="text-gray-500"> x{item?.quantity ?? 0}</span>
                                                            </div>
                                                        ))}
                                                        {order.orderItems.length === 0 && <span className="text-gray-500">{medicineNames}</span>}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`inline-flex w-fit px-2 py-1 rounded-full text-xs font-semibold ${order.highRisk ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                {order.highRisk ? 'High Risk' : 'Standard'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">Type: {order.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex w-fit px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' : order.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : order.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-900 font-medium">
                                                        {order.confidenceScore === null ? 'N/A' : `${Math.round(order.confidenceScore * 100)}%`}
                                                    </td>
                                                    <td className="p-4 font-medium text-gray-900">${order.totalAmount.toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAcceptOrder(order.orderId)}
                                                                disabled={Boolean(actionLoadingByOrderId[order.orderId])}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-60"
                                                                title="Accept order"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRejectOrder(order.orderId)}
                                                                disabled={Boolean(actionLoadingByOrderId[order.orderId])}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-60"
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="text-emerald-600" /> Inventory Management
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigate('/pharmacist/inventory/batch/new')}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-4 font-medium">Image</th>
                                        <th className="p-4 font-medium">Name</th>
                                        <th className="p-4 font-medium">Category</th>
                                        <th className="p-4 font-medium">Price</th>
                                        <th className="p-4 font-medium">Stock</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {inventory.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center">
                                                    <img src={item.image} alt="" className="w-8 h-8 object-contain" />
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">{item.name}</td>
                                            <td className="p-4 text-gray-600">{item.category}</td>
                                            <td className="p-4 text-gray-900">${item.price.toFixed(2)}</td>
                                            <td className="p-4">
                                                {item.inStock ? (
                                                    <span className="text-green-600 font-medium text-sm">In Stock</span>
                                                ) : (
                                                    <span className="text-red-500 font-medium text-sm">Out of Stock</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button className="text-gray-400 hover:text-emerald-600 transition"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="text-emerald-600" /> Team Invitations
                            </h2>
                        </div>

                        <div className="p-6 border-b border-gray-100 space-y-4">
                            <form onSubmit={handleSendInvitation} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(event) => setInviteEmail(event.target.value)}
                                    placeholder="pharmacist@example.com"
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={isInviting}
                                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                                >
                                    <Send className="w-4 h-4" />
                                    {isInviting ? 'Sending...' : 'Send Invitation'}
                                </button>
                            </form>

                            {inviteStatusMsg && <p className="text-sm text-emerald-700">{inviteStatusMsg}</p>}
                            {inviteErrorMsg && <p className="text-sm text-red-600">{inviteErrorMsg}</p>}
                        </div>

                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Pending Pharmacist Requests</h3>
                            {isLoadingStaff ? (
                                <p className="text-sm text-gray-500">Loading pending staff...</p>
                            ) : pendingStaff.length === 0 ? (
                                <p className="text-sm text-gray-500">No pending pharmacist invitations found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingStaff.map((staff) => {
                                        const userId = staff.userId;
                                        const isActionLoading = Boolean(actionLoadingByUserId[userId]);
                                        return (
                                            <div key={staff.id} className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{staff.firstName} {staff.lastName}</p>
                                                    <p className="text-xs text-gray-500">Employment: {staff.employmentStatus || 'ACTIVE'} | Verified: {staff.isVerified ? 'YES' : 'NO'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproveStaff(staff)}
                                                        disabled={isActionLoading}
                                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-60"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Accept
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        title="Reject is not available in current backend staff API"
                                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Verified Pharmacists</h3>
                                {isLoadingStaff ? (
                                    <p className="text-sm text-gray-500">Loading verified staff...</p>
                                ) : verifiedStaff.length === 0 ? (
                                    <p className="text-sm text-gray-500">No verified pharmacists found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {verifiedStaff.map((staff) => (
                                            <div key={staff.id} className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900"> {staff.firstName} {staff.lastName}</p>
                                                    <p className="text-xs text-gray-500">Verified: {staff.verifiedAt ? new Date(staff.verifiedAt).toLocaleDateString() : 'Yes'}</p>
                                                </div>
                                                <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Active</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {staffErrorMsg && <p className="mt-3 text-sm text-red-600">{staffErrorMsg}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacistDashboard;
