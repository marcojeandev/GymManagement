import type { Sale } from '../../types/Sale';
import { X, Receipt, User, CreditCard, Calendar } from 'lucide-react';

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0.00';
  }
  return Number(value).toFixed(2);
};

interface ViewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ViewSaleModal = ({ isOpen, onClose, sale }: ViewSaleModalProps) => {
  if (!isOpen || !sale) return null;

  const total = sale.total || sale.product_sold?.reduce((sum, item) => sum + item.quantity * item.price_at_sale, 0) || 0;
  const change = sale.change || Math.max(0, (sale.payment_amount || 0) - total);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Receipt size={24} />
            Sale Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 flex items-center gap-1"><User size={14} /> Paid By</p>
            <p className="text-white">{sale.paid_by}</p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 flex items-center gap-1"><CreditCard size={14} /> Payment Type</p>
            <p className="text-white capitalize">{sale.payment_type}</p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400">OR Number</p>
            <p className="text-white">{sale.or_number || '—'}</p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400">Payment Status</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              sale.payment_status === 'paid' ? 'bg-green-600/30 text-green-300' :
              sale.payment_status === 'pending' ? 'bg-yellow-600/30 text-yellow-300' :
              'bg-red-600/30 text-red-300'
            }`}>
              {sale.payment_status}
            </span>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400">Total</p>
            <p className="text-white">₱{formatCurrency(total)}</p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30">
            <p className="text-gray-400">Payment Amount</p>
            <p className="text-white">₱{formatCurrency(sale.payment_amount)}</p>
          </div>
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30 col-span-2">
            <p className="text-gray-400">Change</p>
            <p className="text-white text-green-400">₱{formatCurrency(change)}</p>
          </div>
          {sale.transaction_id && (
            <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30 col-span-2">
              <p className="text-gray-400">Transaction ID</p>
              <p className="text-white">{sale.transaction_id}</p>
            </div>
          )}
          <div className="bg-[#1e242c] p-3 rounded-lg border border-gray-700/30 col-span-2">
            <p className="text-gray-400 flex items-center gap-1"><Calendar size={14} /> Date</p>
            <p className="text-white">{new Date(sale.created_at).toLocaleString()}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3">Products</h3>
        <div className="bg-[#1e242c] rounded-lg border border-gray-700/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#12181f] text-gray-400">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {sale.product_sold?.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-white">{item.product?.name || 'Unknown'}</td>
                  <td className="px-4 py-2 text-gray-300 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-gray-300 text-right">₱{item.price_at_sale}</td>
                  <td className="px-4 py-2 text-gray-300 text-right">₱{(item.quantity * item.price_at_sale).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-[#12181f]">
                <td colSpan={3} className="px-4 py-2 text-right font-semibold text-white">Total</td>
                <td className="px-4 py-2 text-right font-semibold text-white">₱{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
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