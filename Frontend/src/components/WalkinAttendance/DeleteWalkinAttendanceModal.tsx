import { useState } from 'react';
import toast from 'react-hot-toast';
import { walkinAttendanceApi } from '../../services/walkinAttendanceApi';
import type { WalkinAttendance } from '../../types/WalkinAttendance';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteWalkinAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attendance: WalkinAttendance | null;
}

export const DeleteWalkinAttendanceModal = ({ isOpen, onClose, onSuccess, attendance }: DeleteWalkinAttendanceModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!attendance) return;
    setLoading(true);
    try {
      await walkinAttendanceApi.deleteAttendance(attendance.id);
      toast.success('Attendance record deleted');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !attendance) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-md p-6 shadow-2xl shadow-red-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle size={22} className="text-red-400" />
            Confirm Delete
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this attendance record for <span className="text-white font-semibold">{attendance.walkin_info?.firstname || 'Walk-in'}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20 disabled:opacity-70">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};