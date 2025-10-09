import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Package, Globe, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisFactors {
  repoHealth: { score: number; passed: boolean; reason: string };
  liveUrl: { found: boolean; url?: string; reason: string };
  documentation: { score: number; passed: boolean; reason: string };
  packagePublished?: { found: boolean; platform?: string; reason: string };
}

interface RepositoryAnalysisStatusProps {
  repository: {
    repository_name: string;
    stars_count: number;
    forks_count: number;
    last_commit_date: string;
    language: string;
  };
  analysisFactors?: AnalysisFactors;
  overallScore?: number;
}

export function RepositoryAnalysisStatus({ 
  repository, 
  analysisFactors,
  overallScore 
}: RepositoryAnalysisStatusProps) {
  
  const getScoreBadge = (score?: number) => {
    if (!score) return <Badge variant="outline">Not Analyzed</Badge>;
    if (score >= 90) return <Badge className="bg-green-500">Excellent ({score})</Badge>;
    if (score >= 80) return <Badge className="bg-blue-500">Good ({score})</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500">Fair ({score})</Badge>;
    return <Badge variant="destructive">Needs Improvement ({score})</Badge>;
  };

  const FactorItem = ({ 
    icon: Icon, 
    title, 
    passed, 
    reason, 
    url 
  }: { 
    icon: any; 
    title: string; 
    passed: boolean; 
    reason: string;
    url?: string;
  }) => (
    <div className="flex items-start gap-2 text-sm">
      {passed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3 w-3" />
          <span className="font-medium">{title}</span>
        </div>
        <p className="text-muted-foreground mt-0.5">{reason}</p>
        {url && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 mt-1"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
        )}
      </div>
    </div>
  );

  if (!analysisFactors) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Tips to improve analysis for {repository.repository_name}:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Add a live demo URL in your README (look for "Demo:", "Live site:", etc.)</li>
              <li>Deploy to GitHub Pages, Vercel, or Netlify</li>
              <li>Include a "homepage" field in package.json</li>
              <li>For APIs: Document endpoints and provide a base URL</li>
              <li>For libraries: Publish to npm, PyPI, or similar registries</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3 border-t pt-3 mt-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold">Analysis Results</h5>
        {getScoreBadge(overallScore)}
      </div>

      <div className="space-y-2">
        <FactorItem
          icon={CheckCircle2}
          title="Repository Health"
          passed={analysisFactors.repoHealth.passed}
          reason={analysisFactors.repoHealth.reason}
        />

        <FactorItem
          icon={Globe}
          title="Live URL / Demo"
          passed={analysisFactors.liveUrl.found}
          reason={analysisFactors.liveUrl.reason}
          url={analysisFactors.liveUrl.url}
        />

        <FactorItem
          icon={FileCode}
          title="Documentation"
          passed={analysisFactors.documentation.passed}
          reason={analysisFactors.documentation.reason}
        />

        {analysisFactors.packagePublished && (
          <FactorItem
            icon={Package}
            title="Package Published"
            passed={analysisFactors.packagePublished.found}
            reason={analysisFactors.packagePublished.reason}
          />
        )}
      </div>

      {(!analysisFactors.liveUrl.found || !analysisFactors.documentation.passed) && (
        <Alert variant="default" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Quick wins to improve score:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {!analysisFactors.liveUrl.found && (
                <li>Deploy your project and add the URL to README</li>
              )}
              {!analysisFactors.documentation.passed && (
                <li>Enhance README with setup instructions and examples</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
