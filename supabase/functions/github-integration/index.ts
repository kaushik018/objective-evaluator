import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GitHubRepo {
  name: string
  full_name: string
  html_url: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  updated_at: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabase.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { username, action } = await req.json()
    const GITHUB_TOKEN = Deno.env.get('GITHUB_ACCESS_TOKEN')

    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured')
    }

    if (action === 'fetch_repos') {
      console.log(`Fetching repositories for GitHub user: ${username}`)
      
      // Fetch user's repositories from GitHub
      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const repos: GitHubRepo[] = await response.json()
      console.log(`Found ${repos.length} repositories`)

      // Store repositories in external_integrations table
      const integrations = repos.map(repo => ({
        user_id: user.id,
        platform: 'github',
        repository_name: repo.name,
        repository_url: repo.html_url,
        last_commit_date: repo.updated_at,
        stars_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language || 'Unknown',
      }))

      // Clear existing GitHub integrations for this user
      await supabase
        .from('external_integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'github')

      // Insert new integrations
      const { error: insertError } = await supabase
        .from('external_integrations')
        .insert(integrations)

      if (insertError) {
        console.error('Error inserting integrations:', insertError)
        throw insertError
      }

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'integration_detected',
          title: 'GitHub Integration Synced',
          description: `Imported ${repos.length} repositories from GitHub`
        })

      console.log(`Successfully imported ${repos.length} GitHub repositories`)

      return new Response(
        JSON.stringify({ 
          message: `Successfully imported ${repos.length} repositories`,
          repositories: repos.map(r => ({
            name: r.name,
            url: r.html_url,
            language: r.language,
            stars: r.stargazers_count
          }))
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'auto_detect') {
      // Auto-detect and add software based on repositories
      const { data: integrations } = await supabase
        .from('external_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'github')

      const softwareToAdd = integrations?.filter(repo => 
        repo.stars_count > 0 || // Any starred repositories
        repo.language && ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Swift', 'C#', 'C++'].includes(repo.language)
      ).slice(0, 8) // Limit to 8 most relevant

      if (softwareToAdd && softwareToAdd.length > 0) {
        const software = softwareToAdd.map(repo => ({
          user_id: user.id,
          name: repo.repository_name,
          category: repo.language || 'Unknown',
          description: `GitHub repository: ${repo.repository_name}`,
          website: repo.repository_url,
          tags: [repo.platform, repo.language].filter(Boolean),
          status: 'pending'
        }))

        const { error: insertError } = await supabase
          .from('software')
          .insert(software)

        if (insertError) {
          console.error('Error inserting software:', insertError)
          throw insertError
        }

        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            activity_type: 'software_added',
            title: 'Auto-detected Software',
            description: `Automatically added ${software.length} applications from GitHub`
          })

        return new Response(
          JSON.stringify({ 
            message: `Auto-detected and added ${software.length} applications`,
            software: software.map(s => s.name)
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ message: 'No action specified' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in GitHub integration:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})