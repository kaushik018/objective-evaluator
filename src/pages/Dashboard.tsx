import { EnhancedSoftwareList } from "@/components/EnhancedSoftwareList";
import { RoleBasedDashboard } from "@/components/RoleBasedDashboard";
import { SEOHead } from "@/components/SEOHead";
import { IntegrationPanel } from "@/components/IntegrationPanel";
import { ImportedRepositories } from "@/components/ImportedRepositories";
import { useErrorTracking } from "@/hooks/useErrorTracking";
import { useEffect } from 'react';

export default function Dashboard() {
  useErrorTracking();

  useEffect(() => {
    // Page view tracking for analytics
    const event = new CustomEvent('page-view', {
      detail: { page: 'dashboard', timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  }, []);

  return (
    <>
      <SEOHead
        title="Dashboard - SoftwareStack Evaluator"
        description="Monitor your software applications with real-time performance metrics, uptime tracking, and comprehensive analytics dashboard."
        canonical="/dashboard"
      />
      <RoleBasedDashboard>
        <div className="space-y-6">
          <EnhancedSoftwareList />
          <IntegrationPanel />
          <ImportedRepositories />
        </div>
      </RoleBasedDashboard>
    </>
  );
}