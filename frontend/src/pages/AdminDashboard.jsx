import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchPendingVendors();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVendors = async () => {
    try {
      const response = await api.get('/admin/vendors?status=pending');
      setVendors(response.data.vendors);
      setPendingCount(response.data.vendors.length);
    } catch (error) {
      console.error('Error fetching vendors:', error);
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
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <div className="flex space-x-4">
                <Link to="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800">
                  Dashboard
                </Link>
                <Link to="/admin/vendors" className="text-gray-600 hover:text-gray-800">
                  Vendors
                  {pendingCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </Link>
                <Link to="/admin/catalog" className="text-gray-600 hover:text-gray-800">
                  Catalog
                </Link>
                <Link to="/admin/orders" className="text-gray-600 hover:text-gray-800">
                  Orders
                </Link>
              </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

          {stats && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalVendors}</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Vendors</dt>
                        <dd className="text-sm text-gray-900">
                          {stats.approvedVendors} approved, {stats.pendingVendors} pending
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Products in Catalog</dt>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                        <dd className="text-sm text-gray-900">
                          Commission: {parseFloat(stats.totalCommission).toFixed(2)} KWD
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {pendingCount} vendor{pendingCount !== 1 ? 's' : ''} waiting for approval
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <Link to="/admin/vendors" className="font-medium underline">
                      Review pending vendors →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  to="/admin/vendors"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <h4 className="font-medium text-gray-900">Manage Vendors</h4>
                  <p className="text-sm text-gray-500 mt-1">Approve or reject vendor applications</p>
                </Link>
                <Link
                  to="/admin/catalog"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <h4 className="font-medium text-gray-900">Manage Catalog</h4>
                  <p className="text-sm text-gray-500 mt-1">Add or edit products in the catalog</p>
                </Link>
                <Link
                  to="/admin/orders"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <h4 className="font-medium text-gray-900">View Orders</h4>
                  <p className="text-sm text-gray-500 mt-1">Review orders and commission</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

