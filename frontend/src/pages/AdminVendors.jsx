import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminVendors = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/admin/vendors' 
        : `/admin/vendors?status=${statusFilter}`;
      const response = await api.get(url);
      setVendors(response.data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      await api.put(`/admin/vendors/${vendorId}/approve`);
      setSuccess('Vendor approved successfully!');
      fetchVendors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to approve vendor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (vendorId) => {
    if (!window.confirm('Are you sure you want to reject this vendor?')) {
      return;
    }
    try {
      await api.put(`/admin/vendors/${vendorId}/reject`);
      setSuccess('Vendor rejected');
      fetchVendors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reject vendor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
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
                <Link to="/admin/vendors" className="text-indigo-600 hover:text-indigo-800">
                  Vendors
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
            <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === 'pending'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === 'approved'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Approved
              </button>
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

          {loading ? (
            <div className="text-center py-12">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No vendors found
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <li key={vendor.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{vendor.email}</h3>
                            <p className="text-sm text-gray-500">
                              Registered: {new Date(vendor.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Products: {vendor._count?.vendorProducts || 0}
                            </p>
                          </div>
                          <div>{getStatusBadge(vendor.vendorStatus)}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {vendor.vendorStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(vendor.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {vendor.vendorStatus === 'approved' && (
                          <button
                            onClick={() => handleReject(vendor.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        )}
                        {vendor.vendorStatus === 'rejected' && (
                          <button
                            onClick={() => handleApprove(vendor.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Approve
                          </button>
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

export default AdminVendors;

