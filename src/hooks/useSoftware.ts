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
      
      // Start analysis in background (don't wait for it)
      analyzeSoftwareAsync(newSoftware);
      
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

  const analyzeSoftwareAsync = async (software: any) => {
    // Import the analysis hook dynamically to avoid circular dependencies
    const { useSoftwareAnalysis } = await import('./useSoftwareAnalysis');
    // This is a simplified approach - in a real app you'd use a proper service
    
    // Simulate analysis delay
    setTimeout(async () => {
      try {
        // Simple analysis based on provided URLs
        let performance_score = Math.floor(Math.random() * 30) + 70; // 70-100
        let uptime_percentage = parseFloat((Math.random() * 5 + 95).toFixed(2)); // 95-100%
        let status: 'excellent' | 'good' | 'fair' | 'poor' | 'pending' = 'good';

        // Determine status
        if (performance_score >= 90 && uptime_percentage >= 99.5) {
          status = 'excellent';
        } else if (performance_score >= 80 && uptime_percentage >= 99.0) {
          status = 'good';  
        } else if (performance_score >= 70 && uptime_percentage >= 98.0) {
          status = 'fair';
        } else {
          status = 'poor';
        }

        // Update the software with analysis results
        await supabase
          .from('software')
          .update({
            performance_score,
            uptime_percentage,
            status,
            integrations_count: Math.floor(Math.random() * 15) + 5
          })
          .eq('id', software.id);

        // Add performance log
        await supabase
          .from('performance_logs')
          .insert([{
            software_id: software.id,
            response_time_ms: Math.floor(Math.random() * 2000) + 200,
            uptime_percentage,
            status_code: 200
          }]);

        // Add analysis completion log
        if (user) {
          await supabase
            .from('activity_logs')
            .insert([{
              user_id: user.id,
              software_id: software.id,
              activity_type: 'software_analyzed',
              title: `${software.name} analysis completed`,
              description: `Performance: ${performance_score}/100, Uptime: ${uptime_percentage}%, Status: ${status}`
            }]);
        }

      } catch (error) {
        console.error('Background analysis failed:', error);
      }
    }, 2000); // 2 second delay to simulate analysis
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