import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { systemSettingsApi } from '../services/systemSettingsApi';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [gymLogo, setGymLogo] = useState<string | null>(null);
  const [gymName, setGymName] = useState('Gym Management');

  useEffect(() => {
    systemSettingsApi.getGymSettings().then((settings) => {
      if (settings) {
        setGymName(settings.gym_name || 'Gym Management');
        if (settings.logo) {
          setGymLogo(`http://localhost:8000/storage/${settings.logo}`);
        }
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-pink-500/10 pointer-events-none" />
      <div className="absolute top-[-50%] right-[-20%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-50%] left-[-20%] w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#14181f] rounded-2xl shadow-2xl shadow-red-500/10 border border-gray-700/50 p-8 relative z-10 backdrop-blur-sm">
        {/* Logo & Gym Name */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 overflow-hidden">
              {gymLogo ? (
                <img src={gymLogo} alt={gymName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">G</span>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            {gymName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full bg-[#1e242c] border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition placeholder-gray-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-red-600/20 disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};