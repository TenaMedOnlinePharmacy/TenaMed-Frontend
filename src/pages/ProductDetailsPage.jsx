import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, ShoppingCart, ShieldCheck, Heart, Share2, Truck,
    ClipboardList, AlertTriangle, Activity, Pill,
} from 'lucide-react';
import { medicineGetById } from '../api/axios';
import { useCart } from '../context/CartContext';
import { resolveApiImageUrl } from '../utils/imageUrl';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=60';

const getMedicineImageValue = (m) => (
    m?.imageUrl || m?.imageURL || m?.medicineImageUrl || m?.medicineImageURL ||
    m?.image || m?.photoUrl || m?.photoURL || m?.thumbnailUrl || m?.thumbnailURL || ''
);

const mapRawToProduct = (medicine) => {
    const price = Number(medicine?.price ?? medicine?.doseValue ?? 0);
    const brandName = medicine?.brandName || medicine?.brand || '';
    const medicineName = medicine?.medicineName || medicine?.name || medicine?.genericName || 'Unnamed medicine';
    const hasDistinctBrand = Boolean(brandName) && brandName !== medicineName;
    const displayName = hasDistinctBrand ? brandName : medicineName;
    const productId = medicine?.productId || medicine?.medicineId || medicine?.id || null;

    return {
        id: productId || displayName,
        productId,
        medicineId: medicine?.medicineId || medicine?.productId || medicine?.id || null,
        pharmacyId: medicine?.pharmacyId || null,
        name: displayName,
        brandName: hasDistinctBrand ? brandName : '',
        genericName: hasDistinctBrand ? medicineName : (medicine?.genericName || ''),
        category: medicine?.medicineCategory || medicine?.category || medicine?.therapeuticClass || 'General',
        pharmacy: medicine?.pharmacyLegalName || 'TenaMED Partner Pharmacy',
        description: medicine?.indications || medicine?.dosageInstructions || 'No description available.',
        indications: medicine?.indications || '',
        contraindications: medicine?.contraindications || '',
        sideEffects: medicine?.sideEffects || '',
        dosageInstructions: medicine?.dosageInstructions || '',
        dosageForm: medicine?.dosageForm || medicine?.doseForm || '',
        therapeuticClass: medicine?.therapeuticClass || '',
        schedule: medicine?.schedule || '',
        regulatoryCode: medicine?.regulatoryCode || '',
        pregnancyCategory: medicine?.pregnancyCategory || '',
        doseValue: medicine?.doseValue ?? null,
        doseUnit: medicine?.doseUnit || '',
        prescriptionRequired: Boolean(medicine?.prescriptionRequired ?? medicine?.requiresPrescription),
        needManualReview: Boolean(medicine?.needManualReview),
        availableQuantity: medicine?.availableQuantity ?? null,
        inStock: typeof medicine?.availableQuantity === 'number' ? medicine.availableQuantity > 0 : true,
        image: resolveApiImageUrl(getMedicineImageValue(medicine), FALLBACK_IMAGE),
        allergenIds: Array.isArray(medicine?.allergenIds) ? medicine.allergenIds : [],
        dopingRuleIds: Array.isArray(medicine?.dopingRuleIds) ? medicine.dopingRuleIds : [],
        price: Number.isFinite(price) && price > 0 ? price : 0,
    };
};

/* Clinical section block */
const ClinicalSection = ({ icon: Icon, title, children, iconColor }) => (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface2)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `rgba(${iconColor},0.15)` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: `rgb(${iconColor})` }} />
            </div>
            <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">{title}</h3>
        </div>
        <div className="px-5 py-4">{children}</div>
    </div>
);

/* Small metadata pill */
const MetaPill = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text3)] font-semibold">{label}</span>
            <span className="text-sm font-semibold text-[var(--text)]">{value}</span>
        </div>
    );
};

