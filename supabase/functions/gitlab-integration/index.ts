import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GitLabProject {
  name: string
  path_with_namespace: string
  web_url: string
  description: string
  programming_language: string
  star_count: number
  forks_count: number
  last_activity_at: string
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
    const GITLAB_TOKEN = Deno.env.get('GITLAB_ACCESS_TOKEN')

    if (!GITLAB_TOKEN) {
      throw new Error('GitLab token not configured')
    }

    if (action === 'fetch_repos') {
      console.log(`Fetching repositories for GitLab user: ${username}`)
      
      // Fetch user's projects from GitLab
      const response = await fetch(`https://gitlab.com/api/v4/users/${username}/projects?per_page=100&order_by=last_activity_at`, {
        headers: {
          'Authorization': `Bearer ${GITLAB_TOKEN}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`GitLab API error: ${response.status}`)
      }

      const projects: GitLabProject[] = await response.json()
      console.log(`Found ${projects.length} projects`)

      // Store projects in external_integrations table
      const integrations = projects.map(project => ({
        user_id: user.id,
        platform: 'gitlab',
        repository_name: project.name,
        repository_url: project.web_url,
        last_commit_date: project.last_activity_at,
        stars_count: project.star_count,
        forks_count: project.forks_count,
        language: project.programming_language || 'Unknown',
      }))

      // Clear existing GitLab integrations for this user
      await supabase
        .from('external_integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'gitlab')

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
          title: 'GitLab Integration Synced',
          description: `Imported ${projects.length} projects from GitLab`
        })

      console.log(`Successfully imported ${projects.length} GitLab projects`)

      return new Response(
        JSON.stringify({ 
          message: `Successfully imported ${projects.length} projects`,
          projects: projects.map(p => ({
            name: p.name,
            url: p.web_url,
            language: p.programming_language,
            stars: p.star_count
          }))
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'auto_detect') {
      // Auto-detect and add software based on projects
      const { data: integrations } = await supabase
        .from('external_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'gitlab')

      const softwareToAdd = integrations?.filter(project => 
        project.stars_count > 0 || // Any starred projects
        project.language && ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Swift', 'C#', 'C++'].includes(project.language)
      ).slice(0, 8) // Limit to 8 most relevant

      if (softwareToAdd && softwareToAdd.length > 0) {
        const software = softwareToAdd.map(project => ({
          user_id: user.id,
          name: project.repository_name,
          category: project.language || 'Unknown',
          description: `GitLab project: ${project.repository_name}`,
          website: project.repository_url,
          tags: [project.platform, project.language].filter(Boolean),
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
            description: `Automatically added ${software.length} applications from GitLab`
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
    console.error('Error in GitLab integration:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})