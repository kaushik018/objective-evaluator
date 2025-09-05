import { MetricCard } from "@/components/Dashboard/MetricCard";
import { SoftwareCard } from "@/components/Dashboard/SoftwareCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  TrendingUp
} from "lucide-react";

// Mock data - in real app, this would come from Supabase
const mockMetrics = {
  totalSoftware: 12,
  averageUptime: 99.2,
  totalIntegrations: 284,
  alertsToday: 3
};

const mockSoftwareList = [
  {
    id: "1",
    name: "Slack",
    version: "4.29.149",
    category: "Communication",
    performanceScore: 94,
    uptimePercentage: 99.8,
    integrations: 47,
    lastUpdated: "2 hours ago",
    status: "excellent" as const,
    website: "https://slack.com"
  },
  {
    id: "2", 
    name: "GitHub",
    version: "Enterprise",
    category: "Development",
    performanceScore: 91,
    uptimePercentage: 99.5,
    integrations: 156,
    lastUpdated: "5 hours ago",
    status: "excellent" as const,
    website: "https://github.com"
  },
  {
    id: "3",
    name: "Jira",
    version: "9.4.0",
    category: "Project Management", 
    performanceScore: 78,
    uptimePercentage: 98.2,
    integrations: 81,
    lastUpdated: "1 day ago",
    status: "good" as const,
    website: "https://atlassian.com/software/jira"
  }
];

export default function Dashboard() {
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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Software
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Software"
          value={mockMetrics.totalSoftware}
          description="Applications monitored"
          icon={Activity}
          status="default"
          trend={{ value: 8.3, label: "vs last month" }}
        />
        <MetricCard
          title="Average Uptime"
          value={`${mockMetrics.averageUptime}%`}
          description="Across all applications"
          icon={CheckCircle}
          status="success"
          trend={{ value: 2.1, label: "vs last month" }}
        />
        <MetricCard
          title="Integrations"
          value={mockMetrics.totalIntegrations}
          description="Total available integrations"
          icon={TrendingUp}
          status="default"
          trend={{ value: 15.2, label: "vs last month" }}
        />
        <MetricCard
          title="Alerts Today"
          value={mockMetrics.alertsToday}
          description="Performance alerts triggered"
          icon={AlertCircle}
          status="warning"
          trend={{ value: -12.5, label: "vs yesterday" }}
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
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Slack performance improved</p>
                  <p className="text-xs text-muted-foreground">Response time decreased by 15ms</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">GitHub API rate limit alert</p>
                  <p className="text-xs text-muted-foreground">Approaching hourly limit</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">New integration detected</p>
                  <p className="text-xs text-muted-foreground">Jira added Confluence integration</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Software */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Software Overview</h2>
          <div className="grid gap-4">
            {mockSoftwareList.map((software) => (
              <SoftwareCard
                key={software.id}
                software={software}
                onView={(id) => console.log("View:", id)}
                onCompare={(id) => console.log("Compare:", id)}
                onDelete={(id) => console.log("Delete:", id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}