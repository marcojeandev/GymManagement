import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Setup } from './pages/Setup';
import { Login } from './pages/Login';
import { DashboardRouter } from './pages/DashboardRouter';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { useEffect, useState } from 'react';
import { checkSystemStatus } from './services/api';

// Admin imports
import { MembersPage as AdminMembersPage } from './pages/admin/Members';
import { SystemSettingsPage } from './pages/admin/SystemSettings';
import { ContractsPage as AdminContractsPage } from './pages/admin/Contracts';
import { ProductsPage as AdminProductsPage } from './pages/admin/Products';
import { SalesPage as AdminSalesPage } from './pages/admin/Sales';
import { WalkinsPage as AdminWalkinsPage } from './pages/admin/Walkins';
import { WalkinAttendancePage as AdminWalkinAttendancePage } from './pages/admin/WalkinAttendance';
import { AttendancePage as AdminAttendancePage } from './pages/admin/Attendance';
import { AccountManagementPage } from './pages/admin/AccountManagement';
import { ReportsPage } from './pages/admin/Reports';

// Cashier imports
import { MembersPage as CashierMembersPage } from './pages/cashier/Members';
import { ContractsPage as CashierContractsPage } from './pages/cashier/Contracts';
import { ProductsPage as CashierProductsPage } from './pages/cashier/Products';
import { SalesPage as CashierSalesPage } from './pages/cashier/Sales';
import { WalkinsPage as CashierWalkinsPage } from './pages/cashier/Walkins';
import { WalkinAttendancePage as CashierWalkinAttendancePage } from './pages/cashier/WalkinAttendance';
import { AttendancePage as CashierAttendancePage } from './pages/cashier/Attendance';
import { CashierDashboard } from './pages/cashier/CashierDashboard';

function SystemGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'configured' | 'unconfigured'>('loading');

  useEffect(() => {
    checkSystemStatus()
      .then((res) => setStatus(res.configured ? 'configured' : 'unconfigured'))
      .catch(() => setStatus('unconfigured'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unconfigured') {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}

function ProtectedSystemRoute({ element }: { element: React.ReactElement }) {
  return (
    <ProtectedRoute>
      <SystemGuard>{element}</SystemGuard>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="/login" element={<Login />} />

          {/* ===== ADMIN ROUTES ===== */}
          {/* Admin Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<DashboardRouter />} />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Admin Management Pages */}
          <Route 
            path="/dashboard/members" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<AdminMembersPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/system-settings" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<SystemSettingsPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/contracts" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<AdminContractsPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/products" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<AdminProductsPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/sales" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<AdminSalesPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/walk-in" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<AdminWalkinsPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/walk-in-attendance" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<AdminWalkinAttendancePage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/attendance" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<AdminAttendancePage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/account-management" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<AccountManagementPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/reports" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ProtectedSystemRoute element={<ReportsPage />} />
              </RoleProtectedRoute>
            } 
          />

          {/* ===== CASHIER ROUTES ===== */}
          <Route 
            path="/cashier/dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['cashier', 'admin']}>
                <ProtectedSystemRoute element={<CashierDashboard />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/cashier/members" 
            element={
              <RoleProtectedRoute allowedRoles={['cashier', 'admin']}>
                <ProtectedSystemRoute element={<CashierMembersPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/cashier/contracts" 
            element={
              <RoleProtectedRoute allowedRoles={['cashier', 'admin']}>
                <ProtectedSystemRoute element={<CashierContractsPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/cashier/products" 
            element={
              <RoleProtectedRoute allowedRoles={['cashier', 'admin']}>
                <ProtectedSystemRoute element={<CashierProductsPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/cashier/sales" 
            element={
              <RoleProtectedRoute allowedRoles={['cashier', 'admin']}>
                <ProtectedSystemRoute element={<CashierSalesPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/cashier/walk-in" 
            element={
              <RoleProtectedRoute allowedRoles={['cashier', 'admin']}>
                <ProtectedSystemRoute element={<CashierWalkinsPage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/cashier/walk-in-attendance" 
            element={
              <RoleProtectedRoute allowedRoles={['cashier', 'admin']}>
                <ProtectedSystemRoute element={<CashierWalkinAttendancePage />} />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/cashier/attendance" 
            element={
              <RoleProtectedRoute allowedRoles={['cashier', 'admin']}>
                <ProtectedSystemRoute element={<CashierAttendancePage />} />
              </RoleProtectedRoute>
            } 
          />

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e242c',
              color: '#e8edf5',
              border: '1px solid #374151',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;