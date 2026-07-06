import { X, User, Mail, Phone, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface MemberScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    contact: string;
    profile: string | null;
    contract_status: 'active' | 'expired' | 'pending';
    membership_status: string;
  } | null;
  loading?: boolean;
  action: 'clock_in' | 'clock_out' | null;
}

export const MemberScanResultModal = ({
  isOpen,
  onClose,
  onConfirm,
  member,
  loading = false,
  action,
}: MemberScanResultModalProps) => {
  if (!isOpen || !member) return null;

  const isActive = member.contract_status === 'active';
  const statusColor = isActive ? 'border-green-500 shadow-green-500/30' : 'border-red-500 shadow-red-500/30';
  const statusText = isActive ? 'Active Contract' : 'Inactive Contract';
  const statusIcon = isActive ? <CheckCircle className="text-green-400" size={20} /> : <XCircle className="text-red-400" size={20} />;

  const profileImage = member.profile
    ? `http://localhost:8000/storage/${member.profile}`
    : `https://ui-avatars.com/api/?name=${member.firstname}+${member.lastname}&background=ef4444&color=fff&size=128`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-md p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Member Found</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        {/* Member Profile */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`h-20 w-20 rounded-full border-4 ${statusColor} shadow-lg flex-shrink-0 overflow-hidden`}>
            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">
              {member.firstname} {member.lastname}
            </p>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Mail size={14} /> {member.email}
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Phone size={14} /> +63{member.contact}
            </div>
          </div>
        </div>

        {/* Contract Status */}
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${isActive ? 'border-green-500/30 bg-green-600/10' : 'border-red-500/30 bg-red-600/10'} mb-4`}>
          {statusIcon}
          <span className={`font-medium ${isActive ? 'text-green-400' : 'text-red-400'}`}>
            {statusText}
          </span>
          <span className="text-gray-400 text-sm ml-auto">
            {member.membership_status === 'active' ? 'Membership Active' : 'Membership Inactive'}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-300 shadow-lg ${
            action === 'clock_in'
              ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
              : action === 'clock_out'
              ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
          } text-white disabled:opacity-70`}
        >
          {loading ? 'Processing...' : action === 'clock_in' ? 'Clock In' : action === 'clock_out' ? 'Clock Out' : 'Confirm'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          {action === 'clock_in' ? 'You are about to clock in this member.' : action === 'clock_out' ? 'You are about to clock out this member.' : ''}
        </p>
      </div>
    </div>
  );
};