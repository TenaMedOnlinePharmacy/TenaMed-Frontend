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
        <div className="bg-zinc-50 text-zinc-600">
            {/* HERO */}
            <section className="relative pt-16 pb-16 lg:pt-24 lg:pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/80 px-4 py-2 shadow-sm">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
                                    <Pill className="w-4 h-4" />
                                </span>
                                <span className="text-sm font-medium text-zinc-900">TenaMED • Modern Pharmacy & Health</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.08] text-zinc-900">
                                Modern Care for <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Your Daily Health.</span>
                            </h1>

                            <p className="text-lg text-zinc-500 max-w-xl leading-relaxed">
                                Experience a new standard of pharmacy. Fast prescription refills, expert medication guidance,
                                and quality health products delivered to you.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/products"
                                    className="inline-flex justify-center items-center gap-2 bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-full transition-all shadow-sm hover:bg-blue-700 hover:-translate-y-0.5"
                                >
                                    Shop Medicines
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to="/upload-prescription"
                                    className="inline-flex justify-center items-center gap-2 border border-zinc-200 bg-white text-zinc-700 text-sm font-medium px-6 py-3 rounded-full transition-all hover:bg-zinc-50 hover:border-zinc-300"
                                >
                                    Upload Prescription
                                    <FilePlus2 className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Trust */}
                            <div className="flex items-center gap-4 pt-4 border-t border-zinc-200/60">
                                <div className="flex -space-x-2">
                                    <img
                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"
                                        alt=""
                                        className="w-8 h-8 rounded-full border-2 object-cover border-white"
                                    />
                                    <img
                                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64"
                                        alt=""
                                        className="w-8 h-8 rounded-full border-2 object-cover border-white"
                                    />
                                    <img
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64"
                                        alt=""
                                        className="w-8 h-8 rounded-full border-2 object-cover border-white"
                                    />
                                </div>
                                <div>
                                    <div className="flex gap-0.5 text-blue-500">
                                        <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                                        <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                                        <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                                        <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                                        <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                                    </div>
                                    <p className="text-xs mt-0.5 text-zinc-500">
                                        Trusted by <span className="font-medium text-zinc-900">50k+ Customers</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-md border border-zinc-200/50 group bg-white">
                                <img
                                    src={HeroImage}
                                    alt="Medicines and health products"
                                    className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <span className="inline-flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-white/20 bg-white/90 text-zinc-800">
                                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Quality Verified
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-white/20 bg-white/90 text-zinc-800">
                                        <Bolt className="w-4 h-4 text-blue-600" /> Same-Day Delivery
                                    </span>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 backdrop-blur-xl p-5 rounded-xl shadow-sm border border-zinc-200/50 flex items-center justify-between bg-white/95">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider mb-0.5 text-zinc-500">Our Promise</p>
                                        <p className="text-sm font-medium tracking-tight text-zinc-900">Accurate, safe, and fast.</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                                        <BadgeCheck className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="py-14 lg:py-20 bg-zinc-950 border-y border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-blue-600 rounded-2xl p-8 shadow-sm md:-translate-y-6 text-white border border-blue-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
                            <h3 className="text-3xl font-semibold tracking-tight mb-2">#1</h3>
                            <p className="text-lg font-medium mb-3">Community Pharmacy</p>
                            <p className="text-sm leading-relaxed text-blue-100 font-light">
                                Reliable medications and expert advice, delivered with care.
                            </p>
                        </div>

                        <div className="p-6 md:p-8">
                            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-2 text-white">1M+</h3>
                            <p className="font-medium mb-2 text-zinc-400 text-sm">Prescriptions Filled</p>
                            <p className="text-xs text-zinc-500 font-light">Accurately processed and safely delivered.</p>
                        </div>

                        <div className="p-6 md:p-8">
                            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-2 text-white">50K+</h3>
                            <p className="font-medium mb-2 text-zinc-400 text-sm">Active Patients</p>
                            <p className="text-xs text-zinc-500 font-light">Trusted for ongoing health and wellness.</p>
                        </div>

                        <div className="p-6 md:p-8">
                            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-2 text-white">15Y+</h3>
                            <p className="font-medium mb-2 text-zinc-400 text-sm">Years in Practice</p>
                            <p className="text-xs text-zinc-500 font-light">Decades of combined clinical experience.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="py-20 lg:py-28 bg-zinc-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-zinc-900">
                            Comprehensive Pharmacy <span className="text-blue-600">Services</span>
                        </h2>
                        <p className="text-base text-zinc-500">
                            More than a place to pick up pills — we help you manage your health end-to-end.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 bg-zinc-50 text-blue-600 mb-6 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 tracking-tight text-zinc-900">Prescription Refills</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Easy refills and reminders so you never miss a dose.
                            </p>
                        </div>

                        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 bg-zinc-50 text-blue-600 mb-6 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                <Syringe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 tracking-tight text-zinc-900">Immunizations</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Walk-in vaccines administered by certified pharmacists.
                            </p>
                        </div>

                        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 bg-zinc-50 text-blue-600 mb-6 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 tracking-tight text-zinc-900">Health Consultations</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Private medication reviews, interactions, and guidance.
                            </p>
                        </div>

                        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 bg-zinc-50 text-blue-600 mb-6 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                <Pill className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 tracking-tight text-zinc-900">OTC & Supplements</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Curated over-the-counter medicines and wellness essentials.
                            </p>
                        </div>

                        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 bg-zinc-50 text-blue-600 mb-6 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 tracking-tight text-zinc-900">Local Delivery</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Fast, discreet delivery straight to your home.
                            </p>
                        </div>

                        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 bg-zinc-50 text-blue-600 mb-6 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                <HeartPulse className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 tracking-tight text-zinc-900">Health Screenings</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Blood pressure and wellness checks to keep you on track.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM */}
            <section className="bg-white pt-20 pb-20 border-t border-zinc-200/60" id="team">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-md border border-zinc-200 text-xs font-medium mb-4 tracking-wide bg-zinc-50 text-zinc-600">
                                Clinical Team
                            </span>
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 text-zinc-900">
                                Meet Your <span className="text-blue-600">Pharmacists</span>
                            </h2>
                            <p className="text-base text-zinc-500 max-w-xl">
                                Licensed professionals committed to safe, effective medication management.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="group relative rounded-2xl overflow-hidden bg-zinc-50 border border-blue-200 shadow-sm">
                            <div className="aspect-[4/5] w-full relative">
                                <img
                                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600"
                                    alt="Lead Pharmacist"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent"></div>
                                <div className="absolute top-4 right-4 p-1.5 rounded-md bg-white/90 backdrop-blur border border-white/20 shadow-sm flex items-center justify-center">
                                    <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-5 text-left text-white">
                                    <span className="inline-block px-2 py-0.5 rounded border border-white/20 backdrop-blur-md text-xs font-medium mb-1.5 bg-white/10">
                                        Lead Pharmacist
                                    </span>
                                    <h4 className="text-lg font-medium tracking-tight">Dr. Sarah Jenkins, PharmD</h4>
                                    <p className="text-xs font-light text-zinc-200">Clinical Director</p>
                                </div>
                            </div>
                        </div>

                        <div className="group relative rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200/80">
                            <div className="aspect-[4/5] w-full relative">
                                <img
                                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600"
                                    alt="Staff Pharmacist"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4 border-t border-zinc-200/50">
                                <h4 className="text-base font-medium tracking-tight text-zinc-900">Dr. Alex Chen, RPh</h4>
                                <p className="text-xs text-zinc-500 font-light mt-0.5">Staff Pharmacist</p>
                            </div>
                        </div>

                        <div className="group relative rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200/80">
                            <div className="aspect-[4/5] w-full relative">
                                <img
                                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600"
                                    alt="Compounding Specialist"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4 border-t border-zinc-200/50">
                                <h4 className="text-base font-medium tracking-tight text-zinc-900">Dr. James Carter, PharmD</h4>
                                <p className="text-xs text-zinc-500 font-light mt-0.5">Compounding Specialist</p>
                            </div>
                        </div>

                        <div className="group relative rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200/80">
                            <div className="aspect-[4/5] w-full relative">
                                <img
                                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600"
                                    alt="Lead Pharmacy Tech"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4 border-t border-zinc-200/50">
                                <h4 className="text-base font-medium tracking-tight text-zinc-900">Maria Lopez, CPhT</h4>
                                <p className="text-xs text-zinc-500 font-light mt-0.5">Lead Pharmacy Tech</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-zinc-50 border-t border-zinc-200/60" id="faq">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 text-zinc-900">
                            Frequently Asked <span className="text-blue-600">Questions</span>
                        </h2>
                        <p className="text-base text-zinc-500">Everything you need to know about orders and prescriptions.</p>
                    </div>

                    <div className="space-y-3">
                        <details className="group rounded-xl border border-zinc-200/80 bg-white [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 text-zinc-900 focus:outline-none">
                                <h3 className="text-sm font-medium">Do you accept health insurance?</h3>
                                <ChevronDown className="w-5 h-5 text-zinc-400 transition duration-300 group-open:-rotate-180" />
                            </summary>
                            <p className="px-5 pb-5 text-sm text-zinc-500 font-light leading-relaxed border-t border-zinc-100 pt-3">
                                Coverage depends on the pharmacy and your provider. Upload your prescription and we’ll help confirm options.
                            </p>
                        </details>

                        <details className="group rounded-xl border border-zinc-200/80 bg-white [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 text-zinc-900 focus:outline-none">
                                <h3 className="text-sm font-medium">How do I transfer my prescription?</h3>
                                <ChevronDown className="w-5 h-5 text-zinc-400 transition duration-300 group-open:-rotate-180" />
                            </summary>
                            <p className="px-5 pb-5 text-sm text-zinc-500 font-light leading-relaxed border-t border-zinc-100 pt-3">
                                Use “Upload Prescription” and include your current pharmacy details — we’ll guide the rest.
                            </p>
                        </details>

                        <details className="group rounded-xl border border-zinc-200/80 bg-white [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 text-zinc-900 focus:outline-none">
                                <h3 className="text-sm font-medium">Is delivery available in my area?</h3>
                                <ChevronDown className="w-5 h-5 text-zinc-400 transition duration-300 group-open:-rotate-180" />
                            </summary>
                            <p className="px-5 pb-5 text-sm text-zinc-500 font-light leading-relaxed border-t border-zinc-100 pt-3">
                                Delivery availability depends on partnered pharmacies and distance. You’ll see options at checkout.
                            </p>
                        </details>

                        <details className="group rounded-xl border border-zinc-200/80 bg-white [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 text-zinc-900 focus:outline-none">
                                <h3 className="text-sm font-medium">Do I need an appointment to consult a pharmacist?</h3>
                                <ChevronDown className="w-5 h-5 text-zinc-400 transition duration-300 group-open:-rotate-180" />
                            </summary>
                            <p className="px-5 pb-5 text-sm text-zinc-500 font-light leading-relaxed border-t border-zinc-100 pt-3">
                                No — you can request a consultation anytime. We’ll connect you with an available pharmacist.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* REQUEST / REFILL */}
            <section id="book" className="py-20 bg-zinc-950 text-white relative border-y border-zinc-800">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                ></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                        <div className="hidden lg:flex flex-col gap-6">
                            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                                Manage Your <br />
                                <span className="text-blue-500">Prescriptions</span> Online.
                            </h2>
                            <p className="font-light text-base text-zinc-400 max-w-md">
                                Request a refill, upload a prescription, or ask a pharmacist — in less than 2 minutes.
                            </p>

                            <div className="mt-8 space-y-4 max-w-sm">
                                <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-blue-500 shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white">Save Time</h4>
                                        <p className="text-xs text-zinc-500 mt-0.5">Skip the line and order instantly.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-blue-500 shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white">Secure Process</h4>
                                        <p className="text-xs text-zinc-500 mt-0.5">Your information stays protected.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-sm">
                            <h3 className="text-xl font-medium tracking-tight mb-6 text-white">Submit a Request</h3>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-white"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer text-zinc-300">
                                            <option>Request Type</option>
                                            <option>Prescription Refill</option>
                                            <option>Upload Prescription</option>
                                            <option>Consult Pharmacist</option>
                                            <option>Book Vaccination</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 pointer-events-none" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Rx Number (Optional)"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-white"
                                    />
                                </div>

                                <textarea
                                    rows={3}
                                    placeholder="Additional details or medications..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-white resize-none"
                                />

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 font-medium text-sm py-3.5 rounded-xl transition-all shadow-sm hover:bg-blue-500 text-white flex items-center justify-center gap-2 mt-2"
                                >
                                    Submit Request
                                    <CalendarClock className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT STRIP */}
            <section className="py-12 bg-white border-t border-zinc-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3 p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50">
                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Location</p>
                                <p className="text-sm text-zinc-500">Addis Ababa, Ethiopia</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50">
                            <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Phone</p>
                                <p className="text-sm text-zinc-500">+251 911 000 000</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Email</p>
                                <p className="text-sm text-zinc-500">support@tenamed.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
