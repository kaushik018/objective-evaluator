import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Github, GitBranch, Star, GitFork, Calendar, Plus, Loader2, ExternalLink, Code, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Repository {
  id: string;
  platform: string;
  repository_name: string;
  repository_url: string;
  language: string;
  stars_count: number;
  forks_count: number;
  last_commit_date: string;
  created_at: string;
}

export function ImportedRepositories() {
  const { session } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToSoftware, setAddingToSoftware] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      loadRepositories();
    }
  }, [session]);

  const loadRepositories = async () => {
    try {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*')
        .order('stars_count', { ascending: false });

      if (error) throw error;
      setRepositories(data || []);
    } catch (error: any) {
      console.error('Error loading repositories:', error);
      toast({
        title: "Error loading repositories",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToSoftware = async (repo: Repository) => {
    if (!session) return;

    setAddingToSoftware(repo.id);
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('software')
        .select('id')
        .eq('name', repo.repository_name)
        .eq('user_id', session.user.id)
        .single();

      if (existing) {
        toast({
          title: "Software already exists",
          description: `${repo.repository_name} is already in your software list.`,
          variant: "destructive"
        });
        return;
      }

      // Add to software table
      const { error } = await supabase
        .from('software')
        .insert({
          user_id: session.user.id,
          name: repo.repository_name,
          category: repo.language || 'Unknown',
          description: `${repo.platform} repository: ${repo.repository_name}`,
          website: repo.repository_url,
          tags: [repo.platform, repo.language].filter(Boolean),
          status: 'pending'
        });

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: session.user.id,
          activity_type: 'software_added',
          title: 'Repository Added',
          description: `Added ${repo.repository_name} from ${repo.platform} to software list`
        });

      toast({
        title: "Repository added",
        description: `${repo.repository_name} has been added to your software list.`,
      });

    } catch (error: any) {
      console.error('Error adding to software:', error);
      toast({
        title: "Error adding repository",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAddingToSoftware(null);
    }
  };

  const autoAddRecommended = async () => {
    if (!session) return;

    setLoading(true);
    try {
      // Get recommended repositories (with stars > 0 or popular languages)
      const recommended = repositories.filter(repo => 
        repo.stars_count > 0 || 
        ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Swift'].includes(repo.language)
      ).slice(0, 5);

      if (recommended.length === 0) {
        toast({
          title: "No recommendations",
          description: "No recommended repositories found for auto-add.",
        });
        return;
      }

      // Check which don't already exist
      const { data: existingSoftware } = await supabase
        .from('software')
        .select('name')
        .eq('user_id', session.user.id);

      const existingNames = new Set(existingSoftware?.map(s => s.name) || []);
      const toAdd = recommended.filter(repo => !existingNames.has(repo.repository_name));

      if (toAdd.length === 0) {
        toast({
          title: "Already added",
          description: "All recommended repositories are already in your software list.",
        });
        return;
      }

      // Add them to software
      const software = toAdd.map(repo => ({
        user_id: session.user.id,
        name: repo.repository_name,
        category: repo.language || 'Unknown',
        description: `${repo.platform} repository: ${repo.repository_name}`,
        website: repo.repository_url,
        tags: [repo.platform, repo.language].filter(Boolean),
        status: 'pending'
      }));

      const { error } = await supabase
        .from('software')
        .insert(software);

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: session.user.id,
          activity_type: 'software_added',
          title: 'Auto-Added Repositories',
          description: `Automatically added ${toAdd.length} recommended repositories`
        });

      toast({
        title: "Repositories added",
        description: `Added ${toAdd.length} recommended repositories to your software list.`,
      });

    } catch (error: any) {
      console.error('Error auto-adding repositories:', error);
      toast({
        title: "Error auto-adding repositories",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'github' ? Github : GitBranch;
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'Go': 'bg-cyan-500',
      'Swift': 'bg-orange-500',
      'HTML': 'bg-orange-600',
      'CSS': 'bg-blue-600',
      'Unknown': 'bg-gray-500'
    };
    return colors[language] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (repositories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Imported Repositories
          </CardTitle>
          <CardDescription>
            No repositories imported yet. Use the integration panel above to sync your GitHub or GitLab repositories.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const recommendedCount = repositories.filter(repo => 
    repo.stars_count > 0 || 
    ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Swift'].includes(repo.language)
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Imported Repositories ({repositories.length})
            </CardTitle>
            <CardDescription>
              Repositories synced from your connected platforms. For better analysis, ensure your repos have live demo URLs in README or are deployed to platforms like GitHub Pages, Vercel, or Netlify.
            </CardDescription>
          </div>
          {recommendedCount > 0 && (
            <Button onClick={autoAddRecommended} disabled={loading} variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Auto-Add Recommended ({recommendedCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {repositories.map((repo) => {
              const PlatformIcon = getPlatformIcon(repo.platform);
              const isRecommended = repo.stars_count > 0 || 
                ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Swift'].includes(repo.language);

              return (
                <div key={repo.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <PlatformIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{repo.repository_name}</h4>
                          {isRecommended && (
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{repo.platform} Repository</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(repo.repository_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addToSoftware(repo)}
                        disabled={addingToSoftware === repo.id}
                      >
                        {addingToSoftware === repo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Add to Software
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                        {repo.language}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {repo.stars_count}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {repo.forks_count}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(repo.last_commit_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}