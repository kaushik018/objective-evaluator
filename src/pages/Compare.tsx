import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCompare, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { useSoftware } from "@/hooks/useSoftware";
import { Link } from "react-router-dom";

// Popular software benchmarks for comparison
const POPULAR_SOFTWARE = [
  {
    name: "GitHub",
    category: "Version Control",
    performance_score: 95,
    uptime_percentage: 99.95,
    response_time: 85,
    status: "excellent" as const
  },
  {
    name: "Slack",
    category: "Communication",
    performance_score: 92,
    uptime_percentage: 99.9,
    response_time: 120,
    status: "excellent" as const
  },
  {
    name: "Stripe",
    category: "Payment Processing",
    performance_score: 98,
    uptime_percentage: 99.99,
    response_time: 65,
    status: "excellent" as const
  },
  {
    name: "Vercel",
    category: "Hosting",
    performance_score: 94,
    uptime_percentage: 99.8,
    response_time: 95,
    status: "excellent" as const
  }
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'excellent': return 'default';
    case 'good': return 'secondary';
    case 'fair': return 'outline';
    case 'poor': return 'destructive';
    default: return 'secondary';
  }
};

const getTrendIcon = (value: number, threshold: { good: number; poor: number }) => {
  if (value <= threshold.good) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (value >= threshold.poor) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-yellow-500" />;
};

const compareMetrics = (userSoftware: any[], popularSoftware: any[]) => {
  if (userSoftware.length === 0) return [];
  
  const userAvg = {
    performance: userSoftware.reduce((sum, sw) => sum + sw.performance_score, 0) / userSoftware.length,
    uptime: userSoftware.reduce((sum, sw) => sum + sw.uptime_percentage, 0) / userSoftware.length,
    response: 150 // Simulated average response time
  };
  
  const popularAvg = {
    performance: popularSoftware.reduce((sum, sw) => sum + sw.performance_score, 0) / popularSoftware.length,
    uptime: popularSoftware.reduce((sum, sw) => sum + sw.uptime_percentage, 0) / popularSoftware.length,
    response: popularSoftware.reduce((sum, sw) => sum + sw.response_time, 0) / popularSoftware.length
  };
  
  return [
    {
      metric: "Performance Score",
      userValue: userAvg.performance,
      popularValue: popularAvg.performance,
      difference: userAvg.performance - popularAvg.performance,
      unit: ""
    },
    {
      metric: "Uptime",
      userValue: userAvg.uptime,
      popularValue: popularAvg.uptime,
      difference: userAvg.uptime - popularAvg.uptime,
      unit: "%"
    },
    {
      metric: "Response Time",
      userValue: userAvg.response,
      popularValue: popularAvg.response,
      difference: popularAvg.response - userAvg.response, // Lower is better for response time
      unit: "ms"
    }
  ];
};

export default function Compare() {
  const { software, loading } = useSoftware();
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <GitCompare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Compare Software</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const comparisons = compareMetrics(software, POPULAR_SOFTWARE);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <GitCompare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Compare Software</h1>
      </div>
      
      <p className="text-muted-foreground">
        Compare your software performance against industry-leading applications.
      </p>

      {software.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitCompare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Software to Compare</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add some software to your monitoring dashboard to start comparing performance metrics.
            </p>
            <Link to="/add-software">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Software
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Software
                  <Badge variant="secondary">{software.length} Apps</Badge>
                </CardTitle>
                <CardDescription>Your monitored applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {software.slice(0, 3).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.category}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
                {software.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{software.length - 3} more applications
                  </p>
                )}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Performance</span>
                    <span className="text-sm">{Math.round(software.reduce((sum, sw) => sum + sw.performance_score, 0) / software.length)}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Uptime</span>
                    <span className="text-sm">{(software.reduce((sum, sw) => sum + sw.uptime_percentage, 0) / software.length).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Industry Leaders
                  <Badge variant="outline">Popular</Badge>
                </CardTitle>
                <CardDescription>Top-performing applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {POPULAR_SOFTWARE.slice(0, 4).map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.category}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Performance</span>
                    <span className="text-sm">{Math.round(POPULAR_SOFTWARE.reduce((sum, sw) => sum + sw.performance_score, 0) / POPULAR_SOFTWARE.length)}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Uptime</span>
                    <span className="text-sm">{(POPULAR_SOFTWARE.reduce((sum, sw) => sum + sw.uptime_percentage, 0) / POPULAR_SOFTWARE.length).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>How your software stacks up against industry leaders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisons.map((comparison, index) => {
                  const isPositive = comparison.difference > 0;
                  const percentage = Math.abs((comparison.difference / comparison.popularValue) * 100);
                  
                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      isPositive ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                    }`}>
                      <span className="text-sm font-medium">{comparison.metric}</span>
                      <Badge variant="secondary" className={`${
                        isPositive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {isPositive ? '+' : ''}{percentage.toFixed(1)}% {isPositive ? 'better' : 'behind'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Button className="w-full" disabled>
                  Generate Detailed Report (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}