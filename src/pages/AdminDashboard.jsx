import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    const [users] = useState(mockUsers);
    const [pharmacies] = useState(mockPharmacies);

    return (
        <div className="bg-transparent min-h-[calc(100vh-4.25rem)] py-12 relative z-10 transition-colors">
            <div className="nova-main">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-syne text-3xl md:text-3xl font-bold text-[var(--text)] tracking-tight">Admin Portal</h1>
                        <p className="text-sm text-[var(--text2)] font-light mt-1">System Overview</p>
                    </div>
                    <div className="flex bg-[var(--surface2)] p-1 rounded-xl border border-[var(--border2)]">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)]'}`}
                        >
                            <Users className="w-4 h-4" /> Users
                        </button>
                        <button
                            onClick={() => setActiveTab('pharmacies')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pharmacies' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface3)]'}`}
                        >
                            <Building2 className="w-4 h-4" /> Pharmacies
                        </button>
                    </div>
                </div>

                <div className="mb-6 flex">
                    <Link to="/admin/medical-verification" className="inline-flex items-center gap-2 btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold transition">
                        Open Medical Verification Queue
                    </Link>
                </div>

                {activeTab === 'users' ? (
                    <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 relative z-0">
                        <div className="p-6 border-b border-[var(--border2)] flex justify-between items-center bg-[var(--surface2)]">
                            <h2 className="font-syne text-lg font-bold text-[var(--text)] tracking-tight">User Management</h2>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text3)] w-4 h-4" />
                                    <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] placeholder-[var(--text3)] rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors" />
                                </div>
                                <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add User
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                    <tr>
                                        <th className="p-4 font-medium tracking-wide">Name</th>
                                        <th className="p-4 font-medium tracking-wide">Email</th>
                                        <th className="p-4 font-medium tracking-wide">Role</th>
                                        <th className="p-4 font-medium tracking-wide">Status</th>
                                        <th className="p-4 font-medium tracking-wide text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border2)]">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors text-sm border-b border-[var(--border2)]">
                                            <td className="p-4 font-semibold text-[var(--text)]">{user.name}</td>
                                            <td className="p-4 text-[var(--text2)]">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${user.role === 'admin' ? 'bg-[rgba(168,85,247,0.1)] text-purple-400 border-[rgba(168,85,247,0.2)]' :
                                                    user.role === 'pharmacist' ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]' :
                                                        'bg-[rgba(59,130,246,0.1)] text-blue-500 border-[rgba(59,130,246,0.2)]'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-emerald-500 font-semibold">{user.status}</td>
                                            <td className="p-4 text-right">
                                                <button className="text-[var(--text3)] hover:text-[var(--accent)] px-2 transition font-semibold">Edit</button>
                                                <button className="text-[var(--text3)] hover:text-[var(--danger)] px-2 transition font-semibold">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="nova-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 relative z-0">
                        <div className="p-6 border-b border-[var(--border2)] flex justify-between items-center bg-[var(--surface2)]">
                            <h2 className="font-syne text-lg font-bold text-[var(--text)] tracking-tight">Pharmacy Management</h2>
                            <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Register Pharmacy
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--surface2)] text-[var(--text2)] text-sm">
                                    <tr>
                                        <th className="p-4 font-medium tracking-wide">Pharmacy Name</th>
                                        <th className="p-4 font-medium tracking-wide">Owner</th>
                                        <th className="p-4 font-medium tracking-wide">Contact</th>
                                        <th className="p-4 font-medium tracking-wide">Status</th>
                                        <th className="p-4 font-medium tracking-wide text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border2)]">
                                    {pharmacies.map(pharmacy => (
                                        <tr key={pharmacy.id} className="hover:bg-[rgba(var(--accent-rgb),0.02)] transition-colors text-sm border-b border-[var(--border2)]">
                                            <td className="p-4 font-semibold text-[var(--text)]">{pharmacy.name}</td>
                                            <td className="p-4 text-[var(--text2)]">{pharmacy.owner}</td>
                                            <td className="p-4 text-[var(--text2)]">{pharmacy.contact}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${pharmacy.status === 'Verified' ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500 border-[rgba(16,185,129,0.2)]' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    }`}>
                                                    {pharmacy.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-[var(--text3)] hover:text-[var(--accent)] px-2 transition font-semibold border-r border-[var(--border2)] mr-2 pr-4">Edit</button>
                                                {pharmacy.status === 'Pending' && (
                                                    <button className="text-emerald-500 hover:text-emerald-400 px-2 font-semibold transition">Approve</button>
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
