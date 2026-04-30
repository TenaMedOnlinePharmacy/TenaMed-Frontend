import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck, Heart, Share2 } from 'lucide-react';
import { medicineGetById } from '../api/axios';

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

const mapMedicineToProduct = (medicine) => {
    const price = Number(medicine?.price ?? medicine?.doseValue ?? 0);
    const brandName = medicine?.brandName || medicine?.brand || '';
    const medicineName = medicine?.medicineName || medicine?.name || 'Unnamed medicine';
    const hasDistinctBrand = Boolean(brandName) && brandName !== medicineName;
    const displayName = hasDistinctBrand ? brandName : medicineName;
    const productId = medicine?.productId || medicine?.medicineId || medicine?.id || null;

    return {
        id: productId || displayName || 'medicine',
        productId,
        medicineId: medicine?.medicineId || medicine?.productId || medicine?.id || null,
        pharmacyId: medicine?.pharmacyId || null,
        name: displayName,
        brandName: hasDistinctBrand ? brandName : '',
        genericName: hasDistinctBrand ? medicineName : '',
        category: medicine?.medicineCategory || medicine?.category || 'General',
        pharmacy: medicine?.pharmacyLegalName || 'TenaMED Partner Pharmacy',
        description: medicine?.indications || medicine?.dosageInstructions || 'No description available.',
        indications: medicine?.indications || '',
        contraindications: medicine?.contraindications || '',
        sideEffects: medicine?.sideEffects || '',
        prescriptionRequired: Boolean(medicine?.prescriptionRequired ?? medicine?.requiresPrescription),
        price: Number.isFinite(price) && price > 0 ? price : 0,
        image: resolveApiImageUrl(getMedicineImageValue(medicine), FALLBACK_MEDICINE_IMAGE),
        inStock: true,
    };
};

const ProductDetailsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const prescriptionOverride = location?.state?.prescriptionOverride;
    const matchedPrescriptionId = location?.state?.prescriptionId;

    const applyPrescriptionOverride = (value) => {
        if (!value || prescriptionOverride !== false) {
            return value;
        }

        return {
            ...value,
            prescriptionRequired: false,
            ...(matchedPrescriptionId ? { prescriptionId: matchedPrescriptionId } : {}),
        };
    };

    useEffect(() => {
        let isMounted = true;
        const routedProduct = location?.state?.product;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));

        if (routedProduct) {
            setProduct(applyPrescriptionOverride(routedProduct));
            if (!isUuid) {
                setIsLoading(false);
                return () => {
                    isMounted = false;
                };
            }
        }

        const loadMedicine = async () => {
            setIsLoading(true);

            try {
                const response = await medicineGetById(id);
                if (isMounted) {
                    const payload = response?.data;
                    const rows = Array.isArray(payload) ? payload : payload ? [payload] : [];

                    if (rows.length === 0) {
                        setProduct(null);
                        return;
                    }

                    const mappedProduct = mapMedicineToProduct(rows[0]);
                    setProduct(applyPrescriptionOverride(mappedProduct));
                }
            } catch {
                if (isMounted) {
                    setProduct(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (id) {
            if (isUuid) {
                loadMedicine();
            } else {
                setIsLoading(false);
            }
        }

        return () => {
            isMounted = false;
        };
    }, [id, location.state]);

    const handleAddToCart = () => {
        if (product?.prescriptionRequired) {
            navigate('/upload-prescription', {
                state: {
                    medicine: product,
                    source: 'product-details',
                },
            });
            return;
        }

        addToCart(product, quantity);
        navigate('/cart');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <p className="text-[var(--text3)] font-medium animate-pulse">Loading medicine details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Product Not Found</h2>
                    <p className="text-[var(--text2)] mb-6">The medicine you are looking for does not exist or has been removed.</p>
                    <Link to="/products" className="inline-flex items-center text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Medicines
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-transparent min-h-screen py-8">
            <div className="nova-main max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-[var(--text3)] mb-8">
                    <Link to="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/products" className="hover:text-[var(--accent)] transition-colors">Medicines</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[var(--text)] font-medium truncate">{product.name}</span>
                </nav>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
                    <div className="flex flex-col md:flex-row">
                        {/* Image Section */}
                        <div className="md:w-1/2 p-4 md:p-8 flex items-center justify-center bg-[var(--surface2)] relative">
                            {/* Glow effect behind image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--accent-rgb)] opacity-10 blur-3xl rounded-full"></div>
                            
                            <div className="relative w-full max-w-md aspect-square bg-[var(--bg)] rounded-xl shadow-[var(--glow)] p-6 overflow-hidden border border-[var(--border2)]">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={(event) => {
                                        event.currentTarget.src = FALLBACK_MEDICINE_IMAGE;
                                    }}
                                    className="w-full h-full object-contain relative z-10 filter drop-shadow-md"
                                />
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="md:w-1/2 p-6 md:p-10 flex flex-col z-10 bg-[var(--surface)]">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="nova-badge nova-badge-otc" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>{product.category}</span>
                                        {product.prescriptionRequired && (
                                            <span className="nova-badge nova-badge-rx" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                                                Prescription Required
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text)] mt-4 tracking-tight">{product.name}</h1>
                                    {product.genericName && (
                                        <p className="text-sm text-[var(--text3)] mt-2">
                                            Generic name: <span className="font-medium text-[var(--text2)]">{product.genericName}</span>
                                        </p>
                                    )}
                                    <p className="text-sm text-[var(--text3)] mt-2">
                                        Sold by <span className="font-semibold text-[var(--accent)]">{product.pharmacy}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-[var(--text3)] hover:text-red-500 rounded-full hover:bg-[var(--surface2)] transition">
                                        <Heart className="w-6 h-6" />
                                    </button>
                                    <button className="p-2 text-[var(--text3)] hover:text-[var(--accent)] rounded-full hover:bg-[var(--surface2)] transition">
                                        <Share2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-b border-[var(--border2)] py-6">
                                <div className="flex items-end gap-4 mb-6">
                                    <span className="text-4xl font-bold text-[var(--text)]">${product.price.toFixed(2)}</span>
                                    <span className="text-[var(--accent2)] font-medium mb-1 flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> In Stock</span>
                                </div>

                                <div className="flex flex-col xl:flex-row gap-4">
                                    <div className="flex items-center border border-[var(--border2)] bg-[var(--bg)] rounded-lg w-max">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-3 text-[var(--text2)] hover:text-[var(--accent)] hover:bg-[var(--surface2)] transition border-r border-[var(--border2)]"
                                        >
                                            -
                                        </button>
                                        <span className="px-6 py-3 font-semibold text-[var(--text)] w-16 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-4 py-3 text-[var(--text2)] hover:text-[var(--accent)] hover:bg-[var(--surface2)] transition border-l border-[var(--border2)]"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 btn-primary py-3 rounded-lg flex items-center justify-center gap-2 shadow-[var(--glow)] disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                        disabled={!product.inStock}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {product.prescriptionRequired ? 'Upload Prescription' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>

                            {/* Description & Features */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-[var(--text)] mb-3 tracking-tight">Product Description</h3>
                                <p className="text-[var(--text2)] leading-relaxed mb-6 font-light text-sm">
                                    {product.description}
                                </p>

                                {product.indications && (
                                    <div className="mb-4 rounded-lg border border-[var(--border2)] bg-[var(--surface2)] px-4 py-3 text-sm text-[var(--text2)] font-light">
                                        <span className="font-semibold text-[var(--accent2)]">Indications: </span>
                                        {product.indications}
                                    </div>
                                )}

                                {(product.contraindications || product.sideEffects) && (
                                    <div className="mb-6 space-y-3 text-sm font-light">
                                        {product.contraindications && (
                                            <div className="rounded-lg border border-[var(--border2)] bg-[var(--surface2)] px-4 py-3 text-[var(--text2)]">
                                                <span className="font-semibold text-amber-500">Contraindications: </span>
                                                {product.contraindications}
                                            </div>
                                        )}
                                        {product.sideEffects && (
                                            <div className="rounded-lg border border-[var(--danger-border)] bg-[rgba(var(--danger-rgb),0.05)] px-4 py-3 text-[var(--text)]">
                                                <span className="font-semibold text-[var(--danger)]">Side Effects: </span>
                                                {product.sideEffects}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    <div className="flex items-center gap-3 p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg">
                                        <Truck className="w-5 h-5 text-[var(--accent)]" />
                                        <div>
                                            <p className="text-xs text-[var(--text3)]">Delivery</p>
                                            <p className="text-sm font-medium text-[var(--text)]">Estimated 2-4 hours</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-lg">
                                        <ShieldCheck className="w-5 h-5 text-[var(--accent2)]" />
                                        <div>
                                            <p className="text-xs text-[var(--text3)]">Guarantee</p>
                                            <p className="text-sm font-medium text-[var(--text)]">100% Genuine</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
