import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { medicineGetAll, medicineSearch, prescriptionGetHospitalIssued } from '../api/axios';
import { useCart } from '../context/CartContext';
import { resolveApiImageUrl } from '../utils/imageUrl';

const FALLBACK_MEDICINE_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=60';

const getMedicineImageValue = (medicine) => (
    medicine?.imageUrl ||
    medicine?.imageURL ||
    medicine?.medicineImageUrl ||
    medicine?.medicineImageURL ||
    medicine?.image ||
    medicine?.photoUrl ||
    medicine?.photoURL ||
    medicine?.thumbnailUrl ||
    medicine?.thumbnailURL ||
    ''
);

const mapMedicineToProduct = (medicine, index) => {
    const parsedPrice = Number(medicine?.price);
    const hasValidPrice = Number.isFinite(parsedPrice) && parsedPrice >= 0;
    const brandName = medicine?.brandName || medicine?.brand || '';
    const medicineName = medicine?.medicineName || medicine?.name || 'Unnamed medicine';
    const hasDistinctBrand = Boolean(brandName) && brandName !== medicineName;
    const displayName = hasDistinctBrand ? brandName : medicineName;
    const pharmacyName = medicine?.pharmacyLegalName || 'TenaMED Partner Pharmacy';
    const category = medicine?.medicineCategory || medicine?.category || 'General';
    const productId = medicine?.productId || medicine?.medicineId || medicine?.id;
    const id = productId || `${displayName}-${pharmacyName}-${index}`;
    const routeId = productId || `name-${encodeURIComponent(displayName)}-${index}`;
    const hasStockInfo = typeof medicine?.availableQuantity === 'number';
    const inStock = hasStockInfo ? medicine.availableQuantity > 0 : true;

    return {
        id,
        routeId,
        productId,
        medicineId: medicine?.medicineId || medicine?.productId || medicine?.id,
        pharmacyId: medicine?.pharmacyId,
        name: displayName,
        brandName: hasDistinctBrand ? brandName : '',
        genericName: hasDistinctBrand ? medicineName : '',
        category,
        pharmacy: pharmacyName,
        description: medicine?.indications || medicine?.dosageInstructions || 'No description available.',
        indications: medicine?.indications || '',
        contraindications: medicine?.contraindications || '',
        sideEffects: medicine?.sideEffects || '',
        prescriptionRequired: Boolean(medicine?.prescriptionRequired ?? medicine?.requiresPrescription),
        price: hasValidPrice ? parsedPrice : null,
        image: resolveApiImageUrl(getMedicineImageValue(medicine), FALLBACK_MEDICINE_IMAGE),
        inStock,
    };
};

const mapMatchedPrescriptionToProduct = (medicine, index, prescriptionId) => {
    const mapped = mapMedicineToProduct(medicine, index);
    return {
        ...mapped,
        prescriptionRequired: false,
        prescriptionId: medicine?.prescriptionId || prescriptionId || null,
    };
};

const ProductsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [usePrescriptionMatches, setUsePrescriptionMatches] = useState(false);
    const [prescriptionSearch, setPrescriptionSearch] = useState({ uniqueCode: '', phone: '' });
    const [prescriptionResult, setPrescriptionResult] = useState(null);
    const [prescriptionError, setPrescriptionError] = useState('');
    const [isPrescriptionLoading, setIsPrescriptionLoading] = useState(false);
    const location = useLocation();
    const { addToCart } = useCart();
    const medicineSearchInputRef = useRef(null);

    const prescriptionMatches = Array.isArray(location.state?.prescriptionMatches)
        ? location.state.prescriptionMatches
        : null;
    const prescriptionId = location.state?.prescriptionId || null;

    useEffect(() => {
        if (prescriptionMatches) {
            setUsePrescriptionMatches(true);
        }
    }, [prescriptionMatches]);

    useEffect(() => {
        let isMounted = true;

        if (usePrescriptionMatches && prescriptionMatches) {
            const mappedMatches = prescriptionMatches.map((row, index) => (
                mapMatchedPrescriptionToProduct(row, index, prescriptionId)
            ));

            setProducts(mappedMatches);
            setIsLoading(false);
            setErrorMsg('');

            return () => {
                isMounted = false;
            };
        }

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
    }, [searchQuery, selectedCategory, usePrescriptionMatches, prescriptionMatches, prescriptionId]);

    const handleBrowseAll = () => {
        setUsePrescriptionMatches(false);
        setSelectedCategory('All');
        setSearchQuery('');
    };

    const normalizePhoneInput = (value) => value.replace(/\s+/g, '');
    const isValidPhone = (value) => /^0[79]\d{8}$/.test(value);

    const handlePrescriptionSearch = async (event) => {
        event.preventDefault();
        const uniqueCode = prescriptionSearch.uniqueCode.trim();
        const phone = normalizePhoneInput(prescriptionSearch.phone);

        setPrescriptionError('');
        setPrescriptionResult(null);

        if (!uniqueCode) {
            setPrescriptionError('Please enter the unique code.');
            return;
        }

        if (!isValidPhone(phone)) {
            setPrescriptionError('Phone number must be 10 digits and start with 09 or 07.');
            return;
        }

        setIsPrescriptionLoading(true);
        try {
            const response = await prescriptionGetHospitalIssued({ uniqueCode, phone });
            const payload = response?.data;
            const result = Array.isArray(payload) ? payload[0] : payload;

            if (!result) {
                setPrescriptionError('No prescription found for that unique code and phone number.');
                return;
            }

            setPrescriptionResult(result);
        } catch (error) {
            setPrescriptionError(error?.response?.data?.error || 'Unable to fetch prescription right now.');
        } finally {
            setIsPrescriptionLoading(false);
        }
    };

    const handlePrescriptionItemSearch = (medicineName) => {
        setUsePrescriptionMatches(false);
        setSelectedCategory('All');
        setSearchQuery(medicineName || '');

        requestAnimationFrame(() => {
            const input = medicineSearchInputRef.current;
            if (input) {
                input.focus();
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    };

    const categories = useMemo(() => {
        const dynamicCategories = products
            .map((product) => product.category)
            .filter(Boolean);
        return ['All', ...new Set(dynamicCategories)];
    }, [products]);

    const prescriptionItems = useMemo(() => {
        const items = prescriptionResult?.items || prescriptionResult?.prescriptionItems || [];
        return Array.isArray(items) ? items : [];
    }, [prescriptionResult]);

    const maxRefillsAllowed = typeof prescriptionResult?.maximumRefillAllowed === 'number'
        ? prescriptionResult.maximumRefillAllowed
        : typeof prescriptionResult?.maxRefillsAllowed === 'number'
            ? prescriptionResult.maxRefillsAllowed
            : '-';
    const refillsUsed = typeof prescriptionResult?.refillUsed === 'number'
        ? prescriptionResult.refillUsed
        : typeof prescriptionResult?.refillsUsed === 'number'
            ? prescriptionResult.refillsUsed
            : '-';

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.pharmacy.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const isPrescriptionList = Boolean(usePrescriptionMatches && prescriptionMatches);

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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                ref={medicineSearchInputRef}
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Find ePrescription</h2>
                            <p className="text-sm text-gray-500">Search medicines issued by a doctor using the unique code and phone number.</p>
                        </div>
                        <form onSubmit={handlePrescriptionSearch} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unique code</label>
                                <input
                                    type="text"
                                    value={prescriptionSearch.uniqueCode}
                                    onChange={(event) => {
                                        setPrescriptionSearch((prev) => ({ ...prev, uniqueCode: event.target.value }));
                                        setPrescriptionError('');
                                    }}
                                    placeholder="Enter unique code"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                                <input
                                    type="tel"
                                    value={prescriptionSearch.phone}
                                    onChange={(event) => {
                                        setPrescriptionSearch((prev) => ({ ...prev, phone: event.target.value }));
                                        setPrescriptionError('');
                                    }}
                                    placeholder="09xxxxxxxx or 07xxxxxxxx"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                />
                                <p className="mt-1 text-xs text-gray-400">Phone must be 10 digits and start with 09 or 07.</p>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={isPrescriptionLoading}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                                >
                                    <Search className="w-4 h-4" />
                                    {isPrescriptionLoading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </form>
                        {prescriptionError && (
                            <p className="text-sm text-red-600">{prescriptionError}</p>
                        )}
                    </div>
                </div>

                {prescriptionResult && (
                    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Prescription details</h3>
                                <p className="text-sm text-gray-500">Maximum refills: {maxRefillsAllowed} • Refill used: {refillsUsed}</p>
                            </div>
                        </div>

                        {prescriptionItems.length > 0 ? (
                            <div className="mt-4 space-y-4">
                                {prescriptionItems.map((item, index) => {
                                    const itemName = item?.name || item?.medicineName || 'Unnamed medicine';
                                    const itemQuantity = item?.quantity ?? item?.qty ?? '-';
                                    const itemForm = item?.from || item?.form || '-';
                                    const itemInstruction = item?.instruction || item?.instructions || 'No instruction provided.';
                                    const itemStrength = item?.strength || '-';

                                    return (
                                        <div key={item?.prescriptionItemId || item?.medicineId || index} className="rounded-xl border border-gray-100 p-4">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide text-gray-400">Medicine</p>
                                                        <p className="text-base font-semibold text-gray-900">{itemName}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                        <p className="text-gray-600"><span className="font-medium text-gray-900">Quantity:</span> {itemQuantity}</p>
                                                        <p className="text-gray-600"><span className="font-medium text-gray-900">Form:</span> {itemForm}</p>
                                                        <p className="text-gray-600"><span className="font-medium text-gray-900">Strength:</span> {itemStrength}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide text-gray-400">Instruction</p>
                                                        <p className="text-sm text-gray-700 whitespace-pre-line">{itemInstruction}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePrescriptionItemSearch(itemName)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                        Search medicine
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-gray-500">No prescription items were returned.</p>
                        )}
                    </div>
                )}

                {isPrescriptionList && (
                    <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <span className="font-semibold">Prescription verified.</span> Showing matched medicines from your upload.
                        </div>
                        <button
                            type="button"
                            onClick={handleBrowseAll}
                            className="px-4 py-2 rounded-lg bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                            Browse all medicines
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}


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
                                        <Link
                                            to={`/products/${product.routeId || product.id}`}
                                            state={{
                                                product,
                                                prescriptionOverride: isPrescriptionList ? false : undefined,
                                                prescriptionId: isPrescriptionList ? product.prescriptionId : undefined,
                                            }}
                                            className="block h-48 overflow-hidden relative bg-gray-100"
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                onError={(event) => {
                                                    event.currentTarget.src = FALLBACK_MEDICINE_IMAGE;
                                                }}
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
                                                <div className="text-xs font-medium text-emerald-600">{product.category}</div>
                                                {product.prescriptionRequired && (
                                                    <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                                                        Prescription Required
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                to={`/products/${product.routeId || product.id}`}
                                                state={{
                                                    product,
                                                    prescriptionOverride: isPrescriptionList ? false : undefined,
                                                    prescriptionId: isPrescriptionList ? product.prescriptionId : undefined,
                                                }}
                                                className="block"
                                            >
                                                <h3 className="font-bold text-gray-900 mb-1 hover:text-emerald-600 transition">{product.name}</h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mb-3">Sold by: {product.pharmacy}</p>

                                            <div className="flex items-center justify-between mt-4">
                                                {typeof product.price === 'number' ? (
                                                    <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-500">Price unavailable</span>
                                                )}
                                                {product.prescriptionRequired ? (
                                                    <Link
                                                        to="/upload-prescription"
                                                        state={{ medicine: product, source: 'products-list' }}
                                                        className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
                                                    >
                                                        Upload prescription
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(product, 1)}
                                                        disabled={!product.inStock}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${product.inStock
                                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                        Add
                                                    </button>
                                                )}
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
                                {isPrescriptionList ? (
                                    <>
                                        <p className="text-gray-500">No matches were found for your prescription.</p>
                                        <button
                                            onClick={handleBrowseAll}
                                            className="mt-4 text-emerald-600 hover:text-emerald-500 font-medium"
                                        >
                                            Browse all medicines
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                                        <button
                                            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                                            className="mt-4 text-emerald-600 hover:text-emerald-500 font-medium"
                                        >
                                            Clear all filters
                                        </button>
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

export default ProductsPage;
