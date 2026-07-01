import { Users, FileText, ShoppingCart, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) => (
  <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      <div className="bg-gray-900/80 p-3 rounded-xl text-red-400 border border-gray-700/50 shadow-inner">
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-emerald-400 flex items-center gap-1 font-medium bg-emerald-400/10 px-2 py-1 rounded-md">
        <TrendingUp size={14} />
        {trend}
      </span>
      <span className="text-gray-500 ml-2">vs last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Members" value="1,248" icon={<Users size={24} />} trend="+12%" />
        <StatCard title="Active Contracts" value="984" icon={<FileText size={24} />} trend="+5%" />
        <StatCard title="Monthly Revenue" value="$42,500" icon={<ShoppingCart size={24} />} trend="+18%" />
        <StatCard title="Walk-ins Today" value="24" icon={<Users size={24} />} trend="+2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 h-[400px] flex items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
           <div className="text-center z-10">
              <TrendingUp className="mx-auto text-gray-500 mb-4 opacity-50" size={48} />
              <h3 className="text-xl text-gray-400 font-medium">Revenue Chart Area</h3>
              <p className="text-gray-600 text-sm mt-2">Implementation of charting library (e.g., Recharts) goes here</p>
           </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-700/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">New member joined</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
