import type { Attendance } from '../../types/Attendance';
import { X, User, Calendar, Clock } from 'lucide-react';

interface ViewAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance | null;
}

export const ViewAttendanceModal = ({ isOpen, onClose, attendance }: ViewAttendanceModalProps) => {
  if (!isOpen || !attendance) return null;

  const member = attendance.member;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Attendance Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-[#1e242c] p-4 rounded-lg border border-gray-700/30">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xl">
            {member?.firstname?.charAt(0).toUpperCase() || 'M'}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">
              {member ? `${member.firstname} ${member.lastname}` : 'Unknown Member'}
            </p>
            <p className="text-gray-400 text-sm">{member?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 flex items-center gap-1"><Clock size={14} /> Time In</p>
            <p className="text-white">{new Date(attendance.time_in).toLocaleString()}</p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 flex items-center gap-1"><Clock size={14} /> Time Out</p>
            <p className="text-white">{attendance.time_out ? new Date(attendance.time_out).toLocaleString() : '—'}</p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400">Status</p>
            <p className={`font-medium ${attendance.time_out ? 'text-green-400' : 'text-yellow-400'}`}>
              {attendance.time_out ? 'Clocked Out' : 'Clocked In'}
            </p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 flex items-center gap-1"><Calendar size={14} /> Recorded</p>
            <p className="text-white">{new Date(attendance.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-gray-700/20">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};