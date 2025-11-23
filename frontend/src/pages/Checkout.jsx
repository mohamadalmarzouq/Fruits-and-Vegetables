import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCheckout();
  }, [id]);

  const fetchCheckout = async () => {
    try {
      const response = await api.get(`/buyer/shopping-lists/${id}/checkout`);
      setCheckout(response.data);
    } catch (error) {
      console.error('Error fetching checkout:', error);
      setError(error.response?.data?.error || 'Failed to load checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCheckout = async () => {
    if (!window.confirm('Complete this order? This action cannot be undone.')) {
      return;
    }

    setCompleting(true);
    setError('');

    try {
      const response = await api.post(`/buyer/shopping-lists/${id}/checkout`);
      // Redirect to receipt page after successful checkout
      navigate(`/buyer/orders/${id}/receipt`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to complete checkout');
      setCompleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading checkout...</div>;
  }

  if (error && !checkout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to={`/buyer/shopping-lists/${id}`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Shopping List
          </Link>
        </div>
      </div>
    );
  }

  if (!checkout) {
    return <div className="flex items-center justify-center min-h-screen">Checkout not found</div>;
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
      <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout Summary</h1>
          <p className="text-gray-600 mb-6">Review your order before completing</p>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow">
              {error}
            </div>
          )}

          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-green-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {checkout.shoppingList.items.map((item, index) => (
                <div key={index} className="px-6 py-5 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.vendorProduct.imageUrl.startsWith('http') ? item.vendorProduct.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.vendorProduct.imageUrl}`}
                        alt={item.product.name}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{item.product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">📦</span> {item.quantity} {item.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">📍</span> {item.vendorProduct.origin}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {parseFloat(item.unitPrice).toFixed(2)} KWD per {item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">{parseFloat(item.totalPrice).toFixed(2)} KWD</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 bg-green-50 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="font-semibold text-gray-900">{parseFloat(checkout.subtotal).toFixed(2)} KWD</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300">
                  <span className="text-gray-900">Total Paid:</span>
                  <span className="text-green-600 text-2xl">{parseFloat(checkout.subtotal).toFixed(2)} KWD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Link
              to={`/buyer/shopping-lists/${id}`}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              ← Back
            </Link>
            <button
              onClick={handleCompleteCheckout}
              disabled={completing}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition shadow-lg hover:shadow-xl"
            >
              {completing ? 'Processing...' : '✓ Complete Order'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p>ℹ️ Note: This is a summary only. No payment processing is included in this MVP.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

