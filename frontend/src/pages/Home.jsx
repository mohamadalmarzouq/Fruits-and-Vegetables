import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRanges, setPriceRanges] = useState({});

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Fetch all products from catalog
      const catalogResponse = await api.get('/products');
      const allProducts = catalogResponse.data.products || [];
      
      // Get popular products (first 12, or all if less than 12)
      const featured = allProducts.slice(0, 12);
      setProducts(featured);

      // Fetch vendor products to get price ranges
      try {
        const vendorProductsResponse = await api.get('/products/vendor-products');
        const vendorProducts = vendorProductsResponse.data.products || [];
        
        // Calculate price ranges for each product
        const ranges = {};
        vendorProducts.forEach(vp => {
          if (vp.isActive && vp.vendor?.vendorStatus === 'approved') {
            if (!ranges[vp.productId]) {
              ranges[vp.productId] = {
                min: parseFloat(vp.price),
                max: parseFloat(vp.price),
                unit: vp.unit
              };
            } else {
              ranges[vp.productId].min = Math.min(ranges[vp.productId].min, parseFloat(vp.price));
              ranges[vp.productId].max = Math.max(ranges[vp.productId].max, parseFloat(vp.price));
            }
          }
        });
        setPriceRanges(ranges);
      } catch (error) {
        // If vendor products endpoint doesn't exist or fails, continue without prices
        console.log('Could not fetch vendor products for price ranges');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceDisplay = (productId) => {
    const range = priceRanges[productId];
    if (range) {
      if (range.min === range.max) {
        return `From ${range.min.toFixed(2)} KWD/${range.unit}`;
      }
      return `From ${range.min.toFixed(2)} KWD/${range.unit}`;
    }
    return 'Price on request';
  };

  const handleShopNow = () => {
    navigate('/register');
  };

  const handleViewOptions = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">FreshSavor</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-green-100 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-50 text-sm font-medium transition"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
              Fresh Fruits & Vegetables
            </h2>
            <h3 className="text-3xl font-bold text-green-600 mb-6">
              at Best Prices
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Compare prices from multiple vendors. Get the best deals on fresh produce delivered to your door.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleShopNow}
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
              >
                Shop Now
              </button>
              <Link
                to="/register?role=vendor"
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-50 transition shadow-lg hover:shadow-xl"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Your Shopping List
              </h3>
              <p className="text-gray-600">
                Add the fruits and vegetables you need with your preferred quantities
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Compare Prices
              </h3>
              <p className="text-gray-600">
                See all available options from multiple vendors with different origins and prices
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Best Deals
              </h3>
              <p className="text-gray-600">
                Choose the best price and checkout. We guarantee you get the lowest prices!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <button
              onClick={handleViewOptions}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              View All Products →
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4 cursor-pointer transform hover:-translate-y-1"
                  onClick={handleViewOptions}
                >
                  <div className="bg-green-50 rounded-lg h-32 flex items-center justify-center mb-3">
                    <span className="text-4xl">
                      {product.category === 'fruit' ? '🍎' : '🥕'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 capitalize">
                    {product.category}
                  </p>
                  <p className="text-green-600 font-bold text-sm mb-3">
                    {getPriceDisplay(product.id)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOptions();
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-xs font-medium transition"
                  >
                    View Options
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose FreshSavor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Best Price Guarantee
              </h3>
              <p className="text-gray-600 text-sm">
                Compare prices from multiple vendors and always get the best deal
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multiple Vendors
              </h3>
              <p className="text-gray-600 text-sm">
                One marketplace, multiple vendors. Choose from various origins and prices
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fresh Produce
              </h3>
              <p className="text-gray-600 text-sm">
                All products from verified vendors ensuring quality and freshness
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Comparison
              </h3>
              <p className="text-gray-600 text-sm">
                Simple interface to compare prices and origins in one place
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join FreshSavor today and get access to the best prices on fresh produce
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-50 transition shadow-lg"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition"
            >
              Login
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-green-500">
            <p className="text-green-100 mb-4">Are you a vendor?</p>
            <Link
              to="/register?role=vendor"
              className="inline-block bg-green-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-900 transition"
            >
              Join as Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">FreshSavor</h3>
              <p className="text-sm">
                Your trusted marketplace for fresh fruits and vegetables at the best prices.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="hover:text-green-400">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-green-400">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-green-400">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/register" className="hover:text-green-400">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/register?role=vendor" className="hover:text-green-400">
                    Become a Vendor
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-green-400 cursor-pointer">How It Works</li>
                <li className="hover:text-green-400 cursor-pointer">Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 FreshSavor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

