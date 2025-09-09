import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Compare() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <GitCompare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Compare Software</h1>
      </div>
      
      <p className="text-muted-foreground">
        Compare performance metrics across different software applications.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Software A
              <Badge variant="secondary">Active</Badge>
            </CardTitle>
            <CardDescription>Production Application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CPU Usage</span>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">23%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Usage</span>
              <div className="flex items-center space-x-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">67%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time</span>
              <div className="flex items-center space-x-1">
                <Minus className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">120ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Software B
              <Badge variant="outline">Testing</Badge>
            </CardTitle>
            <CardDescription>Development Application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CPU Usage</span>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">18%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Usage</span>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time</span>
              <div className="flex items-center space-x-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">95ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparison Summary</CardTitle>
          <CardDescription>Performance analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <span className="text-sm font-medium">CPU Efficiency</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Software B +22% better
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <span className="text-sm font-medium">Memory Management</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Software B +33% better
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <span className="text-sm font-medium">Response Speed</span>
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                Software B +26% slower
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <Button className="w-full">Generate Detailed Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}