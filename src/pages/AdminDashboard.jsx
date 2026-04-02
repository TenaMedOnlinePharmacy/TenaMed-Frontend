import React, { useState } from 'react';
import { Users, Building2, Plus, Trash2, Search, Edit } from 'lucide-react';

// Mock Data
const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'Active' },
    { id: 2, name: 'Alice Pharmacy', email: 'alice@pharmacy.com', role: 'pharmacist', status: 'Active' },
    { id: 3, name: 'Admin User', email: 'admin@tenamed.com', role: 'admin', status: 'Active' },
];

const mockPharmacies = [
    { id: 1, name: 'City Pharmacy', owner: 'Alice Pharmacy', address: '123 Main St', contact: '0911223344', status: 'Verified' },
    { id: 2, name: 'HealthPlus', owner: 'Bob Smith', address: '456 Bole Rd', contact: '0922334455', status: 'Pending' },
];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users'); // users, pharmacies
    const [users, setUsers] = useState(mockUsers);
    const [pharmacies, setPharmacies] = useState(mockPharmacies);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
                        <p className="text-sm text-gray-500">System Overview</p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Users className="w-4 h-4" /> Users
                        </button>
                        <button
                            onClick={() => setActiveTab('pharmacies')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'pharmacies' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Building2 className="w-4 h-4" /> Pharmacies
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {activeTab === 'users' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">User Management</h2>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                                </div>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add User
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-4 font-medium">Name</th>
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                            <td className="p-4 text-gray-600">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'pharmacist' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-green-600 font-medium">{user.status}</td>
                                            <td className="p-4 text-right">
                                                <button className="text-gray-400 hover:text-blue-600 px-2 transition">Edit</button>
                                                <button className="text-gray-400 hover:text-red-500 px-2 transition">Delete</button>
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
                            <h2 className="text-lg font-bold text-gray-900">Pharmacy Management</h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Register Pharmacy
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-4 font-medium">Pharmacy Name</th>
                                        <th className="p-4 font-medium">Owner</th>
                                        <th className="p-4 font-medium">Contact</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pharmacies.map(pharmacy => (
                                        <tr key={pharmacy.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-medium text-gray-900">{pharmacy.name}</td>
                                            <td className="p-4 text-gray-600">{pharmacy.owner}</td>
                                            <td className="p-4 text-gray-600 text-sm">{pharmacy.contact}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pharmacy.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {pharmacy.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-gray-400 hover:text-blue-600 px-2 transition">Edit</button>
                                                {pharmacy.status === 'Pending' && (
                                                    <button className="text-blue-600 hover:text-blue-700 px-2 font-medium text-sm transition">Approve</button>
                                                )}
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

export default AdminDashboard;
