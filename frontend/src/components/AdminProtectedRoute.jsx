import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/vendor/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/vendor/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;

