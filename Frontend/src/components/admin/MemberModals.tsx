// File: src/components/admin/MemberModals.tsx
import { X, ChevronLeft, ChevronRight, Camera, CameraOff, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import type { Member, MemberFormData, MembershipPricing } from '../../types/member';

// ---------- Modal Wrapper ----------
interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ title, isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ---------- Camera Modal ----------
interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal = ({ isOpen, onClose, onCapture }: CameraModalProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    setLoading(true);
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const file = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
        setScreenshot(null);
      } catch {
        toast.error('Capture failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const retake = () => setScreenshot(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 rounded-xl p-3 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-red-400" /> Take Photo
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {screenshot ? (
            <img src={screenshot} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode }}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex justify-between items-center mt-3 gap-2">
          {!screenshot ? (
            <>
              <button
                onClick={() => setFacingMode(m => (m === 'user' ? 'environment' : 'user'))}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs flex items-center gap-1"
              >
                <CameraOff size={14} /> Flip
              </button>
              <button
                onClick={capture}
                disabled={loading}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? '...' : <><Camera size={14} /> Capture</>}
              </button>
              <button onClick={onClose} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={retake} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">
                Retake
              </button>
              <button onClick={onClose} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium">
                Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Step Indicator ----------
const StepIndicator = ({ currentStep, steps }: { currentStep: number; steps: string[] }) => (
  <div className="flex items-center justify-center gap-2 mb-5">
    {steps.map((label, index) => (
      <div key={index} className="flex items-center gap-1.5">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all ${
            index + 1 === currentStep
              ? 'bg-red-600 text-white shadow'
              : index + 1 < currentStep
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {index + 1 < currentStep ? '✓' : index + 1}
        </div>
        <span className={`text-xs font-medium ${index + 1 === currentStep ? 'text-white' : 'text-gray-500'}`}>
          {label}
        </span>
        {index < steps.length - 1 && (
          <div className={`w-5 h-px ${index + 1 < currentStep ? 'bg-green-600' : 'bg-gray-700'}`} />
        )}
      </div>
    ))}
  </div>
);

// ---------- Step 1: Member Info ----------
interface Step1Props {
  formData: MemberFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  preview: string | null;
  isEdit: boolean;
  triggerCamera: () => void;
  errors?: Record<string, string>;
  localErrors?: Record<string, string>;
  onNext: () => void;
}

const Step1MemberInfo = ({
  formData,
  handleChange,
  handleFileChange,
  preview,
  isEdit,
  triggerCamera,
  errors = {},
  localErrors = {},
  onNext,
}: Step1Props) => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

  const allErrors = { ...errors, ...localErrors };

  const fieldClasses = (fieldName: string) =>
    `w-full bg-black/40 border ${allErrors[fieldName] ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 0 && !raw.startsWith('9')) {
      toast.error('Phone number must start with 9');
      return;
    }
    if (raw.length > 11) return;
    handleChange({ ...e, target: { ...e.target, name: 'contact', value: raw } });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-400">First Name <span className="text-red-500">*</span></label>
          <input name="firstname" value={formData.firstname} onChange={handleChange} className={fieldClasses('firstname')} required />
          {allErrors.firstname && <p className="text-xs text-red-400 mt-0.5">{allErrors.firstname}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400">Last Name <span className="text-red-500">*</span></label>
          <input name="lastname" value={formData.lastname} onChange={handleChange} className={fieldClasses('lastname')} required />
          {allErrors.lastname && <p className="text-xs text-red-400 mt-0.5">{allErrors.lastname}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400">Middle Name</label>
          <input name="middlename" value={formData.middlename} onChange={handleChange} className={fieldClasses('middlename')} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400">Suffix</label>
          <input name="suffix" value={formData.suffix} onChange={handleChange} placeholder="Jr." className={fieldClasses('suffix')} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400">Email <span className="text-red-500">*</span></label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} className={fieldClasses('email')} required />
          {allErrors.email && <p className="text-xs text-red-400 mt-0.5">{allErrors.email}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400">Phone <span className="text-red-500">*</span></label>
          <div className="flex gap-1">
            <span className="bg-black/40 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-400 flex items-center">+63</span>
            <input
              name="contact"
              value={formData.contact}
              onChange={handlePhoneChange}
              className={`flex-1 ${fieldClasses('contact')}`}
              placeholder="9XXXXXXXXX"
              required
            />
          </div>
          {allErrors.contact && <p className="text-xs text-red-400 mt-0.5">{allErrors.contact}</p>}
          <p className="text-[10px] text-gray-500 mt-0.5">Starts with 9, digits only</p>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-gray-400">Address <span className="text-red-500">*</span></label>
          <input name="address" value={formData.address} onChange={handleChange} className={fieldClasses('address')} required />
          {allErrors.address && <p className="text-xs text-red-400 mt-0.5">{allErrors.address}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400">Sex <span className="text-red-500">*</span></label>
          <select name="sex" value={formData.sex} onChange={handleChange} className={fieldClasses('sex')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="pt-3 border-t border-gray-700/50">
        <label className="text-xs font-medium text-gray-400 block mb-2">Profile Photo</label>
        <div className="flex items-center gap-3">
          {preview ? (
            <img src={preview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-red-500" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 font-bold border border-gray-700 text-lg">
              {formData.firstname?.[0] || '?'}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs transition"
            >
              <Upload size={14} /> Upload
            </button>
            <button
              type="button"
              onClick={triggerCamera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs transition"
            >
              <Camera size={14} /> Capture
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  if (uploadRef.current) {
                    uploadRef.current.value = '';
                    handleFileChange({ target: { files: null } } as any);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs transition"
              >
                Remove
              </button>
            )}
          </div>
          <input ref={uploadRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Max 2MB · JPG, PNG, SVG</p>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-700/50">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm transition shadow"
        >
          Next: Registration Fee <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ---------- Step 2: Payment ----------
interface Step2Props {
  formData: MemberFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  pricingOptions: MembershipPricing[];
  qrCode?: string;
  errors?: Record<string, string>;
  membershipFee: number;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const Step2Payment = ({
  formData,
  handleChange,
  pricingOptions,
  qrCode,
  errors = {},
  membershipFee = 150,
  isSubmitting,
  onBack,
  onSubmit,
}: Step2Props) => {
  const [showTransactionId, setShowTransactionId] = useState(formData.payment_type === 'gcash');

  useEffect(() => {
    setShowTransactionId(formData.payment_type === 'gcash');
  }, [formData.payment_type]);

  const fieldClasses = (fieldName: string) =>
    `w-full bg-black/40 border ${errors[fieldName] ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-400">One-Time Membership Fee</p>
        <p className="text-2xl font-bold text-white">₱{membershipFee}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-400">Payment Mode</label>
          <select
            name="payment_type"
            value={formData.payment_type}
            onChange={(e) => {
              handleChange(e);
              setShowTransactionId(e.target.value === 'gcash');
            }}
            className={fieldClasses('payment_type')}
          >
            <option value="cash">Cash</option>
            <option value="gcash">GCash</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400">OR Number</label>
          <input
            name="or_number"
            value={formData.or_number || ''}
            readOnly
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 cursor-not-allowed"
          />
          <p className="text-[10px] text-gray-500 mt-0.5">Auto-generated</p>
        </div>
        {showTransactionId && (
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-400">Transaction ID (GCash Ref)</label>
            <input
              name="transaction_id"
              value={formData.transaction_id}
              onChange={handleChange}
              placeholder="e.g., 4X7F9G2K1L"
              className={fieldClasses('transaction_id')}
            />
            {errors.transaction_id && <p className="text-xs text-red-400 mt-0.5">{errors.transaction_id}</p>}
            <p className="text-[10px] text-gray-500 mt-0.5">GCash reference number</p>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-400">Payment Status</label>
          <select name="payment_status" value={formData.payment_status} onChange={handleChange} className={fieldClasses('payment_status')}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400">Paid At</label>
          <input name="paid_at" type="datetime-local" value={formData.paid_at} onChange={handleChange} className={fieldClasses('paid_at')} />
        </div>
      </div>

      {qrCode && (
        <div className="pt-3 border-t border-gray-700/50 text-center">
          <h4 className="text-xs font-medium text-gray-400 mb-1">QR Code</h4>
          <div className="flex justify-center">
            <div className="bg-white p-1 rounded-lg">
              <QRCode value={qrCode} size={96} />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 font-mono break-all">{qrCode}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition shadow disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Complete Registration'}
        </button>
      </div>
    </form>
  );
};

// ---------- Main Modal ----------
interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  formData: MemberFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  pricingOptions: MembershipPricing[];
  isSubmitting: boolean;
  preview: string | null;
  qrCode?: string;
  errors?: Record<string, string>;
  membershipFee?: number;
}

export const MemberFormModal = ({
  isOpen,
  onClose,
  mode,
  formData,
  handleChange,
  handleFileChange,
  handleSubmit,
  pricingOptions,
  isSubmitting,
  preview,
  qrCode,
  errors = {},
  membershipFee = 150,
}: MemberFormModalProps) => {
  const [step, setStep] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const steps = ['Member Info', 'Registration Fee'];

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setShowCamera(false);
      setLocalErrors({});
    }
  }, [isOpen]);

  const generateOrNumber = () => `OR-${Date.now().toString().slice(-6)}`;

  const handleNext = () => {
    const required = ['firstname', 'lastname', 'email', 'contact', 'address', 'sex'];
    const newErrors: Record<string, string> = {};
    required.forEach(field => {
      if (!formData[field as keyof MemberFormData]) {
        newErrors[field] = 'This field is required.';
      }
    });
    if (formData.contact && !/^9\d*$/.test(formData.contact)) {
      newErrors.contact = 'Must start with 9 and contain only digits.';
    }
    if (Object.keys(newErrors).length > 0) {
      setLocalErrors(newErrors);
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setLocalErrors({});
    // Auto‑generate OR if empty
    if (!formData.or_number) {
      handleChange({ target: { name: 'or_number', value: generateOrNumber() } } as any);
    }
    setStep(2);
  };

  const handlePrev = () => {
    setStep(1);
    setLocalErrors({});
  };

  const triggerCamera = () => setShowCamera(true);
  const handleCapture = (file: File) => {
    handleFileChange({ target: { files: [file] } } as any);
  };

  return (
    <>
      <Modal title={mode === 'create' ? 'Create Member Account' : 'Edit Member'} isOpen={isOpen} onClose={onClose}>
        <StepIndicator currentStep={step} steps={steps} />
        {step === 1 ? (
          <Step1MemberInfo
            formData={formData}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            preview={preview}
            isEdit={mode === 'edit'}
            triggerCamera={triggerCamera}
            errors={errors}
            localErrors={localErrors}
            onNext={handleNext}
          />
        ) : (
          <Step2Payment
            formData={formData}
            handleChange={handleChange}
            pricingOptions={pricingOptions}
            qrCode={qrCode}
            errors={errors}
            membershipFee={membershipFee}
            isSubmitting={isSubmitting}
            onBack={handlePrev}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>

      <CameraModal isOpen={showCamera} onClose={() => setShowCamera(false)} onCapture={handleCapture} />
    </>
  );
};

// ---------- Profile Modal ----------
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  storageUrl: string;
}

export const ProfileModal = ({ isOpen, onClose, member, storageUrl }: ProfileModalProps) => {
  const STORAGE_URL = storageUrl || import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

  return (
    <Modal title="Member Profile" isOpen={isOpen} onClose={onClose}>
      {member && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {member.profile ? (
              <img
                src={`${STORAGE_URL}/${member.profile}`}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl font-bold text-white">
                {member.firstname[0]}{member.lastname[0]}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">{member.firstname} {member.lastname}</h3>
              <p className="text-sm text-gray-400">{member.email}</p>
              <p className="text-sm text-gray-400">{member.contact}</p>
              <p className="text-xs text-gray-500">Joined {new Date(member.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
            <div><span className="text-gray-500">Sex:</span> <span className="text-gray-300 capitalize">{member.sex}</span></div>
            <div><span className="text-gray-500">Address:</span> <span className="text-gray-300">{member.address}</span></div>
            <div><span className="text-gray-500">Membership Status:</span> <span className="text-gray-300">{member.membership_status ? 'Active' : 'Inactive'}</span></div>
            <div><span className="text-gray-500">Contract Status:</span> <span className="text-gray-300">{member.contract_status ? 'Active' : 'Inactive'}</span></div>
          </div>
          {member.membership_fee && (
            <div className="border-t border-gray-700 pt-3">
              <h4 className="font-semibold text-white text-sm mb-2">Membership Fee</h4>
              <div className="grid grid-cols-2 gap-2 text-sm bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                <div><span className="text-gray-500">Payment:</span> <span className="text-gray-300 capitalize">{member.membership_fee.payment_type}</span></div>
                <div><span className="text-gray-500">Amount:</span> <span className="text-gray-300">₱{member.membership_fee.payment_amount}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className="text-gray-300 capitalize">{member.membership_fee.payment_status}</span></div>
                <div><span className="text-gray-500">OR:</span> <span className="text-gray-300">{member.membership_fee.or_number || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Txn ID:</span> <span className="text-gray-300">{member.membership_fee.transaction_id || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Paid At:</span> <span className="text-gray-300">{member.membership_fee.paid_at ? new Date(member.membership_fee.paid_at).toLocaleString() : 'Not paid'}</span></div>
              </div>
            </div>
          )}
          {member.qr_code && (
            <div className="border-t border-gray-700 pt-3 text-center">
              <h4 className="font-semibold text-white text-sm mb-1">QR Code</h4>
              <div className="flex justify-center">
                <div className="bg-white p-1 rounded-lg">
                  <QRCode value={member.qr_code} size={96} />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-mono break-all">{member.qr_code}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};