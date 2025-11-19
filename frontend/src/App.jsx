import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import VendorRegister from './pages/VendorRegister';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendors from './pages/AdminVendors';
import AdminCatalog from './pages/AdminCatalog';
import AdminOrders from './pages/AdminOrders';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Unified Login - Works for both vendors and admins */}
          <Route path="/login" element={<Login />} />
          <Route path="/vendor/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          
          {/* Vendor Routes */}
          <Route path="/vendor/register" element={<VendorRegister />} />
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
          
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

