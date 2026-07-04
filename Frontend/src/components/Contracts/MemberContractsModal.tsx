import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { contractApi } from '../../services/contractApi';
import type { Contract } from '../../types/Contract';
import { UpdateContractModal } from './UpdateContractModal';
import { DeleteContractModal } from './DeleteContractModal';
import { Pencil, Trash2 } from 'lucide-react';

interface MemberContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: number | null;
  memberName: string;
}

export const MemberContractsModal = ({ isOpen, onClose, memberId, memberName }: MemberContractsModalProps) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (isOpen && memberId) {
      fetchContracts();
    }
  }, [isOpen, memberId]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const filters: any = { per_page: 100 };
      if (memberId) {
        filters.member_id = memberId;
      }
      const response = await contractApi.getContracts(filters);
      const contractsData = response?.data || [];
      // Sort by latest (descending)
      const sorted = contractsData.sort((a: Contract, b: Contract) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setContracts(sorted);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const openUpdate = (contract: Contract) => {
    setSelectedContract(contract);
    setUpdateOpen(true);
  };

  const openDelete = (contract: Contract) => {
    setSelectedContract(contract);
    setDeleteOpen(true);
  };

  const handleSuccess = () => {
    fetchContracts();
  };

  const handleClose = () => {
    setUpdateOpen(false);
    setDeleteOpen(false);
    setSelectedContract(null);
    onClose();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            Contracts – {memberName}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading contracts...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No contracts for this member.</div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-[#1e242c] rounded-lg p-4 border border-gray-700/30 flex flex-wrap items-center justify-between gap-2 hover:border-red-500/30 transition"
              >
                <div className="flex-1 min-w-[200px]">
                  {/* Date range as primary */}
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">
                      {formatDate(contract.contract_from)} → {formatDate(contract.contract_to)}
                    </span>
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      contract.payment_status === 'paid' ? 'bg-green-500' :
                      contract.payment_status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {contract.contract_pricing?.title || 'N/A'} · ₱{contract.payment_amount || '0'} · {contract.payment_status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openUpdate(contract)}
                    className="p-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => openDelete(contract)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals inside */}
        <UpdateContractModal
          isOpen={updateOpen}
          onClose={() => { setUpdateOpen(false); setSelectedContract(null); }}
          onSuccess={handleSuccess}
          contract={selectedContract}
        />
        <DeleteContractModal
          isOpen={deleteOpen}
          onClose={() => { setDeleteOpen(false); setSelectedContract(null); }}
          onSuccess={handleSuccess}
          contract={selectedContract}
        />
      </div>
    </div>
  );
};