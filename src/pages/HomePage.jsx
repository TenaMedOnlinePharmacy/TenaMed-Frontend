import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BadgeCheck,
    Bolt,
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    Clock,
    FilePlus2,
    FileText,
    HeartPulse,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Pill,
    ShieldCheck,
    Star,
    Syringe,
    Truck,
} from 'lucide-react';

import HeroImage from '../assets/image/image 3.jpg';

const HomePage = () => {
    return (
        <div className="bg-transparent pb-20">
            {/* HERO */}
            <div className="nova-hero">
                <div className="nova-hero-ring"></div>
                <div className="nova-hero-left">
                    <div className="nova-hero-badge">
                        <div className="nova-hero-badge-dot"></div>
                        TenaMED • Modern Pharmacy
                    </div>
                    <h1 className="nova-hero-title">
                        Modern Care for <br />
                        <span className="grad-text">Your Daily Health.</span>
                    </h1>
                    <p className="nova-hero-sub">
                        Experience a new standard of pharmacy. Fast prescription refills, expert medication guidance,
                        and quality health products delivered directly to you.
                    </p>
                    <div className="nova-hero-actions">
                        <Link to="/products" className="btn-primary">
                            Shop Medicines
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                        <Link to="/upload-prescription" className="btn-ghost">
                            Upload Prescription
                            <FilePlus2 className="w-4 h-4 ml-2" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 pt-8 mt-6 border-t border-[var(--border2)]">
                        <div className="flex -space-x-2">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="" className="w-8 h-8 rounded-full border-2 object-cover border-[var(--surface)]" />
                            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="" className="w-8 h-8 rounded-full border-2 object-cover border-[var(--surface)]" />
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" alt="" className="w-8 h-8 rounded-full border-2 object-cover border-[var(--surface)]" />
                        </div>
                        <div>
                            <div className="flex gap-0.5 text-[var(--accent2)]">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <p className="text-xs mt-0.5 text-[var(--text2)]">
                                Trusted by <span className="font-medium text-[var(--text)]">50k+ Customers</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="nova-hero-right">
                    <div className="nova-hero-image-wrap">
                        <div className="nova-hero-image-glow"></div>
                        <img 
                            className="nova-hero-img"
                            src={HeroImage}
                            alt="Medicines and health products"
                            style={{ borderRadius: '20px' }}
                        />
                        <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                            <span className="inline-flex items-center gap-1.5 backdrop-blur-xl px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border2)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--glow)]">
                                <CheckCircle2 className="w-4 h-4 text-[var(--accent2)]" /> Quality Verified
                            </span>
                            <span className="inline-flex items-center gap-1.5 backdrop-blur-xl px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border2)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--glow)]">
                                <Bolt className="w-4 h-4 text-[var(--accent2)]" /> Same-Day Delivery
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS BAR */}
            <div className="nova-stats-bar" style={{ marginTop: '0' }}>
                <div className="nova-stat">
                    <div className="nova-stat-icon blue">#1</div>
                    <div className="nova-stat-content">
                        <div className="nova-stat-val">Community</div>
                        <div className="nova-stat-lbl">Pharmacy Partner</div>
                    </div>
                </div>
                <div className="nova-stat">
                    <div className="nova-stat-icon purple">📜</div>
                    <div className="nova-stat-content">
                        <div className="nova-stat-val">1M+</div>
                        <div className="nova-stat-lbl">Prescriptions Filled</div>
                    </div>
                </div>
                <div className="nova-stat">
                    <div className="nova-stat-icon teal">👥</div>
                    <div className="nova-stat-content">
                        <div className="nova-stat-val">50K+</div>
                        <div className="nova-stat-lbl">Active Patients</div>
                    </div>
                </div>
                <div className="nova-stat hidden sm:flex">
                    <div className="nova-stat-icon green">🎓</div>
                    <div className="nova-stat-content">
                        <div className="nova-stat-val">15Y+</div>
                        <div className="nova-stat-lbl">Years in Practice</div>
                    </div>
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="nova-main mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* SERVICES SECTION */}
                <div className="text-center max-w-2xl mx-auto mb-14 mt-10">
                    <div className="nova-featured-pill mb-4 inline-block mx-auto">▸ OUR SERVICES</div>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[var(--text)]">
                        Comprehensive Pharmacy Services
                    </h2>
                    <p className="text-base text-[var(--text2)]">
                        More than a place to pick up pills — we help you manage your health end-to-end.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    {/* Service Card 1 */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-6 shadow-lg hover:border-[var(--accent2)] transition-colors group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border3)] bg-[var(--surface3)] text-[var(--accent2)] mb-6 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium mb-2 tracking-tight text-[var(--text)]">Prescription Refills</h3>
                        <p className="text-sm text-[var(--text3)] leading-relaxed font-light">
                            Easy refills and reminders so you never miss a dose.
                        </p>
                    </div>

                    {/* Service Card 2 */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-6 shadow-lg hover:border-[var(--accent2)] transition-colors group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border3)] bg-[var(--surface3)] text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform">
                            <Syringe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium mb-2 tracking-tight text-[var(--text)]">Immunizations</h3>
                        <p className="text-sm text-[var(--text3)] leading-relaxed font-light">
                            Walk-in vaccines administered by certified pharmacists.
                        </p>
                    </div>

                    {/* Service Card 3 */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-6 shadow-lg hover:border-[var(--accent2)] transition-colors group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border3)] bg-[var(--surface3)] text-[var(--accent3)] mb-6 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium mb-2 tracking-tight text-[var(--text)]">Health Consultations</h3>
                        <p className="text-sm text-[var(--text3)] leading-relaxed font-light">
                            Private medication reviews, interactions, and guidance.
                        </p>
                    </div>

                    {/* Service Card 4 */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-6 shadow-lg hover:border-[var(--accent2)] transition-colors group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border3)] bg-[var(--surface3)] text-[var(--accent2)] mb-6 group-hover:scale-110 transition-transform">
                            <Pill className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium mb-2 tracking-tight text-[var(--text)]">OTC & Supplements</h3>
                        <p className="text-sm text-[var(--text3)] leading-relaxed font-light">
                            Curated over-the-counter medicines and wellness essentials.
                        </p>
                    </div>

                    {/* Service Card 5 */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-6 shadow-lg hover:border-[var(--accent2)] transition-colors group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border3)] bg-[var(--surface3)] text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium mb-2 tracking-tight text-[var(--text)]">Local Delivery</h3>
                        <p className="text-sm text-[var(--text3)] leading-relaxed font-light">
                            Fast, discreet delivery straight to your home.
                        </p>
                    </div>

                    {/* Service Card 6 */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-6 shadow-lg hover:border-[var(--accent2)] transition-colors group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border3)] bg-[var(--surface3)] text-[var(--accent3)] mb-6 group-hover:scale-110 transition-transform">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium mb-2 tracking-tight text-[var(--text)]">Health Screenings</h3>
                        <p className="text-sm text-[var(--text3)] leading-relaxed font-light">
                            Blood pressure and wellness checks to keep you on track.
                        </p>
                    </div>
                </div>

                {/* TEAM SECTION (MODERNIZED) */}
                <div className="nova-section-head mt-16 mb-8 border-t border-[var(--border2)] pt-12">
                    <div className="nova-section-title">Clinical Team</div>
                    <div className="text-sm text-[var(--text3)]">Licensed professionals committed to safe, effective management.</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    <div className="nova-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="aspect-[4/5] w-full relative">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600" alt="Lead Pharmacist" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-5 text-left z-10">
                                <span className="inline-block px-2 py-0.5 rounded border border-[var(--border2)] backdrop-blur-md text-xs font-medium mb-1.5 bg-[var(--surface)] text-[var(--accent2)]">Lead Pharmacist</span>
                                <h4 className="text-lg font-medium tracking-tight text-[var(--text)]">Dr. Sarah Jenkins</h4>
                                <p className="text-xs font-light text-[var(--text3)]">Clinical Director</p>
                            </div>
                        </div>
                    </div>

                    <div className="nova-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="aspect-[4/5] w-full relative">
                            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600" alt="Pharmacist" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-5 text-left z-10">
                                <h4 className="text-lg font-medium tracking-tight text-[var(--text)]">Dr. Alex Chen</h4>
                                <p className="text-xs font-light text-[var(--text3)]">Staff Pharmacist</p>
                            </div>
                        </div>
                    </div>

                    <div className="nova-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="aspect-[4/5] w-full relative">
                            <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600" alt="Compounding" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-5 text-left z-10">
                                <h4 className="text-lg font-medium tracking-tight text-[var(--text)]">Dr. James Carter</h4>
                                <p className="text-xs font-light text-[var(--text3)]">Compounding Specialist</p>
                            </div>
                        </div>
                    </div>

                    <div className="nova-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="aspect-[4/5] w-full relative">
                            <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600" alt="Pharmacy Tech" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-5 text-left z-10">
                                <h4 className="text-lg font-medium tracking-tight text-[var(--text)]">Maria Lopez</h4>
                                <p className="text-xs font-light text-[var(--text3)]">Lead Pharmacy Tech</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FEATURED: MANAGE PRESCRIPTION */}
                <div className="nova-featured mt-16 mb-16">
                    <div className="nova-featured-shimmer"></div>
                    <div style={{ fontSize: '3rem', flexShrink: 0 }}>💊</div>
                    <div style={{ flex: 1, zIndex: 1 }}>
                        <div className="nova-featured-pill">▸ PORTAL</div>
                        <div className="nova-featured-name">Manage Prescriptions Online</div>
                        <div className="nova-featured-desc">
                            Request a refill, upload a prescription, or ask a pharmacist — securely and instantly.
                        </div>
                    </div>
                    <div className="nova-featured-right z-10 flex flex-col gap-3">
                        <Link to="/upload-prescription" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                            Upload Now
                            <ArrowRight className="w-4 h-4 ml-2 inline" />
                        </Link>
                    </div>
                </div>

                {/* CONTACT INFO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="flex items-start gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface2)]">
                        <div className="p-2 rounded-lg bg-[var(--surface3)] text-[var(--accent)]">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--text)]">Location</p>
                            <p className="text-sm text-[var(--text3)] mt-1">Addis Ababa, Ethiopia</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface2)]">
                        <div className="p-2 rounded-lg bg-[var(--surface3)] text-[var(--accent2)]">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--text)]">Phone</p>
                            <p className="text-sm text-[var(--text3)] mt-1">+251 911 000 000</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface2)]">
                        <div className="p-2 rounded-lg bg-[var(--surface3)] text-[var(--accent3)]">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--text)]">Email</p>
                            <p className="text-sm text-[var(--text3)] mt-1">support@tenamed.com</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomePage;
