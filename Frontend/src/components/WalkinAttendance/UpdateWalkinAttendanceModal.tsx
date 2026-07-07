import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { walkinAttendanceApi } from '../../services/admin/walkinAttendanceApi';
import { walkinApi } from '../../services/admin/walkinApi';
import { memberApi } from '../../services/admin/memberApi';
import type { WalkinInfo } from '../../types/WalkinInfo';
import type { Member } from '../../types/Members';
import type { WalkinAttendance } from '../../types/WalkinAttendance';
import { X } from 'lucide-react';

interface UpdateWalkinAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attendance: WalkinAttendance | null;
}

export const UpdateWalkinAttendanceModal = ({ isOpen, onClose, onSuccess, attendance }: UpdateWalkinAttendanceModalProps) => {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [walkins, setWalkins] = useState<WalkinInfo[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadWalkins();
      loadMembers();
      if (attendance) {
        const type = attendance.walk_in_id ? 'walkin' : 'member';
        setForm({
          type,
          walk_in_id: attendance.walk_in_id || '',
          members_id: attendance.members_id || '',
          time_in: new Date(attendance.time_in).toISOString().slice(0, 16),
          fee_paid: attendance.fee_paid.toString(),
        });
      }
    }
  }, [isOpen, attendance]);

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
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: 'walkin' | 'member') => {
    setForm((prev: any) => ({
      ...prev,
      type,
      walk_in_id: '',
      members_id: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendance) return;
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = ['time_in', 'fee_paid'];
      for (const key of fields) {
        const val = form[key];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      if (form.type === 'walkin') {
        formData.append('walk_in_id', String(form.walk_in_id));
      } else {
        formData.append('members_id', String(form.members_id));
      }
      await walkinAttendanceApi.updateAttendance(attendance.id, formData);
      toast.success('Attendance updated');
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
    onClose();
  };

  if (!isOpen || !form) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Update Walk-in Attendance
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="block text-sm font-medium text-gray-300">Fee Paid (₱) *</label>
            <input
              type="number"
              step="0.01"
              name="fee_paid"
              required
              min="0"
              value={form.fee_paid}
              onChange={handleChange}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
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
              {loading ? 'Updating...' : 'Update Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};