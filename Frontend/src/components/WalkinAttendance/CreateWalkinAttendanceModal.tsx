import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { walkinAttendanceApi } from '../../services/admin/walkinAttendanceApi';
import { walkinApi } from '../../services/admin/walkinApi';
import { memberApi } from '../../services/admin/memberApi';
import type { WalkinInfo } from '../../types/WalkinInfo';
import type { Member } from '../../types/Members';
import { X } from 'lucide-react';

interface CreateWalkinAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ✅ Walk-in fee (you can change this or fetch from settings)
const WALKIN_FEE = 100;

export const CreateWalkinAttendanceModal = ({ isOpen, onClose, onSuccess }: CreateWalkinAttendanceModalProps) => {
  const [form, setForm] = useState({
    type: 'walkin' as 'walkin' | 'member',
    walk_in_id: '',
    members_id: '',
    time_in: '',
    fee_paid: '',
    payment_amount: '', // ✅ Added payment amount
  });
  const [loading, setLoading] = useState(false);
  const [walkins, setWalkins] = useState<WalkinInfo[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadWalkins();
      loadMembers();
      const now = new Date();
      const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setForm((prev) => ({ ...prev, time_in: localTime }));
    }
  }, [isOpen]);

  const loadWalkins = async () => {
    try {
      const response = await walkinApi.getWalkins({ per_page: 100 });
      setWalkins(response.data);
    } catch (error) {
      toast.error('Failed to load walk-in records');
    }
  };

  const loadMembers = async () => {
    try {
      const response = await memberApi.getMembers({ per_page: 100 });
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: 'walkin' | 'member') => {
    setForm((prev) => ({
      ...prev,
      type,
      walk_in_id: '',
      members_id: '',
    }));
  };

  // ✅ Calculate change (frontend only)
  const calculateChange = () => {
    const total = WALKIN_FEE; // Walk-in fee is fixed
    const payment = Number(form.payment_amount) || 0;
    const change = payment - total;
    return change > 0 ? change.toFixed(2) : '0.00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = ['time_in', 'fee_paid'];
      for (const key of fields) {
        const val = form[key as keyof typeof form];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      if (form.type === 'walkin') {
        formData.append('walk_in_id', String(form.walk_in_id));
      } else {
        formData.append('members_id', String(form.members_id));
      }
      await walkinAttendanceApi.createAttendance(formData);
      toast.success('Attendance recorded');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      type: 'walkin',
      walk_in_id: '',
      members_id: '',
      time_in: '',
      fee_paid: '',
      payment_amount: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Record Walk-in Attendance
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Person Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('walkin')}
                className={`px-4 py-2 rounded-lg transition ${
                  form.type === 'walkin'
                    ? 'bg-red-600/20 text-white border border-red-500'
                    : 'bg-[#1e242c] text-gray-400 hover:text-white border border-gray-600'
                }`}
              >
                Walk-in
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('member')}
                className={`px-4 py-2 rounded-lg transition ${
                  form.type === 'member'
                    ? 'bg-red-600/20 text-white border border-red-500'
                    : 'bg-[#1e242c] text-gray-400 hover:text-white border border-gray-600'
                }`}
              >
                Member
              </button>
            </div>
          </div>

          {/* Walk-in select */}
          {form.type === 'walkin' && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Walk-in *</label>
              <select
                name="walk_in_id"
                required
                value={form.walk_in_id}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                <option value="">Select walk-in</option>
                {walkins.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.firstname} {w.lastname} {w.suffix || ''} - {w.email || w.contact}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Member select */}
          {form.type === 'member' && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Member *</label>
              <select
                name="members_id"
                required
                value={form.members_id}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                <option value="">Select member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstname} {m.lastname} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300">Time In *</label>
            <input
              type="datetime-local"
              name="time_in"
              required
              value={form.time_in}
              onChange={handleChange}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>

          {/* ✅ PRICE (Total Amount) - Display Only */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Total Amount (Price)</label>
            <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white">
              ₱{WALKIN_FEE.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Walk-in fee (fixed)</p>
          </div>

          {/* ✅ PAYMENT AMOUNT - Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Payment Amount</label>
            <input
              type="number"
              step="0.01"
              name="payment_amount"
              value={form.payment_amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">Amount paid by customer</p>
          </div>

          {/* ✅ CHANGE - Display Only */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Change</label>
            <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-green-400 font-semibold">
              ₱{calculateChange()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Payment Amount - Total Amount</p>
          </div>

          {/* ✅ FEE PAID (hidden or kept for backend) */}
          <input type="hidden" name="fee_paid" value={form.fee_paid} />

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
              {loading ? 'Recording...' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};