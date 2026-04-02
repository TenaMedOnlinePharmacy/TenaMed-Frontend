import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { products, categories } from '../data/mockProducts';

const ProductsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.pharmacy.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Browse Medicines</h1>
                        <p className="text-gray-500 mt-1">Found {filteredProducts.length} items</p>
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <div className="relative flex-grow md:w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search medicine or pharmacy..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-800">Categories</h3>
                            </div>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`nav-btn w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                                        <Link to={`/products/${product.id}`} className="block h-48 overflow-hidden relative bg-gray-100">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {!product.inStock && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                                                </div>
                                            )}
                                        </Link>
                                        <div className="p-5">
                                            <div className="text-xs font-medium text-blue-600 mb-1">{product.category}</div>
                                            <Link to={`/products/${product.id}`} className="block">
                                                <h3 className="font-bold text-gray-900 mb-1 hover:text-blue-600 transition">{product.name}</h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mb-3">Sold by: {product.pharmacy}</p>

                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                                <button
                                                    disabled={!product.inStock}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${product.inStock
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                                <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No medicines found</h3>
                                <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                                <button
                                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                                    className="mt-4 text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
