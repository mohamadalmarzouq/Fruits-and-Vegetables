import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const OrderReceipt = () => {
  const { id } = useParams();
  const { logout } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      // Get the shopping list with all details
      const response = await api.get(`/buyer/shopping-lists/${id}`);
      const shoppingList = response.data.shoppingList;
      
      if (shoppingList.status !== 'completed') {
        setError('This order has not been completed yet.');
        setLoading(false);
        return;
      }

      // Calculate totals for receipt
      let subtotal = 0;
      const items = shoppingList.items.map(item => {
        const selection = item.selections[0];
        const vendorProduct = selection.vendorProduct;
        
        // Calculate price
        const itemGrams = item.unit === 'kg' ? parseFloat(item.quantity) * 1000 : parseFloat(item.quantity);
        const vpUnitGrams = vendorProduct.unit === 'kg' ? 1000 : 1;
        const pricePerGram = parseFloat(vendorProduct.price) / vpUnitGrams;
        const totalPrice = pricePerGram * itemGrams;
        
        // Unit price for buyer's unit
        const buyerUnitGrams = item.unit === 'kg' ? 1000 : 1;
        const unitPrice = pricePerGram * buyerUnitGrams;
        
        subtotal += totalPrice;
        
        return {
          product: item.product,
          vendorProduct,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice,
          totalPrice
        };
      });

      // Commission is 5% (hidden from user)
      const commission = subtotal * 0.05;
      const grandTotal = subtotal + commission;

      setOrder({
        id: shoppingList.id,
        createdAt: shoppingList.createdAt,
        completedAt: shoppingList.updatedAt,
        items,
        subtotal,
        grandTotal
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order receipt');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading receipt...</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link
            to="/buyer/dashboard"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/buyer/dashboard"
                className="text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Dashboard
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
          {/* Receipt Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Order Receipt</h2>
            <p className="text-sm text-gray-500 mt-2">Order #{order.id.slice(0, 8)}</p>
            <p className="text-sm text-gray-500">
              Completed: {new Date(order.completedAt).toLocaleString()}
            </p>
            <div className="mt-4 inline-block">
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full">
                ✓ Order Completed
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
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
                      <p className="font-medium">{parseFloat(item.totalPrice).toFixed(3)} KWD</p>
                      <p className="text-sm text-gray-500">
                        {parseFloat(item.unitPrice).toFixed(3)} KWD per {item.unit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{parseFloat(order.subtotal).toFixed(3)} KWD</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-300">
                  <span>Total Paid:</span>
                  <span className="text-green-600">{parseFloat(order.grandTotal).toFixed(3)} KWD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Thank you for your order!
            </p>
            <p className="text-xs text-gray-400 mt-2">
              This is a digital receipt. No payment processing was included in this MVP.
            </p>
          </div>

          {/* Print Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;

