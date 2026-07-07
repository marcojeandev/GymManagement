import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { attendanceApi } from '../../../services/cashier/attendanceApi';
import { memberApi } from '../../../services/cashier/memberApi';
import type { Member } from '../../../types/Members';
import { X } from 'lucide-react';

interface CreateAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAttendanceModal = ({ isOpen, onClose, onSuccess }: CreateAttendanceModalProps) => {
  const [form, setForm] = useState({
    members_id: '',
    time_in: '',
    time_out: '',
  });
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMembers();
      // Reset form when modal opens (no member selected yet)
      setForm({ members_id: '', time_in: '', time_out: '' });
      setTodayAttendance(null);
      setIsEditing(false);
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      const response = await memberApi.getMembers({ per_page: 100 });
      const activeMembers = response.data.filter((m: Member) => 
        m.membership_status === 'active' && m.contract_status === 'active'
      );
      setMembers(activeMembers);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  // When member selection changes, fetch today's attendance
  const handleMemberChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setForm((prev) => ({ ...prev, members_id: id, time_in: '', time_out: '' }));
    setTodayAttendance(null);
    setIsEditing(false);

    if (!id) return;

    try {
      // Fetch today's attendance for the selected member
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const response = await attendanceApi.getAttendances({ 
        member_id: parseInt(id), 
        date: today,
        per_page: 1 // we only need the first one (if any)
      });

      const records = response.data || [];
      if (records.length > 0) {
        const record = records[0];
        setTodayAttendance(record);
        setIsEditing(true);

        // Format datetime-local value (YYYY-MM-DDTHH:mm)
        const formatDatetimeLocal = (dateStr: string) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return '';
          return d.toISOString().slice(0, 16);
        };

        setForm((prev) => ({
          ...prev,
          time_in: formatDatetimeLocal(record.time_in),
          time_out: record.time_out ? formatDatetimeLocal(record.time_out) : '',
        }));
      } else {
        // No attendance today – leave fields empty
        setTodayAttendance(null);
        setIsEditing(false);
        setForm((prev) => ({ ...prev, time_in: '', time_out: '' }));
      }
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
      setTodayAttendance(null);
      setIsEditing(false);
      setForm((prev) => ({ ...prev, time_in: '', time_out: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = ['members_id', 'time_in', 'time_out'];
      for (const key of fields) {
        const val = form[key as keyof typeof form];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      await attendanceApi.createAttendance(formData);
      toast.success('Attendance recorded');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ members_id: '', time_in: '', time_out: '' });
    setTodayAttendance(null);
    setIsEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  // Determine button label and action
  const isClockOut = todayAttendance && !todayAttendance.time_out && form.time_out !== '';
  const isClockIn = !todayAttendance || (todayAttendance && todayAttendance.time_out !== null);
  const buttonLabel = isClockOut ? 'Clock Out' : (isClockIn ? 'Clock In' : 'Update');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Manual Attendance Entry
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Member *</label>
            <select
              name="members_id"
              required
              value={form.members_id}
              onChange={handleMemberChange}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            >
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstname} {m.lastname} ({m.email})
                </option>
              ))}
            </select>
            {members.length === 0 && (
              <p className="text-xs text-yellow-500 mt-1">No active members available.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-300">Time Out</label>
              <input
                type="datetime-local"
                name="time_out"
                value={form.time_out}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                {todayAttendance && !todayAttendance.time_out
                  ? 'Leave empty to keep clocked in'
                  : 'Leave empty for clock-in only'}
              </p>
            </div>
          </div>

          {todayAttendance && todayAttendance.time_out === null && (
            <div className="p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg text-yellow-300 text-sm">
              Currently clocked in since {new Date(todayAttendance.time_in).toLocaleString()}.
              {form.time_out ? ' Setting Time Out will clock them out.' : ' Provide Time Out to clock out.'}
            </div>
          )}

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
              disabled={loading || !form.members_id || !form.time_in}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};