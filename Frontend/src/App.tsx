import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Setup } from './pages/Setup';
import { Login } from './pages/Login';
import { DashboardRouter } from './pages/DashboardRouter';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MembersPage } from './pages/admin/Members';
import { SystemSettingsPage } from './pages/admin/SystemSettings';
import { useEffect, useState } from 'react';
import { checkSystemStatus } from './services/api';
import { ContractsPage } from './pages/admin/Contracts';
import { ProductsPage } from './pages/admin/Products';
import { SalesPage } from './pages/admin/Sales';
import { WalkinsPage } from './pages/admin/Walkins';
import { WalkinAttendancePage } from './pages/admin/WalkinAttendance';
import { AttendancePage } from './pages/admin/Attendance';
import { AccountManagementPage } from './pages/admin/AccountManagement';
import { ReportsPage } from './pages/admin/Reports';

function SystemGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'configured' | 'unconfigured'>('loading');
  const { isAuthenticated } = useAuth();

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

  // If configured, allow access
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
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Setup and Login are ALWAYS accessible (no guard) */}
          <Route path="/setup" element={<Setup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes – require auth and system configured */}
          <Route path="/dashboard" element={<ProtectedSystemRoute element={<DashboardRouter />} />} />
          <Route path="/dashboard/members" element={<ProtectedSystemRoute element={<MembersPage />} />} />
          <Route path="/dashboard/system-settings" element={<ProtectedSystemRoute element={<SystemSettingsPage />} />} />
          <Route path="/dashboard/contracts" element={<ProtectedSystemRoute element={<ContractsPage />} />} />
          <Route path="/dashboard/products" element={<ProtectedSystemRoute element={<ProductsPage />} />} />
          <Route path="/dashboard/sales" element={<ProtectedSystemRoute element={<SalesPage />} />} />
          <Route path="/dashboard/walk-in" element={<ProtectedSystemRoute element={<WalkinsPage />} />} />
          <Route path="/dashboard/walk-in-attendance" element={<ProtectedSystemRoute element={<WalkinAttendancePage />} />} />
          <Route path="/dashboard/attendance" element={<ProtectedSystemRoute element={<AttendancePage />} />} />
          <Route path="/dashboard/account-management" element={<ProtectedSystemRoute element={<AccountManagementPage />} />} />
          <Route path="/dashboard/reports" element={<ProtectedSystemRoute element={<ReportsPage />} />} />

          {/* Redirect any unknown routes to dashboard */}
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