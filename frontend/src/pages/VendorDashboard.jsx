import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import VendorOrders from '../components/VendorOrders';
import VendorInventory from '../components/VendorInventory';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'inventory'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    unit: 'kg',
    pricePerUnit: '',
    origin: ''
  });
  const [catalog, setCatalog] = useState([]);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCatalog();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/vendor/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // For create: image is required. For edit: image is optional
    if (!editingProduct && !image) {
      setError('Please select an image');
      return;
    }

    const formDataToSend = new FormData();
    
    if (editingProduct) {
      // Edit mode - only send changed fields
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('pricePerUnit', formData.pricePerUnit);
      formDataToSend.append('origin', formData.origin);
      if (image) {
        formDataToSend.append('image', image);
      }
    } else {
      // Create mode - send all fields
      formDataToSend.append('productId', formData.productId);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('pricePerUnit', formData.pricePerUnit);
      formDataToSend.append('origin', formData.origin);
      formDataToSend.append('image', image);
    }

    try {
      if (editingProduct) {
        await api.put(`/vendor/products/${editingProduct.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/vendor/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Product uploaded successfully!');
      }
      
      setFormData({
        productId: '',
        unit: 'kg',
        pricePerUnit: '',
        origin: ''
      });
      setImage(null);
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.error || (editingProduct ? 'Failed to update product' : 'Failed to upload product'));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productId: product.productId,
      unit: product.unit,
      pricePerUnit: product.price.toString(),
      origin: product.origin
    });
    setImage(null);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      productId: '',
      unit: 'kg',
      pricePerUnit: '',
      origin: ''
    });
    setImage(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/vendor/products/${id}`);
      setSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const handleToggleStock = async (id, currentStatus) => {
    try {
      const response = await api.patch(`/vendor/products/${id}/toggle-stock`);
      setSuccess(response.data.message);
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update stock status');
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
              <span className="text-green-100 text-sm">Vendor Dashboard</span>
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
              Vendor Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your products, orders, and inventory
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inventory
              </button>
            </nav>
          </div>

          {/* Messages */}
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

          {/* Tab Content */}
          {activeTab === 'products' && (
            <>
              {/* Action Bar */}
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                <button
                  onClick={() => {
                    if (showForm) {
                      handleCancelEdit();
                    } else {
                      setShowForm(true);
                    }
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span>{showForm ? '✕' : '+'}</span>
                  <span>{showForm ? 'Cancel' : 'Add Product'}</span>
                </button>
              </div>

          {showForm && (
            <div className="mb-6 bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-900">
                {editingProduct ? '✏️ Edit Product' : '➕ Upload New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingProduct && (
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
                )}
                
                {editingProduct && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <input
                      type="text"
                      value={editingProduct.product.name}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price Per Unit (KWD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder={formData.unit === 'kg' ? 'e.g., 1.50 per kg' : 'e.g., 0.0015 per gram'}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Price per {formData.unit}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Origin</label>
                  <input
                    type="text"
                    required
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Spain, Turkey"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingProduct}
                    onChange={(e) => setImage(e.target.files[0])}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {editingProduct && (
                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                  )}
                </div>

                {editingProduct && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                    <button
                      type="button"
                      onClick={() => handleToggleStock(editingProduct.id, editingProduct.isActive)}
                      className={`w-full px-4 py-2 rounded-md text-white ${
                        editingProduct.isActive 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {editingProduct.isActive ? 'Mark as Out of Stock' : 'Mark as In Stock'}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
                >
                  {editingProduct ? '✓ Update Product' : '✓ Upload Product'}
                </button>
              </form>
            </div>
          )}

          {products.length === 0 ? (
            <div className="bg-white shadow-lg rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-gray-700 mb-2 font-semibold">
                No products yet
              </p>
              <p className="text-gray-500 mb-6">
                Click "Add Product" to start uploading your inventory
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 border border-gray-100"
                >
                  <div className="mb-4">
                    <img
                      src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.imageUrl}`}
                      alt={product.product.name}
                      className="h-48 w-full object-cover rounded-lg mb-4"
                    />
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{product.product.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">📍</span> {product.origin}
                    </p>
                    <p className="text-lg font-bold text-green-600 mb-1">
                      {product.price} KWD per {product.unit}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stock: {product.quantity} {product.unit}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleStock(product.id, product.isActive)}
                      className={`w-full px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
                        product.isActive 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {product.isActive ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </>
          )}

          {activeTab === 'orders' && (
            <VendorOrders />
          )}

          {activeTab === 'inventory' && (
            <VendorInventory />
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

