import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { saleApi } from '../../services/admin/saleApi';
import { productApi } from '../../services/admin/productApi';
import type { Product } from '../../types/Product';
import type { Sale } from '../../types/Sale';
import { X, Plus, Trash2 } from 'lucide-react';

interface UpdateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sale: Sale | null;
}

export const UpdateSaleModal = ({ isOpen, onClose, onSuccess, sale }: UpdateSaleModalProps) => {
  const [form, setForm] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen && sale) {
      loadProducts();
      setForm({
        paid_by: sale.paid_by,
        payment_type: sale.payment_type,
        or_number: sale.or_number || '',
        transaction_id: sale.transaction_id || '',
        payment_status: sale.payment_status,
        payment_amount: sale.payment_amount !== null ? sale.payment_amount.toString() : '', // ensure string
        products: sale.product_sold?.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_sale: item.price_at_sale,
        })) || [],
      });
    }
  }, [isOpen, sale]);

  const loadProducts = async () => {
    try {
      const response = await productApi.getProducts({ per_page: 100 });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    const existing = form.products.find((p: any) => p.product_id === selectedProductId);
    if (existing) {
      toast.error('Product already added');
      return;
    }
    setForm((prev: any) => ({
      ...prev,
      products: [...prev.products, {
        product_id: product.id,
        quantity: 1,
        price_at_sale: product.price,
      }]
    }));
    setSelectedProductId('');
  };

  const removeProduct = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      products: prev.products.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateLineItem = (index: number, field: 'quantity' | 'price_at_sale', value: number) => {
    setForm((prev: any) => ({
      ...prev,
      products: prev.products.map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const totalAmount = form?.products?.reduce((sum: number, item: any) => sum + item.quantity * item.price_at_sale, 0) || 0;
  const paymentAmount = parseFloat(form?.payment_amount) || 0;
  const changeAmount = Math.max(0, paymentAmount - totalAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;
    if (form.products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    if (paymentAmount < totalAmount) {
      toast.error('Payment amount must be at least the total amount');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = ['paid_by', 'payment_type', 'or_number', 'transaction_id', 'payment_status', 'payment_amount'];
      for (const key of fields) {
        const val = form[key];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      form.products.forEach((item: any, index: number) => {
        formData.append(`products[${index}][product_id]`, String(item.product_id));
        formData.append(`products[${index}][quantity]`, String(item.quantity));
        formData.append(`products[${index}][price_at_sale]`, String(item.price_at_sale));
      });
      await saleApi.updateSale(sale.id, formData);
      toast.success('Sale updated successfully');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(null);
    setSelectedProductId('');
    onClose();
  };

  if (!isOpen || !form) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Update Sale
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Paid By *</label>
              <input
                type="text"
                name="paid_by"
                required
                value={form.paid_by}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Type *</label>
              <select
                name="payment_type"
                required
                value={form.payment_type}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">OR Number</label>
              <input
                type="text"
                name="or_number"
                value={form.or_number}
                readOnly
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
              />
            </div>
            {form.payment_type === 'gcash' && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Transaction ID *</label>
                <input
                  type="text"
                  name="transaction_id"
                  required
                  value={form.transaction_id}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Status *</label>
              <select
                name="payment_status"
                required
                value={form.payment_status}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Amount</label>
              <input
                type="number"
                step="0.01"
                name="payment_amount"
                value={form.payment_amount}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Total</label>
              <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed">
                ₱{totalAmount.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Change</label>
              <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-green-400 cursor-not-allowed">
                ₱{changeAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Products</label>
            <div className="flex gap-3 mb-3">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="flex-1 bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (₱{p.price})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addProduct}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-1"
              >
                <Plus size={18} /> Add
              </button>
            </div>
            {form.products.length > 0 && (
              <div className="space-y-2">
                {form.products.map((item: any, index: number) => {
                  const product = products.find(p => p.id === item.product_id);
                  return (
                    <div key={index} className="flex items-center gap-3 bg-[#1e242c] p-3 rounded-lg border border-gray-700">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{product?.name || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-400 text-sm">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                          className="w-16 bg-[#12181f] border border-gray-600 rounded-lg px-2 py-1 text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-gray-400 text-sm">Price:</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price_at_sale}
                          onChange={(e) => updateLineItem(index, 'price_at_sale', Number(e.target.value))}
                          className="w-24 bg-[#12181f] border border-gray-600 rounded-lg px-2 py-1 text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/30">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20 disabled:opacity-70">
              {loading ? 'Updating...' : 'Update Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};