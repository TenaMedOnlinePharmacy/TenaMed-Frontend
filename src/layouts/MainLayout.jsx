import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, X } from 'lucide-react';
import tenaMedLogo from '../assets/Tena med Logo.svg';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
    const location = useLocation();
    const { getCartCount, refreshCart } = useCart();
    const { isAuthenticated, userRole, userEmail, logout } = useAuth();
    const shouldShowFooter = location.pathname !== '/login' && !location.pathname.startsWith('/register');
    
    // Theme toggle state
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('nova-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            return savedTheme === 'dark';
        }
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (!currentTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            return true;
        }
        return currentTheme === 'dark';
    });

    const toggleTheme = () => {
        const nextTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('nova-theme', nextTheme);
        setIsDark(!isDark);
    };

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
            { to: '/complaints', label: 'Complaints' },
        ],
        pharmacy: [
            { to: '/pharmacist/dashboard', label: 'Dashboard' },
            { to: '/pharmacist/dashboard?tab=team', label: 'Team Invitations' },
            { to: '/pharmacist/prescription-review', label: 'Prescription Review' },
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
            { to: '/admin/complaints', label: 'Complaints' },
        ],
    };

    const roleKey = isAuthenticated ? userRole : 'guest';
    const navItems = navByRole[roleKey] || navByRole.guest;

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800">
            {/* Navbar */}
            <nav className="nova-nav">
                <div className="nova-nav-left">
                    <Link to="/" className="nova-logo">
                        <div className="nova-logo-icon">💊</div>
                        TenaMed
                    </Link>
                    <div className="nova-nav-links">
                        {navItems.map((item) => (
                            <Link 
                                key={item.to} 
                                to={item.to} 
                                className={`nova-nav-link ${location.pathname === item.to ? 'active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="nova-nav-right">
                    {/* Theme Toggle */}
                    <div className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        <span className="toggle-label" id="theme-label">{isDark ? 'DARK' : 'LIGHT'}</span>
                        <div className="toggle-track">
                            <div className="toggle-knob" id="toggle-knob">
                                <span id="theme-icon">{isDark ? '🌙' : '☀️'}</span>
                            </div>
                        </div>
                    </div>

                    {isAuthenticated && (
                       <Link to="/profile" className="nova-icon-btn" title="Profile">
                           <User className="w-4 h-4" />
                       </Link>
                    )}

                    {roleKey === 'customer' && (
                        <Link to="/cart" onClick={refreshCart} className="nova-cart-btn">
                            <span>🛒</span>
                            <span className="hidden sm:inline">Cart</span>
                            <div className={`nova-cart-count ${getCartCount() > 0 ? 'bump' : ''}`} id="cart-count">
                                {getCartCount()}
                            </div>
                        </Link>
                    )}
                    
                    {isAuthenticated ? (
                              <button onClick={logout} className="nova-icon-btn" title="Sign Out" style={{ fontSize: '0.8rem' }}>
                           <X className="w-5 h-5" />
                       </button>
                    ) : (
                       <Link to="/login" className="nova-icon-btn flex items-center justify-center whitespace-nowrap px-3 text-xs" style={{ width: 'auto' }}>
                           Sign In
                       </Link>
                    )}

                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            {shouldShowFooter && (
                <footer className="bg-[var(--surface)] text-[var(--text2)] py-12 border-t border-[var(--border)] mt-auto">
                    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span style={{ fontSize: '1.5rem' }}>💊</span>
                                <span className="font-bold text-[var(--text)] text-xl tracking-tight">TenaMed</span>
                            </div>
                            <p className="text-sm font-light leading-relaxed">Your trusted online pharmacy partner. Quality healthcare delivered to your doorstep.</p>
                        </div>
                        <div>
                            <h4 className="text-[var(--text)] font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm font-light">
                                <li><Link to="/products" className="hover:text-[var(--accent)] transition-colors">Buy Medicines</Link></li>
                                <li><Link to="/upload-prescription" className="hover:text-[var(--accent)] transition-colors">Upload Prescription</Link></li>
                                <li><Link to="/pharmacies" className="hover:text-[var(--accent)] transition-colors">Find Pharmacies</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[var(--text)] font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm font-light">
                                <li><span className="hover:text-[var(--accent)] transition-colors cursor-pointer">Contact Us</span></li>
                                <li><span className="hover:text-[var(--accent)] transition-colors cursor-pointer">FAQs</span></li>
                                <li><span className="hover:text-[var(--accent)] transition-colors cursor-pointer">Terms of Service</span></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[var(--text)] font-semibold mb-4">Contact</h4>
                            <p className="text-sm font-light">support@tenamed.com</p>
                            <p className="text-sm font-light">+251 911 000 000</p>
                            {isAuthenticated && <p className="text-xs text-[var(--text3)] mt-2">Signed in as <span className="text-[var(--text)]">{userEmail}</span></p>}
                        </div>
                    </div>
                    <div className="container mx-auto px-4 mt-8 pt-8 border-t border-[var(--border2)] text-center text-xs text-[var(--text3)] font-light">
                        © {new Date().getFullYear()} TenaMed. All rights reserved.
                    </div>
                </footer>
            )}
        </div>
    );
};

export default MainLayout;
