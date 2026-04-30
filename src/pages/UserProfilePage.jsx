import React, { useState } from 'react';
import { User, Package, MapPin, Phone, Mail, Clock, CheckCircle, Truck, XCircle, Search } from 'lucide-react';
import { getOrders } from '../data/orderStore';

const UserProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile'); // profile, orders
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+251 911 223344',
        address: 'Bole, Addis Ababa'
    });

    const [orders] = useState(getOrders());

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-12 relative z-10 transition-colors">
            <div className="nova-main">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="nova-card sticky top-24 overflow-hidden">
                            <div className="p-6 border-b border-[var(--border2)] flex flex-col items-center">
                                <div className="w-24 h-24 bg-[rgba(var(--accent-rgb),0.1)] rounded-full flex items-center justify-center text-[var(--accent)] mb-4 shadow-[var(--glow)] border border-[rgba(var(--accent-rgb),0.2)]">
                                    <User className="w-10 h-10" />
                                </div>
                                <h2 className="font-syne font-bold text-[var(--text)] text-xl tracking-tight">{user.name}</h2>
                                <p className="text-[var(--text3)] text-sm">{user.email}</p>
                            </div>
                            <nav className="p-3 space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'profile' ? 'bg-[var(--surface2)] text-[var(--accent)] shadow-sm' : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'}`}
                                >
                                    <User className="w-5 h-5" /> My Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'orders' ? 'bg-[var(--surface2)] text-[var(--accent)] shadow-sm' : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'}`}
                                >
                                    <Package className="w-5 h-5" /> My Orders
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'profile' ? (
                            <div className="nova-card p-8 animate-in fade-in slide-in-from-bottom-2">
                                <h2 className="font-syne text-2xl font-bold text-[var(--text)] mb-8 tracking-tight">Personal Information</h2>
                                <form className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-3.5 text-[var(--text3)] w-5 h-5" />
                                                <input type="text" value={user.name} readOnly className="w-full pl-12 pr-4 py-3.5 border border-[var(--border2)] rounded-xl bg-[var(--surface2)] text-[var(--text2)] outline-none cursor-not-allowed opacity-70" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-3.5 text-[var(--text3)] w-5 h-5" />
                                                <input type="email" value={user.email} readOnly className="w-full pl-12 pr-4 py-3.5 border border-[var(--border2)] rounded-xl bg-[var(--surface2)] text-[var(--text2)] outline-none cursor-not-allowed opacity-70" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-3.5 text-[var(--text3)] w-5 h-5" />
                                                <input type="text" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} className="w-full pl-12 pr-4 py-3.5 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Shipping Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-3.5 text-[var(--text3)] w-5 h-5" />
                                                <input type="text" value={user.address} onChange={(e) => setUser({ ...user, address: e.target.value })} className="w-full pl-12 pr-4 py-3.5 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button type="button" className="btn-primary px-8 py-3.5 rounded-xl font-medium">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-6 border-b border-[var(--border2)] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    <h2 className="font-syne text-2xl font-bold text-[var(--text)] tracking-tight">Order History</h2>
                                    <div className="relative w-full sm:w-auto">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text3)] w-4 h-4" />
                                        <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-lg text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors placeholder-[var(--text3)]" />
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
                                                <th className="p-4 font-medium tracking-wide">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border2)]">
                                            {orders.map(order => (
                                                <tr key={order.id} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors">
                                                    <td className="p-4 font-mono font-medium text-[var(--accent)] text-sm">{order.id}</td>
                                                    <td className="p-4 text-[var(--text2)] text-sm">{order.date}</td>
                                                    <td className="p-4 text-[var(--text2)] text-sm">
                                                        {order.items.length} items
                                                    </td>
                                                    <td className="p-4 font-medium text-[var(--text)]">${order.total.toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max border ${
                                                                order.status === 'Pending' ? 'bg-[rgba(234,179,8,0.1)] text-yellow-500 border-[rgba(234,179,8,0.2)]' :
                                                                order.status === 'Accepted' ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]' :
                                                                order.status === 'Dispatched' ? 'bg-[rgba(139,92,246,0.1)] text-purple-500 border-[rgba(139,92,246,0.2)]' :
                                                                'bg-[rgba(34,197,94,0.1)] text-green-500 border-[rgba(34,197,94,0.2)]'
                                                            }`}>
                                                            {order.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                            {order.status === 'Accepted' && <CheckCircle className="w-3 h-3" />}
                                                            {order.status === 'Dispatched' && <Truck className="w-3 h-3" />}
                                                            {order.status === 'Delivered' && <CheckCircle className="w-3 h-3" />}
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <button className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-semibold transition-colors">View Details</button>
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
            </div>
        </div>
    );
};

export default UserProfilePage;
