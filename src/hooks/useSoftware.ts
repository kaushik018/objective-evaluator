import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface SoftwareData {
  id: string;
  name: string;
  version?: string;
  category: string;
  description?: string;
  website?: string;
  api_endpoint?: string;
  status_page?: string;
  tags: string[];
  performance_score: number;
  uptime_percentage: number;
  integrations_count: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface CreateSoftwareData {
  name: string;
  version?: string;
  category: string;
  description?: string;
  website?: string;
  api_endpoint?: string;
  status_page?: string;
  tags?: string[];
}

export function useSoftware() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [software, setSoftware] = useState<SoftwareData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSoftware = async () => {
    if (!user) {
      setSoftware([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('software')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSoftware((data || []).map(item => ({
        ...item,
        status: item.status as 'excellent' | 'good' | 'fair' | 'poor' | 'pending'
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load software data",
        variant: "destructive"
      });
      console.error('Error fetching software:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSoftware = async (data: CreateSoftwareData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data: newSoftware, error } = await supabase
        .from('software')
        .insert([{
          ...data,
          user_id: user.id,
          tags: data.tags || [],
        }])
        .select()
        .single();

      if (error) throw error;

      // Add activity log
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          software_id: newSoftware.id,
          activity_type: 'software_added',
          title: `${data.name} added for evaluation`,
          description: `New ${data.category} software added to monitoring`
        }]);

      await fetchSoftware();
      return newSoftware;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add software",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSoftware = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('software')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSoftware();
      toast({
        title: "Success",
        description: "Software removed successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove software",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSoftware();
  }, [user]);

  return {
    software,
    loading,
    addSoftware,
    deleteSoftware,
    refetch: fetchSoftware
  };
}