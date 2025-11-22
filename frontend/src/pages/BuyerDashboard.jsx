import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const fetchShoppingLists = async () => {
    try {
      const response = await api.get('/buyer/shopping-lists');
      setShoppingLists(response.data.shoppingLists);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createShoppingList = async () => {
    try {
      const response = await api.post('/buyer/shopping-lists');
      const newList = response.data.shoppingList;
      navigate(`/buyer/shopping-lists/${newList.id}`);
    } catch (error) {
      console.error('Error creating shopping list:', error);
      alert('Failed to create shopping list');
    }
  };

  const deleteShoppingList = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shopping list?')) {
      return;
    }

    try {
      await api.delete(`/buyer/shopping-lists/${id}`);
      fetchShoppingLists();
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      alert('Failed to delete shopping list');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
              <span className="text-green-100 text-sm">Buyer Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white">{user?.email}</span>
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600">
              Manage your shopping lists and find the best prices on fresh produce
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Shopping Lists</h2>
            <button
              onClick={createShoppingList}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>+</span>
              <span>Create New List</span>
            </button>
          </div>

          {/* Shopping Lists */}
          {shoppingLists.length === 0 ? (
            <div className="bg-white shadow-lg rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-xl text-gray-700 mb-2 font-semibold">
                You don't have any shopping lists yet
              </p>
              <p className="text-gray-500 mb-6">
                Create your first shopping list to start comparing prices
              </p>
              <button
                onClick={createShoppingList}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
              >
                Create Your First Shopping List
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shoppingLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link
                        to={list.status === 'completed' ? `/buyer/shopping-lists/${list.id}/receipt` : `/buyer/shopping-lists/${list.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-green-600 transition"
                      >
                        Shopping List
                      </Link>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        #{list.id.slice(0, 8)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      list.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {list.status === 'completed' ? '✓ Completed' : '⋯ Draft'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">📅</span>
                      <span>{new Date(list.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">📦</span>
                      <span>{list._count?.items || 0} {list._count?.items === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                    {list.status === 'completed' ? (
                      <Link
                        to={`/buyer/orders/${list.id}/receipt`}
                        className="flex-1 bg-green-600 text-white text-center px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
                      >
                        View Receipt
                      </Link>
                    ) : (
                      <>
                        <Link
                          to={`/buyer/shopping-lists/${list.id}`}
                          className="flex-1 bg-green-600 text-white text-center px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
                        >
                          Open
                        </Link>
                        <button
                          onClick={() => deleteShoppingList(list.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
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

export default BuyerDashboard;

