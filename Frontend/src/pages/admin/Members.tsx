// File: src/pages/Admin/Members.tsx
import { useState, useEffect } from 'react';
import { memberService } from '../../services/admin/memberService';
import { settingsService } from '../../services/admin/settingsService';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Member, MemberFormData, MembershipPricing } from '../../types/member';
import { MemberFormModal, ProfileModal } from '../../components/admin/MemberModals';

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pricingOptions, setPricingOptions] = useState<MembershipPricing[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    paid_at: '', password: '', profile: null,
  };
  const [formData, setFormData] = useState<MemberFormData>(initialForm);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const membersArray = await memberService.getMembers();
      setMembers(membersArray);
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profile: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
      setFormData((prev) => ({ ...prev, profile: null }));
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setPreview(null);
    setQrCode(undefined);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') data.append(key, value);
      });
      await memberService.createMember(data);
      toast.success('Member created');
      setShowCreateModal(false);
      resetForm();
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') data.append(key, value);
      });
      await memberService.updateMember(selectedMember.id, data);
      toast.success('Member updated');
      setShowEditModal(false);
      resetForm();
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this member?')) return;
    try {
      await memberService.deleteMember(id);
      toast.success('Deleted');
      fetchMembers();
    } catch {
      toast.error('Delete failed');
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
      password: '',
      profile: null,
    });
    setPreview(member.profile ? `${import.meta.env.VITE_STORAGE_URL}/${member.profile}` : null);
    setQrCode(member.qr_code || undefined);
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
        <h1 className="text-2xl font-bold text-white">Members Management</h1>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No members</td></tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="px-6 py-4 text-gray-200">{m.firstname} {m.lastname}</td>
                    <td className="px-6 py-4">{m.email}</td>
                    <td className="px-6 py-4">{m.contact}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        m.membership_fee?.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        m.membership_fee?.payment_status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {m.membership_fee?.payment_status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-3">
                      <button onClick={() => openProfileModal(m)} className="text-gray-400 hover:text-blue-400 p-1 bg-gray-800 rounded-md hover:bg-gray-700">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEditModal(m)} className="text-gray-400 hover:text-blue-400 p-1 bg-gray-800 rounded-md hover:bg-gray-700">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-400 p-1 bg-gray-800 rounded-md hover:bg-gray-700">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
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
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        member={selectedMember}
        storageUrl={import.meta.env.VITE_STORAGE_URL}
      />

      <style>{`
        .input {
          @apply w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition;
        }
      `}</style>
    </div>
  );
};

export default Members;