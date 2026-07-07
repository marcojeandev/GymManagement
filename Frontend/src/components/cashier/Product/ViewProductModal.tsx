import type { Product } from '../../../types/Product';
import { X, Package, DollarSign, Tag, ShoppingCart, Archive } from 'lucide-react';

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ViewProductModal = ({ isOpen, onClose, product }: ViewProductModalProps) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Product Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {product.image ? (
              <img
                src={`http://localhost:8000/storage/${product.image}`}
                alt={product.name}
                className="h-32 w-32 object-cover rounded-xl border border-gray-600"
              />
            ) : (
              <div className="h-32 w-32 rounded-xl bg-gray-700 flex items-center justify-center text-gray-400">
                <Package size={48} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">{product.name}</h3>
            <p className="text-gray-400 mt-1">{product.description || 'No description'}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-300">
                <DollarSign size={16} className="text-green-400" />
                <span>₱{product.price}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Tag size={16} className="text-blue-400" />
                <span>Qty: {product.quantity}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <ShoppingCart size={16} className="text-yellow-400" />
                <span>Sold: {product.sold}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Archive size={16} className="text-red-400" />
                <span>In Stock: {product.quantity - product.sold}</span>
              </div>
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