import type { WalkinInfo } from '../../../types/WalkinInfo';
import { X, User, Mail, Phone, Calendar, BarChart } from 'lucide-react';

interface ViewWalkinModalProps {
  isOpen: boolean;
  onClose: () => void;
  walkin: WalkinInfo | null;
}

export const ViewWalkinModal = ({ isOpen, onClose, walkin }: ViewWalkinModalProps) => {
  if (!isOpen || !walkin) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Walk-in Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#1e242c] p-4 rounded-lg border border-gray-700/30">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xl">
              {walkin.firstname.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {walkin.firstname} {walkin.middlename} {walkin.lastname} {walkin.suffix}
              </p>
              <p className="text-gray-400 text-sm">
                <User size={14} className="inline mr-1" /> Walk-in
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
              <p className="text-gray-400 flex items-center gap-1"><Mail size={14} /> Email</p>
              <p className="text-white">{walkin.email || '—'}</p>
            </div>
            <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
              <p className="text-gray-400 flex items-center gap-1"><Phone size={14} /> Contact</p>
              <p className="text-white">+63{walkin.contact}</p>
            </div>
            <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
              <p className="text-gray-400 flex items-center gap-1"><BarChart size={14} /> Total Visits</p>
              <p className="text-white">{walkin.total_visits}</p>
            </div>
            <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
              <p className="text-gray-400 flex items-center gap-1"><Calendar size={14} /> First Visit</p>
              <p className="text-white">{new Date(walkin.created_at).toLocaleString()}</p>
            </div>
            <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30 col-span-2">
              <p className="text-gray-400 flex items-center gap-1"><Calendar size={14} /> Last Updated</p>
              <p className="text-white">{new Date(walkin.updated_at).toLocaleString()}</p>
            </div>
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