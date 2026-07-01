import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Members = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      // Mocking for now, replace with actual call if backend is ready
      // const res = await adminService.getMembers();
      // setMembers(res.data);
      setTimeout(() => {
        setMembers([
          { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', status: 'Active' },
          { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', status: 'Inactive' },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      toast.error('Failed to fetch members');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Members Management</h1>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20">
          <Plus size={20} />
          Add Member
        </button>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading members...</td>
                </tr>
              ) : members.map((member) => (
                <tr key={member.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{member.first_name} {member.last_name}</td>
                  <td className="px-6 py-4">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      {member.status}
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

export default Members;
