import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { memberApi } from '../../services/memberApi';
import type { Member, MemberFilters } from '../../types/Members';
import { CreateMemberModal } from '../../components/Member/CreateMemberModal';
import { UpdateMemberModal } from '../../components/Member/UpdateMemberModal';
import { ViewMemberModal } from '../../components/Member/ViewMemberModal';
import { DeleteMemberModal } from '../../components/Member/DeleteMemberModal';
import toast from 'react-hot-toast';

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Members</h2>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            + Add Member
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#14181f] rounded-xl p-4 border border-gray-700/30 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input
              type="text"
              placeholder="Name, email, contact..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-300 mb-1">Sex</label>
            <select
              value={filters.sex || ''}
              onChange={(e) => handleFilter('sex', e.target.value)}
              className="w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#14181f] rounded-xl border border-gray-700/30 overflow-hidden">
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
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No members found</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-700/20 transition">
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold overflow-hidden">
                        {member.profile ? (
                          <img src={`http://localhost:8000/storage/${member.profile}`} alt="" className="h-full w-full object-cover" />
                        ) : (
                          member.firstname.charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {member.firstname} {member.lastname}
                      {member.suffix && ` ${member.suffix}`}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{member.email}</td>
                    <td className="px-4 py-3 text-gray-300">+63{member.contact}</td>
                    <td className="px-4 py-3 text-gray-300 capitalize">{member.sex}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${member.membership_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
                        {member.membership_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${member.contract_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
                        {member.contract_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openView(member)}
                          className="text-blue-400 hover:text-blue-300"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openUpdate(member)}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDelete(member)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <span>
              Showing {pagination.current_page} of {pagination.last_page} pages
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition"
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