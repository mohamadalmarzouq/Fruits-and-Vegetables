import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Vendor Dashboard</h1>
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {showForm && (
            <div className="mb-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? 'Edit Product' : 'Upload New Product'}
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
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {editingProduct ? 'Update Product' : 'Upload Product'}
                </button>
              </form>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No products yet. Click "Add Product" to get started.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                  <li key={product.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.imageUrl}`}
                          alt={product.product.name}
                          className="h-20 w-20 object-cover rounded"
                        />
                        <div>
                          <h3 className="text-lg font-medium">{product.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            {product.origin} • {product.price} KWD per {product.unit}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Stock: {product.quantity} {product.unit}
                          </p>
                          <span className={`inline-block text-xs mt-1 px-2 py-1 rounded ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.isActive ? '✓ In Stock' : '✗ Out of Stock'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStock(product.id, product.isActive)}
                          className={`px-4 py-2 rounded-md text-white text-sm ${
                            product.isActive 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {product.isActive ? 'Out of Stock' : 'In Stock'}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

