import { Link, Outlet, useLocation } from 'react-router-dom';
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

const AdminLayout = () => {
  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="bg-red-500 p-2 rounded-lg">
            <Dumbbell className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-wider">GYM<span className="text-red-500">PRO</span></h1>
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

        <div className="p-4 border-t border-gray-800">
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={20} />
            Logout
          </Link>
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
