import type { Contract } from '../../../types/Contract';

interface ViewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

export const ViewContractModal = ({ isOpen, onClose, contract }: ViewContractModalProps) => {
  if (!isOpen || !contract) return null;

  const pricing = contract.contract_pricing;
  const member = contract.member;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Contract Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">Member</p>
            <p className="text-white font-semibold">
              {member ? `${member.firstname} ${member.lastname}${member.suffix ? ' ' + member.suffix : ''}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Plan</p>
            <p className="text-white">{pricing?.title || 'N/A'}</p>
            {pricing && (
              <p className="text-gray-300 text-sm">₱{pricing.price} / {pricing.duration_months} month(s)</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Payment Type</p>
              <p className="text-white capitalize">{contract.payment_type}</p>
            </div>
            <div>
              <p className="text-gray-400">Amount</p>
              <p className="text-white">{contract.payment_amount ? '₱' + contract.payment_amount : '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">OR Number</p>
              <p className="text-white">{contract.or_number || '—'}</p>
            </div>
            {contract.transaction_id && (
              <div>
                <p className="text-gray-400">Transaction ID</p>
                <p className="text-white">{contract.transaction_id}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400">Payment Status</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                contract.payment_status === 'paid' ? 'bg-green-600/30 text-green-300' :
                contract.payment_status === 'pending' ? 'bg-yellow-600/30 text-yellow-300' :
                'bg-red-600/30 text-red-300'
              }`}>
                {contract.payment_status}
              </span>
            </div>
            <div>
              <p className="text-gray-400">Member Status</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                member?.contract_status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
              }`}>
                {member?.contract_status || 'unknown'}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Period</p>
              <p className="text-white">
                {contract.contract_from ? new Date(contract.contract_from).toLocaleDateString() : 'N/A'}
                {' → '}
                {contract.contract_to ? new Date(contract.contract_to).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};