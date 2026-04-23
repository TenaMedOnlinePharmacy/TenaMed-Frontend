import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { medicineGetAll, medicineSearch } from '../api/axios';
import { useCart } from '../context/CartContext';

const FALLBACK_MEDICINE_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=60';

const mapMedicineToProduct = (medicine, index) => {
    const parsedPrice = Number(medicine?.price);
    const hasValidPrice = Number.isFinite(parsedPrice) && parsedPrice >= 0;
    const medicineName = medicine?.medicineName || medicine?.name || 'Unnamed medicine';
    const pharmacyName = medicine?.pharmacyLegalName || 'TenaMED Partner Pharmacy';
    const category = medicine?.medicineCategory || medicine?.category || 'General';
    const medicineId = medicine?.medicineId || medicine?.id;
    const id = medicineId || `${medicineName}-${pharmacyName}-${index}`;
    const routeId = medicineId || `name-${encodeURIComponent(medicineName)}-${index}`;
    const hasStockInfo = typeof medicine?.availableQuantity === 'number';
    const inStock = hasStockInfo ? medicine.availableQuantity > 0 : true;

    return {
        id,
        routeId,
        medicineId,
        pharmacyId: medicine?.pharmacyId,
        name: medicineName,
        category,
        pharmacy: pharmacyName,
        description: medicine?.indications || medicine?.dosageInstructions || 'No description available.',
        indications: medicine?.indications || '',
        contraindications: medicine?.contraindications || '',
        sideEffects: medicine?.sideEffects || '',
        prescriptionRequired: Boolean(medicine?.prescriptionRequired),
        price: hasValidPrice ? parsedPrice : null,
        image: medicine?.imageUrl || FALLBACK_MEDICINE_IMAGE,
        inStock,
    };
};

const ProductsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const { addToCart } = useCart();

    useEffect(() => {
        let isMounted = true;

        const loadMedicines = async () => {
            setIsLoading(true);
            setErrorMsg('');

            try {
                const hasSearch = Boolean(searchQuery.trim());
                const hasCategory = selectedCategory !== 'All';

                const response = hasSearch || hasCategory
                    ? await medicineSearch({
                        keyword: hasSearch ? searchQuery.trim() : undefined,
                        categoryName: hasCategory ? selectedCategory : undefined,
                    })
                    : await medicineGetAll();

                const rows = Array.isArray(response?.data) ? response.data : [];
                if (isMounted) {
                    setProducts(rows.map((row, index) => mapMedicineToProduct(row, index)));
                }
            } catch (error) {
                if (isMounted) {
                    setProducts([]);
                    setErrorMsg(error?.response?.data?.error || 'Unable to load medicines right now.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadMedicines();

        return () => {
            isMounted = false;
        };
    }, [searchQuery, selectedCategory]);

    const categories = useMemo(() => {
        const dynamicCategories = products
            .map((product) => product.category)
            .filter(Boolean);
        return ['All', ...new Set(dynamicCategories)];
    }, [products]);

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
                        {isLoading ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                                <p className="text-gray-500">Loading medicines...</p>
                            </div>
                        ) : errorMsg ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-red-100">
                                <h3 className="text-lg font-medium text-red-700">Failed to load medicines</h3>
                                <p className="text-red-500">{errorMsg}</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                                        <Link to={`/products/${product.routeId || product.id}`} state={{ product }} className="block h-48 overflow-hidden relative bg-gray-100">
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
                                            <div className="mb-1 flex items-center gap-2">
                                                <div className="text-xs font-medium text-blue-600">{product.category}</div>
                                                {product.prescriptionRequired && (
                                                    <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                                                        Prescription Required
                                                    </span>
                                                )}
                                            </div>
                                            <Link to={`/products/${product.routeId || product.id}`} state={{ product }} className="block">
                                                <h3 className="font-bold text-gray-900 mb-1 hover:text-blue-600 transition">{product.name}</h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mb-3">Sold by: {product.pharmacy}</p>

                                            <div className="flex items-center justify-between mt-4">
                                                {typeof product.price === 'number' ? (
                                                    <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-500">Price unavailable</span>
                                                )}
                                                <button
                                                    onClick={() => addToCart(product, 1)}
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
