import React, { useMemo, useState } from 'react';
import { Clock, Search, CheckCircle, Truck } from 'lucide-react';
import { getOrders } from '../data/orderStore';

const statusClassMap = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Accepted: 'bg-blue-100 text-blue-700',
    Dispatched: 'bg-indigo-100 text-indigo-700',
    Delivered: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
};

const statusIcon = {
    Pending: <Clock className="w-3.5 h-3.5" />,
    Accepted: <CheckCircle className="w-3.5 h-3.5" />,
    Dispatched: <Truck className="w-3.5 h-3.5" />,
    Delivered: <CheckCircle className="w-3.5 h-3.5" />,
    Rejected: <Clock className="w-3.5 h-3.5" />,
};

const OrderTrackingPage = () => {
    const [query, setQuery] = useState('');
    const orders = useMemo(() => getOrders(), []);

    const filtered = orders.filter((order) => {
        const q = query.toLowerCase();
        return (
            order.id.toLowerCase().includes(q) ||
            order.customer.toLowerCase().includes(q) ||
            order.status.toLowerCase().includes(q)
        );
    });

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Order Tracking & History</h1>
                    <p className="text-gray-500 mt-1">Track ongoing orders and browse completed purchases.</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-gray-900">My Orders</h2>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by order ID, status..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">Order ID</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Items</th>
                                    <th className="p-4 font-medium">Total</th>
                                    <th className="p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-blue-600">{order.id}</td>
                                        <td className="p-4 text-gray-600">{order.date}</td>
                                        <td className="p-4 text-gray-600">{order.items.length} items</td>
                                        <td className="p-4 font-medium text-gray-900">${order.total.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusClassMap[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {statusIcon[order.status]}
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
