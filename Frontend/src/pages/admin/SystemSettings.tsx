import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { systemSettingsApi } from '../../services/systemSettingsApi';
import type {  MembershipPrice, ContractPrice, GymSetting } from '../../services/systemSettingsApi';
import toast from 'react-hot-toast';

type TabType = 'gym' | 'membership' | 'contract';

export const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('gym');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Gym Settings
  const [gym, setGym] = useState<GymSetting | null>(null);
  const [gymForm, setGymForm] = useState({
    gym_name: '',
    description: '',
    location: '',
    email: '',
    contact: '',
    primary_color: '#ef4444',
    secondary_color: '#dc2626',
    logo: null as File | null,
    favicon: null as File | null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // Membership Price
  const [membership, setMembership] = useState<MembershipPrice | null>(null);
  const [membershipForm, setMembershipForm] = useState({
    price: '',
    description: '',
  });

  // Contract Price
  const [contract, setContract] = useState<ContractPrice | null>(null);
  const [contractForm, setContractForm] = useState({
    price: '',
    title: '',
    description: '',
  });

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [gymData, membershipData, contractData] = await Promise.all([
        systemSettingsApi.getGymSettings(),
        systemSettingsApi.getMembershipPrice(),
        systemSettingsApi.getContractPrice(),
      ]);

      // Gym settings
      if (gymData) {
        setGym(gymData);
        setGymForm({
          gym_name: gymData.gym_name || '',
          description: gymData.description || '',
          location: gymData.location || '',
          email: gymData.email || '',
          contact: gymData.contact || '',
          primary_color: gymData.primary_color || '#ef4444',
          secondary_color: gymData.secondary_color || '#dc2626',
          logo: null,
          favicon: null,
        });
        if (gymData.logo) {
          setLogoPreview(`http://localhost:8000/storage/${gymData.logo}`);
        }
        if (gymData.favicon) {
          setFaviconPreview(`http://localhost:8000/storage/${gymData.favicon}`);
        }
      }

      // Membership price
      if (membershipData) {
        setMembership(membershipData);
        setMembershipForm({
          price: membershipData.price?.toString() || '',
          description: membershipData.description || '',
        });
      }

      // Contract price
      if (contractData) {
        setContract(contractData);
        setContractForm({
          price: contractData.price?.toString() || '',
          title: contractData.title || '',
          description: contractData.description || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle Gym form changes
  const handleGymChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setGymForm((prev) => ({ ...prev, [name]: file }));
      if (name === 'logo' && file) {
        const reader = new FileReader();
        reader.onload = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else if (name === 'favicon' && file) {
        const reader = new FileReader();
        reader.onload = () => setFaviconPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    } else {
      setGymForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Membership form changes
  const handleMembershipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMembershipForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Contract form changes
  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContractForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Gym Settings
  const handleGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(gymForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'logo' || key === 'favicon') {
            if (value instanceof File) {
              formData.append(key, value);
            }
          } else {
            formData.append(key, String(value));
          }
        }
      });
      const updated = await systemSettingsApi.updateSystemSettings(formData);
      setGym(updated);
      toast.success('Gym settings updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Submit Membership Price
  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        price: parseFloat(membershipForm.price),
        description: membershipForm.description,
      };
      const updated = await systemSettingsApi.updateMembershipPrice(data);
      setMembership(updated);
      toast.success(updated ? 'Membership price updated' : 'Membership price created');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Submit Contract Price
  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        price: parseFloat(contractForm.price),
        title: contractForm.title,
        description: contractForm.description,
      };
      const updated = await systemSettingsApi.updateContractPrice(data);
      setContract(updated);
      toast.success(updated ? 'Contract price updated' : 'Contract price created');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading settings...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab('gym')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition ${
              activeTab === 'gym'
                ? 'bg-red-600/20 text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            Gym Settings
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition ${
              activeTab === 'membership'
                ? 'bg-red-600/20 text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            Membership Price
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition ${
              activeTab === 'contract'
                ? 'bg-red-600/20 text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            Contract Price
          </button>
        </div>

        {/* Gym Settings Tab */}
        {activeTab === 'gym' && (
          <form onSubmit={handleGymSubmit} className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Gym Name *</label>
                <input
                  type="text"
                  name="gym_name"
                  required
                  value={gymForm.gym_name}
                  onChange={handleGymChange}
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={gymForm.email}
                  onChange={handleGymChange}
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                name="description"
                rows={3}
                value={gymForm.description}
                onChange={handleGymChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Location</label>
              <input
                type="text"
                name="location"
                value={gymForm.location}
                onChange={handleGymChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Contact</label>
              <div className="mt-1 flex items-center bg-[#1e242c] border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                <span className="pl-3 text-gray-400 select-none">+63</span>
                <input
                  type="text"
                  name="contact"
                  placeholder="91234567890"
                  maxLength={11}
                  value={gymForm.contact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setGymForm((prev) => ({ ...prev, contact: val }));
                  }}
                  className="w-full bg-transparent border-0 px-2 py-2.5 text-white focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">11 digits starting with 9</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Primary Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    name="primary_color"
                    value={gymForm.primary_color}
                    onChange={handleGymChange}
                    className="h-10 w-10 rounded border border-gray-600 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={gymForm.primary_color}
                    onChange={handleGymChange}
                    name="primary_color"
                    className="flex-1 bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Secondary Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    name="secondary_color"
                    value={gymForm.secondary_color}
                    onChange={handleGymChange}
                    className="h-10 w-10 rounded border border-gray-600 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={gymForm.secondary_color}
                    onChange={handleGymChange}
                    name="secondary_color"
                    className="flex-1 bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Logo</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleGymChange}
                className="mt-1 w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
              />
              {logoPreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain rounded border border-gray-600" />
                  <span className="text-gray-400 text-sm">Current logo</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Favicon</label>
              <input
                type="file"
                name="favicon"
                accept="image/*"
                onChange={handleGymChange}
                className="mt-1 w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
              />
              {faviconPreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={faviconPreview} alt="Favicon preview" className="h-12 w-12 object-contain rounded border border-gray-600" />
                  <span className="text-gray-400 text-sm">Current favicon</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Update Gym Settings'}
              </button>
            </div>
          </form>
        )}

        {/* Membership Price Tab */}
        {activeTab === 'membership' && (
          <form onSubmit={handleMembershipSubmit} className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300">Price (₱) *</label>
              <input
                type="number"
                name="price"
                required
                step="0.01"
                min="0"
                value={membershipForm.price}
                onChange={handleMembershipChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Description *</label>
              <textarea
                name="description"
                required
                rows={3}
                value={membershipForm.description}
                onChange={handleMembershipChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70"
              >
                {saving ? 'Saving...' : membership ? 'Update Membership Price' : 'Create Membership Price'}
              </button>
            </div>
          </form>
        )}

        {/* Contract Price Tab */}
        {activeTab === 'contract' && (
          <form onSubmit={handleContractSubmit} className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300">Title *</label>
              <input
                type="text"
                name="title"
                required
                value={contractForm.title}
                onChange={handleContractChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Price (₱) *</label>
              <input
                type="number"
                name="price"
                required
                step="0.01"
                min="0"
                value={contractForm.price}
                onChange={handleContractChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Description *</label>
              <textarea
                name="description"
                required
                rows={3}
                value={contractForm.description}
                onChange={handleContractChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70"
              >
                {saving ? 'Saving...' : contract ? 'Update Contract Price' : 'Create Contract Price'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};