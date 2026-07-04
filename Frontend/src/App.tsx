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

  if (status === 'unconfigured' && window.location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  if (status === 'configured' && window.location.pathname === '/setup') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/members"
        element={
          <ProtectedRoute>
            <MembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/system-settings"
        element={
          <ProtectedRoute>
            <SystemSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SystemGuard>
          <AppRoutes />
        </SystemGuard>
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