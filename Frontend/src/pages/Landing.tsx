import React, { useState, useEffect } from 'react';
import { settingsService, STORAGE_URL } from '../services/api';
import toast from 'react-hot-toast';
import {
  Dumbbell,
  FileText,
  MapPin,
  Mail,
  Phone,
  Image,
  Globe,
  Save,
  Loader2,
  Upload,
  X,
  Check,
  Eye,
  Edit3,
  Palette
} from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    gym_name: '',
    description: '',
    location: '',
    email: '',
    contact: '',
    logo: null as File | null,
    favicon: null as File | null,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      const data = response.data.data;
      setFormData({
        gym_name: data.gym_name || '',
        description: data.description || '',
        location: data.location || '',
        email: data.email || '',
        contact: data.contact || '',
        logo: null,
        favicon: null,
      });
      if (data.logo) {
        setPreviewLogo(`${STORAGE_URL}/${data.logo}`);
      }
      if (data.favicon) {
        setPreviewFavicon(`${STORAGE_URL}/${data.favicon}`);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, [e.target.name]: file });
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (e.target.name === 'logo') {
          setPreviewLogo(reader.result as string);
        } else if (e.target.name === 'favicon') {
          setPreviewFavicon(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type: 'logo' | 'favicon') => {
    setFormData({ ...formData, [type]: null });
    if (type === 'logo') {
      setPreviewLogo(null);
    } else {
      setPreviewFavicon(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          data.append(key, value);
        }
      });
      await settingsService.updateSettings(data);
      toast.success('Settings updated successfully!');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-xl">
              <Dumbbell className="w-7 h-7 text-red-500" />
            </div>
            Gym Settings
          </h1>
          <p className="text-gray-400 mt-1">Customize your gym's brand and information</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-400">Live</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===== BRAND CARD ===== */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Brand Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gym Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Dumbbell className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  name="gym_name"
                  value={formData.gym_name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  placeholder="Enter gym name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition resize-none"
                  placeholder="Describe your gym"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== CONTACT CARD ===== */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  placeholder="contact@gym.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  placeholder="09123456789"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  placeholder="123 Main St, City, Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== MEDIA CARD ===== */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Image className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Brand Assets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo
              </label>
              <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition ${
                previewLogo 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-gray-700 hover:border-red-500/30 bg-black/30'
              }`}>
                {previewLogo ? (
                  <div className="space-y-3">
                    <img src={previewLogo} alt="Logo Preview" className="max-h-32 mx-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => removeFile('logo')}
                      className="text-sm text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Drop your logo here or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 5MB</p>
                  </>
                )}
                <input
                  type="file"
                  name="logo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Favicon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Favicon
              </label>
              <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition ${
                previewFavicon 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-gray-700 hover:border-red-500/30 bg-black/30'
              }`}>
                {previewFavicon ? (
                  <div className="space-y-3">
                    <img src={previewFavicon} alt="Favicon Preview" className="h-16 mx-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => removeFile('favicon')}
                      className="text-sm text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Globe className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Drop your favicon here</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, ICO up to 1MB</p>
                  </>
                )}
                <input
                  type="file"
                  name="favicon"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== PREVIEW CARD ===== */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/30 border border-gray-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Eye className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Preview</h2>
          </div>
          <div className="bg-black/50 rounded-xl p-4 flex items-center gap-4">
            {previewLogo ? (
              <img src={previewLogo} alt="Logo Preview" className="h-12 w-auto" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-lg">{formData.gym_name || 'Your Gym Name'}</p>
              <p className="text-gray-400 text-sm">{formData.description || 'Your gym description'}</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-red-500/25"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Settings;