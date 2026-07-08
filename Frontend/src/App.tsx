// App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Setup } from './pages/Setup';
import { Login } from './pages/Login';
import { DashboardRouter } from './pages/DashboardRouter';
import { ProtectedRoute } from './components/ProtectedRoute';
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

          {/* Admin Routes */}
          <Route path="/dashboard" element={<ProtectedSystemRoute element={<DashboardRouter />} />} />
          <Route path="/dashboard/members" element={<ProtectedSystemRoute element={<AdminMembersPage />} />} />
          <Route path="/dashboard/system-settings" element={<ProtectedSystemRoute element={<SystemSettingsPage />} />} />
          <Route path="/dashboard/contracts" element={<ProtectedSystemRoute element={<AdminContractsPage />} />} />
          <Route path="/dashboard/products" element={<ProtectedSystemRoute element={<AdminProductsPage />} />} />
          <Route path="/dashboard/sales" element={<ProtectedSystemRoute element={<AdminSalesPage />} />} />
          <Route path="/dashboard/walk-in" element={<ProtectedSystemRoute element={<AdminWalkinsPage />} />} />
          <Route path="/dashboard/walk-in-attendance" element={<ProtectedSystemRoute element={<AdminWalkinAttendancePage />} />} />
          <Route path="/dashboard/attendance" element={<ProtectedSystemRoute element={<AdminAttendancePage />} />} />
          <Route path="/dashboard/account-management" element={<ProtectedSystemRoute element={<AccountManagementPage />} />} />
          <Route path="/dashboard/reports" element={<ProtectedSystemRoute element={<ReportsPage />} />} />

          {/* Cashier Routes */}
          <Route path="/cashier/dashboard" element={<ProtectedSystemRoute element={<CashierDashboard />} />} />
          <Route path="/cashier/members" element={<ProtectedSystemRoute element={<CashierMembersPage />} />} />
          <Route path="/cashier/contracts" element={<ProtectedSystemRoute element={<CashierContractsPage />} />} />
          <Route path="/cashier/products" element={<ProtectedSystemRoute element={<CashierProductsPage />} />} />
          <Route path="/cashier/sales" element={<ProtectedSystemRoute element={<CashierSalesPage />} />} />
          <Route path="/cashier/walk-in" element={<ProtectedSystemRoute element={<CashierWalkinsPage />} />} />
          <Route path="/cashier/walk-in-attendance" element={<ProtectedSystemRoute element={<CashierWalkinAttendancePage />} />} />
          <Route path="/cashier/attendance" element={<ProtectedSystemRoute element={<CashierAttendancePage />} />} />

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