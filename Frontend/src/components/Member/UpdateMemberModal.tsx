import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { memberApi } from '../../services/memberApi';
import { systemSettingsApi } from '../../services/systemSettingsApi';
import type { MembershipPrice } from '../../services/systemSettingsApi';
import type { Member, MemberFormData } from '../../types/Members';

interface UpdateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: Member | null;
}

const suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

export const UpdateMemberModal = ({ isOpen, onClose, onSuccess, member }: UpdateMemberModalProps) => {
  const [form, setForm] = useState<MemberFormData | null>(null);
  const [pricing, setPricing] = useState<MembershipPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && member) {
      loadPricing();
      const fee = member.membership_fee;
      setForm({
        firstname: member.firstname,
        middlename: member.middlename || '',
        lastname: member.lastname,
        suffix: member.suffix || '',
        email: member.email,
        contact: member.contact.replace('+63', ''),
        address: member.address,
        sex: member.sex,
        membership_status: member.membership_status,
        contract_status: member.contract_status,
        membership_id: fee?.membership_id || '',
        payment_type: fee?.payment_type || 'cash',
        payment_amount: fee?.payment_amount || '',
        or_number: fee?.or_number || '',
        transaction_id: fee?.transaction_id || '',
        payment_status: fee?.payment_status || 'pending',
        paid_at: fee?.paid_at ? new Date(fee.paid_at).toISOString().slice(0, 16) : '',
        profile: null,
      });
      setPreview(member.profile ? `http://localhost:8000/storage/${member.profile}` : null);
    }
  }, [isOpen, member]);

  const loadPricing = async () => {
    try {
      const data = await systemSettingsApi.getMembershipPrice();
      setPricing(data);
    } catch (error) {
      toast.error('Failed to load membership plan');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!form) return;
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setForm((prev) => prev ? { ...prev, profile: file } : null);
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(member?.profile ? `http://localhost:8000/storage/${member.profile}` : null);
      }
    } else {
      setForm((prev) => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !member) return;
    setLoading(true);
    try {
      const formData = new FormData();
      const fields: (keyof MemberFormData)[] = [
        'firstname', 'middlename', 'lastname', 'suffix', 'email', 'contact',
        'address', 'sex', 'membership_status', 'contract_status',
        'membership_id', 'payment_type', 'payment_amount', 'or_number',
        'transaction_id', 'payment_status', 'paid_at',
      ];
      for (const key of fields) {
        const val = form[key];
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, String(val));
        }
      }
      if (form.profile) {
        formData.append('profile', form.profile);
      }
      await memberApi.updateMember(member.id, formData);
      toast.success('Member updated successfully');
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
    setPreview(null);
    onClose();
  };

  if (!isOpen || !form) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Update Member</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">First Name *</label>
              <input
                type="text"
                name="firstname"
                required
                value={form.firstname}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Middle Name</label>
              <input
                type="text"
                name="middlename"
                value={form.middlename}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {suffixes.map((s) => (
                  <option key={s} value={s}>{s || 'None'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Sex *</label>
              <select
                name="sex"
                required
                value={form.sex}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Contact (+63)</label>
              <div className="mt-1 flex items-center bg-[#1e242c] border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                <span className="pl-3 text-gray-400 select-none">+63</span>
                <input
                  type="text"
                  name="contact"
                  placeholder="91234567890"
                  maxLength={11}
                  value={form.contact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setForm((prev) => prev ? { ...prev, contact: val } : null);
                  }}
                  className="w-full bg-transparent border-0 px-2 py-2.5 text-white focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">11 digits starting with 9</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Address *</label>
            <textarea
              name="address"
              required
              rows={2}
              value={form.address}
              onChange={handleChange}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Membership Status *</label>
              <select
                name="membership_status"
                required
                value={form.membership_status}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Contract Status *</label>
              <select
                name="contract_status"
                required
                value={form.contract_status}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-700" />

          {/* Membership Fee Section - READONLY */}
          <h3 className="text-lg font-semibold text-white">Membership Fee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Membership Plan *</label>
              <input
                type="hidden"
                name="membership_id"
                value={form.membership_id}
              />
              <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white">
                {pricing ? `(₱${pricing.price} / ${' Permanent'} )` : 'No plan set'}
              </div>
              {!pricing && <p className="text-xs text-yellow-500 mt-1">No membership plan set. Please set in System Settings.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Price</label>
              <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed">
                ₱{pricing?.price ?? '—'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Type *</label>
              <select
                name="payment_type"
                required
                value={form.payment_type}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Amount</label>
              <input
                type="number"
                step="0.01"
                name="payment_amount"
                value={form.payment_amount}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">OR Number</label>
              <input
                type="text"
                name="or_number"
                value={form.or_number}
                readOnly
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
            </div>
            {form.payment_type === 'gcash' && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Transaction ID</label>
                <input
                  type="text"
                  name="transaction_id"
                  value={form.transaction_id}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Payment Status *</label>
              <select
                name="payment_status"
                required
                value={form.payment_status}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Paid At</label>
              <input
                type="datetime-local"
                name="paid_at"
                value={form.paid_at}
                onChange={handleChange}
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Profile Photo - with Capture and Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Profile Photo</label>
            <div className="flex gap-2 mt-1">
              {/* Camera Capture Button */}
              <button
                type="button"
                onClick={() => document.getElementById('camera-input-update')?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Take Photo
              </button>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="camera-input-update"
                onChange={handleChange}
                className="hidden"
              />

              {/* Upload File Button */}
              <label
                htmlFor="file-input-update"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm flex items-center cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Photo
              </label>
              <input
                type="file"
                accept="image/*"
                id="file-input-update"
                onChange={handleChange}
                className="hidden"
              />
            </div>
            {preview && (
              <div className="mt-2 flex items-center gap-3">
                <img src={preview} alt="Profile preview" className="h-16 w-16 object-cover rounded-full border border-gray-600" />
                <span className="text-gray-400 text-sm">Preview</span>
                <button
                  type="button"
                  onClick={() => {
                    setPreview(member?.profile ? `http://localhost:8000/storage/${member.profile}` : null);
                    setForm((prev) => prev ? { ...prev, profile: null } : null);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-70"
            >
              {loading ? 'Updating...' : 'Update Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};