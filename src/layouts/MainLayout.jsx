import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, User, Search } from 'lucide-react';

import { useCart } from '../context/CartContext';

const MainLayout = () => {
    const { getCartCount } = useCart();

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
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Home</Link>
                        <Link to="/products" className="text-gray-600 hover:text-blue-600 font-medium transition">Medicines</Link>
                        <Link to="/pharmacies" className="text-gray-600 hover:text-blue-600 font-medium transition">Pharmacies</Link>
                        <Link to="/upload-prescription" className="text-gray-600 hover:text-blue-600 font-medium transition">Prescription</Link>
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

                        <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition group">
                            <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                            {getCartCount() > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>

                        <Link to="/profile" className="hidden md:flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition">
                            <User className="w-5 h-5 text-gray-600" />
                        </Link>

                        <Link to="/login" className="hidden md:flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg">
                            <span>Sign In</span>
                        </Link>

                        <button className="md:hidden p-2">
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>
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
                            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition">FAQs</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <p className="text-sm">support@tenamed.com</p>
                        <p className="text-sm">+251 911 000 000</p>
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
