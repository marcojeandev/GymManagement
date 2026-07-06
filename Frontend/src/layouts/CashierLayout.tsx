import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Menu, X } from 'lucide-react';

const navGroups = [
  {
    title: 'Management',
    items: [
      { label: 'Members', path: '/dashboard/members' },
      { label: 'Contracts', path: '/dashboard/contracts' },
      // System Settings omitted for cashier
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Products', path: '/dashboard/products' },
      { label: 'Sales', path: '/dashboard/sales' },
    ],
  },
  {
    title: 'Attendance',
    items: [
      { label: 'Attendance', path: '/dashboard/attendance' },
      { label: 'Walk-in', path: '/dashboard/walk-in' },
      { label: 'Walk-in Attendance', path: '/dashboard/walk-in-attendance' },
    ],
  },
];

export const CashierLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<string[]>(['Management', 'Sales', 'Attendance']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((g) => g !== title) : [...prev, title]
    );
  };

  const handleLogout = async () => {
    try {
      const { message } = await logout();
      toast.success(message);
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    } finally {
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#14181f] border-b border-gray-700/50 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-lg font-bold text-white shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <span className="text-white font-semibold">{user?.name}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-0 z-40 w-64 bg-[#14181f] border-r border-gray-700/50 flex flex-col h-screen transition-transform duration-300 ease-in-out`}>
        {/* Large Profile */}
        <div className="p-4 border-b border-gray-700/30 flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{user?.name}</p>
            <p className="text-gray-400 text-sm truncate">{user?.email}</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-full text-xs font-medium">
              CASHIER
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Dashboard standalone link */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 text-sm rounded-lg transition mb-2 ${
                isActive
                  ? 'bg-blue-600/20 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`
            }
          >
            Dashboard
          </NavLink>

          {/* Dropdown groups */}
          {navGroups.map((group) => {
            const isOpen = openGroups.includes(group.title);
            return (
              <div key={group.title} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition"
                >
                  <span>{group.title}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="ml-2 space-y-0.5 mt-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `block px-3 py-2 text-sm rounded-lg transition ${
                            isActive
                              ? 'bg-blue-600/20 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-3 border-t border-gray-700/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-full">
        {children}
      </main>
    </div>
  );
};