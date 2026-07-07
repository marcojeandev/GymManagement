import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { dashboardApi } from '../../services/admin/dashboardApi';
import toast from 'react-hot-toast';
import {
  Users,
  UserCheck,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardData, DashboardTrend } from '../../types/Dashboard';

export const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // ✅ Explicitly type trendData as an array of objects with day and sales
  const [trendData, setTrendData] = useState<{ day: string; sales: number }[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // ✅ Type the resolved values using 'as' to tell TypeScript what we expect
      const [dashboardData, trend] = await Promise.all([
        dashboardApi.getDashboard(),
        dashboardApi.getSalesTrend(7),
      ]) as [DashboardData, DashboardTrend];

      // ✅ Ensure recent_sales is always an array
      const safeData: DashboardData = {
        ...dashboardData,
        recent_sales: Array.isArray(dashboardData.recent_sales)
          ? dashboardData.recent_sales
          : [],
      };

      setData(safeData);

      // ✅ Build chart data with explicit types for map parameters
      const chartData = trend.labels.map((label: string, i: number) => ({
        day: label,
        sales: trend.values[i] ?? 0, // use nullish coalescing for safety
      }));
      setTrendData(chartData);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Safe currency formatter
  const formatCurrency = (value: number | string | null | undefined): string => {
    const num = Number(value);
    if (isNaN(num)) return '₱0.00';
    return `₱${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl animate-pulse">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <span className="text-gray-400 text-sm">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-white">{data.members.total}</p>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className="text-green-400">Active: {data.members.active}</span>
                  <span className="text-blue-400">New: {data.members.new_this_month}</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-600/20 flex items-center justify-center">
                <Users className="text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Contracts</p>
                <p className="text-2xl font-bold text-white">{data.contracts.active}</p>
                <p className="text-xs text-yellow-400 mt-1">
                  Expiring soon: {data.contracts.expiring_soon}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-600/20 flex items-center justify-center">
                <FileText className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue (Month)</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(data.sales.this_month)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Today: {formatCurrency(data.sales.today)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-600/20 flex items-center justify-center">
                <DollarSign className="text-yellow-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Attendance (Month)</p>
                <p className="text-2xl font-bold text-white">{data.attendance.this_month}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Today: {data.attendance.today} • Walk-ins: {data.walkins.today}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                <Calendar className="text-blue-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-yellow-400" />
                Sales Trend (Last 7 Days)
              </h3>
              <span className="text-xs text-gray-400">
                {formatCurrency(trendData.reduce((sum, d) => sum + d.sales, 0))}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }} />
                <Bar dataKey="sales" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-400" />
              Recent Sales
            </h3>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {data.recent_sales.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent sales</p>
              ) : (
                data.recent_sales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
                    <div>
                      <p className="text-white font-medium">{sale.paid_by}</p>
                      <p className="text-gray-400 text-xs">OR #{sale.or_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-semibold">{formatCurrency(sale.amount)}</p>
                      <p className="text-gray-500 text-xs">{sale.created_at}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-4 shadow-xl shadow-red-500/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-600/20 flex items-center justify-center">
              <UserCheck className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Walk-ins (Month)</p>
              <p className="text-xl font-bold text-white">{data.walkins.this_month}</p>
            </div>
          </div>
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-4 shadow-xl shadow-red-500/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
              <Clock className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Attendance Today</p>
              <p className="text-xl font-bold text-white">{data.attendance.today}</p>
            </div>
          </div>
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-4 shadow-xl shadow-red-500/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-pink-600/20 flex items-center justify-center">
              <DollarSign className="text-pink-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Revenue Today</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.sales.today)}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};