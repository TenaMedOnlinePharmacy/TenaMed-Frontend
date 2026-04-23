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

    return {
        id: medicine?.id || medicine?.medicineId || medicine?.medicineName || 'medicine',
        medicineId: medicine?.medicineId || medicine?.id || null,
        pharmacyId: medicine?.pharmacyId || null,
        name: medicine?.medicineName || medicine?.name || 'Unnamed medicine',
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

    useEffect(() => {
        let isMounted = true;
        const routedProduct = location?.state?.product;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));

        if (routedProduct) {
            setProduct(routedProduct);
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

                    setProduct(mappedProduct);
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <p className="text-gray-500">Loading medicine details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">The medicine you are looking for does not exist or has been removed.</p>
                    <Link to="/products" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Medicines
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:text-emerald-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/products" className="hover:text-emerald-600">Medicines</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Image Section */}
                        <div className="md:w-1/2 p-4 md:p-8 bg-gray-50 flex items-center justify-center">
                            <div className="relative w-full max-w-sm aspect-square bg-white rounded-xl shadow-sm p-4 overflow-hidden border border-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={(event) => {
                                        event.currentTarget.src = FALLBACK_MEDICINE_IMAGE;
                                    }}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="md:w-1/2 p-6 md:p-10 flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{product.category}</span>
                                        {product.prescriptionRequired && (
                                            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                Prescription Required
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{product.name}</h1>
                                    <p className="text-sm text-gray-500">
                                        Sold by <span className="font-semibold text-emerald-600">{product.pharmacy}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition">
                                        <Heart className="w-6 h-6" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-full hover:bg-gray-100 transition">
                                        <Share2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-b border-gray-100 py-6">
                                <div className="flex items-end gap-4 mb-6">
                                    <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                    <span className="text-green-600 font-medium mb-1">In Stock</span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg w-max">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition border-r border-gray-300"
                                        >
                                            -
                                        </button>
                                        <span className="px-6 py-3 font-semibold text-gray-900 w-16 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition border-l border-gray-300"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!product.inStock}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {product.prescriptionRequired ? 'Upload Prescription' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>

                            {/* Description & Features */}
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Product Description</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {product.description}
                                </p>

                                {product.indications && (
                                    <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                                        <span className="font-semibold">Indications: </span>
                                        {product.indications}
                                    </div>
                                )}

                                {(product.contraindications || product.sideEffects) && (
                                    <div className="mb-6 space-y-3 text-sm">
                                        {product.contraindications && (
                                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                                                <span className="font-semibold">Contraindications: </span>
                                                {product.contraindications}
                                            </div>
                                        )}
                                        {product.sideEffects && (
                                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800">
                                                <span className="font-semibold">Side Effects: </span>
                                                {product.sideEffects}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Truck className="w-6 h-6 text-emerald-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">Delivery</p>
                                            <p className="text-sm font-semibold text-gray-900">Estimated 2-4 hours</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <ShieldCheck className="w-6 h-6 text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">Guarantee</p>
                                            <p className="text-sm font-semibold text-gray-900">100% Genuine</p>
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
