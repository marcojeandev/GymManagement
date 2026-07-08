import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { reportsApi } from '../../services/admin/reportsApi';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  UserPlus,
  Download,
  Printer,
} from 'lucide-react';

const COLORS = ['#ef4444', '#dc2626', '#f87171', '#b91c1c', '#7f1d1d'];

export const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [memberGrowth, setMemberGrowth] = useState<any>(null);
  const [salesTrend, setSalesTrend] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any>(null);
  const [salesByPayment, setSalesByPayment] = useState<any>([]);
  const [membershipDist, setMembershipDist] = useState<any>([]);
  const [contractDist, setContractDist] = useState<any>([]);
  const [attendanceDist, setAttendanceDist] = useState<any>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        overviewData,
        memberGrowthData,
        salesTrendData,
        topProductsData,
        attendanceTrendData,
        salesByPaymentData,
        membershipDistData,
        contractDistData,
        attendanceDistData,
        revenueData,
      ] = await Promise.all([
        reportsApi.getOverview(),
        reportsApi.getMemberGrowth(12),
        reportsApi.getSalesTrend(30),
        reportsApi.getTopProducts(5),
        reportsApi.getAttendanceTrend(30),
        reportsApi.getSalesByPaymentType(),
        reportsApi.getMembershipDistribution(),
        reportsApi.getContractDistribution(),
        reportsApi.getAttendanceDistribution(dateRange.start, dateRange.end),
        reportsApi.getRevenue(dateRange.start, dateRange.end),
      ]);

      // ✅ Ensure all data is properly extracted from API responses
      setOverview(overviewData?.data || overviewData || null);
      setMemberGrowth(memberGrowthData?.data || memberGrowthData || null);
      setSalesTrend(salesTrendData?.data || salesTrendData || null);
      setTopProducts(Array.isArray(topProductsData?.data) ? topProductsData.data : (Array.isArray(topProductsData) ? topProductsData : []));
      setAttendanceTrend(attendanceTrendData?.data || attendanceTrendData || null);
      setSalesByPayment(Array.isArray(salesByPaymentData?.data) ? salesByPaymentData.data : (Array.isArray(salesByPaymentData) ? salesByPaymentData : []));
      
      // ✅ Ensure these are always arrays
      const membershipData = membershipDistData?.data || membershipDistData || [];
      setMembershipDist(Array.isArray(membershipData) ? membershipData : []);
      
      const contractData = contractDistData?.data || contractDistData || [];
      setContractDist(Array.isArray(contractData) ? contractData : []);
      
      const attendanceData = attendanceDistData?.data || attendanceDistData || [];
      setAttendanceDist(Array.isArray(attendanceData) ? attendanceData : []);
      
      setRevenue(revenueData?.data || revenueData || null);
    } catch (error) {
      console.error('Reports fetch error:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₱${value.toFixed(2)}`;
  };

  // ========== CSV Export ==========
  const exportCSV = () => {
    let csv = 'Gym Management System - Report\n';
    csv += `Generated on: ${new Date().toLocaleString()}\n`;
    csv += `Period: ${dateRange.start} to ${dateRange.end}\n\n`;

    csv += 'OVERVIEW\n';
    csv += `Total Members,${overview?.members?.total || 0}\n`;
    csv += `Active Members,${overview?.members?.active || 0}\n`;
    csv += `Expired Members,${overview?.members?.expired || 0}\n`;
    csv += `Active Contracts,${overview?.contracts?.active || 0}\n`;
    csv += `Revenue (Month),${formatCurrency(overview?.sales?.this_month || 0)}\n`;
    csv += `Revenue (Today),${formatCurrency(overview?.sales?.today || 0)}\n`;
    csv += `Attendance (Month),${overview?.attendance?.this_month || 0}\n`;
    csv += `Attendance (Today),${overview?.attendance?.today || 0}\n`;
    csv += `Total Walk-ins,${overview?.walkins?.total || 0}\n`;
    csv += `Walk-ins (Today),${overview?.walkins?.today || 0}\n\n`;

    csv += 'MEMBER GROWTH (Monthly)\n';
    csv += 'Month,New Members\n';
    memberGrowth?.labels?.forEach((label: string, i: number) => {
      csv += `${label},${memberGrowth?.values?.[i] || 0}\n`;
    });
    csv += '\n';

    csv += 'SALES TREND (Daily)\n';
    csv += 'Day,Sales (₱)\n';
    salesTrend?.labels?.forEach((label: string, i: number) => {
      csv += `${label},${salesTrend?.values?.[i] || 0}\n`;
    });
    csv += '\n';

    csv += 'TOP SELLING PRODUCTS\n';
    csv += 'Product,Total Quantity,Total Revenue (₱)\n';
    topProducts?.forEach((product: any) => {
      csv += `${product.name},${product.total_quantity},${product.total_revenue || 0}\n`;
    });
    csv += '\n';

    csv += 'ATTENDANCE TREND (Daily)\n';
    csv += 'Day,Count\n';
    attendanceTrend?.labels?.forEach((label: string, i: number) => {
      csv += `${label},${attendanceTrend?.values?.[i] || 0}\n`;
    });
    csv += '\n';

    csv += 'SALES BY PAYMENT TYPE\n';
    csv += 'Payment Type,Count,Total (₱)\n';
    salesByPayment?.forEach((item: any) => {
      csv += `${item.payment_type},${item.count},${item.total}\n`;
    });
    csv += '\n';

    csv += 'MEMBERSHIP STATUS DISTRIBUTION\n';
    csv += 'Status,Count\n';
    membershipDist?.forEach((item: any) => {
      csv += `${item.membership_status},${item.count}\n`;
    });
    csv += '\n';

    csv += 'CONTRACT STATUS DISTRIBUTION\n';
    csv += 'Status,Count\n';
    contractDist?.forEach((item: any) => {
      csv += `${item.status},${item.count}\n`;
    });
    csv += '\n';

    csv += 'ATTENDANCE DISTRIBUTION (Member vs Walk-in)\n';
    csv += 'Type,Count\n';
    attendanceDist?.forEach((item: any) => {
      csv += `${item.type},${item.count}\n`;
    });
    csv += '\n';

    csv += 'REVENUE BREAKDOWN\n';
    csv += `Total Revenue,${formatCurrency(revenue?.total_revenue || 0)}\n`;
    csv += `Product Sales,${formatCurrency(revenue?.breakdown?.sales || 0)}\n`;
    csv += `Contracts,${formatCurrency(revenue?.breakdown?.contracts || 0)}\n`;
    csv += `Membership Fees,${formatCurrency(revenue?.breakdown?.membership_fees || 0)}\n`;
    csv += '\n';

    csv += `TOTAL REVENUE (Period),${formatCurrency(revenue?.total_revenue || 0)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Gym_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success('CSV exported successfully');
  };

  // ========== Print ==========
  const handlePrint = () => {
    const style = document.createElement('style');
    style.id = 'print-style';
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #print-area, #print-area * { visibility: visible; }
        #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .print-card { break-inside: avoid; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      const el = document.getElementById('print-style');
      if (el) el.remove();
    }, 1000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl animate-pulse">Loading reports...</div>
        </div>
      </AdminLayout>
    );
  }

  // Ensure payment data exists
  const paymentData = salesByPayment && salesByPayment.length > 0 ? salesByPayment : [
    { payment_type: 'cash', count: 0, total: 0 },
    { payment_type: 'gcash', count: 0, total: 0 },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header with Export Buttons */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-red-500" />
            Reports & Analytics
          </h2>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="bg-[#1e242c] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="bg-[#1e242c] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
            <div className="flex gap-2 no-print">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-lg shadow-green-600/20"
              >
                <Download size={18} />
                CSV
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg shadow-blue-600/20"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Print Area */}
        <div id="print-area">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5 print-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Members</p>
                  <p className="text-2xl font-bold text-white">{overview?.members?.total || 0}</p>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span className="text-green-400">Active: {overview?.members?.active || 0}</span>
                    <span className="text-red-400">Expired: {overview?.members?.expired || 0}</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-600/20 flex items-center justify-center">
                  <Users className="text-red-400" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5 print-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Contracts</p>
                  <p className="text-2xl font-bold text-white">{overview?.contracts?.active || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-600/20 flex items-center justify-center">
                  <FileText className="text-green-400" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5 print-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Revenue (Month)</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(overview?.sales?.this_month || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">Today: {formatCurrency(overview?.sales?.today || 0)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-600/20 flex items-center justify-center">
                  <DollarSign className="text-yellow-400" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5 print-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Attendance (Month)</p>
                  <p className="text-2xl font-bold text-white">{overview?.attendance?.this_month || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Today: {overview?.attendance?.today || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Calendar className="text-blue-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Member Growth */}
            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5 print-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-red-400" />
                Member Growth
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={memberGrowth?.labels?.map((label: string, i: number) => ({
                  month: label,
                  members: memberGrowth?.values?.[i] || 0,
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }} />
                  <Area type="monotone" dataKey="members" stroke="#ef4444" fill="#ef444480" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sales Trend */}
            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5 print-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-yellow-400" />
                Sales Trend (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesTrend?.labels?.map((label: string, i: number) => ({
                  day: label,
                  sales: salesTrend?.values?.[i] || 0,
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }} />
                  <Bar dataKey="sales" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5 print-card">
              <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  layout="vertical"
                  data={topProducts || []}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }} />
                  <Bar dataKey="total_quantity" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Attendance Trend */}
            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5 print-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-400" />
                Attendance Trend
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceTrend?.labels?.map((label: string, i: number) => ({
                  day: label,
                  attendance: attendanceTrend?.values?.[i] || 0,
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }} />
                  <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sales by Payment Type */}
            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5 print-card">
              <h3 className="text-lg font-semibold text-white mb-4">Sales by Payment Type</h3>
              {paymentData.some((item: any) => item.total > 0 || item.count > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="payment_type"
                    >
                      {paymentData.map((index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400">
                  <div className="text-center">
                    <DollarSign size={48} className="mx-auto text-gray-600 mb-2" />
                    <p>No sales data available</p>
                    <p className="text-sm text-gray-500">Sales will appear here once you have transactions</p>
                  </div>
                </div>
              )}
            </div>

            {/* Membership Distribution - FIXED */}
            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5 print-card">
              <h3 className="text-lg font-semibold text-white mb-4">Membership Status</h3>
              {membershipDist && Array.isArray(membershipDist) && membershipDist.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={membershipDist}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="membership_status"
                    >
                      {membershipDist.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.membership_status === 'active' ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400">
                  <div className="text-center">
                    <Users size={48} className="mx-auto text-gray-600 mb-2" />
                    <p>No membership data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5 print-card">
              <p className="text-gray-400 text-sm">Walk-ins (Total)</p>
              <p className="text-2xl font-bold text-white">{overview?.walkins?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Today: {overview?.walkins?.today || 0}</p>
            </div>

            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5 print-card">
              <p className="text-gray-400 text-sm">Attendance (Member vs Walk-in)</p>
              <div className="flex gap-4 mt-1">
                <span className="text-blue-400">
                  Members: {Array.isArray(attendanceDist) ? attendanceDist.find((d: any) => d.type === 'Members')?.count || 0 : 0}
                </span>
                <span className="text-yellow-400">
                  Walk-ins: {Array.isArray(attendanceDist) ? attendanceDist.find((d: any) => d.type === 'Walk-ins')?.count || 0 : 0}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dateRange.start} – {dateRange.end}
              </p>
            </div>

            <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 shadow-xl shadow-red-500/5 print-card">
              <p className="text-gray-400 text-sm">Total Revenue (Period)</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(revenue?.total_revenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dateRange.start} – {dateRange.end}
              </p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5 print-card mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
            {revenue?.breakdown ? (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(revenue.total_revenue || 0)}</p>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-4 text-center border border-blue-500/30">
                  <p className="text-gray-400 text-sm">Product Sales</p>
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(revenue.breakdown.sales || 0)}</p>
                </div>
                <div className="bg-green-900/20 rounded-lg p-4 text-center border border-green-500/30">
                  <p className="text-gray-400 text-sm">Contracts</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(revenue.breakdown.contracts || 0)}</p>
                </div>
                <div className="bg-purple-900/20 rounded-lg p-4 text-center border border-purple-500/30">
                  <p className="text-gray-400 text-sm">Membership Fees</p>
                  <p className="text-2xl font-bold text-purple-400">{formatCurrency(revenue.breakdown.membership_fees || 0)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">No revenue data available</div>
            )}
          </div>

          {/* Contract Status Distribution */}
          <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-red-500/5 print-card">
            <h3 className="text-lg font-semibold text-white mb-4">Contract Status</h3>
            {contractDist && Array.isArray(contractDist) && contractDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contractDist}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {contractDist.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'active' ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e242c', border: '1px solid #374151' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-gray-600 mb-2" />
                  <p>No contract data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};