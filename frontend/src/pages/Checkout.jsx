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
      alert('Order completed successfully!');
      navigate('/buyer/dashboard');
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

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout Summary</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {checkout.shoppingList.items.map((item, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.vendorProduct.imageUrl.startsWith('http') ? item.vendorProduct.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.vendorProduct.imageUrl}`}
                        alt={item.product.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit} • {item.vendorProduct.origin}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{parseFloat(item.totalPrice).toFixed(2)} KWD</p>
                      <p className="text-sm text-gray-500">
                        {parseFloat(item.unitPrice).toFixed(2)} KWD per {item.unit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{parseFloat(checkout.subtotal).toFixed(2)} KWD</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">{parseFloat(checkout.grandTotal).toFixed(2)} KWD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Link
              to={`/buyer/shopping-lists/${id}`}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </Link>
            <button
              onClick={handleCompleteCheckout}
              disabled={completing}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {completing ? 'Processing...' : 'Complete Order'}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Note: This is a summary only. No payment processing is included in this MVP.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

