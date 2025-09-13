import { ReactNode } from 'react';
import React from 'react';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, User, BarChart3, Settings, AlertCircle } from 'lucide-react';

interface RoleBasedDashboardProps {
  children: ReactNode;
}

interface DashboardSection {
  title: string;
  description: string;
  icon: typeof Shield;
  requiredRole: UserRole;
  content: ReactNode;
}

export function RoleBasedDashboard({ children }: RoleBasedDashboardProps) {
  const { role, loading, hasRole } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const roleConfig = {
    admin: {
      color: 'bg-destructive text-destructive-foreground',
      icon: Shield,
      label: 'Administrator'
    },
    manager: {
      color: 'bg-warning text-warning-foreground',
      icon: Users,
      label: 'Manager'
    },
    user: {
      color: 'bg-primary text-primary-foreground',
      icon: User,
      label: 'User'
    }
  };

  const sections: DashboardSection[] = [
    {
      title: 'System Administration',
      description: 'Manage users, system settings, and global configurations',
      icon: Shield,
      requiredRole: 'admin',
      content: (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">99.8%</p>
              <p className="text-xs text-muted-foreground">System uptime</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">0.2%</p>
              <p className="text-xs text-muted-foreground">Last 24h</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Team Analytics',
      description: 'View team performance metrics and software usage analytics',
      icon: BarChart3,
      requiredRole: 'manager',
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Frontend Team</span>
                  <Badge variant="outline">95% avg uptime</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Backend Team</span>
                  <Badge variant="outline">98% avg uptime</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">DevOps Team</span>
                  <Badge variant="outline">99% avg uptime</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Team Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">3 performance alerts this week</div>
                <div className="text-sm text-muted-foreground">1 critical issue resolved</div>
              <div className="text-sm text-muted-foreground">5 optimization recommendations</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Personal Software Stack',
      description: 'Monitor and manage your personal software applications',
      icon: User,
      requiredRole: 'user',
      content: children
    }
  ];

  return (
    <div className="space-y-6">
      {/* Role Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={roleConfig[role].color}>
            {React.createElement(roleConfig[role].icon, { className: "h-3 w-3 mr-1" })}
            {roleConfig[role].label}
          </Badge>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {role === 'admin' && 'Full system access and administration'}
              {role === 'manager' && 'Team management and analytics'}
              {role === 'user' && 'Personal software monitoring'}
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => {
          if (!hasRole(section.requiredRole)) return null;

          return (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-2">
                <section.icon className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              {section.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}