import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useExternalIntegrations() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const syncGitHubRepos = async (username: string) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to sync GitHub repositories.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('github-integration', {
        body: { username, action: 'fetch_repos' }
      });

      if (error) throw error;

      toast({
        title: "GitHub sync successful",
        description: "Your repositories have been imported successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('GitHub sync error:', error);
      toast({
        title: "GitHub sync failed",
        description: error.message || "Failed to sync GitHub repositories",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const syncGitLabRepos = async (username: string) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to sync GitLab projects.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('gitlab-integration', {
        body: { username, action: 'fetch_repos' }
      });

      if (error) throw error;

      toast({
        title: "GitLab sync successful",
        description: "Your projects have been imported successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('GitLab sync error:', error);
      toast({
        title: "GitLab sync failed",
        description: error.message || "Failed to sync GitLab projects",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const autoDetectSoftware = async (platform: 'github' | 'gitlab') => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to auto-detect software.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const functionName = platform === 'github' ? 'github-integration' : 'gitlab-integration';
      
      const { error } = await supabase.functions.invoke(functionName, {
        body: { action: 'auto_detect' }
      });

      if (error) throw error;

      toast({
        title: "Auto-detection complete",
        description: `Software applications have been automatically detected from ${platform}.`,
      });

      return true;
    } catch (error: any) {
      console.error('Auto-detection error:', error);
      toast({
        title: "Auto-detection failed",
        description: error.message || "Failed to auto-detect software",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    syncGitHubRepos,
    syncGitLabRepos,
    autoDetectSoftware
  };
}