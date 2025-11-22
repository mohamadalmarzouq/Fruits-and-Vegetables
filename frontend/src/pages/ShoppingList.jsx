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
      const list = response.data.shoppingList;
      
      // If order is completed, redirect to receipt page
      if (list.status === 'completed') {
        navigate(`/buyer/orders/${id}/receipt`);
        return;
      }
      
      setShoppingList(list);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-white">
                FreshSavor
              </Link>
              <Link to="/buyer/dashboard" className="text-green-100 hover:text-white text-sm">
                ← Dashboard
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
              >
                {showAddForm ? '✕ Cancel' : '+ Add Item'}
              </button>
              {allItemsHaveSelections && shoppingList.items.length > 0 && (
                <Link
                  to={`/buyer/shopping-lists/${id}/checkout`}
                  className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </Link>
              )}
            </div>
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

          {showAddForm && (
            <div className="mb-6 bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-900">➕ Add Item to List</h3>
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
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
                >
                  ✓ Add to List
                </button>
              </form>
            </div>
          )}

          {shoppingList.items.length === 0 ? (
            <div className="bg-white shadow-lg rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-xl text-gray-700 mb-2 font-semibold">
                Your shopping list is empty
              </p>
              <p className="text-gray-500 mb-6">
                Add items to start comparing prices
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shoppingList.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">📦</span> {item.quantity} {item.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">📍</span>{' '}
                        {item.selections.length > 0 && item.selections[0].vendorProduct 
                          ? item.selections[0].vendorProduct.origin
                          : (item.originPreference || 'No preference')
                        }
                      </p>
                    </div>
                  </div>

                  {item.selections.length > 0 ? (
                    <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                      <p className="text-sm text-green-800 font-semibold mb-1">
                        ✓ Option Selected
                      </p>
                      <p className="text-xs text-green-700">
                        {item.selections[0].vendorProduct.price} KWD per {item.selections[0].vendorProduct.unit}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
                      <p className="text-sm text-yellow-800 font-semibold">
                        ⚠ No option selected
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    {item.selections.length === 0 ? (
                      <button
                        onClick={() => handleViewOptions(item.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
                      >
                        View Options
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewOptions(item.id)}
                        className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition font-medium text-sm"
                      >
                        Change Option
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                    >
                      Remove
                    </button>
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

export default ShoppingList;

