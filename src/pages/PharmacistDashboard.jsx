import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, ClipboardList, CheckCircle, XCircle, Truck, Plus, Trash2, Edit, Users, Send } from 'lucide-react';
import { products } from '../data/mockProducts';
import { mockOrders } from '../data/mockOrders';
import { pharmacyInvitePharmacist, pharmacyListStaff, pharmacyVerifyStaff } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PharmacistDashboard = () => {
    const { userRole } = useAuth();
    const isPharmacyOwner = userRole === 'pharmacy';
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState(requestedTab === 'team' && isPharmacyOwner ? 'team' : 'orders');
    const [inventory, setInventory] = useState(products);
    const [orders, setOrders] = useState(mockOrders);
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

    const pendingStaff = useMemo(() => {
        return staffRows.filter((row) => row?.staffRole === 'PHARMACIST' && !Boolean(row?.isVerified));
    }, [staffRows]);

    const verifiedStaff = useMemo(() => {
        return staffRows.filter((row) => row?.staffRole === 'PHARMACIST' && Boolean(row?.isVerified));
    }, [staffRows]);

    const pendingOrders = orders.filter((order) => order.status === 'Pending').length;
    const acceptedOrders = orders.filter((order) => order.status === 'Accepted').length;
    const completedOrders = orders.filter((order) => order.status === 'Delivered').length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const outOfStockCount = inventory.filter((item) => !item.inStock).length;

    // Order Actions
    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

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
                            <p className="text-xs text-gray-500">Pending Orders</p>
                            <p className="text-2xl font-bold text-amber-600">{pendingOrders}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Accepted Orders</p>
                            <p className="text-2xl font-bold text-emerald-600">{acceptedOrders}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Completed Orders</p>
                            <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Sales (Mock)</p>
                            <p className="text-2xl font-bold text-gray-900">${revenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-500">Active Orders</p>
                            <p className="text-2xl font-bold text-emerald-600">{acceptedOrders + pendingOrders}</p>
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-4 font-medium">Order ID</th>
                                        <th className="p-4 font-medium">Customer</th>
                                        <th className="p-4 font-medium">Items</th>
                                        <th className="p-4 font-medium">Total</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-medium text-gray-900">{order.id}</td>
                                            <td className="p-4 text-gray-600">{order.customer}</td>
                                            <td className="p-4 text-gray-600 text-sm">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx}>{item.name} x{item.quantity}</div>
                                                ))}
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">${order.total.toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        order.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                            order.status === 'Dispatched' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-green-100 text-green-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {order.status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => updateOrderStatus(order.id, 'Accepted')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Accept">
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button onClick={() => updateOrderStatus(order.id, 'Rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject">
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status === 'Accepted' && (
                                                        <button onClick={() => updateOrderStatus(order.id, 'Dispatched')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded flex items-center gap-1 text-sm font-medium">
                                                            <Truck className="w-4 h-4" /> Dispatch
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
                            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2">
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
                                                    <p className="text-sm font-medium text-gray-900">User ID: {userId}</p>
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
