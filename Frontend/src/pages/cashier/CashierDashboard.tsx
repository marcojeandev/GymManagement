// pages/cashier/Dashboard.tsx or wherever this component is

import { useState, useEffect } from 'react';
import { CashierLayout } from '../../layouts/CashierLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface DashboardData {
  total_sales?: number;
  pending_orders?: number;
  total_members?: number;
  today_attendance?: number;
  // Add other fields based on your API response
}

export const CashierDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    total_sales: 0,
    pending_orders: 0,
    total_members: 0,
    today_attendance: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cashier/dashboard');
      if (response.data.status === 1) {
        setData(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      toast.error(error.response?.data?.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CashierLayout>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Cashier Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </CashierLayout>
    );
  }

  return (
    <CashierLayout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Cashier Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Sales */}
          <div className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30">
            <h3 className="text-gray-400 text-sm">Today's Sales</h3>
            <p className="text-3xl font-bold text-white mt-1">
              ₱{data.total_sales?.toLocaleString() || '0'}
            </p>
          </div>

          {/* Pending Orders */}
          <div className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30">
            <h3 className="text-gray-400 text-sm">Pending Orders</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {data.pending_orders || 0}
            </p>
          </div>

          {/* Total Members */}
          <div className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30">
            <h3 className="text-gray-400 text-sm">Total Members</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {data.total_members || 0}
            </p>
          </div>

          {/* Today's Attendance */}
          <div className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30">
            <h3 className="text-gray-400 text-sm">Today's Attendance</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {data.today_attendance || 0}
            </p>
          </div>
        </div>

        {/* Optional: Add more sections like recent activity, sales chart, etc. */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30">
            <h3 className="text-white font-semibold mb-4">Recent Sales</h3>
            <p className="text-gray-400 text-sm">No recent sales to display</p>
          </div>
          <div className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30">
            <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                New Member
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                New Sale
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                Check In
              </button>
            </div>
          </div>
        </div>
      </div>
    </CashierLayout>
  );
};