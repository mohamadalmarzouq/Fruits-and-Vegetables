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

