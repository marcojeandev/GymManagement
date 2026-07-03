// File: src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSetupStatus } from '../hooks/useSetupStatus';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const setupStatus = useSetupStatus();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (setupStatus === 'not_configured') {
      navigate('/setup', { replace: true });
    }
  }, [setupStatus, navigate]);

  if (setupStatus === 'loading' || setupStatus === 'not_configured') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-600/30 rounded-2xl blur-2xl scale-150" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-xl">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>
        <Loader2 className="w-7 h-7 animate-spin text-red-500 opacity-70" />
        <p className="text-gray-600 text-sm tracking-widest uppercase">
          {setupStatus === 'not_configured' ? 'Redirecting to setup…' : 'Loading…'}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      const { data } = response.data;

      // ✅ Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Logged in successfully!');

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row text-white font-sans">
      {/* Left side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-black/90 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="relative z-20 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">Push Your Limits</h1>
          <p className="text-lg text-gray-300 max-w-md leading-relaxed">Access your personalized dashboard, track your progress, and conquer your fitness goals today.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#111] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-center tracking-tight">Welcome Back</h2>
          </div>

          <div className="hidden md:block mb-12">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-gray-400 text-lg">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-gray-300">Password</label>
                <a href="#" className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 mt-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-gray-400">
            Don't have an account?{' '}
            <a href="#" className="text-red-500 hover:text-red-400 font-semibold transition-colors">Contact admin</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;