/* ── Main component ────────────────────────────────────── */
const ProductDetailsPage = () => {
    const { id } = useParams();
    const routeIdIsUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [cartError, setCartError] = useState('');
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const prescriptionOverride = location?.state?.prescriptionOverride;
    const matchedPrescriptionId = location?.state?.prescriptionId;

    const applyOverride = (p) => {
        if (!p || prescriptionOverride !== false) return p;
        return {
            ...p,
            prescriptionRequired: false,
            ...(matchedPrescriptionId ? { prescriptionId: matchedPrescriptionId } : {}),
        };
    };

    useEffect(() => {
        let isMounted = true;
        const routedProduct = location?.state?.product;
        const isUuid = routeIdIsUuid;

        if (routedProduct) {
            // Preserve full product payload from ProductsPage to avoid ID mismatches.
            setProduct(applyOverride({
                ...routedProduct,
                id: routedProduct?.id || id,
                productId: routedProduct?.productId || (isUuid ? id : null),
                medicineId: routedProduct?.medicineId || routedProduct?.id || null,
            }));
            setIsLoading(false);
            return () => { isMounted = false; };
        }

        const loadMedicine = async () => {
            if (!routedProduct) setIsLoading(true);
            try {
                const response = await medicineGetById(id);
                if (isMounted) {
                    const payload = response?.data;
                    const rows = Array.isArray(payload) ? payload : payload ? [payload] : [];
                    if (rows.length === 0) {
                        if (!routedProduct) setProduct(null);
                        return;
                    }
                    const fromApi = mapRawToProduct(rows[0]);
                    const merged = {
                        ...(routedProduct || {}),
                        ...fromApi,
                        // Keep product identity from routed state when API response lacks product-specific ids.
                        productId: fromApi.productId || routedProduct?.productId || (isUuid ? id : null),
                        medicineId: fromApi.medicineId || routedProduct?.medicineId || fromApi.id || null,
                        id: fromApi.id || routedProduct?.id || (isUuid ? id : fromApi.id),
                        price: fromApi.price > 0 ? fromApi.price : (routedProduct?.price ?? 0),
                        pharmacy: (fromApi.pharmacy && fromApi.pharmacy !== 'TenaMED Partner Pharmacy')
                            ? fromApi.pharmacy : (routedProduct?.pharmacy || fromApi.pharmacy),
                        pharmacyId: fromApi.pharmacyId || routedProduct?.pharmacyId || null,
                        category: (fromApi.category && fromApi.category !== 'General')
                            ? fromApi.category : (routedProduct?.category || fromApi.category),
                    };
                    setProduct(applyOverride(merged));
                }
            } catch {
                if (isMounted && !routedProduct) setProduct(null);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        if (id) {
            if (isUuid) loadMedicine();
            else setIsLoading(false);
        }

        return () => { isMounted = false; };
    }, [id, location.state]);

    const handleAddToCart = async () => {
        setCartError('');
        if (product?.prescriptionRequired) {
            navigate('/upload-prescription', { state: { medicine: product, source: 'product-details' } });
            return;
        }
        const resolvedProductId = product?.productId || (routeIdIsUuid ? id : null);
        if (!resolvedProductId) {
            setCartError('This item is missing product ID. Please open it from the product list and try again.');
            return;
        }
        try {
            await addToCart({
                ...product,
                productId: resolvedProductId,
            }, quantity);
            navigate('/cart');
        } catch (error) {
            setCartError(error?.response?.data?.error || 'Unable to add this item to cart. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[var(--text3)] font-medium">Loading medicine details…</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-5xl mb-4">💊</div>
                    <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Product Not Found</h2>
                    <p className="text-[var(--text2)] mb-6">The medicine you are looking for does not exist or has been removed.</p>
                    <Link to="/products" className="btn-primary">← Back to Medicines</Link>
                </div>
            </div>
        );
    }

    const stockLabel = product.availableQuantity !== null
        ? product.availableQuantity > 0 ? `In Stock (${product.availableQuantity} units)` : 'Out of Stock'
        : product.inStock ? 'In Stock' : 'Out of Stock';
    const stockColor = product.inStock ? 'var(--success)' : 'var(--danger)';
    const hasMetaPills = product.dosageForm || product.schedule || product.doseValue || product.pregnancyCategory || product.regulatoryCode;
    const hasClinical = product.indications || product.description || product.dosageInstructions || product.contraindications || product.sideEffects;

    return (
        <div className="bg-transparent min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-[var(--text3)] mb-6">
                    <Link to="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-[var(--accent)] transition-colors">Medicines</Link>
                    <span>/</span>
                    <span className="text-[var(--text)] font-medium truncate">{product.name}</span>
                </nav>

                {/* ── Main hero card ── */}
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden mb-5"
                    style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
                    <div className="flex flex-col md:flex-row">

                        {/* Image column */}
                        <div className="md:w-[260px] flex-shrink-0 flex flex-col">
                            <div className="relative flex items-center justify-center p-8 bg-[var(--surface2)] flex-1 min-h-[220px]">
                                <div className="absolute inset-0 opacity-10 blur-3xl"
                                    style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                    className="relative z-10 max-h-40 w-full object-contain"
                                    style={{ filter: 'drop-shadow(0 8px 24px rgba(79,140,255,0.25))' }}
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5 p-3 border-t border-[var(--border)]">
                                <span className="nova-badge nova-badge-otc">{product.category}</span>
                                {product.prescriptionRequired && <span className="nova-badge nova-badge-rx">Rx Required</span>}
                                {!product.inStock && <span className="nova-badge nova-badge-low">Out of Stock</span>}
                                {product.needManualReview && (
                                    <span className="nova-badge" style={{ background: 'rgba(255,179,71,0.15)', color: 'var(--warn)', border: '1px solid rgba(255,179,71,0.3)' }}>
                                        Manual Review
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Details column */}
                        <div className="flex-1 p-6 flex flex-col gap-5 border-l border-[var(--border)]">

                            {/* Name + actions */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight leading-tight">{product.name}</h1>
                                    {product.genericName && (
                                        <p className="text-sm text-[var(--text3)] mt-1">
                                            Generic: <span className="font-medium text-[var(--text2)]">{product.genericName}</span>
                                        </p>
                                    )}
                                    {product.brandName && (
                                        <p className="text-sm text-[var(--text3)] mt-0.5">
                                            Brand: <span className="font-medium text-[var(--accent)]">{product.brandName}</span>
                                        </p>
                                    )}
                                    <p className="text-sm text-[var(--text3)] mt-1">
                                        🏪 <span className="font-semibold text-[var(--accent2)]">{product.pharmacy}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button className="p-2 text-[var(--text3)] hover:text-red-400 rounded-xl hover:bg-[var(--surface2)] transition border border-[var(--border)]">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-[var(--text3)] hover:text-[var(--accent)] rounded-xl hover:bg-[var(--surface2)] transition border border-[var(--border)]">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Meta pills — only if any exist */}
                            {hasMetaPills && (
                                <div className="flex flex-wrap gap-2">
                                    <MetaPill label="Form" value={product.dosageForm} />
                                    <MetaPill label="Schedule" value={product.schedule} />
                                    <MetaPill label="Dose" value={product.doseValue ? `${product.doseValue} ${product.doseUnit}`.trim() : ''} />
                                    <MetaPill label="Pregnancy" value={product.pregnancyCategory} />
                                    <MetaPill label="Reg. Code" value={product.regulatoryCode} />
                                </div>
                            )}

                            {/* Price + CTA */}
                            <div className="border-t border-[var(--border)] pt-4 mt-auto">
                                <div className="flex items-end gap-4 mb-4">
                                    <span className="text-3xl font-bold" style={{
                                        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                    }}>
                                        {product.price > 0 ? `$${product.price.toFixed(2)}` : 'Price unavailable'}
                                    </span>
                                    <span className="text-sm mb-1 font-medium" style={{ color: stockColor }}>● {stockLabel}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center border border-[var(--border2)] bg-[var(--surface2)] rounded-xl overflow-hidden">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2.5 text-[var(--text2)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition text-lg border-r border-[var(--border2)]">−</button>
                                        <span className="px-5 py-2.5 font-bold text-[var(--text)] min-w-[3rem] text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)}
                                            className="px-4 py-2.5 text-[var(--text2)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition text-lg border-l border-[var(--border2)]">+</button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!product.inStock}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {product.prescriptionRequired ? 'Upload Prescription' : 'Add to Cart'}
                                    </button>
                                </div>
                                {cartError ? (
                                    <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                                        {cartError}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Clinical info sections ── */}
                {hasClinical && (
                    <div className="flex flex-col gap-3 mb-5">
                        {(product.indications || product.description) && (
                            <ClinicalSection icon={ClipboardList} title="Indications" iconColor="79,140,255">
                                <p className="text-sm text-[var(--text2)] leading-relaxed">{product.indications || product.description}</p>
                            </ClinicalSection>
                        )}
                        {product.dosageInstructions && (
                            <ClinicalSection icon={Pill} title="Dosage Instructions" iconColor="0,229,192">
                                <p className="text-sm text-[var(--text2)] leading-relaxed">{product.dosageInstructions}</p>
                            </ClinicalSection>
                        )}
                        {product.contraindications && (
                            <ClinicalSection icon={AlertTriangle} title="Contraindications" iconColor="255,179,71">
                                <p className="text-sm text-[var(--text2)] leading-relaxed">{product.contraindications}</p>
                            </ClinicalSection>
                        )}
                        {product.sideEffects && (
                            <ClinicalSection icon={Activity} title="Side Effects" iconColor="255,79,106">
                                <p className="text-sm text-[var(--text2)] leading-relaxed">{product.sideEffects}</p>
                            </ClinicalSection>
                        )}
                    </div>
                )}

                {/* ── Delivery & Guarantee ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="w-9 h-9 rounded-xl bg-[rgba(79,140,255,0.12)] flex items-center justify-center flex-shrink-0">
                            <Truck className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text3)]">Delivery</p>
                            <p className="text-sm font-semibold text-[var(--text)]">Estimated 2–4 hours</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="w-9 h-9 rounded-xl bg-[rgba(0,229,192,0.12)] flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-5 h-5 text-[var(--accent2)]" />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text3)]">Guarantee</p>
                            <p className="text-sm font-semibold text-[var(--text)]">100% Genuine Medicine</p>
                        </div>
                    </div>
                </div>

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-[var(--text3)] hover:text-[var(--accent)] transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Medicines
                </button>

            </div>
        </div>
    );
};

export default ProductDetailsPage;
