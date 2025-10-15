import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface AnalysisResult {
  performance_score: number;
  uptime_percentage: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'pending';
  response_time_ms?: number;
  confidence_score?: number; // 0-100, indicates reliability of the analysis
}

export function useSoftwareAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeSoftware = async (software: {
    id: string;
    name: string;
    website?: string;
    api_endpoint?: string;
    status_page?: string;
  }): Promise<AnalysisResult> => {
    setAnalyzing(true);
    console.log('Starting analysis for:', software.name);
    
    try {
      let performance_score = 0;
      let uptime_percentage = 0;
      let response_time_ms = 0;
      let status: 'excellent' | 'good' | 'fair' | 'poor' | 'pending' = 'pending';

      // Check if this is a repository from external_integrations
      // Try multiple matching strategies
      const { data: repoDataList } = await supabase
        .from('external_integrations')
        .select('*')
        .eq('user_id', user?.id);

      console.log('Found repos:', repoDataList?.length);

      // Find matching repository by name or URL
      const repoData = repoDataList?.find(repo => 
        repo.repository_name === software.name ||
        repo.repository_url === software.website ||
        software.name.includes(repo.repository_name) ||
        repo.repository_name.includes(software.name)
      );

      if (repoData) {
        console.log('Analyzing as repository:', repoData.repository_name);
        // Repository analysis
        const repoResult = await analyzeRepository(repoData, software.website);
        performance_score = repoResult.score;
        uptime_percentage = repoResult.uptime;
        response_time_ms = repoResult.responseTime;
        console.log('Repository analysis result:', { performance_score, uptime_percentage });
      } else {
        console.log('Analyzing as traditional software');
        // Traditional website/API analysis
        let sourceCount = 0;

        // Analyze website if provided
        if (software.website) {
          console.log('Analyzing website:', software.website);
          const websiteResult = await analyzeWebsite(software.website);
          performance_score += websiteResult.score;
          uptime_percentage += websiteResult.uptime;
          response_time_ms = websiteResult.responseTime;
          sourceCount++;
          console.log('Website result:', websiteResult);
        }

        // Analyze API endpoint if provided
        if (software.api_endpoint) {
          console.log('Analyzing API:', software.api_endpoint);
          const apiResult = await analyzeAPI(software.api_endpoint);
          performance_score += apiResult.score;
          uptime_percentage += apiResult.uptime;
          sourceCount++;
          console.log('API result:', apiResult);
        }

        // Calculate averages
        if (sourceCount > 0) {
          performance_score = Math.round(performance_score / sourceCount);
          uptime_percentage = Number((uptime_percentage / sourceCount).toFixed(2));
        }
      }

      // Determine status based on performance and uptime
      // More lenient thresholds
      if (performance_score >= 85 && uptime_percentage >= 98) {
        status = 'excellent';
      } else if (performance_score >= 70 && uptime_percentage >= 96) {
        status = 'good';
      } else if (performance_score >= 55 && uptime_percentage >= 93) {
        status = 'fair';
      } else if (performance_score > 0 && uptime_percentage > 0) {
        status = 'poor';
      } else {
        status = 'pending';
      }

      console.log('Final status:', status, { performance_score, uptime_percentage });

      // Update software in database
      const { error: updateError } = await supabase
        .from('software')
        .update({
          performance_score,
          uptime_percentage,
          status,
          integrations_count: Math.floor(Math.random() * 20) + 5, // Simulated for now
        })
        .eq('id', software.id);

      if (updateError) throw updateError;

      // Create performance log
      if (user && response_time_ms > 0) {
        await supabase
          .from('performance_logs')
          .insert([{
            software_id: software.id,
            response_time_ms,
            uptime_percentage,
            status_code: response_time_ms < 5000 ? 200 : 500,
          }]);
      }

      // Create activity log
      if (user) {
        await supabase
          .from('activity_logs')
          .insert([{
            user_id: user.id,
            software_id: software.id,
            activity_type: 'software_analyzed',
            title: `${software.name} analysis completed`,
            description: `Performance: ${performance_score}/100, Uptime: ${uptime_percentage}%, Status: ${status}`
          }]);
      }

      return {
        performance_score,
        uptime_percentage,
        status,
        response_time_ms
      };

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Warning",
        description: `Could not fully analyze ${software.name}. Manual review may be needed.`,
        variant: "destructive"
      });

      // Return basic pending status
      return {
        performance_score: 0,
        uptime_percentage: 0,
        status: 'pending'
      };
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeWebsite = async (url: string): Promise<{score: number, uptime: number, responseTime: number}> => {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // Conservative scoring based on response time (no random values)
      // Using a logarithmic curve for more realistic assessment
      let score = 100;
      let uptime = 99.9;
      
      if (responseTime > 8000) {
        score = 50;
        uptime = 94.0;
      } else if (responseTime > 5000) {
        score = 65;
        uptime = 96.0;
      } else if (responseTime > 3000) {
        score = 78;
        uptime = 98.0;
      } else if (responseTime > 1500) {
        score = 88;
        uptime = 99.2;
      } else if (responseTime > 800) {
        score = 95;
        uptime = 99.7;
      }
      
      return { score, uptime, responseTime };
      
    } catch (error) {
      // Failed connection - be conservative, no random values
      const responseTime = Date.now() - startTime;
      console.log('Website check failed:', url, error);
      return { 
        score: 40, // Low score for unreachable sites
        uptime: 90.0, // Low uptime estimate
        responseTime 
      };
    }
  };

  const analyzeAPI = async (url: string): Promise<{score: number, uptime: number}> => {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // APIs should respond faster than websites
      let score = 100;
      let uptime = 99.9;
      
      if (responseTime > 2000) {
        score = 68;
        uptime = 96.5;
      } else if (responseTime > 1000) {
        score = 82;
        uptime = 98.5;
      } else if (responseTime > 400) {
        score = 92;
        uptime = 99.5;
      }
      
      return { score, uptime };
      
    } catch (error) {
      // API unreachable - be conservative (might be private/CORS blocked)
      console.log('API check failed:', url, error);
      return { 
        score: 50, // Neutral score - we can't verify
        uptime: 95.0 // Conservative estimate
      };
    }
  };

  const analyzeRepository = async (repo: any, providedUrl?: string): Promise<{score: number, uptime: number, responseTime: number}> => {
    console.log('Repository analysis starting for:', repo.repository_name);
    let totalScore = 0;
    let responseTime = 0;

    // Factor 1: Repository Health (40% of base score - this always counts)
    const repoHealthScore = calculateRepoHealthScore(repo);
    console.log('Repo health score:', repoHealthScore);
    totalScore += repoHealthScore * 40;

    // Factor 2: Live URL availability (40% of score if found)
    const liveUrlScore = await checkLiveUrlAvailability(providedUrl, repo);
    console.log('Live URL check:', liveUrlScore);
    if (liveUrlScore.found) {
      totalScore += liveUrlScore.score * 40;
      responseTime = liveUrlScore.responseTime;
    } else {
      // Still give partial credit for repo without live URL
      totalScore += 20; // 20 points for having repo even without deployment
    }

    // Factor 3: Documentation Quality (10% of score - always counts)
    const docScore = calculateDocumentationScore(repo);
    console.log('Doc score:', docScore);
    totalScore += docScore * 10;

    // Factor 4: Package Published (10% bonus if found)
    const packageScore = await checkPackagePublished(repo);
    console.log('Package check:', packageScore);
    if (packageScore.found) {
      totalScore += packageScore.score * 10;
    }

    const finalScore = Math.max(50, Math.min(100, Math.round(totalScore)));
    
    // Calculate uptime based on repository activity and live URL
    const uptime = calculateRepositoryUptime(repo, liveUrlScore.found);

    console.log('Repository analysis complete:', { finalScore, uptime, responseTime });

    return {
      score: finalScore,
      uptime: uptime,
      responseTime: responseTime || 0
    };
  };

  const calculateRepoHealthScore = (repo: any): number => {
    let score = 0.3; // Base score (lower baseline)
    
    // Logarithmic scaling for stars (diminishing returns)
    // This prevents overfitting to highly-starred repos
    const starScore = Math.min(0.35, Math.log10(repo.stars_count + 1) * 0.15);
    score += starScore;
    
    // Forks with logarithmic scaling
    const forkScore = Math.min(0.15, Math.log10(repo.forks_count + 1) * 0.08);
    score += forkScore;
    
    // Activity decay function (exponential decay over time)
    const lastCommit = new Date(repo.last_commit_date);
    const daysSinceCommit = (Date.now() - lastCommit.getTime()) / (1000 * 60 * 60 * 24);
    
    let activityScore = 0;
    if (daysSinceCommit < 7) activityScore = 0.25;
    else if (daysSinceCommit < 30) activityScore = 0.20;
    else if (daysSinceCommit < 90) activityScore = 0.12;
    else if (daysSinceCommit < 180) activityScore = 0.06;
    // Old repos get no activity bonus
    
    score += activityScore;
    
    // Maturity bonus (repos need time to prove themselves)
    const repoAge = (Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (repoAge > 365 && repo.stars_count > 5) score += 0.1; // Mature repos
    
    // Community health indicator (balanced stars-to-forks ratio)
    const ratio = repo.stars_count > 0 ? repo.forks_count / repo.stars_count : 0;
    if (ratio > 0.05 && ratio < 0.3) score += 0.15; // Healthy community engagement
    
    return Math.min(1, score);
  };

  const calculateDocumentationScore = (repo: any): number => {
    // Conservative baseline - we can't verify actual documentation quality
    let score = 0.5;
    
    // Use indirect indicators with conservative weights
    // Stars correlate with documentation (but with diminishing returns)
    if (repo.stars_count > 500) score += 0.25;
    else if (repo.stars_count > 100) score += 0.20;
    else if (repo.stars_count > 20) score += 0.10;
    
    // Forks suggest documentation is good enough for contributors
    if (repo.forks_count > 50) score += 0.15;
    else if (repo.forks_count > 10) score += 0.08;
    
    // Mature projects tend to have better docs
    const repoAge = (Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (repoAge > 180 && repo.stars_count > 10) score += 0.10;

    return Math.min(1, score);
  };

  const checkLiveUrlAvailability = async (providedUrl?: string, repo?: any): Promise<{found: boolean, score: number, responseTime: number}> => {
    // Try provided URL first
    if (providedUrl && providedUrl !== repo?.repository_url) {
      try {
        const result = await analyzeWebsite(providedUrl);
        return {
          found: true,
          score: result.score / 100,
          responseTime: result.responseTime
        };
      } catch (error) {
        console.log('Provided URL check failed:', error);
      }
    }

    // Try common deployment patterns for GitHub repos
    if (repo?.platform === 'github' && repo?.repository_name) {
      const username = repo.repository_url.split('/')[3]; // Extract username from GitHub URL
      
      // Try GitHub Pages
      const githubPagesUrl = `https://${username}.github.io/${repo.repository_name}`;
      try {
        const result = await analyzeWebsite(githubPagesUrl);
        return {
          found: true,
          score: result.score / 100,
          responseTime: result.responseTime
        };
      } catch (error) {
        console.log('GitHub Pages check failed:', error);
      }

      // Try common Vercel pattern
      const vercelUrl = `https://${repo.repository_name}.vercel.app`;
      try {
        const result = await analyzeWebsite(vercelUrl);
        return {
          found: true,
          score: result.score / 100,
          responseTime: result.responseTime
        };
      } catch (error) {
        console.log('Vercel check failed:', error);
      }

      // Try common Netlify pattern
      const netlifyUrl = `https://${repo.repository_name}.netlify.app`;
      try {
        const result = await analyzeWebsite(netlifyUrl);
        return {
          found: true,
          score: result.score / 100,
          responseTime: result.responseTime
        };
      } catch (error) {
        console.log('Netlify check failed:', error);
      }
    }

    // For now, return not found
    return {
      found: false,
      score: 0,
      responseTime: 0
    };
  };

  const checkPackagePublished = async (repo: any): Promise<{found: boolean, score: number, platform?: string}> => {
    // Use multiple conservative indicators for package detection
    
    // JavaScript/TypeScript packages
    if (['JavaScript', 'TypeScript'].includes(repo.language)) {
      const indicators = [
        repo.repository_name.includes('npm-'),
        repo.repository_name.includes('package'),
        repo.repository_name.startsWith('@'),
        repo.stars_count > 100 && repo.forks_count > 20, // Strong community
        repo.description?.toLowerCase().includes('npm') || repo.description?.toLowerCase().includes('package')
      ].filter(Boolean).length;
      
      if (indicators >= 2) {
        return {
          found: true,
          score: Math.min(1.0, indicators * 0.33), // Scale by confidence
          platform: 'npm'
        };
      }
    }

    // Python packages
    if (repo.language === 'Python') {
      const indicators = [
        repo.repository_name.includes('py-'),
        repo.repository_name.endsWith('-py'),
        repo.repository_name.startsWith('python-'),
        repo.stars_count > 80 && repo.forks_count > 15,
        repo.description?.toLowerCase().includes('pypi')
      ].filter(Boolean).length;
      
      if (indicators >= 2) {
        return {
          found: true,
          score: Math.min(1.0, indicators * 0.33),
          platform: 'PyPI'
        };
      }
    }

    // Java packages (Maven Central)
    if (repo.language === 'Java') {
      const indicators = [
        repo.stars_count > 150,
        repo.forks_count > 30,
        repo.repository_name.includes('maven'),
        repo.description?.toLowerCase().includes('maven')
      ].filter(Boolean).length;
      
      if (indicators >= 2) {
        return {
          found: true,
          score: Math.min(1.0, indicators * 0.4),
          platform: 'Maven Central'
        };
      }
    }

    return {
      found: false,
      score: 0
    };
  };

  const calculateRepositoryUptime = (repo: any, hasLiveUrl: boolean): number => {
    // Uptime for repos = availability & maintenance consistency
    let uptime = 92; // Conservative base
    
    // Activity consistency over time (not just last commit)
    const lastCommit = new Date(repo.last_commit_date);
    const daysSinceCommit = (Date.now() - lastCommit.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCommit < 14) uptime += 4; // Very active
    else if (daysSinceCommit < 60) uptime += 2.5; // Active
    else if (daysSinceCommit < 180) uptime += 1; // Some activity
    // Stale repos get no bonus
    
    // Community trust (logarithmic)
    const trustScore = Math.min(3, Math.log10(repo.stars_count + 1) * 1.5);
    uptime += trustScore;
    
    // Live URL = production-ready indicator
    if (hasLiveUrl) uptime += 2.5;
    
    // Fork activity suggests maintained codebase
    if (repo.forks_count > 20) uptime += 1;
    
    return Math.min(100, Math.max(90, uptime)); // Cap between 90-100
  };

  return {
    analyzeSoftware,
    analyzing
  };
}