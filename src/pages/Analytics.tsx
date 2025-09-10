import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Activity, Clock, Plus, AlertTriangle } from "lucide-react";
import { useSoftware } from "@/hooks/useSoftware";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const getActivityColor = (type: string) => {
  switch (type) {
    case 'software_added': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
    case 'performance_alert': return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    case 'system_error': return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    default: return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
  }
};

const getActivityDotColor = (type: string) => {
  switch (type) {
    case 'software_added': return 'bg-green-500';
    case 'performance_alert': return 'bg-yellow-500';
    case 'system_error': return 'bg-red-500';
    default: return 'bg-blue-500';
  }
};

const getStatusHealth = (status: string) => {
  switch (status) {
    case 'excellent': return { color: 'bg-green-500', text: 'Excellent', textColor: 'text-green-700 dark:text-green-300' };
    case 'good': return { color: 'bg-blue-500', text: 'Good', textColor: 'text-blue-700 dark:text-blue-300' };
    case 'fair': return { color: 'bg-yellow-500', text: 'Fair', textColor: 'text-yellow-700 dark:text-yellow-300' };
    case 'poor': return { color: 'bg-red-500', text: 'Poor', textColor: 'text-red-700 dark:text-red-300' };
    default: return { color: 'bg-gray-500', text: 'Pending', textColor: 'text-gray-700 dark:text-gray-300' };
  }
};

export default function Analytics() {
  const { software, loading: softwareLoading, refetch } = useSoftware();
  const { logs, loading: logsLoading, refetch: refetchLogs } = useActivityLogs();

  // Set up real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('analytics-updates')
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

  if (softwareLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (software.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add some software to your monitoring dashboard to start seeing detailed analytics and insights.
            </p>
            <Link to="/add-software">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Software
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate metrics from user's software
  const totalSoftware = software.length;
  const avgUptime = software.reduce((sum, sw) => sum + sw.uptime_percentage, 0) / totalSoftware;
  const avgPerformance = software.reduce((sum, sw) => sum + sw.performance_score, 0) / totalSoftware;
  const totalIntegrations = software.reduce((sum, sw) => sum + sw.integrations_count, 0);
  const excellentSoftware = software.filter(sw => sw.status === 'excellent').length;
  const poorSoftware = software.filter(sw => sw.status === 'poor').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      
      <p className="text-muted-foreground">
        Detailed analytics and insights for your {totalSoftware} monitored applications.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUptime.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {avgUptime >= 99.5 ? '+' : ''}{(avgUptime - 99.0).toFixed(1)}% from baseline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgPerformance)}/100</div>
            <p className="text-xs text-muted-foreground">
              {avgPerformance >= 80 ? 'Excellent' : avgPerformance >= 60 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSoftware}</div>
            <p className="text-xs text-muted-foreground">
              {excellentSoftware} excellent, {poorSoftware} need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              {(totalIntegrations / totalSoftware).toFixed(1)} avg per software
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Software Health Overview</CardTitle>
            <CardDescription>Status distribution of your applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {software.slice(0, 5).map((app) => {
              const health = getStatusHealth(app.status);
              return (
                <div key={app.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{app.name}</span>
                    <Badge variant="secondary" className={health.textColor}>
                      {health.text}
                    </Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`${health.color} h-2 rounded-full`} 
                      style={{ width: `${app.performance_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Performance: {app.performance_score}/100</span>
                    <span>Uptime: {app.uptime_percentage}%</span>
                  </div>
                </div>
              );
            })}
            {software.length > 5 && (
              <p className="text-xs text-muted-foreground pt-2">
                +{software.length - 5} more applications...
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>How your software performs across categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {['excellent', 'good', 'fair', 'poor', 'pending'].map((status) => {
                const count = software.filter(sw => sw.status === status).length;
                const percentage = totalSoftware > 0 ? (count / totalSoftware) * 100 : 0;
                const health = getStatusHealth(status);
                
                if (count === 0) return null;
                
                return (
                  <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${health.color} rounded-full`}></div>
                      <span className="text-sm font-medium capitalize">{status}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events from your monitored software</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className={`flex items-center space-x-3 p-3 border rounded-lg ${getActivityColor(log.activity_type)}`}>
                  <div className={`w-2 h-2 ${getActivityDotColor(log.activity_type)} rounded-full`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.title}</p>
                    {log.description && (
                      <p className="text-xs text-muted-foreground">{log.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}