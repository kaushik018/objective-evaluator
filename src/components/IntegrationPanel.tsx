import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useExternalIntegrations } from '@/hooks/useExternalIntegrations';
import { Github, GitBranch, Loader2, Download, Zap } from 'lucide-react';

export function IntegrationPanel() {
  const [githubUsername, setGithubUsername] = useState('');
  const [gitlabUsername, setGitlabUsername] = useState('');
  const { loading, syncGitHubRepos, syncGitLabRepos, autoDetectSoftware } = useExternalIntegrations();

  const handleGitHubSync = async () => {
    if (!githubUsername.trim()) return;
    await syncGitHubRepos(githubUsername.trim());
  };

  const handleGitLabSync = async () => {
    if (!gitlabUsername.trim()) return;
    await syncGitLabRepos(gitlabUsername.trim());
  };

  const handleAutoDetect = async (platform: 'github' | 'gitlab') => {
    await autoDetectSoftware(platform);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          External Integrations
        </CardTitle>
        <CardDescription>
          Connect your GitHub and GitLab accounts to automatically discover and monitor your software projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GitHub Integration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            <h3 className="text-lg font-semibold">GitHub</h3>
            <Badge variant="outline">Free</Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="github-username">GitHub Username</Label>
              <Input
                id="github-username"
                placeholder="Enter your GitHub username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGitHubSync}
                disabled={loading || !githubUsername.trim()}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Sync Repositories
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleAutoDetect('github')}
                disabled={loading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto-Detect
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* GitLab Integration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            <h3 className="text-lg font-semibold">GitLab</h3>
            <Badge variant="outline">Free</Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="gitlab-username">GitLab Username</Label>
              <Input
                id="gitlab-username"
                placeholder="Enter your GitLab username"
                value={gitlabUsername}
                onChange={(e) => setGitlabUsername(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGitLabSync}
                disabled={loading || !gitlabUsername.trim()}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Sync Projects
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleAutoDetect('gitlab')}
                disabled={loading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto-Detect
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Integration Benefits */}
        <div className="space-y-2">
          <h4 className="font-medium">Benefits of Integration:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Automatic software detection from your repositories</li>
            <li>• Real-time performance monitoring for deployed applications</li>
            <li>• Centralized dashboard for all your software projects</li>
            <li>• Historical performance trends and analytics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}