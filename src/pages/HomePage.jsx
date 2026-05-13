import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, FilePlus2, Star, ShieldCheck, Truck, Phone, Mail, Clock,
    ArrowRight, Heart, ShoppingCart, ChevronDown, CheckCircle2,
    Stethoscope, Video, FileText, Lock, CreditCard, Award, Activity, Pill, Plus, AlertCircle, RefreshCw, Snowflake, MessageCircle
} from 'lucide-react';
import HeroImage from '../assets/image/image 3.jpg';

// Static Data
const categories = [
    { id: 1, name: 'Prescription Drugs', icon: FileText, highlight: true },
    { id: 2, name: 'Medicines', icon: Pill },
    { id: 3, name: 'Vitamins', icon: Activity },
    { id: 4, name: 'Skincare', icon: Heart },
    { id: 5, name: 'Baby Care', icon: Star },
    { id: 6, name: 'Devices', icon: Stethoscope },
];

const featuredProducts = [
    { id: 1, name: 'Paracetamol 500mg', dosage: 'Pack of 10', price: 5.99, discount: 0, stock: 'In Stock', rating: 4.8, reviews: 124 },
    { id: 2, name: 'Amoxicillin 250mg', dosage: 'Bottle 100ml', price: 12.50, discount: 15, stock: 'Prescription Required', rating: 4.9, reviews: 89 },
    { id: 3, name: 'Vitamin C 1000mg', dosage: 'Pack of 30', price: 8.99, discount: 30, stock: 'In Stock', rating: 4.7, reviews: 210 },
    { id: 4, name: 'Ibuprofen 400mg', dosage: 'Pack of 20', price: 6.50, discount: 0, stock: 'Low Stock', rating: 4.6, reviews: 56 },
];

