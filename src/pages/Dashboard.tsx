import { MetricCard } from "@/components/Dashboard/MetricCard";
import { SoftwareCard } from "@/components/Dashboard/SoftwareCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useSoftware } from "@/hooks/useSoftware";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  TrendingUp,
  Loader2
} from "lucide-react";

export default function Dashboard() {
  const { software, loading: softwareLoading, deleteSoftware, refetch } = useSoftware();
  const { logs, loading: logsLoading, refetch: refetchLogs } = useActivityLogs();

  // Set up real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'software'
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        () => {
          refetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, refetchLogs]);

  // Calculate metrics from real data
  const metrics = {
    totalSoftware: software.length,
    averageUptime: software.length > 0 
      ? Number((software.reduce((sum, s) => sum + s.uptime_percentage, 0) / software.length).toFixed(1))
      : 0,
    totalIntegrations: software.reduce((sum, s) => sum + s.integrations_count, 0),
    alertsToday: software.filter(s => s.status === 'poor' || s.status === 'fair').length
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'software_added': return 'bg-primary';
      case 'performance_improved': return 'bg-success';
      case 'performance_degraded': 
      case 'uptime_alert': return 'bg-warning';
      case 'integration_detected': return 'bg-accent';
      default: return 'bg-muted-foreground';
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and evaluate your software stack performance
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/add-software">
            <Plus className="h-4 w-4 mr-2" />
            Add Software
          </Link>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Software"
          value={metrics.totalSoftware}
          description="Applications monitored"
          icon={Activity}
          status="default"
        />
        <MetricCard
          title="Average Uptime"
          value={`${metrics.averageUptime}%`}
          description="Across all applications"
          icon={CheckCircle}
          status={metrics.averageUptime > 95 ? "success" : metrics.averageUptime > 90 ? "warning" : "destructive"}
        />
        <MetricCard
          title="Integrations"
          value={metrics.totalIntegrations}
          description="Total available integrations"
          icon={TrendingUp}
          status="default"
        />
        <MetricCard
          title="Alerts Today"
          value={metrics.alertsToday}
          description="Performance alerts triggered"
          icon={AlertCircle}
          status={metrics.alertsToday === 0 ? "success" : metrics.alertsToday < 3 ? "warning" : "destructive"}
        />
      </div>

      {/* Recent Activity & Top Software */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${getActivityColor(log.activity_type)} rounded-full mt-2 flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.title}</p>
                      {log.description && (
                        <p className="text-xs text-muted-foreground">{log.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity. Start by adding your first software application.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Software */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Software Overview</h2>
          {softwareLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : software.length > 0 ? (
            <div className="grid gap-4">
              {software.map((item) => (
                <SoftwareCard
                  key={item.id}
                  software={{
                    id: item.id,
                    name: item.name,
                    version: item.version || 'N/A',
                    category: item.category,
                    performanceScore: item.performance_score,
                    uptimePercentage: item.uptime_percentage,
                    integrations: item.integrations_count,
                    lastUpdated: formatTimeAgo(item.updated_at),
                    status: item.status,
                    website: item.website
                  }}
                  onView={(id) => console.log("View:", id)}
                  onCompare={(id) => console.log("Compare:", id)}
                  onDelete={deleteSoftware}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No software added yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by adding your first software application to begin monitoring and evaluation.
                </p>
                <Button asChild>
                  <Link to="/add-software">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Software
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}