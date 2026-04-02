import React from 'react';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroBg from '../assets/image/image 3.jpg';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gray-900 text-white py-24 lg:py-32 overflow-hidden">
                <div
                    className="absolute inset-0 z-0 opacity-40"
                    style={{
                        backgroundImage: `url('${HeroBg}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>

                <div className="container mx-auto px-4 relative z-20 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Your Health, <br />
                            <span className="text-blue-400">Delivered.</span>
                        </h1>
                        <p className="text-xl mb-8 text-gray-200 max-w-lg">
                            Order medicines, upload prescriptions, and consult pharmacists from the comfort of your home.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/products" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition flex items-center shadow-lg transform hover:-translate-y-1">
                                Shop Now <ShoppingBag className="ml-2 w-5 h-5" />
                            </Link>
                            <Link to="/upload-prescription" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition flex items-center transform hover:-translate-y-1">
                                Upload Script <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="md:w-1/2 flex justify-center">
                        <div className="relative w-80 h-80 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl animate-pulse">
                            <span className="text-6xl animate-bounce">💊</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16">
                <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 text-center group">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                            <Truck className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Fast Delivery</h3>
                        <p className="text-gray-600">Get your medicines delivered to your doorstep within hours.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 text-center group">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors duration-300">
                            <ShieldCheck className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Genuine Products</h3>
                        <p className="text-gray-600">100% authentic medicines sourced directly from manufacturers.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 text-center group">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                            <ShoppingBag className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Huge Inventory</h3>
                        <p className="text-gray-600">Wide range of healthcare products and medicines available.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
