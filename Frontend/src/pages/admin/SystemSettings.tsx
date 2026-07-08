import { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { systemSettingsApi } from '../../services/admin/systemSettingsApi';
import type { MembershipPrice, ContractPrice, GymSetting } from '../../services/admin/systemSettingsApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2} from 'lucide-react';

type TabType = 'gym' | 'membership' | 'contract';

export const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('gym');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---------- Gym ----------
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
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ---------- Membership ----------
  const [membership, setMembership] = useState<MembershipPrice | null>(null);
  const [membershipForm, setMembershipForm] = useState({
    price: '',
    description: '',
  });

  // ---------- Contract ----------
  const [contracts, setContracts] = useState<ContractPrice[]>([]);
  const [editingContractId, setEditingContractId] = useState<number | null>(null);
  const [newContractForm, setNewContractForm] = useState({ title: '', price: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [gymData, membershipData, contractData] = await Promise.all([
        systemSettingsApi.getGymSettings(),
        systemSettingsApi.getMembershipPrice(),
        systemSettingsApi.getContractPrices(),
      ]);

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
        });
        if (gymData.logo) setLogoPreview(`http://localhost:8000/storage/${gymData.logo}`);
      }

      if (membershipData) {
        setMembership(membershipData);
        setMembershipForm({
          price: membershipData.price?.toString() || '',
          description: membershipData.description || '',
        });
      }

      setContracts(contractData || []);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Gym handlers ----------
  const handleGymChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setGymForm((prev) => ({ ...prev, [name]: file }));
      if (name === 'logo' && file) {
        const reader = new FileReader();
        reader.onload = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    } else {
      setGymForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(gymForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'logo') {
            if (value instanceof File) formData.append(key, value);
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

  // ---------- Membership handlers ----------
  const handleMembershipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMembershipForm((prev) => ({ ...prev, [name]: value }));
  };

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
      toast.success('Membership price updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Contract handlers ----------
  const handleNewContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContractForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditContractChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const { name, value } = e.target;
    setContracts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, [name]: name === 'price' ? parseFloat(value) : value } : c
      )
    );
  };

  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        title: newContractForm.title,
        price: parseFloat(newContractForm.price),
        description: newContractForm.description,
      };
      const created = await systemSettingsApi.createContractPrice(data);
      setContracts((prev) => [...prev, created]);
      setNewContractForm({ title: '', price: '', description: '' });
      setShowAddForm(false);
      toast.success('Contract plan added');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Add failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContract = async (id: number) => {
    setSaving(true);
    try {
      const contract = contracts.find((c) => c.id === id);
      if (!contract) return;
      const data = {
        title: contract.title,
        price: contract.price,
        description: contract.description,
      };
      const updated = await systemSettingsApi.updateContractPrice(id, data);
      setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingContractId(null);
      toast.success('Contract plan updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContract = async (id: number) => {
    if (!confirm('Delete this contract plan?')) return;
    setSaving(true);
    try {
      await systemSettingsApi.deleteContractPrice(id);
      setContracts((prev) => prev.filter((c) => c.id !== id));
      toast.success('Contract plan deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl animate-pulse">Loading settings...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Shiny header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            System Settings
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-700/50">
          {['gym', 'membership', 'contract'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-red-600/20 text-white border-b-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30 hover:shadow-lg'
              }`}
            >
              {tab === 'gym' ? 'Gym Settings' : tab === 'membership' ? 'Membership Price' : 'Contract Plans'}
            </button>
          ))}
        </div>

        {/* ========== GYM TAB ========== */}
        {activeTab === 'gym' && (
          <form onSubmit={handleGymSubmit} className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 space-y-5 shadow-xl shadow-red-500/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Gym Name *</label>
                <input
                  type="text"
                  name="gym_name"
                  required
                  value={gymForm.gym_name}
                  onChange={handleGymChange}
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={gymForm.email}
                  onChange={handleGymChange}
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Location</label>
              <input
                type="text"
                name="location"
                value={gymForm.location}
                onChange={handleGymChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
            <div>
              <label className="block text-sm font-medium text-gray-300">Logo</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleGymChange}
                className="mt-1 w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer transition"
              />
              {logoPreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain rounded border border-gray-600" />
                  <span className="text-gray-400 text-sm">Current logo</span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20 disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Update Gym Settings'}
              </button>
            </div>
          </form>
        )}

        {/* ========== MEMBERSHIP TAB ========== */}
        {activeTab === 'membership' && (
          <form onSubmit={handleMembershipSubmit} className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 space-y-5 shadow-xl shadow-red-500/5">
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20 disabled:opacity-70"
              >
                {saving ? 'Saving...' : membership ? 'Update Membership Price' : 'Create Membership Price'}
              </button>
            </div>
          </form>
        )}

        {/* ========== CONTRACT TAB ========== */}
        {activeTab === 'contract' && (
          <div className="space-y-6">
            {/* Add button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`flex items-center gap-2 px-5 py-2.5 ${
                  showAddForm
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-green-600/20`}
              >
                <Plus size={18} />
                {showAddForm ? 'Cancel' : 'Add Contract Plan'}
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-green-500/5">
                <h4 className="text-lg font-semibold text-white mb-4">New Contract Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={newContractForm.title}
                    onChange={handleNewContractChange}
                    className="bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    value={newContractForm.price}
                    onChange={handleNewContractChange}
                    className="bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                  <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={newContractForm.description}
                    onChange={handleNewContractChange}
                    className="bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAddContract}
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-green-600/20 disabled:opacity-70"
                  >
                    {saving ? 'Adding...' : 'Add Plan'}
                  </button>
                </div>
              </div>
            )}

            {/* Contract list */}
            <div className="grid grid-cols-1 gap-3">
              {contracts.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#14181f] border border-gray-700/50 rounded-xl p-4 shadow-md hover:shadow-red-500/5 transition-all duration-300 hover:border-red-500/30"
                >
                  {editingContractId === item.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          name="title"
                          value={item.title}
                          onChange={(e) => handleEditContractChange(e, item.id)}
                          className="bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        />
                        <input
                          type="number"
                          name="price"
                          value={item.price}
                          step="0.01"
                          min="0"
                          onChange={(e) => handleEditContractChange(e, item.id)}
                          className="bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        />
                        <input
                          type="text"
                          name="description"
                          value={item.description}
                          onChange={(e) => handleEditContractChange(e, item.id)}
                          className="bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateContract(item.id)}
                          disabled={saving}
                          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-70"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingContractId(null)}
                          className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1 min-w-[180px]">
                        <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                        <p className="text-gray-400 text-sm">
                          ₱{item.price} · {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingContractId(item.id)}
                          className="p-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteContract(item.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {contracts.length === 0 && (
                <div className="text-center text-gray-400 py-10 bg-[#14181f] rounded-2xl border border-gray-700/30">
                  No contract plans yet. Click <span className="text-green-400">"Add Contract Plan"</span> to create one.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};