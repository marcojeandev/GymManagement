// File: src/hooks/useSetupStatus.ts
import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService'; // ✅ correct import

export const useSetupStatus = () => {
  const [status, setStatus] = useState<'loading' | 'configured' | 'not_configured'>('loading');

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await settingsService.getSettings();
        const data = res.data.data;
        // If gym_name exists and is not empty, system is configured
        if (data?.gym_name && data.gym_name.trim() !== '') {
          setStatus('configured');
        } else {
          setStatus('not_configured');
        }
      } catch {
        setStatus('not_configured');
      }
    };

    checkSetup();
  }, []);

  return status;
};