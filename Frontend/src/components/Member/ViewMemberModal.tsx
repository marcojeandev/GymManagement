import { useState, useEffect } from 'react';
import type { Member } from '../../types/Members';
import { QRCodeSVG } from 'qrcode.react';
import { X, MapPin, Mail, Phone, User, Calendar, CreditCard } from 'lucide-react';
import { systemSettingsApi } from '../../services/systemSettingsApi';
import type { MembershipPrice } from '../../services/systemSettingsApi';

interface ViewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const ViewMemberModal = ({ isOpen, onClose, member }: ViewMemberModalProps) => {
  const [plan, setPlan] = useState<MembershipPrice | null>(null);

  useEffect(() => {
    if (isOpen && member?.membership_fee) {
      systemSettingsApi.getMembershipPrice().then((data) => {
        setPlan(data);
      });
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const fee = member.membership_fee;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Member Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden ring-2 ring-red-500/30">
            {member.profile ? (
              <img src={`http://localhost:8000/storage/${member.profile}`} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              member.firstname.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-xl font-semibold text-white">
              {member.firstname} {member.middlename} {member.lastname} {member.suffix}
            </p>
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <Mail size={16} />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Phone size={16} />
              <span>+63{member.contact}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 flex items-center gap-1"><User size={14} /> Sex</p>
            <p className="text-white capitalize">{member.sex}</p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 flex items-center gap-1"><Calendar size={14} /> Membership</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              member.membership_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
            }`}>
              {member.membership_status}
            </span>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 flex items-center gap-1"><Calendar size={14} /> Contract</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              member.contract_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
            }`}>
              {member.contract_status}
            </span>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30 col-span-2">
            <p className="text-gray-400 flex items-center gap-1"><MapPin size={14} /> Address</p>
            <p className="text-white">{member.address}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-4 flex flex-col items-center bg-[#1e242c] p-4 rounded-lg border border-gray-700/30">
          <p className="text-gray-400 text-sm mb-2">QR Code</p>
          <div className="bg-white p-2 rounded-lg inline-block shadow-lg">
            <QRCodeSVG
              value={member.qr_code}
              size={120}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin
            />
          </div>
          <p className="text-gray-500 text-xs mt-1 font-mono">{member.qr_code}</p>
        </div>

        {fee && (
          <>
            <hr className="border-gray-700 my-4" />
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CreditCard size={20} className="text-red-400" />
              Membership Fee
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              {/* Plan - now shows description + price */}
              <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
                <p className="text-gray-400">Plan</p>
                <p className="text-white">
                  {plan ? `${plan.description} (₱${plan.price})` : 'Loading...'}
                </p>
              </div>
              <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
                <p className="text-gray-400">Payment Type</p>
                <p className="text-white capitalize">{fee.payment_type}</p>
              </div>
              <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
                <p className="text-gray-400">Amount</p>
                <p className="text-white">₱{fee.payment_amount}</p>
              </div>
              <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
                <p className="text-gray-400">OR Number</p>
                <p className="text-white">{fee.or_number}</p>
              </div>
              {fee.transaction_id && (
                <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30 col-span-2">
                  <p className="text-gray-400">Transaction ID</p>
                  <p className="text-white">{fee.transaction_id}</p>
                </div>
              )}
              <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
                <p className="text-gray-400">Payment Status</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  fee.payment_status === 'paid' ? 'bg-green-600/30 text-green-300' :
                  fee.payment_status === 'pending' ? 'bg-yellow-600/30 text-yellow-300' :
                  'bg-red-600/30 text-red-300'
                }`}>
                  {fee.payment_status}
                </span>
              </div>
              {fee.paid_at && (
                <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
                  <p className="text-gray-400">Paid At</p>
                  <p className="text-white">{new Date(fee.paid_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-gray-700/20">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};