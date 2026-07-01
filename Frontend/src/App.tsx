import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast' ;
import Landing from './pages/Landing';
import Login from './pages/Login';
import Setup from './pages/Setup';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
// other admin pages will be added here

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Smart redirect gate: checks settings and routes accordingly */}
        <Route path="/" element={<Landing />} />
        {/* First-time gym setup wizard */}
        <Route path="/setup" element={<Setup />} />
        {/* Member login */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          {/* 
          <Route path="contracts" element={<Contracts />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="walk-in" element={<WalkIn />} />
          <Route path="walk-in-attendance" element={<WalkInAttendance />} />
          <Route path="settings" element={<Settings />} />
          */}
        </Route>
      </Routes>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' },
        success: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />
    </BrowserRouter>
  );
}

export default App;