import React, { useMemo, useState } from 'react';
import { Clock, Search, CheckCircle, Truck } from 'lucide-react';
import { getOrders } from '../data/orderStore';

const statusClassMap = {
    Pending: 'bg-[rgba(234,179,8,0.1)] text-yellow-500 border border-[rgba(234,179,8,0.2)]',
    Accepted: 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border border-[rgba(16,185,129,0.2)]',
    Dispatched: 'bg-[rgba(139,92,246,0.1)] text-purple-500 border border-[rgba(139,92,246,0.2)]',
    Delivered: 'bg-[rgba(34,197,94,0.1)] text-green-500 border border-[rgba(34,197,94,0.2)]',
    Rejected: 'bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)] border border-[var(--danger-border)]',
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
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-12 relative z-10 transition-colors">
            <div className="nova-main max-w-5xl">
                <div className="mb-8">
                    <h1 className="font-syne text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight">Order Tracking & History</h1>
                    <p className="text-[var(--text2)] font-light mt-2">Track ongoing orders and browse completed purchases.</p>
                </div>

                <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-5 border-b border-[var(--border2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="font-syne font-semibold text-lg text-[var(--text)] tracking-tight">My Orders</h2>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)]" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by order ID, status..."
                                className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border2)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors placeholder-[var(--text3)]"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                <tr>
                                    <th className="p-4 font-medium tracking-wide">Order ID</th>
                                    <th className="p-4 font-medium tracking-wide">Date</th>
                                    <th className="p-4 font-medium tracking-wide">Items</th>
                                    <th className="p-4 font-medium tracking-wide">Total</th>
                                    <th className="p-4 font-medium tracking-wide">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border2)]">
                                {filtered.map((order) => (
                                    <tr key={order.id} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors">
                                        <td className="p-4 font-mono font-semibold text-[var(--accent)]">{order.id}</td>
                                        <td className="p-4 text-[var(--text2)]">{order.date}</td>
                                        <td className="p-4 text-[var(--text2)]">{order.items.length} items</td>
                                        <td className="p-4 font-medium text-[var(--text)]">${order.total.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusClassMap[order.status] || 'bg-[var(--surface2)] text-[var(--text)] border border-[var(--border2)]'}`}>
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
