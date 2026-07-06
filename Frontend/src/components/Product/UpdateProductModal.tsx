import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { productApi } from '../../services/productApi';
import type { Product } from '../../types/Product';
import { X, Upload } from 'lucide-react';

interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

export const UpdateProductModal = ({ isOpen, onClose, onSuccess, product }: UpdateProductModalProps) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    sold: '',
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        sold: product.sold.toString(),
        image: null,
      });
      setPreview(product.image ? `http://localhost:8000/storage/${product.image}` : null);
    }
  }, [isOpen, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setForm((prev) => ({ ...prev, image: file }));
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(product?.image ? `http://localhost:8000/storage/${product.image}` : null);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = ['name', 'description', 'price', 'quantity', 'sold'];
      for (const key of fields) {
        const val = form[key as keyof typeof form];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      if (form.image) {
        formData.append('image', form.image);
      }
      await productApi.updateProduct(product.id, formData);
      toast.success('Product updated successfully');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', description: '', price: '', quantity: '', sold: '', image: null });
    setPreview(null);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Update Product
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name *</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Price (₱) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                required
                min="0"
                value={form.price}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Quantity *</label>
              <input
                type="number"
                name="quantity"
                required
                min="0"
                value={form.quantity}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Sold *</label>
              <input
                type="number"
                name="sold"
                required
                min="0"
                value={form.sold}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Image</label>
            <div className="flex items-center gap-3 mt-1">
              <label
                htmlFor="image-upload-update"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition cursor-pointer flex items-center gap-2"
              >
                <Upload size={18} />
                Upload
              </label>
              <input
                type="file"
                accept="image/*"
                id="image-upload-update"
                onChange={handleChange}
                className="hidden"
              />
              {preview && (
                <div className="flex items-center gap-2">
                  <img src={preview} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-gray-600" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(product?.image ? `http://localhost:8000/storage/${product.image}` : null);
                      setForm((prev) => ({ ...prev, image: null }));
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/30">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20 disabled:opacity-70"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};