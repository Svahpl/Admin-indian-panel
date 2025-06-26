import React, { useState, useEffect } from 'react';
import { Truck, Save, RefreshCw, IndianRupee, X, CheckCircle, AlertCircle } from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
            <div className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg max-w-md w-full
                transform transition-all duration-300 ease-in-out
                ${type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-green-50 border border-green-200 text-green-800'
                }
            `}>
                <div className="flex-shrink-0">
                    {type === 'error' ? (
                        <AlertCircle className="text-red-500" size={20} />
                    ) : (
                        <CheckCircle className="text-green-500" size={20} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className={`
                        flex-shrink-0 p-1 rounded-full transition-colors
                        ${type === 'error'
                            ? 'hover:bg-red-100 text-red-400 hover:text-red-600'
                            : 'hover:bg-green-100 text-green-400 hover:text-green-600'
                        }
                    `}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

function DeliveryChargeManager() {
    const [charge, setCharge] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState(null);

    // Fetch charge on component mount
    useEffect(() => {
        fetchCharge();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    const fetchCharge = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/indcharge/getingcharge`, {
                headers: {
                    'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? window.localStorage?.getItem('token') || '' : '')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch charge');
            }

            const data = await response.json();
            console.log('Fetched data:', data);

            // Handle the API response structure - data.charge is an array
            if (data && data.charge && Array.isArray(data.charge) && data.charge.length > 0) {
                setCharge(data.charge[0].charge.toString());
            } else if (data && Array.isArray(data) && data.length > 0 && data[0].charge !== undefined) {
                setCharge(data[0].charge.toString());
            } else {
                setCharge('');
            }

        } catch (error) {
            console.error('Error fetching charge:', error);
            showToast('Failed to load delivery charge', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (value) => {
        // Only allow positive numbers
        if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
            setCharge(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!charge) {
            showToast('Please enter delivery charge', 'error');
            return;
        }

        if (isNaN(charge)) {
            showToast('Please enter a valid number for charge', 'error');
            return;
        }

        if (parseFloat(charge) < 0) {
            showToast('Charge cannot be negative', 'error');
            return;
        }

        try {
            setUpdating(true);

            const requestData = {
                charge: parseFloat(charge)
            };

            console.log('Sending data:', requestData);

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/indcharge/addindcharge`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? window.localStorage?.getItem('token') || '' : '')
                },
                body: JSON.stringify(requestData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Response error:', errorData);
                throw new Error(`Failed to update charge: ${response.status}`);
            }

            const result = await response.json();
            console.log('Update result:', result);

            showToast('Delivery charge updated successfully!');

        } catch (error) {
            console.error('Error updating charge:', error);
            showToast('Failed to update delivery charge. Please try again.', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handleRefresh = () => {
        fetchCharge();
    };

    if (loading) {
        return (
            <div id='stock' className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center space-y-4 text-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <Truck className="absolute inset-0 m-auto text-blue-600" size={20} />
                    </div>
                    <span className="text-gray-700 text-lg font-medium">Loading delivery charge...</span>
                </div>
            </div>
        );
    }

    return (
        <div id='stock' className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 sm:p-6 lg:p-8">
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <Truck className="text-white" size={24} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                    Delivery Charge
                                </h1>
                                <p className="text-gray-600">Manage your delivery pricing</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 self-start sm:self-auto"
                            title="Refresh charge"
                        >
                            <RefreshCw className={`${loading ? 'animate-spin' : ''} transition-transform`} size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                    <div className="space-y-8">
                        {/* Charge Input */}
                        <div>
                            <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <IndianRupee className="text-green-600" size={18} />
                                </div>
                                <span>Delivery Charge Amount</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <IndianRupee className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={charge}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="Enter delivery charge amount"
                                    required
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">Enter the delivery charge in rupees</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={updating}
                            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        >
                            {updating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Update Delivery Charge</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Current Charge Display */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Current Delivery Charge</span>
                        </h3>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                                        <Truck className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-600 uppercase tracking-wide">
                                            Delivery Charge
                                        </p>
                                        <p className="text-3xl font-bold text-green-800 mt-1">
                                            ₹{charge || '0.00'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                    <p className="text-sm font-semibold text-green-600 mt-1">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                            <AlertCircle className="text-blue-600" size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">Information</p>
                            <p className="text-sm text-blue-700 mt-1">
                                This charge will be applied to all delivery orders. Make sure to set a reasonable amount that covers your delivery costs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeliveryChargeManager;