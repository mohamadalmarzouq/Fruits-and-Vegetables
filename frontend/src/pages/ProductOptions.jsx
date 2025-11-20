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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to={`/buyer/shopping-lists/${id}`}
                className="text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Shopping List
              </Link>
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Options</h2>
            <p className="text-gray-600 mt-1">
              {item.product.name} • {item.quantity} {item.unit}
              {item.originPreference && ` • Preferred: ${item.originPreference}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {options.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">
                No vendor options available for this product.
                {item.originPreference && ' Try removing the origin preference.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className={`bg-white shadow rounded-lg p-6 border-2 ${
                    option.isBestPrice
                      ? 'border-green-500'
                      : selectedOption === option.id
                      ? 'border-indigo-500'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={option.imageUrl.startsWith('http') ? option.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${option.imageUrl}`}
                        alt={option.product.name}
                        className="h-24 w-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium">{option.product.name}</h3>
                          {option.isBestPrice && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                              Best Price
                            </span>
                          )}
                          {selectedOption === option.id && (
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Origin: {option.origin}
                        </p>
                        <p className="text-sm text-gray-600">
                          Available: {option.availableQuantity} {option.availableUnit}
                        </p>
                        <p className="text-lg font-bold text-indigo-600 mt-2">
                          {parseFloat(option.totalPrice).toFixed(2)} KWD
                        </p>
                        {option.vendorCount > 1 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {option.vendorCount} vendors offering this price
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleSelect(option.id)}
                        disabled={saving || selectedOption === option.id}
                        className={`px-6 py-2 rounded-md text-sm font-medium ${
                          selectedOption === option.id
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        } disabled:opacity-50`}
                      >
                        {saving ? 'Saving...' : selectedOption === option.id ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductOptions;

