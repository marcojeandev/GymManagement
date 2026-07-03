// File: src/pages/Admin/Members.tsx
import { useState, useEffect } from 'react';
import { memberService } from '../../services/admin/memberService';
import { settingsService } from '../../services/admin/settingsService';
import { Plus, Edit2, Trash2, Eye, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Member, MemberFormData, MembershipPricing } from '../../types/member';
import { MemberFormModal, ProfileModal } from '../../components/admin/MemberModals';

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pricingOptions, setPricingOptions] = useState<MembershipPricing[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [membershipFee, setMembershipFee] = useState(150);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | undefined>(undefined);

  const initialForm: MemberFormData = {
    firstname: '', middlename: '', lastname: '', suffix: '',
    email: '', contact: '', address: '', sex: 'male',
    membership_id: '', payment_type: 'cash', payment_amount: '',
    or_number: '', transaction_id: '', payment_status: 'pending',
    paid_at: '', profile: null,
  };
  const [formData, setFormData] = useState<MemberFormData>(initialForm);

  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      setMembers(data);
    } catch {
      toast.error('Failed to fetch members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const res = await settingsService.getMembershipPrice();
      const data = res.data.data;
      if (data) {
        setPricingOptions([{ id: data.id, name: 'Standard Plan', price: data.price }]);
        setMembershipFee(data.price || 150);
      }
    } catch {
      toast.error('Failed to load pricing');
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchPricing();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profile: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
      setFormData(prev => ({ ...prev, profile: null }));
    }
    if (errors.profile) setErrors(prev => ({ ...prev, profile: '' }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setPreview(null);
    setQrCode(undefined);
    setErrors({});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    if (!formData.membership_id && pricingOptions.length > 0) {
      formData.membership_id = String(pricingOptions[0].id);
    }

    const newErrors: Record<string, string> = {};
    if (!formData.firstname) newErrors.firstname = 'Required';
    if (!formData.lastname) newErrors.lastname = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.contact) newErrors.contact = 'Required';
    if (!formData.address) newErrors.address = 'Required';
    if (!formData.membership_id) newErrors.membership_id = 'Select a plan';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') data.append(key, value);
      });
      await memberService.createMember(data);
      toast.success('Member created successfully.');
      setShowCreateModal(false);
      resetForm();
      fetchMembers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Creation failed.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setErrors({});
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};
    if (!formData.firstname) newErrors.firstname = 'Required';
    if (!formData.lastname) newErrors.lastname = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.contact) newErrors.contact = 'Required';
    if (!formData.address) newErrors.address = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') data.append(key, value);
      });
      await memberService.updateMember(selectedMember.id, data);
      toast.success('Member updated successfully.');
      setShowEditModal(false);
      resetForm();
      fetchMembers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Update failed.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this member? This cannot be undone.')) return;
    try {
      await memberService.deleteMember(id);
      toast.success('Member deleted.');
      fetchMembers();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      firstname: member.firstname || '',
      middlename: member.middlename || '',
      lastname: member.lastname || '',
      suffix: member.suffix || '',
      email: member.email || '',
      contact: member.contact || '',
      address: member.address || '',
      sex: member.sex || 'male',
      membership_id: member.membership_fee?.membership_id?.toString() || '',
      payment_type: member.membership_fee?.payment_type || 'cash',
      payment_amount: member.membership_fee?.payment_amount?.toString() || '',
      or_number: member.membership_fee?.or_number || '',
      transaction_id: member.membership_fee?.transaction_id || '',
      payment_status: member.membership_fee?.payment_status || 'pending',
      paid_at: member.membership_fee?.paid_at || '',
      profile: null,
    });
    setPreview(member.profile ? `${STORAGE_URL}/${member.profile}` : null);
    setQrCode(member.qr_code || undefined);
    setErrors({});
    setShowEditModal(true);
  };

  const openProfileModal = (member: Member) => {
    setSelectedMember(member);
    setShowProfileModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Members Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all registered user accounts (including non-members).</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition shadow-lg shadow-red-500/20 hover:shadow-red-500/40 active:scale-[0.98]"
        >
          <Plus size={18} />
          Create Account
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-4">
          <p className="text-sm text-gray-400">Total Members</p>
          <p className="text-2xl font-bold text-white">{members.length}</p>
        </div>
        <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-4">
          <p className="text-sm text-gray-400">Active Members</p>
          <p className="text-2xl font-bold text-emerald-400">
            {members.filter(m => m.membership_fee?.payment_status === 'paid').length}
          </p>
        </div>
        <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-4">
          <p className="text-sm text-gray-400">Inactive Members</p>
          <p className="text-2xl font-bold text-red-400">
            {members.filter(m => m.membership_fee?.payment_status !== 'paid').length}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-xs uppercase text-gray-400 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700" />
                        <div>
                          <div className="h-4 w-32 bg-gray-700 rounded" />
                          <div className="h-3 w-40 bg-gray-700 rounded mt-1" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-700 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-gray-600" />
                      <span className="text-sm">No members yet.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const profileUrl = m.profile ? `${STORAGE_URL}/${m.profile}` : null;
                  return (
                    <tr key={m.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {profileUrl ? (
                            <img
                              src={profileUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-400 text-xs font-bold">
                              {m.firstname?.[0]}{m.lastname?.[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-200">{m.firstname} {m.lastname}</p>
                            <p className="text-xs text-gray-400">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          m.membership_fee?.payment_status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {m.membership_fee?.payment_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button
                          onClick={() => openProfileModal(m)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <MemberFormModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        mode="create"
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleCreate}
        pricingOptions={pricingOptions}
        isSubmitting={isSubmitting}
        preview={preview}
        qrCode={qrCode}
        errors={errors}
        membershipFee={membershipFee}
      />
      <MemberFormModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        mode="edit"
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleUpdate}
        pricingOptions={pricingOptions}
        isSubmitting={isSubmitting}
        preview={preview}
        qrCode={qrCode}
        errors={errors}
        membershipFee={membershipFee}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        member={selectedMember}
        storageUrl={STORAGE_URL}
      />

      <style>{`
        .input {
          @apply w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition;
        }
        .input:disabled {
          @apply opacity-50 cursor-not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Members;