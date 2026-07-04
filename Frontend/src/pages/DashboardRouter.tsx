import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { CashierDashboard } from './cashier/CashierDashboard';
import { Navigate } from 'react-router-dom';

export const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'cashier':
      return <CashierDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};