import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has allowed role
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user?.role === 'cashier') {
      return <Navigate to="/cashier/dashboard" replace />;
    }
    if (user?.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};