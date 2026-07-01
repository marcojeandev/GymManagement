import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '../services/api';
import { useSetupStatus } from '../hooks/useSetupStatus';
import toast from 'react-hot-toast';
import {
  Dumbbell, Upload, MapPin, Mail, Phone, FileText,
  Building2, ArrowRight, Loader2, CheckCircle2, ImagePlus,
  User, Lock, Eye, EyeOff, ShieldCheck,
} from 'lucide-react';

const Setup = () => {
  const navigate = useNavigate();
  const setupStatus = useSetupStatus();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  // All form-state hooks must be declared before any conditional returns
  const [form, setForm] = useState({
    gym_name: '',
    description: '',
    location: '',
    email: '',
    contact: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const [files, setFiles] = useState<{ logo: File | null; favicon: File | null }>({
    logo: null,
    favicon: null,
  });

  // Guard: if system is already configured, redirect to login
  useEffect(() => {
    if (setupStatus === 'configured') {
      navigate('/login', { replace: true });
    }
  }, [setupStatus, navigate]);

  // Show branded loader while checking setup status
  if (setupStatus === 'loading' || setupStatus === 'configured') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-600/30 rounded-2xl blur-2xl scale-150" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-xl">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>
        <Loader2 className="w-7 h-7 animate-spin text-red-500 opacity-70" />
        <p className="text-gray-600 text-sm tracking-widest uppercase">
          {setupStatus === 'configured' ? 'Redirecting to login…' : 'Checking configuration…'}
        </p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (type: 'logo' | 'favicon') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles({ ...files, [type]: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') setLogoPreview(reader.result as string);
      else setFaviconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gym_name.trim()) { toast.error('Gym name is required'); return; }
    if (!form.admin_name.trim()) { toast.error('Admin name is required'); return; }
    if (!form.admin_email.trim()) { toast.error('Admin email is required'); return; }
    if (form.admin_password.length < 8) { toast.error('Password must be at least 8 characters'); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('gym_name', form.gym_name);
      formData.append('description', form.description);
      formData.append('location', form.location);
      formData.append('email', form.email);
      formData.append('contact', form.contact);
      formData.append('admin_name', form.admin_name);
      formData.append('admin_email', form.admin_email);
      formData.append('admin_password', form.admin_password);
      if (files.logo) formData.append('logo', files.logo);
      if (files.favicon) formData.append('favicon', files.favicon);

      await settingsService.updateSettings(formData);
      toast.success('Gym configured! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error(err?.response?.data?.message || 'Failed to save settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Progress steps
  const steps = [
    { label: 'Gym Info',  done: !!form.gym_name },
    { label: 'Contact',   done: !!form.email && !!form.contact },
    { label: 'Branding',  done: !!files.logo },
    { label: 'Admin',     done: !!form.admin_name && !!form.admin_email && form.admin_password.length >= 8 },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      {/* Top bar */}
      <div className="w-full border-b border-white/5 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center gap-3 shrink-0 sticky top-0 z-50">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md shadow-red-500/20">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">First-Time Setup</span>
        <div className="ml-auto flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all
                ${step.done
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-white/5 text-gray-500 border-white/5'
                }`}>
                {step.done
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">{i + 1}</span>
                }
                <span className="hidden md:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && <div className="w-3 h-px bg-white/10 hidden md:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto py-12 px-4 relative">
        {/* Background glow */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-3xl relative z-10">
          {/* Heading */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-5 uppercase tracking-widest">
              ⚙ System Configuration
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Set Up Your Gym
            </h1>
            <p className="text-gray-400 text-base max-w-lg mx-auto">
              Configure your gym profile and create the administrator account. This only runs once.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Section 1: Gym Info ─────────────────────── */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-1 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Gym Information</h2>
                  <p className="text-xs text-gray-500">Shown publicly on your landing page</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">
                  Gym Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="gym_name" value={form.gym_name}
                  onChange={handleChange} required
                  placeholder="e.g. Iron Peak Fitness"
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-500" /> Description
                </label>
                <textarea
                  name="description" value={form.description}
                  onChange={handleChange} rows={3}
                  placeholder="Briefly describe your gym…"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 outline-none text-white placeholder-gray-600 transition-all resize-none text-sm"
                />
              </div>
            </div>

            {/* ── Section 2: Contact ──────────────────────── */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-1 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Contact Details</h2>
                  <p className="text-xs text-gray-500">Displayed in the footer of your landing page</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-500" /> Email Address
                  </label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="gym@example.com" className="input-field" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500" /> Phone / Contact
                  </label>
                  <input type="text" name="contact" value={form.contact} onChange={handleChange}
                    placeholder="+1 (555) 000-0000" className="input-field" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" /> Location / Address
                </label>
                <input type="text" name="location" value={form.location} onChange={handleChange}
                  placeholder="123 Fitness Ave, New York, NY 10001" className="input-field" />
              </div>
            </div>

            {/* ── Section 3: Branding ─────────────────────── */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-1 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <ImagePlus className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Branding</h2>
                  <p className="text-xs text-gray-500">Upload your gym logo and browser favicon</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Gym Logo</label>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange('logo')} />
                  <button type="button" onClick={() => logoRef.current?.click()}
                    className="w-full h-40 rounded-xl border-2 border-dashed border-white/10 hover:border-red-500/40 bg-white/[0.02] hover:bg-red-500/5 flex flex-col items-center justify-center gap-3 transition-all group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-28 w-28 object-contain rounded-xl" />
                    ) : (
                      <>
                        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-300">Click to upload logo</p>
                          <p className="text-xs text-gray-600 mt-0.5">PNG, JPG, SVG · Max 2MB</p>
                        </div>
                      </>
                    )}
                  </button>
                  {logoPreview && (
                    <button type="button" onClick={() => { setLogoPreview(null); setFiles(f => ({ ...f, logo: null })); }}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                      Remove logo
                    </button>
                  )}
                </div>

                {/* Favicon */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Favicon <span className="text-gray-600 text-xs">(optional)</span>
                  </label>
                  <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange('favicon')} />
                  <button type="button" onClick={() => faviconRef.current?.click()}
                    className="w-full h-40 rounded-xl border-2 border-dashed border-white/10 hover:border-red-500/40 bg-white/[0.02] hover:bg-red-500/5 flex flex-col items-center justify-center gap-3 transition-all group">
                    {faviconPreview ? (
                      <img src={faviconPreview} alt="Favicon" className="h-20 w-20 object-contain rounded-lg" />
                    ) : (
                      <>
                        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-300">Click to upload favicon</p>
                          <p className="text-xs text-gray-600 mt-0.5">ICO, PNG · Max 512KB</p>
                        </div>
                      </>
                    )}
                  </button>
                  {faviconPreview && (
                    <button type="button" onClick={() => { setFaviconPreview(null); setFiles(f => ({ ...f, favicon: null })); }}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                      Remove favicon
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 4: Admin Account ────────────────── */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-1 border-b border-red-500/10">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Administrator Account</h2>
                  <p className="text-xs text-gray-500">This will be the superadmin account with full access</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                    role: admin · status: active
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-500" /> Full Name <span className="text-red-500">*</span>
                </label>
                <input type="text" name="admin_name" value={form.admin_name} onChange={handleChange}
                  required placeholder="e.g. John Doe" className="input-field" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-500" /> Email Address <span className="text-red-500">*</span>
                </label>
                <input type="email" name="admin_email" value={form.admin_email} onChange={handleChange}
                  required placeholder="admin@yourgym.com" className="input-field" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-500" /> Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="admin_password" value={form.admin_password}
                    onChange={handleChange} required
                    placeholder="Minimum 8 characters"
                    className="input-field pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => {
                    const len = form.admin_password.length;
                    const active = (i === 0 && len >= 1) || (i === 1 && len >= 5) || (i === 2 && len >= 8) || (i === 3 && len >= 12);
                    return (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                        ${active
                          ? i < 2 ? 'bg-orange-500' : i === 2 ? 'bg-yellow-500' : 'bg-green-500'
                          : 'bg-white/10'
                        }`} />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-600">
                  {form.admin_password.length === 0
                    ? 'Enter a password'
                    : form.admin_password.length < 5
                    ? 'Too short'
                    : form.admin_password.length < 8
                    ? 'Almost there – needs 8+ characters'
                    : form.admin_password.length < 12
                    ? 'Good strength'
                    : 'Strong password ✓'}
                </p>
              </div>
            </div>

            {/* ── Submit ──────────────────────────────────── */}
            <button
              type="submit"
              disabled={saving || !form.gym_name.trim() || !form.admin_name.trim() || !form.admin_email.trim() || form.admin_password.length < 8}
              className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] active:scale-[0.99]"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving Configuration…</>
              ) : (
                <>Complete Setup & Continue <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="text-center text-xs text-gray-600 pb-6">
              Settings and admin credentials can be updated anytime from the admin dashboard.
            </p>
          </form>
        </div>
      </div>

      {/* Reusable inline style for inputs */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field::placeholder { color: #4b5563; }
        .input-field:focus {
          border-color: rgba(239,68,68,0.6);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
        }
      `}</style>
    </div>
  );
};

export default Setup;
