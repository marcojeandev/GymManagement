import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { contractApi } from '../../services/contractApi';
import type { Contract, ContractPricing } from '../../types/Contract';

interface UpdateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contract: Contract | null;
}

export const UpdateContractModal = ({ isOpen, onClose, onSuccess, contract }: UpdateContractModalProps) => {
  const [form, setForm] = useState<any>(null);
  const [pricing, setPricing] = useState<ContractPricing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contract) {
      loadPricing();
      // Format dates to YYYY-MM-DD for input[type="date"]
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      };

      setForm({
        members_id: contract.members_id,
        contract_id: contract.contract_id,
        contract_from: formatDate(contract.contract_from),
        contract_to: formatDate(contract.contract_to),
        payment_type: contract.payment_type,
        payment_amount: contract.payment_amount || '',
        or_number: contract.or_number || '',
        transaction_id: contract.transaction_id || '',
        payment_status: contract.payment_status,
        paid_at: contract.paid_at ? new Date(contract.paid_at).toISOString().slice(0, 16) : '',
      });
    }
  }, [isOpen, contract]);

  const loadPricing = async () => {
    try {
      const data = await contractApi.getContractPricing();
      setPricing(data);
    } catch (error) {
      toast.error('Failed to load contract plans');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setForm((prev: any) => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = [
        'members_id', 'contract_id', 'contract_from', 'contract_to',
        'payment_type', 'payment_amount', 'or_number', 'transaction_id',
        'payment_status', 'paid_at'
      ];
      for (const key of fields) {
        const val = form[key];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      await contractApi.updateContract(contract.id, formData);
      toast.success('Contract updated successfully');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(null);
    setPricing([]);
    onClose();
  };

  if (!isOpen || !form) return null;

  const memberName = contract?.member 
    ? `${contract.member.firstname} ${contract.member.lastname}` 
    : `Member #${form.members_id}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Update Contract</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Member – read-only */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Member</label>
            <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white">
              {memberName}
              <input type="hidden" name="members_id" value={form.members_id} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Contract Plan *</label>
            <select
              name="contract_id"
              required
              value={form.contract_id}
              onChange={handleChange}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select plan</option>
              {pricing.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} (₱{p.price} / {p.duration_months} mo)
                </option>
              ))}
            </select>
            {pricing.length === 0 && <p className="text-xs text-yellow-500 mt-1">No contract plans set.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Contract From</label>
              <input
                type="date"
                name="contract_from"
                value={form.contract_from}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Contract To</label>
              <input
                type="date"
                name="contract_to"
                value={form.contract_to}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Type *</label>
              <select
                name="payment_type"
                required
                value={form.payment_type}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Amount</label>
              <input
                type="number"
                step="0.01"
                name="payment_amount"
                value={form.payment_amount}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">OR Number</label>
              <input
                type="text"
                name="or_number"
                value={form.or_number}
                readOnly
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
            </div>
            {form.payment_type === 'gcash' && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Transaction ID</label>
                <input
                  type="text"
                  name="transaction_id"
                  value={form.transaction_id}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Status *</label>
              <select
                name="payment_status"
                required
                value={form.payment_status}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Paid At</label>
              <input
                type="datetime-local"
                name="paid_at"
                value={form.paid_at}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70">
              {loading ? 'Updating...' : 'Update Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};