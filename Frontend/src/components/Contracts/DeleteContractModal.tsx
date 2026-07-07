import { useState } from 'react';
import toast from 'react-hot-toast';
import { contractApi } from '../../services/admin/contractApi';
import type { Contract } from '../../types/Contract';

interface DeleteContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contract: Contract | null;
}

export const DeleteContractModal = ({ isOpen, onClose, onSuccess, contract }: DeleteContractModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      await contractApi.deleteContract(contract.id);
      toast.success('Contract deleted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-white mb-2">Confirm Delete</h2>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this contract for <span className="text-white font-semibold">{contract.member?.firstname || ''} {contract.member?.lastname || ''}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};