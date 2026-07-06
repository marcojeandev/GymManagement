import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { contractApi } from '../../services/contractApi';
import type { ContractPricing } from '../../types/Contract';
import type { Member } from '../../types/Members';
import { MemberSearchSelect } from './MemberSearchSelect';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMember?: Member | null;
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

export const CreateContractModal = ({ isOpen, onClose, onSuccess, initialMember }: CreateContractModalProps) => {
  const [form, setForm] = useState(initialForm);
  const [pricing, setPricing] = useState<ContractPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const isFixedMember = !!initialMember;
  const [selectedPricing, setSelectedPricing] = useState<ContractPricing | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPricing();
      const orNum = 'OR-' + Date.now().toString().slice(-8);
      setForm((prev) => ({ ...prev, or_number: orNum }));
      if (initialMember) {
        setForm((prev) => ({ ...prev, members_id: String(initialMember.id) }));
      }
    }
  }, [isOpen, initialMember]);

  const loadPricing = async () => {
    try {
      const data = await contractApi.getContractPricing();
      setPricing(data);
      if (data.length === 1) {
        const plan = data[0];
        setForm((prev) => ({ ...prev, contract_id: String(plan.id) }));
        setSelectedPricing(plan);
      }
    } catch (error) {
      toast.error('Failed to load contract plans');
    }
  };

  // When contract_id changes, update selectedPricing
  useEffect(() => {
    if (form.contract_id && pricing.length > 0) {
      const found = pricing.find(p => p.id === parseInt(form.contract_id));
      setSelectedPricing(found || null);
    } else {
      setSelectedPricing(null);
    }
  }, [form.contract_id, pricing]);

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

  // Compute total, payment amount, change – ensure numbers
  const total = Number(selectedPricing?.price) || 0;
  const paymentAmount = Number(form.payment_amount) || 0;
  const change = Math.max(0, paymentAmount - total);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: if payment_amount is entered, must be >= total
    if (form.payment_amount && paymentAmount < total) {
      toast.error('Payment amount must be at least the total amount');
      return;
    }
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
    setSelectedPricing(null);
    onClose();
  };

  if (!isOpen) return null;

  const memberName = initialMember
    ? [initialMember.firstname, initialMember.middlename, initialMember.lastname, initialMember.suffix]
        .filter(Boolean).join(' ')
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            {isFixedMember ? 'Add Contract' : 'Create Contract'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                {memberName}
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
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Contract To</label>
              <input
                type="date"
                name="contract_to"
                value={form.contract_to}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>

          {/* Total / Payment / Change row – fixed with Number() and fallback */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#1e242c] p-4 rounded-lg border border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-400">Total</label>
              <div className="text-xl font-bold text-white">₱{total.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Payment Amount</label>
              <div className="text-xl font-bold text-yellow-400">₱{paymentAmount.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Change</label>
              <div className={`text-xl font-bold ${change > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                ₱{change.toFixed(2)}
              </div>
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
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/30">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20 disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};