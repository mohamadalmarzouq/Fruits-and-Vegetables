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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Buyer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
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
            <h2 className="text-2xl font-bold text-gray-900">My Shopping Lists</h2>
            <button
              onClick={createShoppingList}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              + Create New List
            </button>
          </div>

          {shoppingLists.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500 mb-4">You don't have any shopping lists yet.</p>
              <button
                onClick={createShoppingList}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Create Your First Shopping List
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {shoppingLists.map((list) => (
                  <li key={list.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link
                          to={list.status === 'completed' ? `/buyer/shopping-lists/${list.id}/receipt` : `/buyer/shopping-lists/${list.id}`}
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Shopping List #{list.id.slice(0, 8)}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {new Date(list.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Items: {list._count?.items || 0}
                        </p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            list.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {list.status === 'completed' ? '✓ Completed' : '⋯ Draft'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {list.status === 'completed' ? (
                          <Link
                            to={`/buyer/orders/${list.id}/receipt`}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            View Receipt
                          </Link>
                        ) : (
                          <>
                            <Link
                              to={`/buyer/shopping-lists/${list.id}`}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                              Open
                            </Link>
                            <button
                              onClick={() => deleteShoppingList(list.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
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

export default BuyerDashboard;

