import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, User, Search, X } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { getCartCount } = useCart();
    const { isAuthenticated, userRole, userEmail, logout } = useAuth();

    const navByRole = {
        guest: [
            { to: '/', label: 'Home' },
            { to: '/products', label: 'Medicines' },
            { to: '/hospital/register', label: 'Hospital Signup' },
            { to: '/doctor/login', label: 'Doctor Login' },
        ],
        customer: [
            { to: '/', label: 'Home' },
            { to: '/products', label: 'Medicines' },
            { to: '/upload-prescription', label: 'Prescription' },
            { to: '/orders', label: 'My Orders' },
        ],
        pharmacist: [
            { to: '/pharmacist/dashboard', label: 'Dashboard' },
            { to: '/pharmacist/prescription-review', label: 'Prescription Review' },
        ],
        hospital: [
            { to: '/hospital/dashboard', label: 'Hospital Dashboard' },
        ],
        doctor: [
            { to: '/doctor/prescriptions/new', label: 'E-Prescriptions' },
        ],
        admin: [
            { to: '/admin/dashboard', label: 'Admin Dashboard' },
            { to: '/admin/medical-verification', label: 'Medical Verification' },
        ],
    };

    const roleKey = isAuthenticated ? userRole : 'guest';
    const navItems = navByRole[roleKey] || navByRole.guest;

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800">
            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 backdrop-blur-lg bg-opacity-90">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        TenaMed
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link key={item.to} to={item.to} className="text-gray-600 hover:text-blue-600 font-medium transition">
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-100 transition">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-32 focus:w-48 transition-all"
                            />
                        </div>

                        {roleKey === 'customer' && (
                            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition group">
                                <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                                {getCartCount() > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {getCartCount()}
                                    </span>
                                )}
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/profile" className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition">
                                    <User className="w-5 h-5 text-gray-600" />
                                </Link>
                                <button onClick={logout} className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black transition">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden md:flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg">
                                <span>Sign In</span>
                            </Link>
                        )}

                        <button
                            type="button"
                            className="md:hidden p-2"
                            aria-label="Toggle mobile menu"
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-600" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
                        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 transition">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
                            />
                        </div>

                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg font-medium transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {roleKey === 'customer' && (
                            <Link
                                to="/cart"
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="font-medium">Cart</span>
                                <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-red-500 text-white text-xs font-bold">
                                    {getCartCount()}
                                </span>
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium">Profile</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center justify-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-white text-xl font-bold mb-4">TenaMed</h3>
                        <p className="text-sm text-gray-400">Your trusted online pharmacy partner. Quality healthcare delivered to your doorstep.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/products" className="hover:text-white transition">Buy Medicines</Link></li>
                            <li><Link to="/upload-prescription" className="hover:text-white transition">Upload Prescription</Link></li>
                            <li><Link to="/pharmacies" className="hover:text-white transition">Find Pharmacies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><span className="hover:text-white transition">Contact Us</span></li>
                            <li><span className="hover:text-white transition">FAQs</span></li>
                            <li><span className="hover:text-white transition">Terms of Service</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <p className="text-sm">support@tenamed.com</p>
                        <p className="text-sm">+251 911 000 000</p>
                        {isAuthenticated && <p className="text-xs text-gray-500 mt-2">Signed in as {userEmail}</p>}
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} TenaMed. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
