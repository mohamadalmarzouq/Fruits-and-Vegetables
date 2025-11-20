import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const ShoppingList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [shoppingList, setShoppingList] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unit: 'kg',
    originPreference: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchShoppingList();
    fetchCatalog();
  }, [id]);

  const fetchShoppingList = async () => {
    try {
      const response = await api.get(`/buyer/shopping-lists/${id}`);
      setShoppingList(response.data.shoppingList);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const response = await api.get('/products');
      setCatalog(response.data.products);
    } catch (error) {
      console.error('Error fetching catalog:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.productId || !formData.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await api.post(`/buyer/shopping-lists/${id}/items`, formData);
      setSuccess('Item added to shopping list!');
      setFormData({
        productId: '',
        quantity: '',
        unit: 'kg',
        originPreference: ''
      });
      setShowAddForm(false);
      fetchShoppingList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add item');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Remove this item from the list?')) {
      return;
    }

    try {
      await api.delete(`/buyer/shopping-lists/${id}/items/${itemId}`);
      fetchShoppingList();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const handleViewOptions = (itemId) => {
    navigate(`/buyer/shopping-lists/${id}/items/${itemId}/options`);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!shoppingList) {
    return <div className="flex items-center justify-center min-h-screen">Shopping list not found</div>;
  }

  const allItemsHaveSelections = shoppingList.items.every(item => item.selections.length > 0);

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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shopping List</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {showAddForm ? 'Cancel' : '+ Add Item'}
              </button>
              {allItemsHaveSelections && shoppingList.items.length > 0 && (
                <Link
                  to={`/buyer/shopping-lists/${id}/checkout`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Proceed to Checkout
                </Link>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {showAddForm && (
            <div className="mb-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Add Item to List</h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select a product</option>
                    {catalog.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="kg">KG</option>
                      <option value="gram">Gram</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Origin Preference (Optional)</label>
                  <input
                    type="text"
                    value={formData.originPreference}
                    onChange={(e) => setFormData({ ...formData, originPreference: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Spain, Turkey"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Add to List
                </button>
              </form>
            </div>
          )}

          {shoppingList.items.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500 mb-4">Your shopping list is empty.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {shoppingList.items.map((item) => (
                  <li key={item.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit}
                          {item.originPreference && ` • Origin: ${item.originPreference}`}
                        </p>
                        {item.selections.length > 0 ? (
                          <p className="text-sm text-green-600 mt-1">✓ Option selected</p>
                        ) : (
                          <p className="text-sm text-yellow-600 mt-1">⚠ No option selected</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {item.selections.length === 0 ? (
                          <button
                            onClick={() => handleViewOptions(item.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                          >
                            View Options
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewOptions(item.id)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                          >
                            Change Option
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;

