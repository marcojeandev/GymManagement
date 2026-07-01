import { useState, useEffect } from 'react';
import { settingsService } from '../services/api';

export type SetupStatus = 'loading' | 'configured' | 'not_configured';

/**
 * Checks whether the gym has been set up (i.e. gym_name exists in system_settings
 * and an admin user has been created).
 *
 * Returns:
 *  - 'loading'         while the API call is in flight
 *  - 'configured'      when gym_name is present → login is accessible, setup is blocked
 *  - 'not_configured'  when no settings → setup is accessible, login is blocked
 */
export function useSetupStatus(): SetupStatus {
  const [status, setStatus] = useState<SetupStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    settingsService
      .getSettings()
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data;
        const isConfigured = !!data?.gym_name && data.gym_name.trim() !== '';
        setStatus(isConfigured ? 'configured' : 'not_configured');
      })
      .catch(() => {
        if (!cancelled) setStatus('not_configured');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
