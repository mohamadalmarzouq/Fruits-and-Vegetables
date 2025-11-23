import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const AdminVendorProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [refreshingProductId, setRefreshingProductId] = useState(null);
  const [refreshError, setRefreshError] = useState('');

  useEffect(() => {
    fetchVendorProducts();
  }, [id]);

  const fetchVendorProducts = async () => {
    try {
      const response = await api.get(`/admin/vendors/${id}`);
      setVendor(response.data.vendor);
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      setError('Failed to load vendor products');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalysis = async (productId) => {
    setRefreshingProductId(productId);
    setRefreshError('');
    try {
      const response = await api.post(`/admin/products/${productId}/analyze`);
      // Update the product in the vendor's products list
      setVendor(prev => ({
        ...prev,
        vendorProducts: prev.vendorProducts.map(p => 
          p.id === productId ? response.data.product : p
        )
      }));
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      setRefreshError(`Failed to refresh analysis: ${error.response?.data?.message || error.message}`);
    } finally {
      setRefreshingProductId(null);
    }
  };

  const renderStars = (score, maxScore) => {
    const stars = [];
    for (let i = 0; i < maxScore; i++) {
      stars.push(
        <span key={i} className={i < score ? 'text-yellow-400' : 'text-gray-300'}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Vendor not found'}</p>
          <Link
            to="/admin/vendors"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              <div className="flex space-x-4">
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-800">
                  Dashboard
                </Link>
                <Link to="/admin/vendors" className="text-indigo-600 hover:text-indigo-800">
                  Vendors
                </Link>
                <Link to="/admin/catalog" className="text-gray-600 hover:text-gray-800">
                  Catalog
                </Link>
                <Link to="/admin/orders" className="text-gray-600 hover:text-gray-800">
                  Orders
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/admin/vendors"
              className="text-indigo-600 hover:text-indigo-800 text-sm mb-2 inline-block"
            >
              ← Back to Vendors
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Vendor Products</h2>
            <p className="text-gray-600 mt-1">
              {vendor.email} • {vendor.vendorProducts.length} {vendor.vendorProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {/* Products Grid */}
          {vendor.vendorProducts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">This vendor hasn't uploaded any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendor.vendorProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border border-gray-100"
                >
                  <div className="mb-4">
                    <div className="relative group cursor-pointer" onClick={() => setSelectedImage(product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.imageUrl}`)}>
                      <img
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.imageUrl}`}
                        alt={product.product.name}
                        className="h-48 w-full object-cover rounded-lg hover:opacity-90 transition border-2 border-gray-200 hover:border-indigo-500"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition flex items-center justify-center pointer-events-none">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold bg-indigo-600 px-2 py-1 rounded pointer-events-none">
                          Click to enlarge
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{product.product.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">📍</span> {product.origin}
                      </p>
                      <p className="text-lg font-bold text-green-600 mb-1">
                        {product.price} KWD per {product.unit}
                      </p>
                      <p className="text-xs text-gray-400">
                        Stock: {product.quantity} {product.unit}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Added: {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* AI Quality Report */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">AI Quality Report</h4>
                      <button
                        onClick={() => refreshAnalysis(product.id)}
                        disabled={refreshingProductId === product.id}
                        className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {refreshingProductId === product.id ? 'Analyzing...' : 'Refresh Analysis'}
                      </button>
                    </div>
                    {refreshError && refreshingProductId === product.id && (
                      <p className="text-xs text-red-600 mb-2">{refreshError}</p>
                    )}
                    {product.aiQualityReport ? (
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium text-gray-700">Freshness: </span>
                          <span className="inline-flex items-center">
                            {renderStars(product.aiQualityReport.freshness?.score || 0, product.aiQualityReport.freshness?.maxScore || 5)}
                          </span>
                          <span className="text-gray-600 ml-1">
                            ({product.aiQualityReport.freshness?.score || 0}/{product.aiQualityReport.freshness?.maxScore || 5})
                          </span>
                          {product.aiQualityReport.freshness?.description && (
                            <p className="text-gray-500 mt-0.5">{product.aiQualityReport.freshness.description}</p>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Ripeness: </span>
                          <span className="text-gray-600">{product.aiQualityReport.ripeness || 'Not assessed'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Visible defects: </span>
                          <span className="text-gray-600">{product.aiQualityReport.visibleDefects || 'No defects noted'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Color: </span>
                          <span className="text-gray-600">{product.aiQualityReport.color || 'Not assessed'}</span>
                        </div>
                        {product.aiQualityReport.overallQuality && (
                          <div className="pt-1 border-t border-gray-100">
                            <span className="font-medium text-gray-700">Overall: </span>
                            <span className="text-gray-600">{product.aiQualityReport.overallQuality}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">
                        Failed to get the report for this image. Click "Refresh Analysis" to try again.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition z-10"
              aria-label="Close image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Product image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorProducts;

