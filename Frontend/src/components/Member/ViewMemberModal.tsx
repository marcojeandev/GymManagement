import type { Member } from '../../types/Members';

interface ViewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const ViewMemberModal = ({ isOpen, onClose, member }: ViewMemberModalProps) => {
  if (!isOpen || !member) return null;

  const fee = member.membership_fee;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Member Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden">
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
            <p className="text-gray-400">{member.email}</p>
            <p className="text-gray-400">+63{member.contact}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Sex</p>
            <p className="text-white capitalize">{member.sex}</p>
          </div>
          <div>
            <p className="text-gray-400">QR Code</p>
            <p className="text-white font-mono">{member.qr_code}</p>
          </div>
          <div>
            <p className="text-gray-400">Membership Status</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${member.membership_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
              {member.membership_status}
            </span>
          </div>
          <div>
            <p className="text-gray-400">Contract Status</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${member.contract_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
              {member.contract_status}
            </span>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400">Address</p>
            <p className="text-white">{member.address}</p>
          </div>
        </div>

        {fee && (
          <>
            <hr className="border-gray-700 my-4" />
            <h3 className="text-lg font-semibold text-white mb-3">Membership Fee</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Plan</p>
                <p className="text-white">Plan ID: {fee.membership_id}</p>
              </div>
              <div>
                <p className="text-gray-400">Payment Type</p>
                <p className="text-white capitalize">{fee.payment_type}</p>
              </div>
              <div>
                <p className="text-gray-400">Amount</p>
                <p className="text-white">₱{fee.payment_amount}</p>
              </div>
              <div>
                <p className="text-gray-400">OR Number</p>
                <p className="text-white">{fee.or_number}</p>
              </div>
              {fee.transaction_id && (
                <div>
                  <p className="text-gray-400">Transaction ID</p>
                  <p className="text-white">{fee.transaction_id}</p>
                </div>
              )}
              <div>
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
                <div>
                  <p className="text-gray-400">Paid At</p>
                  <p className="text-white">{new Date(fee.paid_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};