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
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-gray-100 flex flex-col items-center">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                    <User className="w-10 h-10" />
                                </div>
                                <h2 className="font-bold text-gray-900 text-lg">{user.name}</h2>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>
                            <nav className="p-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <User className="w-5 h-5" /> My Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Package className="w-5 h-5" /> My Orders
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'profile' ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                                <form className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                                <input type="text" value={user.name} readOnly className="w-full pl-10 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                                <input type="email" value={user.email} readOnly className="w-full pl-10 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                                <input type="text" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                                <input type="text" value={user.address} onChange={(e) => setUser({ ...user, address: e.target.value })} className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input type="text" placeholder="Search orders..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" />
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
                                                <th className="p-4 font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                                    <td className="p-4 font-medium text-blue-600">{order.id}</td>
                                                    <td className="p-4 text-gray-600 text-sm">{order.date}</td>
                                                    <td className="p-4 text-gray-600 text-sm">
                                                        {order.items.length} items
                                                    </td>
                                                    <td className="p-4 font-medium text-gray-900">${order.total.toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                order.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                                                                    order.status === 'Dispatched' ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-green-100 text-green-700'
                                                            }`}>
                                                            {order.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                            {order.status === 'Accepted' && <CheckCircle className="w-3 h-3" />}
                                                            {order.status === 'Dispatched' && <Truck className="w-3 h-3" />}
                                                            {order.status === 'Delivered' && <CheckCircle className="w-3 h-3" />}
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
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
