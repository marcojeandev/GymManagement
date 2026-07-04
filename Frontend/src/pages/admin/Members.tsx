import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { memberApi } from '../../services/memberApi';
import type { Member, MemberFilters } from '../../types/Members';
import { CreateMemberModal } from '../../components/Member/CreateMemberModal';
import { UpdateMemberModal } from '../../components/Member/UpdateMemberModal';
import { ViewMemberModal } from '../../components/Member/ViewMemberModal';
import { DeleteMemberModal } from '../../components/Member/DeleteMemberModal';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Pencil, Trash2, User } from 'lucide-react';

export const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MemberFilters>({
    per_page: 10,
    page: 1,
    search: '',
  });
  const [pagination, setPagination] = useState<any>(null);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [filters]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await memberApi.getMembers(filters);
      setMembers(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilter = (key: keyof MemberFilters, value: string) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const openView = (member: Member) => {
    setSelectedMember(member);
    setViewOpen(true);
  };

  const openUpdate = (member: Member) => {
    setSelectedMember(member);
    setUpdateOpen(true);
  };

  const openDelete = (member: Member) => {
    setSelectedMember(member);
    setDeleteOpen(true);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Shiny Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <User className="w-7 h-7 text-red-500" />
            Members
          </h2>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20"
          >
            <Plus size={18} />
            Add Member
          </button>
        </div>

        {/* Filters – Shiny */}
        <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 mb-6 shadow-xl shadow-red-500/5">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Name, email, contact..."
                  value={filters.search}
                  onChange={handleSearch}
                  className="w-full bg-[#1e242c] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-300 mb-1">Sex</label>
              <select
                value={filters.sex || ''}
                onChange={(e) => handleFilter('sex', e.target.value)}
                className="w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-300 mb-1">Membership</label>
              <select
                value={filters.membership_status || ''}
                onChange={(e) => handleFilter('membership_status', e.target.value)}
                className="w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table – Shiny */}
        <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl shadow-red-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e242c] text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Profile</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Sex</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Contract</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-10 w-10 rounded-full bg-gray-700/40"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-32"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-20 mx-auto"></div></td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No members found</td></tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-700/20 transition group">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold overflow-hidden shadow-md">
                          {member.profile ? (
                            <img src={`http://localhost:8000/storage/${member.profile}`} alt="" className="h-full w-full object-cover" />
                          ) : (
                            member.firstname.charAt(0).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        {member.firstname} {member.lastname}
                        {member.suffix && ` ${member.suffix}`}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{member.email}</td>
                      <td className="px-4 py-3 text-gray-300">+63{member.contact}</td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{member.sex}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.membership_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
                        }`}>
                          {member.membership_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.contract_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
                        }`}>
                          {member.contract_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openView(member)}
                            className="p-1.5 text-blue-400 hover:text-white border border-blue-400/30 hover:bg-blue-500/20 rounded-lg transition group-hover:border-blue-400/60"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openUpdate(member)}
                            className="p-1.5 text-yellow-400 hover:text-white border border-yellow-400/30 hover:bg-yellow-500/20 rounded-lg transition group-hover:border-yellow-400/60"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openDelete(member)}
                            className="p-1.5 text-red-400 hover:text-white border border-red-400/30 hover:bg-red-500/20 rounded-lg transition group-hover:border-red-400/60"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination – Shiny */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
            <span>
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-4 py-1.5 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition border border-gray-700/30"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-4 py-1.5 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition border border-gray-700/30"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateMemberModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={fetchMembers}
        />
        <UpdateMemberModal
          isOpen={updateOpen}
          onClose={() => { setUpdateOpen(false); setSelectedMember(null); }}
          onSuccess={fetchMembers}
          member={selectedMember}
        />
        <ViewMemberModal
          isOpen={viewOpen}
          onClose={() => { setViewOpen(false); setSelectedMember(null); }}
          member={selectedMember}
        />
        <DeleteMemberModal
          isOpen={deleteOpen}
          onClose={() => { setDeleteOpen(false); setSelectedMember(null); }}
          onSuccess={fetchMembers}
          member={selectedMember}
        />
      </div>
    </AdminLayout>
  );
};