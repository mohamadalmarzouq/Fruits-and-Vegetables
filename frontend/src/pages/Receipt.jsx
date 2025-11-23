import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Receipt = () => {
  const { id } = useParams();
  const { logout } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      // Get the completed shopping list
      const response = await api.get(`/buyer/shopping-lists/${id}`);
      const shoppingList = response.data.shoppingList;

      if (shoppingList.status !== 'completed') {
        setError('This order is not completed yet');
        return;
      }

      // Get the order details
      const ordersResponse = await api.get(`/buyer/orders`);
      const relatedOrder = ordersResponse.data.orders.find(
        o => o.shoppingListId === id
      );

      if (relatedOrder) {
        setOrder(relatedOrder);
      } else {
        // If order not found via API, construct from shopping list
        // Calculate totals from selections
        let subtotal = 0;
        const orderItems = [];

        for (const item of shoppingList.items) {
          if (item.selections.length > 0) {
            const selection = item.selections[0];
            const vendorProduct = selection.vendorProduct;
            
            // Calculate price
            const itemGrams = item.unit === 'kg' ? parseFloat(item.quantity) * 1000 : parseFloat(item.quantity);
            const vpUnitGrams = vendorProduct.unit === 'kg' ? 1000 : 1;
            const pricePerGram = parseFloat(vendorProduct.price) / vpUnitGrams;
            const totalPrice = pricePerGram * itemGrams;
            const buyerUnitGrams = item.unit === 'kg' ? 1000 : 1;
            const unitPrice = pricePerGram * buyerUnitGrams;

            subtotal += totalPrice;

            orderItems.push({
              product: item.product,
              vendorProduct: {
                origin: vendorProduct.origin,
                imageUrl: vendorProduct.imageUrl
              },
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: unitPrice,
              totalPrice: totalPrice
            });
          }
        }

        // Commission is calculated and stored in database for admin, but NOT shown to buyers
        // Buyers only see the subtotal as their total
        const grandTotal = subtotal; // No commission shown to buyers

        setOrder({
          id: id,
          items: orderItems,
          subtotal: subtotal,
          grandTotal: grandTotal,
          createdAt: shoppingList.updatedAt
        });
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setError('Failed to load receipt');
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
          <p className="text-red-600 mb-4">{error || 'Receipt not found'}</p>
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
              <Link to="/buyer/dashboard" className="text-indigo-600 hover:text-indigo-800">
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
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Order Receipt</h2>
            <p className="text-sm text-gray-500 mt-2">
              Order Date: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Completed
              </span>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{parseFloat(order.subtotal).toFixed(3)} KWD</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total Paid:</span>
                  <span className="text-indigo-600">{parseFloat(order.grandTotal).toFixed(3)} KWD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Thank you for your order!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;