const conditions = [
    { id: 1, name: 'Diabetes', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 2, name: 'Heart Health', color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 3, name: 'Cold & Flu', color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { id: 4, name: 'Allergy', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 5, name: 'Pain Relief', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 6, name: 'Mental Wellness', color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

const blogs = [
    { id: 1, title: 'Managing Diabetes Daily', tag: 'Chronic Care', time: '5 min read', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'When to Use Antibiotics', tag: 'Medication', time: '4 min read', image: 'https://images.unsplash.com/photo-1584308666744-24d5e4a8c919?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'Vitamins for Immunity', tag: 'Wellness', time: '6 min read', image: 'https://images.unsplash.com/photo-1550572017-edb947c0bc78?auto=format&fit=crop&w=400&q=80' },
];

const reviews = [
    { id: 1, name: 'Sarah M.', text: 'Fast delivery and very easy prescription upload. Saved me a trip!', condition: 'Asthma Management', rating: 5 },
    { id: 2, name: 'David K.', text: 'The pharmacists are incredibly helpful when I have questions about interactions.', condition: 'Heart Health', rating: 5 },
    { id: 3, name: 'Elena R.', text: 'Always genuine medicines and their bundle deals are fantastic.', condition: 'Diabetes Care', rating: 4 },
];

const faqs = [
    { q: 'How do I upload a prescription?', a: 'Click the "Upload Prescription" button, attach a clear image or PDF of your doctor\'s prescription, and our licensed pharmacist will review it within 30 minutes.' },
    { q: 'What is the delivery time?', a: 'We offer same-day delivery for orders placed before 2 PM, and next-day delivery for all other orders.' },
    { q: 'Are all your medicines genuine?', a: 'Yes, 100%. We source directly from manufacturers and authorized distributors. We are fully licensed and ISO certified.' },
    { q: 'Do you offer tele-consultations?', a: 'Yes! You can speak via video or chat with our licensed pharmacists 24/7 for medication counseling.' },
    { q: 'How does cold-chain storage work?', a: 'For sensitive medications like insulin, we use specialized temperature-controlled packaging during delivery to ensure efficacy.' },
    { q: 'Can I return medicines?', a: 'Due to safety regulations, prescription medicines cannot be returned. OTC and devices can be returned within 7 days if unopened.' },
    { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, Chapa, Mobile Money, and Cash on Delivery.' },
    { q: 'Do you accept health insurance?', a: 'We partner with major health insurance providers. You can submit your policy details during checkout.' },
    { q: 'How can I track my order?', a: 'Once your order is dispatched, you will receive an SMS and email with a live tracking link.' },
    { q: 'What if my requested medicine is out of stock?', a: 'We will notify you immediately and our pharmacist can suggest a medically equivalent alternative after consulting your doctor.' },
];

const HomePage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="bg-[var(--bg)] min-h-screen text-[var(--text)] pb-10 overflow-hidden">
            {/* 1. HERO SECTION */}
            <div className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] blur-3xl rounded-full translate-x-1/4 -translate-y-1/4" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface2)] border border-[var(--border)] text-sm mb-6 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
                            Trusted by 50,000+ Patients
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Your Prescriptions,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">
                                Delivered Fast & Safe.
                            </span>
                        </h1>
                        <p className="text-lg text-[var(--text2)] mb-8 max-w-lg leading-relaxed">
                            Licensed pharmacy bringing genuine medicines, tele-consultations, and seamless refills directly to your door.
                        </p>

                        <div className="relative max-w-xl mb-6">
                            <input
                                type="text"
                                placeholder="Search for medicines, vitamins, or brands..."
                                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-[var(--surface)] border border-[var(--border2)] focus:border-[var(--accent)] outline-none shadow-sm text-[var(--text)] placeholder-[var(--text3)]"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text3)]" />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[var(--accent)] text-white rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-md">
                                Search
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link to="/upload-prescription" className="inline-flex items-center px-6 py-3 bg-[var(--surface)] border border-[var(--border2)] rounded-xl font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm">
                                <FilePlus2 className="w-5 h-5 mr-2" /> Upload Prescription
                            </Link>
                            <span className="text-sm text-[var(--text3)] flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[var(--success)]" /> Reviewed in 30 mins
                            </span>
                        </div>

                        <div className="mt-10 flex gap-6 text-sm font-medium text-[var(--text2)]">
                            <div className="flex items-center gap-1.5"><ShieldCheck className="w-5 h-5 text-[var(--success)]" /> Licensed</div>
                            <div className="flex items-center gap-1.5"><Award className="w-5 h-5 text-[var(--accent)]" /> ISO Certified</div>
                            <div className="flex items-center gap-1.5"><Clock className="w-5 h-5 text-blue-500" /> 24/7 Support</div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--surface)] to-transparent opacity-20 rounded-3xl z-10" />
                        <img
                            src={HeroImage}
                            alt="Pharmacy delivery"
                            className="w-full h-auto rounded-3xl shadow-2xl object-cover aspect-[4/3] border border-[var(--border)]"
                        />
                        {/* Trust badge overlaid */}
                        <div className="absolute -bottom-6 -left-6 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border2)] shadow-xl flex items-center gap-4 z-20">
                            <div className="w-12 h-12 rounded-full bg-[rgba(var(--success-rgb),0.1)] flex items-center justify-center">
                                <Truck className="w-6 h-6 text-[var(--success)]" />
                            </div>
                            <div>
                                <p className="font-bold text-[var(--text)]">Same-Day Delivery</p>
                                <p className="text-xs text-[var(--text3)]">For orders before 2 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. QUICK CATEGORY NAVIGATION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4">
                    {categories.map(cat => (
                        <div key={cat.id} className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl border ${cat.highlight ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'bg-[var(--surface)] border-[var(--border2)] text-[var(--text)] hover:border-[var(--accent)] transition-colors cursor-pointer'}`}>
                            <cat.icon className="w-5 h-5" />
                            <span className="font-medium whitespace-nowrap">{cat.name}</span>
                            {cat.highlight && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs font-bold">Rx</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. PROMO BANNER / OFFERS */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="z-10 text-center md:text-left mb-6 md:mb-0">
                        <span className="inline-block px-3 py-1 bg-black/20 rounded-full text-sm font-semibold mb-3">⚡ FLASH DEAL</span>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Up to 30% Off OTC Medicines</h2>
                        <p className="text-white/80">Stock up on essentials before the season changes.</p>
                    </div>
                    <div className="z-10 flex flex-col items-center">
                        <div className="flex gap-3 mb-4">
                            {['04', '21', '30'].map((time, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="bg-white text-[var(--accent)] font-bold text-2xl w-14 h-14 flex items-center justify-center rounded-xl shadow-inner">
                                        {time}
                                    </div>
                                    {idx < 2 && <span className="text-2xl font-bold self-center">:</span>}
                                </React.Fragment>
                            ))}
                        </div>
                        <button className="px-6 py-2.5 bg-white text-[var(--accent)] font-semibold rounded-xl hover:bg-opacity-90 transition-all shadow-md w-full">
                            Shop Sale
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. FEATURED PRODUCTS */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text)]">Featured Products</h2>
                        <p className="text-[var(--text2)] mt-1">Best-selling and top-rated items</p>
                    </div>
                    <Link to="/products" className="text-[var(--accent)] font-medium hover:underline flex items-center">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map(prod => (
                        <div key={prod.id} className="bg-[var(--surface)] border border-[var(--border2)] rounded-2xl p-4 flex flex-col hover:shadow-xl transition-all group relative">
                            {prod.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-[var(--danger)] text-white text-xs font-bold px-2 py-1 rounded z-10">
                                    -{prod.discount}%
                                </div>
                            )}
                            <button className="absolute top-4 right-4 p-2 bg-[var(--bg)] rounded-full text-[var(--text3)] hover:text-[var(--danger)] transition-colors z-10">
                                <Heart className="w-4 h-4" />
                            </button>
                            <div className="aspect-square w-full bg-[var(--bg)] rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                                <img src={`https://images.unsplash.com/photo-1584308666744-24d5e4a8c919?auto=format&fit=crop&w=300&q=80`} alt={prod.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400 mb-1 text-sm">
                                <Star className="w-3.5 h-3.5 fill-current" /> <span className="text-[var(--text)]">{prod.rating}</span> <span className="text-[var(--text3)]">({prod.reviews})</span>
                            </div>
                            <h3 className="font-semibold text-[var(--text)] line-clamp-1">{prod.name}</h3>
                            <p className="text-xs text-[var(--text3)] mb-2">{prod.dosage}</p>

                            <div className="mt-auto pt-4 border-t border-[var(--border2)] flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-lg">${prod.price.toFixed(2)}</span>
                                </div>
                                <button className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:bg-opacity-90 shadow-md">
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>
                            <div className={`mt-3 text-xs font-medium flex items-center gap-1 ${prod.stock === 'In Stock' ? 'text-[var(--success)]' :
                                    prod.stock === 'Low Stock' ? 'text-amber-500' : 'text-[var(--accent2)]'
                                }`}>
                                {prod.stock === 'Prescription Required' ? <FileText className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                {prod.stock}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. UPLOAD PRESCRIPTION SECTION */}
            <div className="bg-[var(--surface2)] border-y border-[var(--border)] py-20 mb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="w-14 h-14 bg-[rgba(var(--accent-rgb),0.1)] rounded-2xl flex items-center justify-center mb-6 border border-[rgba(var(--accent-rgb),0.2)]">
                                <FilePlus2 className="w-7 h-7 text-[var(--accent)]" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Have a Prescription?</h2>
                            <p className="text-[var(--text2)] mb-8 text-lg">Upload your doctor's prescription and let our licensed pharmacists handle the rest. We verify, pack, and deliver directly to you.</p>

                            <div className="space-y-6 mb-8">
                                {[
                                    { step: 1, title: 'Upload Image or PDF', desc: 'Securely upload your valid prescription.' },
                                    { step: 2, title: 'Pharmacist Review', desc: 'Our team verifies it within 30 minutes.' },
                                    { step: 3, title: 'Fast Delivery', desc: 'Dispatched in cold-chain secure packaging.' }
                                ].map(item => (
                                    <div key={item.step} className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border2)] flex items-center justify-center font-bold text-[var(--accent)] shrink-0">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[var(--text)]">{item.title}</h4>
                                            <p className="text-sm text-[var(--text3)]">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link to="/upload-prescription" className="inline-flex px-8 py-3.5 bg-[var(--accent)] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                                Upload Now
                            </Link>
                            <p className="mt-3 text-xs text-[var(--text3)]">Accepted formats: JPG, PNG, PDF. Max 5MB.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)] to-transparent rounded-3xl opacity-50 z-10" />
                            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" alt="Pharmacist reviewing" className="rounded-3xl shadow-2xl border border-[var(--border)]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. SHOP BY HEALTH CONDITION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[var(--text)]">Shop by Health Condition</h2>
                    <p className="text-[var(--text2)] mt-2">Find exactly what you need for your specific health goals.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {conditions.map(cond => (
                        <div key={cond.id} className="bg-[var(--surface)] border border-[var(--border2)] rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer hover:border-[var(--accent)] hover:shadow-md transition-all group">
                            <div className={`w-14 h-14 rounded-full ${cond.bg} ${cond.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Activity className="w-6 h-6" />
                            </div>
                            <span className="font-medium text-sm text-[var(--text)]">{cond.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 8. SHOP BY BRAND */}
            <div className="border-y border-[var(--border)] bg-[var(--surface2)] py-12 mb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm font-semibold text-[var(--text3)] mb-8 uppercase tracking-wider">Trusted by Global Pharmacy Brands</p>
                    <div className="flex justify-between items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto gap-8 hide-scrollbar">
                        {['Abbott', 'Pfizer', 'Bayer', 'GSK', 'Novartis', 'Sanofi'].map(brand => (
                            <div key={brand} className="text-2xl font-black text-[var(--text)]">{brand}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 9. WHY CHOOSE US - VALUE PROP */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border2)] rounded-2xl flex items-center justify-center mb-4 shadow-sm text-[var(--accent)]">
                            <Truck className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-[var(--text)]">Fast Delivery</h4>
                        <p className="text-sm text-[var(--text3)]">Same-day dispatch for all orders placed before 2 PM.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border2)] rounded-2xl flex items-center justify-center mb-4 shadow-sm text-[var(--success)]">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-[var(--text)]">100% Genuine</h4>
                        <p className="text-sm text-[var(--text3)]">Directly sourced from authorized manufacturers.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border2)] rounded-2xl flex items-center justify-center mb-4 shadow-sm text-blue-500">
                            <Snowflake className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-[var(--text)]">Cold-Chain Storage</h4>
                        <p className="text-sm text-[var(--text3)]">Temperature controlled logistics for sensitive meds.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border2)] rounded-2xl flex items-center justify-center mb-4 shadow-sm text-[var(--accent2)]">
                            <RefreshCw className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-[var(--text)]">Easy Returns</h4>
                        <p className="text-sm text-[var(--text3)]">Hassle-free refunds on eligible non-prescription items.</p>
                    </div>
                </div>
            </div>

            {/* 10. CONSULT A PHARMACIST */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--surface2)] to-transparent z-0 hidden md:block"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <span className="inline-block px-3 py-1 bg-[rgba(var(--accent-rgb),0.1)] text-[var(--accent)] rounded-full text-sm font-bold mb-4">Telemedicine Ready</span>
                            <h2 className="text-3xl font-bold mb-3">Talk to a Licensed Pharmacist</h2>
                            <p className="text-[var(--text2)] max-w-md mb-6">Have questions about side effects, interactions, or dosages? Connect with our clinical team live.</p>
                            <div className="flex gap-4">
                                <button className="flex items-center px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md">
                                    <Video className="w-5 h-5 mr-2" /> Video Consult
                                </button>
                                <button className="flex items-center px-6 py-3 bg-[var(--bg)] border border-[var(--border2)] text-[var(--text)] font-semibold rounded-xl hover:border-[var(--accent)] transition-colors shadow-sm">
                                    <MessageCircle className="w-5 h-5 mr-2" /> Live Chat
                                </button>
                            </div>
                            <p className="mt-4 text-xs font-medium text-[var(--success)] flex items-center gap-1.5"><Clock className="w-4 h-4" /> Available Now (24/7)</p>
                        </div>
                        <div className="flex -space-x-4">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&h=120&q=80" className="w-24 h-24 rounded-full border-4 border-[var(--surface)] object-cover shadow-lg relative z-20" alt="Pharmacist" />
                            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=120&h=120&q=80" className="w-24 h-24 rounded-full border-4 border-[var(--surface)] object-cover shadow-lg relative z-10" alt="Pharmacist" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 11. HEALTH BLOG */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text)]">Health Blog & Tips</h2>
                        <p className="text-[var(--text2)] mt-1">Expert advice for a healthier life.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {blogs.map(blog => (
                        <div key={blog.id} className="bg-[var(--surface)] rounded-2xl border border-[var(--border2)] overflow-hidden hover:shadow-lg transition-all group">
                            <div className="aspect-video w-full overflow-hidden relative">
                                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <span className="absolute top-3 left-3 bg-[var(--bg)]/90 backdrop-blur text-[var(--text)] text-xs font-bold px-2 py-1 rounded shadow-sm">
                                    {blog.tag}
                                </span>
                            </div>
                            <div className="p-5">
                                <div className="text-xs text-[var(--text3)] mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {blog.time}</div>
                                <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--accent)] transition-colors">{blog.title}</h3>
                                <button className="text-sm font-medium text-[var(--accent)] hover:underline flex items-center">Read Article <ArrowRight className="w-4 h-4 ml-1" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 12. CUSTOMER REVIEWS */}
            <div className="bg-[var(--surface2)] border-y border-[var(--border)] py-20 mb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="flex justify-center gap-1 text-[#ffc107] mb-3">
                            <Star className="w-6 h-6 fill-current" />
                            <Star className="w-6 h-6 fill-current" />
                            <Star className="w-6 h-6 fill-current" />
                            <Star className="w-6 h-6 fill-current" />
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                        <h2 className="text-3xl font-bold text-[var(--text)]">4.8/5 from 12,000+ Reviews</h2>
                        <p className="text-[var(--text2)] mt-2">See what our community has to say.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reviews.map(rev => (
                            <div key={rev.id} className="bg-[var(--surface)] border border-[var(--border2)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold">{rev.name}</h4>
                                        <p className="text-xs text-[var(--text3)] mt-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[var(--success)]" /> Verified Purchase</p>
                                    </div>
                                    <div className="flex gap-0.5 text-[#ffc107]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-[var(--border2)]'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[var(--text2)] text-sm italic mb-4">"{rev.text}"</p>
                                <div className="inline-flex px-2 py-1 bg-[var(--surface3)] text-[var(--text3)] rounded text-xs font-medium">
                                    Condition: {rev.condition}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 14. FAQS */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[var(--text)]">Frequently Asked Questions</h2>
                    <p className="text-[var(--text2)] mt-2">Everything you need to know about our pharmacy services.</p>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border border-[var(--border2)] bg-[var(--surface)] rounded-2xl overflow-hidden transition-all">
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-[var(--surface2)] transition-colors"
                            >
                                <span className="font-semibold text-[var(--text)]">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-[var(--text3)] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                            </button>
                            {openFaq === idx && (
                                <div className="px-6 pb-5 pt-1 text-[var(--text2)] text-sm leading-relaxed border-t border-[var(--border)]">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 13. NEWSLETTER */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="bg-[var(--surface)] border border-[var(--border2)] rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--surface2)] z-0 pointer-events-none"></div>
                    <div className="relative z-10 max-w-xl mx-auto">
                        <div className="w-12 h-12 bg-[var(--surface3)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border2)]">
                            <Mail className="w-6 h-6 text-[var(--accent)]" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Get Weekly Health Tips & Exclusive Discounts</h2>
                        <p className="text-[var(--text2)] mb-6 text-sm">Join 50,000+ subscribers managing their health smarter.</p>
                        <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-4 py-3 bg-[var(--bg)] border border-[var(--border2)] rounded-xl outline-none focus:border-[var(--accent)] text-[var(--text)]"
                                required
                            />
                            <button type="submit" className="px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-xl hover:opacity-90 shadow-sm whitespace-nowrap">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* 15. CERTIFICATIONS & TRUST FOOTER BANNER */}
            <div className="bg-[var(--surface2)] border-t border-[var(--border)] pt-12 pb-6 mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-between items-center gap-8 mb-8 pb-8 border-b border-[var(--border)]">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-[var(--success)]" />
                            <div>
                                <h4 className="font-bold text-[var(--text)]">Licensed Pharmacy</h4>
                                <p className="text-xs text-[var(--text3)]">License #PHRM-2023-8942</p>
                            </div>
                        </div>
                        <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all flex-wrap">
                            {/* Payment icons placeholders */}
                            <div className="px-3 py-1 bg-[var(--bg)] border border-[var(--border2)] rounded text-sm font-black text-[var(--text)]">VISA</div>
                            <div className="px-3 py-1 bg-[var(--bg)] border border-[var(--border2)] rounded text-sm font-black text-[var(--text)]">MASTERCARD</div>
                            <div className="px-3 py-1 bg-[var(--bg)] border border-[var(--border2)] rounded text-sm font-black text-[var(--text)]">PAYPAL</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text2)]">
                            <Lock className="w-4 h-4" /> 256-bit SSL Encrypted Checkout
                        </div>
                    </div>
                    <div className="text-center text-xs text-[var(--text3)]">
                        <p>© 2026 TenaMED Pharmacy. All rights reserved.</p>
                        <p className="mt-1">Disclaimer: The content on this site is for informational purposes only. Always consult with a qualified healthcare professional.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
