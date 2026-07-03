// File: src/components/admin/MemberModals.tsx
import { X, ChevronLeft, ChevronRight, Camera, CameraOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import Webcam from 'react-webcam';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ---------- Camera Capture Modal ----------
interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal = ({ isOpen, onClose, onCapture }: CameraModalProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setScreenshot(imageSrc);
      // Convert data URL to File
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
          onCapture(file);
          onClose();
          setScreenshot(null);
        });
    }
  };

  const retake = () => {
    setScreenshot(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-4 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Take a Photo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
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
        <div className="flex justify-between items-center mt-4 gap-3">
          {!screenshot ? (
            <>
              <button
                onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2"
              >
                <CameraOff size={16} /> Flip
              </button>
              <button
                onClick={capture}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center gap-2"
              >
                <Camera size={16} /> Capture
              </button>
              <button onClick={onClose} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Retake
              </button>
              <button
                onClick={() => {
                  // The file is already passed via onCapture when capture was taken.
                  // We just close the modal.
                  onClose();
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
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
  <div className="flex items-center justify-center gap-3 mb-6">
    {steps.map((label, index) => (
      <div key={index} className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
            index + 1 === currentStep
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
              : index + 1 < currentStep
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {index + 1 < currentStep ? '✓' : index + 1}
        </div>
        <span
          className={`text-xs font-medium ${
            index + 1 === currentStep ? 'text-white' : 'text-gray-500'
          } hidden sm:inline`}
        >
          {label}
        </span>
        {index < steps.length - 1 && (
          <div
            className={`w-6 h-px ${
              index + 1 < currentStep ? 'bg-green-600' : 'bg-gray-700'
            } hidden sm:block`}
          />
        )}
      </div>
    ))}
  </div>
);

// ---------- Step 1: Member Info ----------
interface Step1Props {
  formData: MemberFormData;
  handleChange: any;
  handleFileChange: any;
  preview: string | null;
  isEdit: boolean;
  triggerCamera: () => void;
}

const Step1MemberInfo = ({
  formData,
  handleChange,
  handleFileChange,
  preview,
  isEdit,
  triggerCamera,
}: Step1Props) => {
  const uploadRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          placeholder="First Name *"
          className="input"
          required
        />
        <input
          name="middlename"
          value={formData.middlename}
          onChange={handleChange}
          placeholder="Middle Name"
          className="input"
        />
        <input
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          placeholder="Last Name *"
          className="input"
          required
        />
        <input
          name="suffix"
          value={formData.suffix}
          onChange={handleChange}
          placeholder="Suffix (Jr., Sr.)"
          className="input"
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email *"
          className="input"
          required
        />
        <input
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Contact *"
          className="input"
          required
        />
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address *"
          className="input md:col-span-2"
          required
        />
        <select name="sex" value={formData.sex} onChange={handleChange} className="input md:col-span-2">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Profile Photo */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {preview ? (
            <img src={preview} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border-2 border-red-500" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-2xl font-bold">
              {formData.firstname?.[0] || '?'}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2 transition"
            >
              <Camera size={16} /> Upload
            </button>
            <button
              type="button"
              onClick={triggerCamera}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2 transition"
            >
              <Camera size={16} /> Capture
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG</p>
      </div>
    </div>
  );
};

// ---------- Step 2: Payment & Membership ----------
interface Step2Props {
  formData: MemberFormData;
  handleChange: any;
  pricingOptions: MembershipPricing[];
  qrCode?: string;
}

const Step2Payment = ({ formData, handleChange, pricingOptions, qrCode }: Step2Props) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <select
        name="membership_id"
        value={formData.membership_id}
        onChange={handleChange}
        className="input"
        required
      >
        <option value="">Select Membership *</option>
        {pricingOptions.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} (₱{p.price})
          </option>
        ))}
      </select>
      <select name="payment_type" value={formData.payment_type} onChange={handleChange} className="input">
        <option value="cash">Cash</option>
        <option value="gcash">GCash</option>
      </select>
      <input
        name="payment_amount"
        type="number"
        value={formData.payment_amount}
        onChange={handleChange}
        placeholder="Amount"
        className="input"
      />
      <input
        name="or_number"
        value={formData.or_number}
        onChange={handleChange}
        placeholder="OR Number"
        className="input"
      />
      <input
        name="transaction_id"
        value={formData.transaction_id}
        onChange={handleChange}
        placeholder="Transaction ID"
        className="input"
      />
      <select name="payment_status" value={formData.payment_status} onChange={handleChange} className="input">
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
      </select>
      <input
        name="paid_at"
        type="datetime-local"
        value={formData.paid_at}
        onChange={handleChange}
        className="input"
      />
    </div>

    {qrCode && (
      <div className="border-t border-gray-700 pt-4 mt-4 text-center">
        <h4 className="text-sm font-medium text-gray-300 mb-2">QR Code</h4>
        <QRCode value={qrCode} size={128} />
        <p className="text-xs text-gray-500 mt-1">{qrCode}</p>
      </div>
    )}
  </div>
);

// ---------- Main Form Modal ----------
interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  formData: MemberFormData;
  handleChange: any;
  handleFileChange: any;
  handleSubmit: (e: React.FormEvent) => void;
  pricingOptions: MembershipPricing[];
  isSubmitting: boolean;
  preview: string | null;
  qrCode?: string;
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
}: MemberFormModalProps) => {
  const [step, setStep] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const totalSteps = 2;
  const steps = ['Member Info', 'Payment'];

  // Reset step when modal closes
  useEffect(() => {
    if (!isOpen) setStep(1);
  }, [isOpen]);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };
  const isFirstStep = step === 1;
  const isLastStep = step === totalSteps;

  const triggerCamera = () => setShowCamera(true);

  const handleCapture = (file: File) => {
    handleFileChange({ target: { files: [file] } } as any);
  };

  return (
    <>
      <Modal title={mode === 'create' ? 'Add New Member' : 'Edit Member'} isOpen={isOpen} onClose={onClose}>
        <StepIndicator currentStep={step} steps={steps} />
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <Step1MemberInfo
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              preview={preview}
              isEdit={mode === 'edit'}
              triggerCamera={triggerCamera}
            />
          )}
          {step === 2 && (
            <Step2Payment
              formData={formData}
              handleChange={handleChange}
              pricingOptions={pricingOptions}
              qrCode={qrCode}
            />
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex items-center gap-1 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} /> Back
            </button>
            {isLastStep ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Member' : 'Update Member'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />
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

export const ProfileModal = ({ isOpen, onClose, member, storageUrl }: ProfileModalProps) => (
  <Modal title="Member Profile" isOpen={isOpen} onClose={onClose}>
    {member && (
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          {member.profile ? (
            <img src={`${storageUrl}/${member.profile}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-red-500" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-3xl font-bold text-white">
              {member.firstname[0]}{member.lastname[0]}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-white">{member.firstname} {member.lastname}</h3>
            <p className="text-gray-400">{member.email}</p>
            <p className="text-gray-400">{member.contact}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Sex:</span> {member.sex}</div>
          <div><span className="text-gray-500">Address:</span> {member.address}</div>
          <div><span className="text-gray-500">Membership Status:</span> {member.membership_status ? 'Active' : 'Inactive'}</div>
          <div><span className="text-gray-500">Contract Status:</span> {member.contract_status ? 'Active' : 'Inactive'}</div>
        </div>
        {member.membership_fee && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="font-semibold text-white mb-2">Membership Fee</h4>
            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-800/30 p-4 rounded-xl">
              <div><span className="text-gray-500">Payment Type:</span> {member.membership_fee.payment_type}</div>
              <div><span className="text-gray-500">Amount:</span> ₱{member.membership_fee.payment_amount}</div>
              <div><span className="text-gray-500">Status:</span> {member.membership_fee.payment_status}</div>
              <div><span className="text-gray-500">OR Number:</span> {member.membership_fee.or_number || 'N/A'}</div>
              <div className="col-span-2"><span className="text-gray-500">Transaction ID:</span> {member.membership_fee.transaction_id || 'N/A'}</div>
              <div className="col-span-2"><span className="text-gray-500">Paid At:</span> {member.membership_fee.paid_at ? new Date(member.membership_fee.paid_at).toLocaleString() : 'Not paid'}</div>
            </div>
          </div>
        )}
        {member.qr_code && (
          <div className="border-t border-gray-700 pt-4 text-center">
            <h4 className="font-semibold text-white mb-2">QR Code</h4>
            <QRCode value={member.qr_code} size={128} />
            <p className="text-xs text-gray-500 mt-1">{member.qr_code}</p>
          </div>
        )}
      </div>
    )}
  </Modal>
);