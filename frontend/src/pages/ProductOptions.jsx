import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const ProductOptions = () => {
  const { id, itemId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [item, setItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchOptions();
  }, [itemId]);

  const fetchOptions = async () => {
    try {
      const response = await api.get(`/buyer/shopping-list-items/${itemId}/matching`);
      setItem(response.data.item);
      setOptions(response.data.options);
      
      // Check if user already selected an option
      const shoppingListResponse = await api.get(`/buyer/shopping-lists/${id}`);
      const selectedItem = shoppingListResponse.data.shoppingList.items.find(i => i.id === itemId);
      if (selectedItem?.selections?.[0]) {
        setSelectedOption(selectedItem.selections[0].vendorProductId);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Failed to load product options');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (vendorProductId) => {
    setSaving(true);
    setError('');

    try {
      await api.post(`/buyer/shopping-list-items/${itemId}/select`, {
        vendorProductId
      });
      setSelectedOption(vendorProductId);
      setSaving(false);
      // Show success message
      setTimeout(() => {
        navigate(`/buyer/shopping-lists/${id}`);
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save selection');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading options...</div>;
  }

  if (!item) {
    return <div className="flex items-center justify-center min-h-screen">Item not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-white">
                FreshSavor
              </Link>
              <Link
                to={`/buyer/shopping-lists/${id}`}
                className="text-green-100 hover:text-white text-sm"
              >
                ← Back to Shopping List
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="text-sm text-white hover:text-green-100 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Options</h1>
            <p className="text-lg text-gray-600">
              {item.product.name} • {item.quantity} {item.unit}
              {item.originPreference && ` • Your Preference: ${item.originPreference}`}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Showing all available origins - select the best option for you
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow">
              {error}
            </div>
          )}

          {options.length === 0 ? (
            <div className="bg-white shadow-lg rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-700 mb-2 font-semibold">
                No options available
              </p>
              <p className="text-gray-500">
                {item.originPreference && 'Try removing the origin preference.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className={`bg-white shadow-lg rounded-xl p-6 border-2 transition hover:shadow-xl ${
                    option.isBestPrice
                      ? 'border-green-500 bg-green-50'
                      : selectedOption === option.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="relative group">
                        <img
                          src={option.imageUrl.startsWith('http') ? option.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${option.imageUrl}`}
                          alt={option.product.name}
                          className="h-32 w-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition border-2 border-gray-200 hover:border-green-500"
                          onClick={() => setSelectedImage(option.imageUrl.startsWith('http') ? option.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${option.imageUrl}`)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold bg-green-600 px-2 py-1 rounded">
                            Click to enlarge
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{option.product.name}</h3>
                          <div className="flex flex-col items-end space-y-1">
                            {option.isBestPrice && (
                              <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                ⭐ Best Price
                              </span>
                            )}
                            {selectedOption === option.id && (
                              <span className="bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                                ✓ Selected
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">📍</span> {option.origin}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">📦</span> Available: {option.availableQuantity} {option.availableUnit}
                          </p>
                          {option.vendorCount > 1 && (
                            <p className="text-xs text-gray-500">
                              {option.vendorCount} vendors offering this price
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Total Price</p>
                          <p className="text-2xl font-bold text-green-600">
                            {parseFloat(option.totalPrice).toFixed(2)} KWD
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelect(option.id)}
                          disabled={saving || selectedOption === option.id}
                          className={`px-6 py-3 rounded-lg text-sm font-semibold transition ${
                            selectedOption === option.id
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                          } disabled:opacity-50`}
                        >
                          {saving ? 'Saving...' : selectedOption === option.id ? '✓ Selected' : 'Select'}
                        </button>
                      </div>
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

export default ProductOptions;

