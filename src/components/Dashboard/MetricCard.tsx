import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  status?: "success" | "warning" | "destructive" | "default";
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  status = "default",
  trend,
  className
}: MetricCardProps) {
  const statusColors = {
    success: "text-success",
    warning: "text-warning", 
    destructive: "text-destructive",
    default: "text-primary"
  };

  const badgeVariants = {
    success: "default" as const,
    warning: "secondary" as const,
    destructive: "destructive" as const,
    default: "default" as const
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", statusColors[status])} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {trend && (
            <Badge variant={badgeVariants[status]} className="ml-2">
              {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}