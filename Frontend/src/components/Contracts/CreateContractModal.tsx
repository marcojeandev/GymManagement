import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { contractApi } from '../../services/contractApi';
import type { ContractPricing } from '../../types/Contract';
import { MemberSearchSelect } from './MemberSearchSelect';
import { memberApi } from '../../services/memberApi';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMemberId?: number | null;
}

const initialForm = {
  members_id: '',
  contract_id: '',
  contract_from: '',
  contract_to: '',
  payment_type: 'cash' as 'cash' | 'gcash',
  payment_amount: '',
  or_number: '',
  transaction_id: '',
  payment_status: 'pending' as 'pending' | 'paid' | 'failed',
  paid_at: '',
};

export const CreateContractModal = ({ isOpen, onClose, onSuccess, initialMemberId }: CreateContractModalProps) => {
  const [form, setForm] = useState(initialForm);
  const [pricing, setPricing] = useState<ContractPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberName, setMemberName] = useState<string>('');
  const isFixedMember = !!initialMemberId;

  useEffect(() => {
    if (isOpen) {
      loadPricing();
      const orNum = 'OR-' + Date.now().toString().slice(-8);
      setForm((prev) => ({ ...prev, or_number: orNum }));
      if (initialMemberId) {
        setForm((prev) => ({ ...prev, members_id: String(initialMemberId) }));
        // Fetch member name
        fetchMemberName(initialMemberId);
      }
    }
  }, [isOpen, initialMemberId]);

  const fetchMemberName = async (id: number) => {
    try {
      const response = await memberApi.getMember(id);
      const member = response.data;
      setMemberName(`${member.firstname} ${member.lastname}${member.suffix ? ' ' + member.suffix : ''}`);
    } catch (error) {
      setMemberName(`Member #${id}`);
    }
  };

  const loadPricing = async () => {
    try {
      const data = await contractApi.getContractPricing();
      setPricing(data);
      if (data.length === 1) {
        setForm((prev) => ({ ...prev, contract_id: String(data[0].id) }));
      }
    } catch (error) {
      toast.error('Failed to load contract plans');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setForm((prev) => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMemberSelect = (id: number | '') => {
    setForm((prev) => ({ ...prev, members_id: String(id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = [
        'members_id', 'contract_id', 'contract_from', 'contract_to',
        'payment_type', 'payment_amount', 'or_number', 'transaction_id',
        'payment_status', 'paid_at'
      ];
      for (const key of fields) {
        const val = form[key as keyof typeof form];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      await contractApi.createContract(formData);
      toast.success('Contract created successfully');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setPricing([]);
    setMemberName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isFixedMember ? 'Add Contract' : 'Create Contract'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Member field */}
          {!isFixedMember ? (
            <div>
              <label className="block text-sm font-medium text-gray-300">Member *</label>
              <MemberSearchSelect
                value={form.members_id ? parseInt(form.members_id) : ''}
                onChange={handleMemberSelect}
                placeholder="Search member by name or email..."
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300">Member</label>
              <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white">
                {memberName || 'Loading...'}
                <input type="hidden" name="members_id" value={form.members_id} />
              </div>
            </div>
          )}

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
              {loading ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};