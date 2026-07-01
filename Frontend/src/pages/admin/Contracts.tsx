import { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

const Contracts = () => {
  const [contracts] = useState([
    { id: 1, member_name: 'John Doe', type: 'Annual', start_date: '2026-01-01', end_date: '2026-12-31', status: 'Active', price: '$500' },
    { id: 2, member_name: 'Jane Smith', type: 'Monthly', start_date: '2026-07-01', end_date: '2026-08-01', status: 'Pending', price: '$50' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Contracts</h1>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20">
          <Plus size={20} />
          New Contract
        </button>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search contracts..." 
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{contract.member_name}</td>
                  <td className="px-6 py-4">{contract.type}</td>
                  <td className="px-6 py-4">{contract.start_date} to {contract.end_date}</td>
                  <td className="px-6 py-4 text-emerald-400 font-medium">{contract.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      contract.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button className="text-gray-400 hover:text-blue-400 transition-colors p-1 bg-gray-800 rounded-md hover:bg-gray-700">
                      <Edit2 size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-red-400 transition-colors p-1 bg-gray-800 rounded-md hover:bg-gray-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
