import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { walkinApi } from '../../services/walkinApi';
import type { WalkinInfo } from '../../types/WalkinInfo';
import { X } from 'lucide-react';

interface UpdateWalkinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walkin: WalkinInfo | null;
}

const suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

export const UpdateWalkinModal = ({ isOpen, onClose, onSuccess, walkin }: UpdateWalkinModalProps) => {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && walkin) {
      setForm({
        firstname: walkin.firstname,
        middlename: walkin.middlename || '',
        lastname: walkin.lastname,
        suffix: walkin.suffix || '',
        email: walkin.email || '',
        contact: walkin.contact,
        total_visits: walkin.total_visits.toString(),
      });
    }
  }, [isOpen, walkin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkin) return;
    setLoading(true);
    try {
      const formData = new FormData();
      const fields = ['firstname', 'middlename', 'lastname', 'suffix', 'email', 'contact', 'total_visits'];
      for (const key of fields) {
        const val = form[key];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      await walkinApi.updateWalkin(walkin.id, formData);
      toast.success('Walk-in record updated');
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
    onClose();
  };

  if (!isOpen || !form) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Update Walk-in Record
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700/50">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">First Name *</label>
              <input
                type="text"
                name="firstname"
                required
                value={form.firstname}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Middle Name</label>
              <input
                type="text"
                name="middlename"
                value={form.middlename}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Last Name *</label>
              <input
                type="text"
                name="lastname"
                required
                value={form.lastname}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Suffix</label>
              <select
                name="suffix"
                value={form.suffix}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                {suffixes.map((s) => (
                  <option key={s} value={s}>{s || 'None'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Total Visits</label>
              <input
                type="number"
                name="total_visits"
                min="1"
                value={form.total_visits}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Contact (+63) *</label>
              <div className="mt-1 flex items-center bg-[#1e242c] border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                <span className="pl-3 text-gray-400 select-none">+63</span>
                <input
                  type="text"
                  name="contact"
                  placeholder="91234567890"
                  maxLength={11}
                  required
                  value={form.contact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setForm((prev: any) => ({ ...prev, contact: val }));
                  }}
                  className="w-full bg-transparent border-0 px-2 py-2.5 text-white focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">11 digits starting with 9</p>
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
              {loading ? 'Updating...' : 'Update Walk-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};