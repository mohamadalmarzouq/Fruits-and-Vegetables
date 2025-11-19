import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminOrders = () => {
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              <div className="flex space-x-4">
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-800">
                  Dashboard
                </Link>
                <Link to="/admin/vendors" className="text-gray-600 hover:text-gray-800">
                  Vendors
                </Link>
                <Link to="/admin/catalog" className="text-gray-600 hover:text-gray-800">
                  Catalog
                </Link>
                <Link to="/admin/orders" className="text-indigo-600 hover:text-indigo-800">
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>

          {loading ? (
            <div className="text-center py-12">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No orders yet</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <li key={order.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-500">
                              Buyer: {order.buyer.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              Date: {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm font-medium text-gray-900 mt-2">
                              Total: {parseFloat(order.grandTotal).toFixed(2)} KWD
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">
                              Commission: {parseFloat(order.platformCommission).toFixed(2)} KWD
                            </p>
                          </div>
                          <button
                            onClick={() => viewOrderDetails(order.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedOrder && (
                <div className="lg:col-span-1">
                  <div className="bg-white shadow rounded-lg p-6 sticky top-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Order Details</h3>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Buyer</p>
                        <p className="font-medium">{selectedOrder.buyer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Items</p>
                        <div className="mt-2 space-y-2">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="text-sm border-b pb-2">
                              <p className="font-medium">{item.vendorProduct.product.name}</p>
                              <p className="text-gray-600">
                                {item.quantity} {item.vendorProduct.unit} × {parseFloat(item.unitPrice).toFixed(2)} KWD
                              </p>
                              <p className="text-xs text-gray-500">
                                Vendor: {item.vendorProduct.vendor.email}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Subtotal:</span>
                          <span>{parseFloat(selectedOrder.subtotal).toFixed(2)} KWD</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2 text-indigo-600">
                          <span>Platform Commission (5%):</span>
                          <span>{parseFloat(selectedOrder.platformCommission).toFixed(2)} KWD</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Grand Total:</span>
                          <span>{parseFloat(selectedOrder.grandTotal).toFixed(2)} KWD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

