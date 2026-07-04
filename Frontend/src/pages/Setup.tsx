import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

// Utility: validate Philippine mobile number (11 digits starting with 9)
const validatePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('9');
};

export const Setup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gym_name: '',
    description: '',
    email: '',
    contact: '', // user will input 11 digits (e.g., 91234567890)
    logo: null as File | null,
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirmation: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, logo: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate contact (if provided)
    if (form.contact && !validatePhone(form.contact)) {
      toast.error('Contact must be 11 digits starting with 9 (e.g., 91234567890)');
      return;
    }

    if (form.admin_password !== form.admin_password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    const data = new FormData();
    data.append('gym_name', form.gym_name);
    if (form.description) data.append('description', form.description);
    if (form.email) data.append('email', form.email);
    if (form.contact) data.append('contact', `+63${form.contact}`);
    if (form.logo) data.append('logo', form.logo);
    data.append('admin_name', form.admin_name);
    data.append('admin_email', form.admin_email);
    data.append('admin_password', form.admin_password);

    setLoading(true);
    try {
      await api.post('/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Setup completed! Please log in.');
      navigate('/login');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Setup failed.';
      toast.error(msg);
      if (error.response?.status === 403) {
        // System already configured – redirect to login
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] p-4">
      <div className="w-full max-w-2xl bg-[#14181f] rounded-2xl shadow-2xl p-8 border border-gray-700/50">
        <h1 className="text-3xl font-bold text-white mb-2">Gym Setup</h1>
        <p className="text-gray-400 text-sm mb-6">Create your gym profile and admin account</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Gym Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Gym Name *</label>
            <input
              type="text"
              required
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={form.gym_name}
              onChange={(e) => setForm({ ...form, gym_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Contact</label>
              <div className="mt-1 flex items-center bg-[#1e242c] border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                <span className="pl-3 text-gray-400 select-none">+63</span>
                <input
                  type="text"
                  placeholder="91234567890"
                  maxLength={11}
                  className="w-full bg-transparent border-0 px-2 py-2.5 text-white focus:outline-none"
                  value={form.contact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setForm({ ...form, contact: val });
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">11 digits starting with 9</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Logo</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
              onChange={handleFileChange}
            />
            {logoPreview && (
              <div className="mt-2 flex items-center gap-3">
                <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain rounded border border-gray-600" />
                <span className="text-gray-400 text-sm">Preview</span>
              </div>
            )}
          </div>

          <hr className="border-gray-700 my-4" />

          {/* Admin Account */}
          <h2 className="text-xl font-semibold text-white">Admin Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name *</label>
              <input
                type="text"
                required
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={form.admin_name}
                onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email *</label>
              <input
                type="email"
                required
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={form.admin_email}
                onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Password *</label>
              <input
                type="password"
                required
                minLength={8}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={form.admin_password}
                onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Confirm Password *</label>
              <input
                type="password"
                required
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={form.admin_password_confirmation}
                onChange={(e) => setForm({ ...form, admin_password_confirmation: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-70"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};