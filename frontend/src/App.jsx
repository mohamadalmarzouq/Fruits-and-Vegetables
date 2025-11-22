import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendors from './pages/AdminVendors';
import AdminCatalog from './pages/AdminCatalog';
import AdminOrders from './pages/AdminOrders';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import BuyerProtectedRoute from './components/BuyerProtectedRoute';
import BuyerDashboard from './pages/BuyerDashboard';
import ShoppingList from './pages/ShoppingList';
import ProductOptions from './pages/ProductOptions';
import Checkout from './pages/Checkout';
import OrderReceipt from './pages/OrderReceipt';
import Receipt from './pages/Receipt';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Home/Landing Page */}
          <Route path="/" element={<Home />} />
          
          {/* Unified Login - Works for both vendors and admins */}
          <Route path="/login" element={<Login />} />
          <Route path="/vendor/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          
          {/* Registration - Unified for Vendor and Buyer */}
          <Route path="/register" element={<Register />} />
          <Route path="/vendor/register" element={<Register />} />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <AdminProtectedRoute>
                <AdminVendors />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/catalog"
            element={
              <AdminProtectedRoute>
                <AdminCatalog />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <AdminOrders />
              </AdminProtectedRoute>
            }
          />
          
          {/* Buyer Routes */}
          <Route
            path="/buyer/dashboard"
            element={
              <BuyerProtectedRoute>
                <BuyerDashboard />
              </BuyerProtectedRoute>
            }
          />
          <Route
            path="/buyer/shopping-lists/:id"
            element={
              <BuyerProtectedRoute>
                <ShoppingList />
              </BuyerProtectedRoute>
            }
          />
          <Route
            path="/buyer/shopping-lists/:id/items/:itemId/options"
            element={
              <BuyerProtectedRoute>
                <ProductOptions />
              </BuyerProtectedRoute>
            }
          />
          <Route
            path="/buyer/shopping-lists/:id/checkout"
            element={
              <BuyerProtectedRoute>
                <Checkout />
              </BuyerProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders/:id/receipt"
            element={
              <BuyerProtectedRoute>
                <OrderReceipt />
              </BuyerProtectedRoute>
            }
          />
          <Route
            path="/buyer/shopping-lists/:id/receipt"
            element={
              <BuyerProtectedRoute>
                <Receipt />
              </BuyerProtectedRoute>
            }
          />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

