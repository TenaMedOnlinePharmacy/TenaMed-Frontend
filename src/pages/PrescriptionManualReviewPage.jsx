import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { ocrGetPipelineStatus } from '../api/axios';
import { resolveApiImageUrl } from '../utils/imageUrl';

const PrescriptionManualReviewPage = () => {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [pipelineStatus, setPipelineStatus] = useState(null);

    useEffect(() => {
        const fetchPrescriptionData = async () => {
            if (!prescriptionId) {
                setErrorMsg('Prescription ID is missing.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setErrorMsg('');
            try {
                const response = await ocrGetPipelineStatus(prescriptionId);
                const data = response?.data || null;

                // Store pipeline status for reference
                setPipelineStatus(data);

                const fetchedMatches =
                    data?.inventoryMatches ||
                    data?.inventory_matches ||
                    data?.matches ||
                    [];
                setMatches(Array.isArray(fetchedMatches) ? fetchedMatches : []);
            } catch (error) {
                console.error('Error fetching prescription data:', error);
                setErrorMsg(
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    'Failed to load prescription details. Please try again.'
                );
                setMatches([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrescriptionData();
    }, [prescriptionId]);

    const statusLabel = useMemo(() => pipelineStatus?.status || '', [pipelineStatus]);
    const statusMessage = useMemo(() => pipelineStatus?.message || '', [pipelineStatus]);
    const prescriptionStatus = useMemo(() => pipelineStatus?.prescriptionStatus || '', [pipelineStatus]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading prescription details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Products
                    </button>
                </div>

                {/* Error Message */}
                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800">Error</h3>
                            <p className="text-red-700">{errorMsg}</p>
                        </div>
                    </div>
                )}

                {statusMessage && !errorMsg && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm font-medium">{statusMessage}</p>
                    </div>
                )}

                {/* Prescription Info */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Prescription Details</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Prescription ID</p>
                            <p className="text-lg font-mono text-gray-900 break-all">{prescriptionId}</p>
                        </div>
                        {statusLabel && (
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-lg font-semibold text-green-600">{statusLabel}</p>
                            </div>
                        )}
                        {prescriptionStatus && (
                            <div>
                                <p className="text-sm text-gray-600">Prescription Status</p>
                                <p className="text-lg font-semibold text-gray-900">{prescriptionStatus}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Associated Products</h2>

                    {matches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {matches.map((match, index) => (
                                <div
                                    key={match?.productId || index}
                                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                                >
                                    {/* Product Image */}
                                    {match?.imageUrl && (
                                        <div className="h-48 bg-gray-100 overflow-hidden">
                                            <img
                                                src={resolveApiImageUrl(match.imageUrl, match.imageUrl)}
                                                alt={match?.medicineName || match?.brandName || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                                            {match?.medicineName || match?.brandName || 'Unknown Product'}
                                        </h3>

                                        {match?.medicineCategory && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {match.medicineCategory}
                                            </p>
                                        )}

                                        <div className="space-y-2 mb-4">
                                            {match?.pharmacyLegalName && (
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Pharmacy:</span> {match.pharmacyLegalName}
                                                </p>
                                            )}
                                            {match?.price !== null && match?.price !== undefined && (
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Price:</span> ${match.price}
                                                </p>
                                            )}
                                            {match?.prescriptionRequired !== undefined && (
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Prescription:</span> {match.prescriptionRequired ? 'Required' : 'Not required'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Add to Cart Button */}
                                        {match?.productId ? (
                                            <button
                                                onClick={() => navigate(`/products/${match.productId}`)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
                                            >
                                                View Details
                                            </button>
                                        ) : (
                                            <div className="text-xs text-gray-500">No product link available.</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                {statusLabel === 'PROCESSING' ? 'Processing prescription. Check back soon.' : 'No products found for this prescription.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrescriptionManualReviewPage;
