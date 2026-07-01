import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsService, STORAGE_URL } from '../services/api';
import toast from 'react-hot-toast';
import {
  Dumbbell, MapPin, Mail, Phone, LogIn, Loader2,
  ArrowRight, Activity, Users, CalendarCheck, ShieldCheck
} from 'lucide-react';

interface SettingsData {
  gym_name: string;
  description: string;
  location: string;
  email: string;
  contact: string;
  logo: string | null;
  favicon: string | null;
}

const Landing = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsService.getSettings();
        const data: SettingsData = res.data.data;

        // If gym_name is empty/null, the system has not been set up yet → go to setup
        if (!data || !data.gym_name || data.gym_name.trim() === '') {
          navigate('/setup', { replace: true });
          return;
        }

        // System is already configured → go straight to login
        navigate('/login', { replace: true });
      } catch {
        // If the API errors (e.g. 404 / no settings yet) → treat as not configured
        navigate('/setup', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  // This component just acts as the smart redirect gate
  // Show a branded loader while we decide where to send the user
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808] gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-red-600/30 rounded-2xl blur-2xl scale-150" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-xl">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
      </div>
      <Loader2 className="w-7 h-7 animate-spin text-red-500 opacity-70" />
      <p className="text-gray-600 text-sm tracking-widest uppercase">Loading…</p>
    </div>
  );
};

export default Landing;