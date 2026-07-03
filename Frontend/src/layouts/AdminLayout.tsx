// File: src/layouts/AdminLayout.tsx
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  ShoppingCart, 
  QrCode, 
  UserPlus, 
  ClipboardCheck, 
  Settings,
  LogOut,
  Dumbbell
} from 'lucide-react';
import { authService } from '../services/authService';
import { settingsService } from '../services/admin/settingsService';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gymName, setGymName] = useState('Gym');
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Members', path: '/admin/members', icon: <Users size={20} /> },
    { name: 'Contracts', path: '/admin/contracts', icon: <FileText size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Sales', path: '/admin/sales', icon: <ShoppingCart size={20} /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <QrCode size={20} /> },
    { name: 'Walk-in', path: '/admin/walk-in', icon: <UserPlus size={20} /> },
    { name: 'Walk-in Attendance', path: '/admin/walk-in-attendance', icon: <ClipboardCheck size={20} /> },
    { name: 'System Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  // Fetch gym settings
  useEffect(() => {
    const fetchGymSettings = async () => {
      try {
        const res = await settingsService.getGymSettings();
        const data = res.data.data;
        if (data) {
          setGymName(data.gym_name || 'Gym');
          setLogo(data.logo || null);
        }
      } catch (error) {
        console.error('Failed to fetch gym settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGymSettings();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  // Build the logo URL
  const logoUrl = logo ? `${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${logo}` : null;

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          {loading ? (
            <div className="w-10 h-10 rounded-lg bg-gray-700 animate-pulse" />
          ) : logoUrl ? (
            <img
            src={logoUrl}
            alt="Gym Logo"
            className="w-10 h-10 object-contain rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              // Fallback to default icon
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const defaultIcon = document.createElement('div');
                defaultIcon.className = 'bg-red-500 p-2 rounded-lg';
                defaultIcon.innerHTML = `<svg class="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
                parent.prepend(defaultIcon);
              }
            }}
          />
          ) : (
            <div className="bg-red-500 p-2 rounded-lg">
              <Dumbbell className="text-white" size={24} />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-wider truncate">
            {loading ? 'Loading...' : gymName || 'Gym'}
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-red-500/10 text-red-500 font-medium' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-100'
                }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0B0C10]">
        <header className="h-20 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {navItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold shadow-lg shadow-red-500/20">
                A
              </div>
              <span className="text-sm font-medium text-gray-200">Admin User</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;