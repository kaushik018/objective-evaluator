import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MoreHorizontal, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Minus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SoftwareData {
  id: string;
  name: string;
  version: string;
  category: string;
  performanceScore: number;
  uptimePercentage: number;
  integrations: number;
  lastUpdated: string;
  status: "excellent" | "good" | "fair" | "poor" | "pending";
  website?: string;
}

interface SoftwareCardProps {
  software: SoftwareData;
  onView?: (id: string) => void;
  onCompare?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SoftwareCard({ 
  software, 
  onView, 
  onCompare, 
  onDelete 
}: SoftwareCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-success";
      case "good": return "text-primary";
      case "fair": return "text-warning";
      case "poor": return "text-destructive";
      case "pending": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "excellent": return "default" as const;
      case "good": return "secondary" as const;
      case "fair": return "outline" as const;
      case "poor": return "destructive" as const;
      case "pending": return "outline" as const;
      default: return "outline" as const;
    }
  };

  const getTrendIcon = (score: number) => {
    if (score >= 80) return TrendingUp;
    if (score >= 60) return Minus;
    return TrendingDown;
  };

  const TrendIcon = getTrendIcon(software.performanceScore);

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-lg font-semibold">{software.name}</CardTitle>
          <Badge variant="outline">{software.version}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(software.id)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCompare?.(software.id)}>
              Add to Compare
            </DropdownMenuItem>
            {software.website && (
              <DropdownMenuItem asChild>
                <a href={software.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete?.(software.id)}
              className="text-destructive"
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Category</span>
          <Badge variant="secondary">{software.category}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Performance Score</span>
            <div className="flex items-center space-x-2">
              <TrendIcon className={getStatusColor(software.status) + " h-4 w-4"} />
              <span className="text-sm font-semibold">{software.performanceScore}%</span>
            </div>
          </div>
          <Progress value={software.performanceScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uptime</span>
            <span className="text-sm font-semibold">{software.uptimePercentage}%</span>
          </div>
          <Progress value={software.uptimePercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Integrations</span>
          <span className="text-sm font-semibold">{software.integrations} available</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusBadgeVariant(software.status)}>
              {software.status}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            Updated {software.lastUpdated}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}