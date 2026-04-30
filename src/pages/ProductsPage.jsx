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
    const listKey = productId ? `${productId}-${index}` : id;
    const hasStockInfo = typeof medicine?.availableQuantity === 'number';
    const inStock = hasStockInfo ? medicine.availableQuantity > 0 : true;

    return {
        id,
        listKey,
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
    const [activeSort, setActiveSort] = useState('name');
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

    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const normalizedQuery = searchQuery.toLowerCase();
        const matchesSearch = product.name.toLowerCase().includes(normalizedQuery) ||
            (product.brandName || '').toLowerCase().includes(normalizedQuery) ||
            (product.genericName || '').toLowerCase().includes(normalizedQuery) ||
            product.pharmacy.toLowerCase().includes(normalizedQuery);
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        if (activeSort === 'name') return a.name.localeCompare(b.name);
        if (activeSort === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (activeSort === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (activeSort === 'stock') return (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0);
        return 0;
    });

    const isPrescriptionList = Boolean(usePrescriptionMatches && prescriptionMatches);

    return (
        <div className="bg-transparent">
            {/* HERO */}
            <div className="nova-hero">
                <div className="nova-hero-ring"></div>
                <div className="nova-hero-left">
                    <div className="nova-hero-badge">
                        <div className="nova-hero-badge-dot"></div>
                        Next-Gen Pharmacy Platform
                    </div>
                    <h1 className="nova-hero-title">
                        Your Health,<br />
                        <span className="grad-text">Delivered Fast</span>
                    </h1>
                    <p className="nova-hero-sub">Browse verified medicines, compare generics, and checkout with confidence. Prescription management built right in.</p>
                    <div className="nova-hero-actions">
                        <a href="#main-grid" className="btn-primary" onClick={(e) => { e.preventDefault(); document.getElementById('main-grid')?.scrollIntoView({ behavior: 'smooth' }); }}>
                            Explore Medicines
                        </a>
                        <Link to="/upload-prescription" className="btn-ghost">Upload Rx →</Link>
                    </div>
                </div>
                <div className="nova-hero-right">
                    <div className="nova-hero-image-wrap">
                        <div className="nova-hero-image-glow"></div>
                        <img 
                            className="nova-hero-img"
                            src={FALLBACK_MEDICINE_IMAGE}
                            alt="Prescription Medicine Bottles"
                            style={{ borderRadius: '20px' }}
                        />
                    </div>
                    <div className="nova-search-wrap">
                        <Search className="nova-search-icon w-4 h-4" />
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="Search medicines, ingredients, categories…" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            ref={medicineSearchInputRef}
                        />
                        <span className="nova-search-kbd">⌘K</span>
                    </div>
                </div>
            </div>

            {/* FILTER BAR */ }
    <div className="nova-filter-bar">
        <span className="nova-filter-label">Filter</span>
        {categories.slice(0, 8).map(cat => (
            <button
                key={cat}
                className={`nova-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
            >
                {cat}
            </button>
        ))}

        <div className="nova-sort-right">
            <span className="nova-filter-label">Sort</span>
            <select onChange={(e) => setActiveSort(e.target.value)} value={activeSort}>
                <option value="name">Name A–Z</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="stock">In Stock First</option>
            </select>
        </div>
    </div>

    {/* MAIN AREA */ }
    <div className="nova-main" id="main-grid">

        {/* E-Prescription Finder formatted as Featured */}
        <div className="nova-featured hover:transform-none cursor-default mb-4">
            <div className="nova-featured-shimmer"></div>
            <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🩺</div>
            <div style={{ flex: 1, zIndex: 1 }}>
                <div className="nova-featured-pill">▸ MEDICAL</div>
                <div className="nova-featured-name">Find ePrescription</div>
                <div className="nova-featured-desc">Search medicines issued by a doctor using unique code and phone.</div>
                {prescriptionError && <p className="text-sm text-red-500 mt-2">{prescriptionError}</p>}
            </div>
            <form onSubmit={handlePrescriptionSearch} className="nova-featured-right flex sm:flex-row flex-col gap-2 relative z-10">
                <input
                    type="text"
                    value={prescriptionSearch.uniqueCode}
                    onChange={(e) => setPrescriptionSearch({ ...prescriptionSearch, uniqueCode: e.target.value })}
                    placeholder="Unique Code"
                    className="bg-[var(--surface)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <input
                    type="tel"
                    value={prescriptionSearch.phone}
                    onChange={(e) => setPrescriptionSearch({ ...prescriptionSearch, phone: e.target.value })}
                    placeholder="Phone (09...)"
                    className="bg-[var(--surface)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <button type="submit" disabled={isPrescriptionLoading} className="nova-featured-add">
                    {isPrescriptionLoading ? 'Searching...' : 'Find'}
                </button>
            </form>
        </div>

        {/* Prescription Results Info */}
        {prescriptionResult && (
            <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)] p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text)]">Prescription details</h3>
                    <p className="text-sm text-[var(--text3)]">Maximum refills: {maxRefillsAllowed} • Refill used: {refillsUsed}</p>
                </div>
                {prescriptionItems.length > 0 ? (
                    <div className="space-y-4">
                        {prescriptionItems.map((item, idx) => (
                            <div key={idx} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--surface)]">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-[var(--text3)]">Medicine</p>
                                        <p className="text-base font-semibold text-[var(--text)]">{item?.name || item?.medicineName || 'Unnamed'}</p>
                                        <div className="flex gap-4 mt-2 text-sm text-[var(--text2)]">
                                            <span>Form: {item?.form || '-'}</span>
                                            <span>Qty: {item?.quantity ?? item?.qty ?? '-'}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handlePrescriptionItemSearch(item?.name || item?.medicineName)}
                                        className="btn-ghost"
                                    >
                                        Search Code
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[var(--text3)]">No prescription items found.</p>
                )}
            </div>
        )}

        {isPrescriptionList && (
            <div className="mb-4 rounded-xl border border-[var(--accent2-rgb)] bg-[rgba(var(--accent2-rgb),0.1)] px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-[var(--text)]"><span className="font-semibold text-[var(--accent2)]">Verified.</span> Showing matched items.</span>
                <button onClick={handleBrowseAll} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Browse All</button>
            </div>
        )}

        <div className="nova-section-head">
            <div className="nova-section-title">Medicines Catalogue {selectedCategory !== 'All' ? `(${selectedCategory})` : ''}</div>
            <div className="nova-count-badge" id="count-label">{filteredProducts.length} items</div>
        </div>

        {isLoading ? (
            <div className="nova-empty">
                <div className="nova-empty-icon animate-pulse">⏳</div>
                <div className="nova-empty-msg">Loading catalogue...</div>
            </div>
        ) : filteredProducts.length > 0 ? (
            <div className="nova-grid" id="med-grid">
                {filteredProducts.map((product, i) => {
                    const isAdded = false; // Add to cart state logic if needed
                    const hasLowStock = product.inStock; // We can use mock UI for stock percentages 
                    const stockPct = product.inStock ? 85 : 0;
                    const stockColor = stockPct > 50 ? 'var(--accent2)' : 'var(--danger)';

                    return (
                        <div key={product.listKey || product.id} className="nova-card" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="nova-card-top">
                                <Link
                                    to={`/products/${product.routeId || product.id}`}
                                    state={{
                                        product,
                                        prescriptionOverride: isPrescriptionList ? false : undefined,
                                        prescriptionId: isPrescriptionList ? product.prescriptionId : undefined,
                                    }}
                                    className="nova-card-icon-wrap"
                                >
                                    <img src={product.image} className="nova-card-icon-img" alt={product.name} onError={(e) => { e.currentTarget.src = FALLBACK_MEDICINE_IMAGE; }} />
                                </Link>
                                <div className="nova-badges">
                                    {product.prescriptionRequired ? (
                                        <span className="nova-badge nova-badge-rx">Rx Only</span>
                                    ) : (
                                        <span className="nova-badge nova-badge-otc">OTC</span>
                                    )}
                                    {!product.inStock && <span className="nova-badge nova-badge-low">OOS</span>}
                                </div>
                            </div>

                            <Link
                                to={`/products/${product.routeId || product.id}`}
                                state={{ product }}
                                className="no-underline group"
                            >
                                <div className="nova-card-name group-hover:text-[var(--accent)] transition-colors">{product.name}</div>
                                {product.genericName && <div className="nova-card-generic">{product.genericName}</div>}
                                <span className="nova-card-cat">{product.category}</span>
                            </Link>

                            <div>
                                <div className="nova-stock-row">
                                    <span className="nova-stock-text">Availability</span>
                                    <span className="nova-stock-val" style={{ color: stockColor }}>{product.inStock ? 'Available' : 'Out of Stock'}</span>
                                </div>
                                <div className="nova-stock-bar">
                                    <div className="nova-stock-fill" style={{ width: `${stockPct}%`, background: stockColor }}></div>
                                </div>
                            </div>

                            <div className="nova-card-bottom">
                                <div className="nova-price-wrap">
                                    {typeof product.price === 'number' ? (
                                        <div className="nova-price">${product.price.toFixed(2)}</div>
                                    ) : (
                                        <div className="nova-price opacity-50 text-sm">Unavailable</div>
                                    )}
                                    <span className="nova-price-unit">per pack</span>
                                </div>
                                {product.prescriptionRequired ? (
                                    <Link
                                        to="/upload-prescription"
                                        state={{ medicine: product, source: 'products-list' }}
                                        className="nova-icon-btn"
                                        title="Upload Rx"
                                    >
                                        📄
                                    </Link>
                                ) : (
                                    <button
                                        className={`nova-add-btn ${isAdded ? 'added' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addToCart(product, 1);
                                        }}
                                        disabled={!product.inStock}
                                        style={!product.inStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="nova-empty">
                <div className="nova-empty-icon">🔍</div>
                <div className="nova-empty-msg">No medicines found for your search.</div>
                <button onClick={handleBrowseAll} className="btn-ghost mt-4">Clear Filters</button>
            </div>
        )}
    </div>
        </div >
    );
};

export default ProductsPage;
