import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { memberApi } from '../../services/admin/memberApi';
import { systemSettingsApi } from '../../services/admin/systemSettingsApi';
import type { MembershipPrice } from '../../services/admin/systemSettingsApi';
import type { MemberFormData } from '../../types/Members';
import { X, Camera, Upload } from 'lucide-react';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialForm: MemberFormData = {
  firstname: '',
  middlename: '',
  lastname: '',
  suffix: '',
  email: '',
  contact: '',
  address: '',
  sex: 'male',
  membership_status: 'active',
  contract_status: 'active',
  membership_id: '',
  payment_type: 'cash',
  payment_amount: '',
  or_number: '',
  transaction_id: '',
  payment_status: 'pending',
  paid_at: '',
  profile: null,
};

const suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

export const CreateMemberModal = ({ isOpen, onClose, onSuccess }: CreateMemberModalProps) => {
  const [form, setForm] = useState<MemberFormData>(initialForm);
  const [pricing, setPricing] = useState<MembershipPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Camera states
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPricing();
      const orNum = 'OR-' + Date.now().toString().slice(-8);
      setForm((prev) => ({ ...prev, or_number: orNum }));
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // FIX: attach the MediaStream to the <video> element only after it has
  // actually mounted (i.e. once cameraOpen is true and videoRef is set).
  // Previously the stream was attached inside startCamera() before the
  // video element existed in the DOM, which produced a permanently black
  // preview and black captured photos.
  useEffect(() => {
    if (cameraOpen && stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      const playVideo = () => {
        video.play().catch((e) => console.error('Video play() failed:', e));
      };

      if (video.readyState >= 1) {
        playVideo();
      } else {
        video.onloadedmetadata = playVideo;
      }
    }
  }, [cameraOpen, stream]);

  const loadPricing = async () => {
    try {
      const data = await systemSettingsApi.getMembershipPrice();
      setPricing(data);
      if (data) {
        setForm((prev) => ({ ...prev, membership_id: data.id }));
      }
    } catch (error) {
      toast.error('Failed to load membership plan');
    }
  };

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      setStream(mediaStream);
      // Mount the <video> element first; the effect above attaches the
      // stream once videoRef.current is actually available.
      setCameraOpen(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied. Please allow permissions or upload a photo.');
      toast.error('Camera access denied. Please allow camera permissions.');
      document.getElementById('camera-fallback-create')?.click();
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Camera is still warming up, try again in a moment.');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
          setForm((prev) => ({ ...prev, profile: file }));
          const url = URL.createObjectURL(blob);
          setPreview(url);
          stopCamera();
          toast.success('Photo captured!');
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setForm((prev) => ({ ...prev, profile: file }));
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const fields: (keyof MemberFormData)[] = [
        'firstname',
        'middlename',
        'lastname',
        'suffix',
        'email',
        'contact',
        'address',
        'sex',
        'membership_status',
        'contract_status',
        'membership_id',
        'payment_type',
        'payment_amount',
        'or_number',
        'transaction_id',
        'payment_status',
        'paid_at',
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
      await memberApi.createMember(formData);
      toast.success('Member created successfully');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setForm(initialForm);
    setPreview(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#14181f] rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-red-500/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Create Member
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
                  <option key={s} value={s}>
                    {s || 'None'}
                  </option>
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Contact (+63)</label>
              <div className="mt-1 flex items-center bg-[#1e242c] border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-red-500 transition">
                <span className="pl-3 text-gray-400 select-none">+63</span>
                <input
                  type="text"
                  name="contact"
                  placeholder="91234567890"
                  maxLength={11}
                  value={form.contact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setForm((prev) => ({ ...prev, contact: val }));
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
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-700" />

          <h3 className="text-lg font-semibold text-white">Membership Fee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Membership Plan *</label>
              <input type="hidden" name="membership_id" value={form.membership_id} />
              <div className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white">
                {pricing ? `(₱${pricing.price} / Permanent)` : 'No plan set'}
              </div>
              {!pricing && <p className="text-xs text-yellow-500 mt-1">No membership plan set.</p>}
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                  className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
                className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>

          {/* ===== Profile Photo – FIXED CAMERA ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Profile Photo</label>
            <div className="mt-2">
              {!cameraOpen ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={cameraLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition shadow-lg shadow-blue-600/20"
                  >
                    <Camera size={18} />
                    {cameraLoading ? 'Opening...' : 'Take Photo'}
                  </button>
                  <label
                    htmlFor="file-upload-create"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition cursor-pointer"
                  >
                    <Upload size={18} />
                    Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="file-upload-create"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id="camera-fallback-create"
                    onChange={handleChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {cameraError && (
                    <div className="text-red-400 text-sm mb-2">{cameraError}</div>
                  )}
                  {/* Video container - portrait orientation (taller than wide) */}
                  <div
                    className="bg-black rounded-lg overflow-hidden relative mx-auto"
                    style={{ aspectRatio: '3 / 4', maxWidth: '360px', width: '100%' }}
                  >
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-lg shadow-green-600/20"
                    >
                      <Camera size={18} />
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {preview && !cameraOpen && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="h-16 w-16 object-cover rounded-full border-2 border-red-500/30"
                />
                <span className="text-gray-400 text-sm">Preview</span>
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setForm((prev) => ({ ...prev, profile: null }));
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
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
              {loading ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
