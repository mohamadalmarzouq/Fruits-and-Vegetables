import { useState, useEffect } from 'react';
import api from '../utils/api';

const VendorInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/vendor/inventory');
      setInventory(response.data.inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStock = (product) => {
    setEditingProduct(product);
    setStockForm({ quantity: product.currentStock.toString() });
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/vendor/inventory/products/${editingProduct.id}/stock`, {
        quantity: parseFloat(stockForm.quantity)
      });
      setSuccess('Stock updated successfully!');
      setEditingProduct(null);
      setStockForm({ quantity: '' });
      fetchInventory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update stock');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow">
          {success}
        </div>
      )}

      {inventory.length === 0 ? (
        <div className="bg-white shadow-lg rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl text-gray-700 mb-2 font-semibold">
            No products in inventory
          </p>
          <p className="text-gray-500">
            Add products to start tracking inventory
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Initial Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ending Inventory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {item.product.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.origin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.initialStock.toFixed(2)} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        item.currentStock < item.endingInventory ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.currentStock.toFixed(2)} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {item.soldQuantity.toFixed(2)} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                      {item.pendingQuantity.toFixed(2)} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        item.endingInventory < 0 ? 'text-red-600' : 
                        item.endingInventory < 100 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.endingInventory.toFixed(2)} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditStock(item)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Edit Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Update Stock: {editingProduct.product.name}
            </h3>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock ({editingProduct.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Initial Stock: {editingProduct.initialStock.toFixed(2)} {editingProduct.unit}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition"
                >
                  Update Stock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setStockForm({ quantity: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorInventory;

