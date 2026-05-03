import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Phone, Mail, Clock, CheckCircle, Truck, XCircle, Search, Users, Plus, Calendar, Activity, Droplet } from 'lucide-react';
import { getOrders } from '../data/orderStore';
import { patientCreateProfile, patientGetProfiles, patientUpdateProfile, patientDeleteProfile } from '../api/axios';

const UserProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile'); // profile, orders, patients
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+251 911 223344',
        address: 'Bole, Addis Ababa'
    });

    const [orders] = useState(getOrders());

    // Patient Profiles State
    const [profiles, setProfiles] = useState([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '',
        dateOfBirth: '',
        gender: 'Male',
        weight: '',
        height: '',
        isPregnant: false,
        bloodType: '',
        uniqueCode: '',
        allergens: ''
    });

    useEffect(() => {
        if (activeTab === 'patients') {
            fetchProfiles();
        }
    }, [activeTab]);

    const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        try {
            const response = await patientGetProfiles();
            setProfiles(response.data || []);
        } catch (error) {
            console.error('Failed to fetch patient profiles:', error);
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const updatePayload = {
                    name: newPatient.name,
                    dateOfBirth: newPatient.dateOfBirth,
                    gender: newPatient.gender,
                    weight: newPatient.weight ? parseFloat(newPatient.weight) : null,
                    height: newPatient.height ? parseInt(newPatient.height, 10) : null,
                    isPregnant: newPatient.isPregnant,
                    bloodType: newPatient.bloodType || null,
                    uniqueCode: newPatient.uniqueCode || null,
                };
                await patientUpdateProfile(updatePayload);
            } else {
                const createPayload = {
                    name: newPatient.name,
                    dateOfBirth: newPatient.dateOfBirth,
                    gender: newPatient.gender,
                    weight: newPatient.weight ? parseFloat(newPatient.weight) : null,
                    height: newPatient.height ? parseInt(newPatient.height, 10) : null,
                    isPregnant: newPatient.isPregnant,
                    bloodType: newPatient.bloodType || null,
                    uniqueCode: newPatient.uniqueCode || null,
                    allergens: newPatient.allergens ? newPatient.allergens.split(',').map(a => a.trim()).filter(a => a) : []
                };
                await patientCreateProfile(createPayload);
            }
            setShowAddForm(false);
            setIsEditing(false);
            setNewPatient({
                name: '',
                dateOfBirth: '',
                gender: 'Male',
                weight: '',
                height: '',
                isPregnant: false,
                bloodType: '',
                uniqueCode: '',
                allergens: ''
            });
            fetchProfiles();
        } catch (error) {
            console.error('Failed to save patient profile:', error);
        }
    };

    const handleEditClick = (profile) => {
        setNewPatient({
            name: profile.name || '',
            dateOfBirth: profile.dateOfBirth || '',
            gender: profile.gender || 'Male',
            weight: profile.weight || '',
            height: profile.height || '',
            isPregnant: profile.isPregnant || false,
            bloodType: profile.bloodType || '',
            uniqueCode: profile.uniqueCode || '',
            allergens: profile.allergens ? profile.allergens.join(', ') : ''
        });
        setIsEditing(true);
        setShowAddForm(true);
    };

    const handleDeleteProfile = async (profileId) => {
        if (!window.confirm("Are you sure you want to delete this profile?")) return;
        try {
            await patientDeleteProfile(profileId);
            fetchProfiles();
        } catch (error) {
            console.error('Failed to delete patient profile:', error);
            alert("Failed to delete the profile. The backend might not support this operation yet.");
        }
    };

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
                                <button
                                    onClick={() => setActiveTab('patients')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'patients' ? 'bg-[var(--surface2)] text-[var(--accent)] shadow-sm' : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'}`}
                                >
                                    <Users className="w-5 h-5" /> Patient Profiles
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
                        ) : activeTab === 'orders' ? (
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
                        ) : (
                            <div className="nova-card p-8 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="font-syne text-2xl font-bold text-[var(--text)] tracking-tight">Patient Profiles</h2>
                                    {!showAddForm && profiles.length === 0 && (
                                        <button 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setNewPatient({ name: '', dateOfBirth: '', gender: 'Male', weight: '', height: '', isPregnant: false, bloodType: '', uniqueCode: '', allergens: '' });
                                                setShowAddForm(true);
                                            }}
                                            className="btn-primary px-5 py-2.5 rounded-xl font-medium flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" /> Add Profile
                                        </button>
                                    )}
                                </div>

                                {showAddForm ? (
                                    <form onSubmit={handleAddPatient} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Full Name</label>
                                                <input required type="text" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="w-full px-4 py-3 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Date of Birth</label>
                                                <input required type="date" value={newPatient.dateOfBirth} onChange={e => setNewPatient({...newPatient, dateOfBirth: e.target.value})} className="w-full px-4 py-3 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Gender</label>
                                                <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} className="w-full px-4 py-3 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none">
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Blood Type</label>
                                                <select value={newPatient.bloodType} onChange={e => setNewPatient({...newPatient, bloodType: e.target.value})} className="w-full px-4 py-3 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none">
                                                    <option value="">Select Blood Type</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Weight (kg)</label>
                                                <input type="number" step="0.1" value={newPatient.weight} onChange={e => setNewPatient({...newPatient, weight: e.target.value})} className="w-full px-4 py-3 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Height (cm)</label>
                                                <input type="number" value={newPatient.height} onChange={e => setNewPatient({...newPatient, height: e.target.value})} className="w-full px-4 py-3 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Unique Code</label>
                                                <input type="text" value={newPatient.uniqueCode} onChange={e => setNewPatient({...newPatient, uniqueCode: e.target.value})} className="w-full px-4 py-3 border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text2)] mb-1.5">Allergens (comma separated) {isEditing && <span className="text-xs text-[var(--text3)] font-normal">(Cannot edit after creation)</span>}</label>
                                                <input type="text" placeholder="e.g. Peanuts, Penicillin" value={newPatient.allergens} onChange={e => setNewPatient({...newPatient, allergens: e.target.value})} readOnly={isEditing} className={`w-full px-4 py-3 border border-[var(--border2)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none ${isEditing ? 'bg-[var(--surface2)] opacity-70 cursor-not-allowed text-[var(--text3)]' : 'bg-[var(--bg)] text-[var(--text)]'}`} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="isPregnant" checked={newPatient.isPregnant} onChange={e => setNewPatient({...newPatient, isPregnant: e.target.checked})} className="w-4 h-4 text-[var(--accent)] rounded border-[var(--border2)]" />
                                            <label htmlFor="isPregnant" className="text-sm font-medium text-[var(--text2)]">Is Pregnant</label>
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button type="submit" className="btn-primary px-8 py-3 rounded-xl font-medium">{isEditing ? 'Update Profile' : 'Save Profile'}</button>
                                            <button type="button" onClick={() => { setShowAddForm(false); setIsEditing(false); }} className="px-8 py-3 rounded-xl font-medium border border-[var(--border2)] text-[var(--text2)] hover:bg-[var(--surface2)]">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {isLoadingProfiles ? (
                                            <div className="flex justify-center items-center py-12">
                                                <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : profiles.length === 0 ? (
                                            <div className="text-center py-12 bg-[var(--surface2)] rounded-2xl border border-[var(--border2)]">
                                                <Users className="w-12 h-12 text-[var(--text3)] mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-[var(--text)] mb-2">No Profiles Found</h3>
                                                <p className="text-[var(--text2)] mb-6">You haven't added any patient profiles yet.</p>
                                                <button onClick={() => { setIsEditing(false); setShowAddForm(true); }} className="btn-primary px-6 py-2.5 rounded-xl font-medium inline-flex items-center gap-2">
                                                    <Plus className="w-5 h-5" /> Create Profile
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {profiles.map((profile, index) => (
                                                    <div key={index} className="bg-[var(--surface2)] rounded-2xl p-6 border border-[var(--border2)] hover:border-[var(--accent)] transition-colors">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-[rgba(var(--accent-rgb),0.1)] rounded-full flex items-center justify-center text-[var(--accent)]">
                                                                    <User className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-lg text-[var(--text)]">{profile.name}</h3>
                                                                    <p className="text-sm text-[var(--text2)]">{profile.gender} • {profile.bloodType || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <button 
                                                                    onClick={() => handleEditClick(profile)}
                                                                    className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium px-3 py-1.5 rounded-lg border border-[var(--border2)] hover:border-[var(--accent)] transition-colors"
                                                                >
                                                                    Update Profile
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteProfile(profile.id)}
                                                                    className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-500 transition-colors"
                                                                >
                                                                    Delete Profile
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3 mt-6">
                                                            <div className="flex items-center gap-3 text-sm text-[var(--text2)]">
                                                                <Calendar className="w-4 h-4 text-[var(--accent)]" /> 
                                                                <span>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-[var(--text2)]">
                                                                <Activity className="w-4 h-4 text-[var(--accent)]" /> 
                                                                <span>{profile.height ? `${profile.height} cm` : '-'} / {profile.weight ? `${profile.weight} kg` : '-'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-[var(--text2)]">
                                                                <Droplet className="w-4 h-4 text-[var(--accent)]" /> 
                                                                <span className="truncate">{profile.allergies?.length > 0 ? profile.allergies.map(a => a.allergenName).join(', ') : 'No known allergies'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
