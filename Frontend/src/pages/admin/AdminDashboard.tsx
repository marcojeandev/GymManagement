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
  CreditCard,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DashboardData } from '../../types/Dashboard';

export const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<{ 
    day: string; 
    sales: number; 
    contracts: number; 
    membership: number; 
    total: number;
  }[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashboardData, trend] = await Promise.all([
        dashboardApi.getDashboard(),
        dashboardApi.getSalesTrend(7),
      ]);

      if (!dashboardData) {
        throw new Error('No dashboard data received');
      }

      const safeData: DashboardData = {
        ...dashboardData,
        recent_sales: Array.isArray(dashboardData.recent_sales)
          ? dashboardData.recent_sales
          : [],
        recent_contracts: Array.isArray(dashboardData.recent_contracts)
          ? dashboardData.recent_contracts
          : [],
      };

      setData(safeData);

      // BUILD CHART DATA
      if (trend && trend.labels && Array.isArray(trend.labels) && trend.labels.length > 0) {
        const chartData = trend.labels.map((label: string, i: number) => ({
          day: label,
          sales: trend.breakdown?.sales?.[i] ?? 0,
          contracts: trend.breakdown?.contracts?.[i] ?? 0,
          membership: trend.breakdown?.membership_fees?.[i] ?? 0,
          total: trend.values?.[i] ?? 0,
        }));
        
        console.log('📊 Chart Data:', chartData);
        setTrendData(chartData);
      } else {
        // If no trend data, create default with zeros
        const defaultData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          defaultData.push({ 
            day: label, 
            sales: 0, 
            contracts: 0, 
            membership: 0, 
            total: 0 
          });
        }
        setTrendData(defaultData);
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string | null | undefined): string => {
    const num = Number(value);
    if (isNaN(num)) return '₱0.00';
    return `₱${num.toFixed(2)}`;
  };

  // Calculate totals for the chart display
  const totalChartRevenue = trendData.reduce((sum, d) => sum + d.total, 0);
  const totalChartSales = trendData.reduce((sum, d) => sum + d.sales, 0);
  const totalChartContracts = trendData.reduce((sum, d) => sum + d.contracts, 0);
  const totalChartMembership = trendData.reduce((sum, d) => sum + d.membership, 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl animate-pulse">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">No data available</div>
        </div>
      </AdminLayout>
    );
  }

  // Calculate revenue totals - all now use total_amount from backend
  const totalMonthlyRevenue = data.sales?.total_this_month || 0;
  const totalTodayRevenue = data.sales?.total_today || 0;
  const totalLastWeekRevenue = data.sales?.total_last_week || 0;
  
  // Calculate today's revenue including all sources
  const todayTotalRevenue = 
    (data.sales?.today || 0) +
    (data.contracts?.revenue_today || 0) +
    (data.membership_fees?.revenue_today || 0) +
    (data.walkins?.revenue_today || 0);

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
                <p className="text-2xl font-bold text-white">{data.members?.total || 0}</p>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className="text-green-400">Active: {data.members?.active || 0}</span>
                  <span className="text-blue-400">New: {data.members?.new_this_month || 0}</span>
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
                <p className="text-2xl font-bold text-white">{data.contracts?.active || 0}</p>
                <p className="text-xs text-yellow-400 mt-1">
                  Expiring soon: {data.contracts?.expiring_soon || 0}
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
                <p className="text-gray-400 text-sm">Total Revenue (Month)</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalMonthlyRevenue)}</p>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className="text-green-400">Today: {formatCurrency(totalTodayRevenue)}</span>
                  <span className="text-blue-400">Week: {formatCurrency(totalLastWeekRevenue)}</span>
                </div>
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
                <p className="text-2xl font-bold text-white">{data.attendance?.this_month || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Today: {data.attendance?.today || 0} • Walk-ins: {data.walkins?.today || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                <Calendar className="text-blue-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-4 shadow-xl shadow-red-500/5">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-blue-400" />
              Product Sales
            </p>
            <p className="text-xl font-bold text-white">{formatCurrency(data.sales?.this_month || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Using total_amount</p>
          </div>
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-4 shadow-xl shadow-red-500/5">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <FileText size={16} className="text-green-400" />
              Contract Revenue
            </p>
            <p className="text-xl font-bold text-white">{formatCurrency(data.contracts?.revenue_this_month || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Using total_amount</p>
          </div>
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-4 shadow-xl shadow-red-500/5">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Users size={16} className="text-purple-400" />
              Membership Fees
            </p>
            <p className="text-xl font-bold text-white">{formatCurrency(data.membership_fees?.revenue_this_month || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Using total_amount</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend with Breakdown */}
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-yellow-400" />
                Revenue Trend (Last 7 Days)
              </h3>
              <span className="text-xs text-gray-400">
                Total: {formatCurrency(totalChartRevenue)}
              </span>
            </div>
            {trendData.length > 0 && trendData.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'sales') return [`₱${Number(value).toFixed(2)}`, 'Product Sales'];
                      if (name === 'contracts') return [`₱${Number(value).toFixed(2)}`, 'Contracts'];
                      if (name === 'membership') return [`₱${Number(value).toFixed(2)}`, 'Membership Fees'];
                      return [`₱${Number(value).toFixed(2)}`, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" stackId="a" fill="#3b82f6" name="Product Sales" />
                  <Bar dataKey="contracts" stackId="a" fill="#22c55e" name="Contracts" />
                  <Bar dataKey="membership" stackId="a" fill="#a855f7" name="Membership Fees" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                <p>No revenue data available for the last 7 days</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-400" />
              Recent Transactions
            </h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {data.recent_sales?.length === 0 && data.recent_contracts?.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent transactions</p>
              ) : (
                <>
                  {data.recent_sales?.map((sale) => (
                    <div key={`sale-${sale.id}`} className="flex items-center justify-between bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
                      <div>
                        <p className="text-white font-medium">{sale.paid_by}</p>
                        <p className="text-gray-400 text-xs">OR #{sale.or_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-semibold">{formatCurrency(sale.amount)}</p>
                        <p className="text-gray-500 text-xs">{sale.created_at}</p>
                      </div>
                    </div>
                  ))}
                  {data.recent_contracts?.map((contract) => (
                    <div key={`contract-${contract.id}`} className="flex items-center justify-between bg-[#1e242c] p-3 rounded-lg border border-green-700/30">
                      <div>
                        <p className="text-white font-medium">{contract.member_name}</p>
                        <p className="text-gray-400 text-xs">Contract • OR #{contract.or_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">{formatCurrency(contract.amount)}</p>
                        <p className="text-gray-500 text-xs">{contract.created_at}</p>
                      </div>
                    </div>
                  ))}
                </>
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
              <p className="text-xl font-bold text-white">{data.walkins?.this_month || 0}</p>
            </div>
          </div>
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-4 shadow-xl shadow-red-500/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
              <Clock className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Attendance Today</p>
              <p className="text-xl font-bold text-white">{data.attendance?.today || 0}</p>
            </div>
          </div>
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue Today</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(todayTotalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Walk-ins: {formatCurrency(data.walkins?.revenue_today || 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-600/20 flex items-center justify-center">
                <DollarSign className="text-yellow-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};