import { useState, useEffect } from 'react';
import { CashierLayout } from '../../layouts/CashierLayout';
import { memberApi } from '../../services/cashier/memberApi';
import { contractApi } from '../../services/cashier/contractApi';
import type { Member } from '../../types/Members';
import type { Contract } from '../../types/Contract';
import { CreateContractModal } from '../../components/cashier/Contracts/CreateContractModal';
import { MemberContractsModal } from '../../components/cashier/Contracts/MemberContractsModal';
import toast from 'react-hot-toast';
import { Search, Plus, Eye, FilePlus } from 'lucide-react';

// Extend Member to include latest contract range
interface MemberWithContract extends Member {
  latestContractRange: string;
}

export const ContractsPage = () => {
  const [members, setMembers] = useState<MemberWithContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForMember, setCreateForMember] = useState<Member | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [page, search]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const membersResponse = await memberApi.getMembers({ search, per_page: 10, page });
      const membersData = membersResponse.data;

      const contractsResponse = await contractApi.getContracts({ per_page: 1000 });
      const allContracts: Contract[] = contractsResponse?.data || [];

      // Map: memberId → { range: string, toDate: Date }
      const latestContractMap = new Map<number, { range: string; toDate: Date }>();

      function formatRange(contract: Contract): string {
        const from = contract.contract_from ? new Date(contract.contract_from).toLocaleDateString() : '—';
        const to = contract.contract_to ? new Date(contract.contract_to).toLocaleDateString() : '—';
        return `${from} → ${to}`;
      }

      allContracts.forEach(contract => {
        const memberId = contract.members_id;
        const newDate = contract.contract_to ? new Date(contract.contract_to) : new Date(0);
        const existing = latestContractMap.get(memberId);
        if (!existing || newDate > existing.toDate) {
          latestContractMap.set(memberId, { range: formatRange(contract), toDate: newDate });
        }
      });

      const enrichedMembers = membersData.map((member: Member) => ({
        ...member,
        latestContractRange: latestContractMap.get(member.id)?.range || 'No contract',
      }));

      setMembers(enrichedMembers);
      setPagination({
        current_page: membersResponse.current_page,
        last_page: membersResponse.last_page,
        per_page: membersResponse.per_page,
        total: membersResponse.total,
      });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleGlobalAdd = () => {
    setCreateForMember(null);
    setCreateOpen(true);
  };

  const handleMemberAdd = (member: Member) => {
    setCreateForMember(member);
    setCreateOpen(true);
  };

  const openViewContracts = (member: Member) => {
    setSelectedMember(member);
    setViewOpen(true);
  };

  const handleSuccess = () => {
    fetchMembers();
    setCreateOpen(false);
    setCreateForMember(null);
  };

  return (
    <CashierLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Contracts Management
          </h2>
          <button
            onClick={handleGlobalAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20"
          >
            <Plus size={18} />
            Add Contract
          </button>
        </div>

        <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-5 mb-6 shadow-xl shadow-red-500/5">
          <div className="flex gap-4 items-end">
            <div className="flex-1 min-w-[200px] relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">Search Members</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#1e242c] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl shadow-red-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e242c] text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Current Contract</th>
                  <th className="px-4 py-3 text-left">Contract Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-32"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-36"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-700/40 rounded w-20 mx-auto"></div></td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No members found</td></tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-700/20 transition group">
                      <td className="px-4 py-3 text-white font-medium">
                        {member.firstname} {member.lastname}
                        {member.suffix && ` ${member.suffix}`}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{member.email}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {member.latestContractRange}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.contract_status === 'active' 
                            ? 'bg-green-600/30 text-green-300' 
                            : 'bg-red-600/30 text-red-300'
                        }`}>
                          {member.contract_status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openViewContracts(member)}
                            className="flex items-center gap-1 px-3 py-1.5 text-blue-400 hover:text-white border border-blue-400/30 hover:bg-blue-500/20 rounded-lg transition group-hover:border-blue-400/60"
                            title="View Contracts"
                          >
                            <Eye size={16} />
                            <span className="text-xs">View</span>
                          </button>
                          <button
                            onClick={() => handleMemberAdd(member)}
                            className="flex items-center gap-1 px-3 py-1.5 text-green-400 hover:text-white border border-green-400/30 hover:bg-green-500/20 rounded-lg transition group-hover:border-green-400/60"
                            title="Add Contract"
                          >
                            <FilePlus size={16} />
                            <span className="text-xs">Add</span>
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

        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
            <span>Page {pagination.current_page} of {pagination.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="px-4 py-1.5 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition border border-gray-700/30">Previous</button>
              <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="px-4 py-1.5 bg-[#1e242c] rounded-lg disabled:opacity-50 hover:bg-gray-700/30 transition border border-gray-700/30">Next</button>
            </div>
          </div>
        )}

        {/* Modals – FIXED props and key */}
        <CreateContractModal
          key={createForMember?.id || 'global'}
          isOpen={createOpen}
          onClose={() => { setCreateOpen(false); setCreateForMember(null); }}
          onSuccess={handleSuccess}
          initialMember={createForMember} // <-- pass full object
        />
        <MemberContractsModal
          isOpen={viewOpen}
          onClose={() => { setViewOpen(false); setSelectedMember(null); }}
          memberId={selectedMember?.id || null}
          memberName={selectedMember ? `${selectedMember.firstname} ${selectedMember.lastname}` : ''}
        />
      </div>
    </CashierLayout>
  );
};