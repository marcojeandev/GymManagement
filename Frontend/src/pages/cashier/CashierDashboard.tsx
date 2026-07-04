import { CashierLayout } from '../../layouts/CashierLayout';

export const CashierDashboard = () => {
  return (
    <CashierLayout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Cashier Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30">
            <h3 className="text-gray-400 text-sm">Today's Sales</h3>
            <p className="text-3xl font-bold text-white mt-1">₱0</p>
          </div>
          <div className="bg-[#14181f] rounded-xl p-5 border border-gray-700/30">
            <h3 className="text-gray-400 text-sm">Pending Orders</h3>
            <p className="text-3xl font-bold text-white mt-1">0</p>
          </div>
        </div>
      </div>
    </CashierLayout>
  );
};