import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useErrorTracking() {
  const { session } = useAuth();

  const logError = async (error: Error, url?: string) => {
    if (!session) return;

    try {
      await supabase.functions.invoke('error-tracking', {
        body: {
          error_message: error.message,
          stack_trace: error.stack,
          url: url || window.location.href,
          user_agent: navigator.userAgent
        }
      });
    } catch (trackingError) {
      console.error('Failed to log error:', trackingError);
    }
  };

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError(new Error(event.error?.message || 'Unknown error'), event.filename);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(new Error(event.reason?.message || 'Unhandled promise rejection'));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [session]);

  return { logError };
}