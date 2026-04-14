import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, CheckCircle, XCircle, Truck, Plus, Trash2, Edit } from 'lucide-react';
import { products } from '../data/mockProducts';
import { mockOrders } from '../data/mockOrders';

const PharmacistDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'inventory'
    const [inventory, setInventory] = useState(products);
    const [orders, setOrders] = useState(mockOrders);

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

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Pharmacist Dashboard</h1>
                        <p className="text-sm text-gray-500">City Pharmacy</p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'orders' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Inventory
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">Pending Orders</p>
                        <p className="text-2xl font-bold text-amber-600">{pendingOrders}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">Accepted Orders</p>
                        <p className="text-2xl font-bold text-blue-600">{acceptedOrders}</p>
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

                <div className="mb-6">
                    <Link to="/pharmacist/prescription-review" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        Open Prescription Review Queue
                    </Link>
                </div>

                {activeTab === 'orders' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="text-blue-600" /> Incoming Orders
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
                                                        order.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
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
                                                        <button onClick={() => updateOrderStatus(order.id, 'Dispatched')} className="p-1 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1 text-sm font-medium">
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
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="text-blue-600" /> Inventory Management
                            </h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
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
                                                    <button className="text-gray-400 hover:text-blue-600 transition"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacistDashboard;
