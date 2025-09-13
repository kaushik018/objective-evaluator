import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { error_message, stack_trace, url, user_agent } = await req.json()

    console.log(`Logging error for user ${user.id}: ${error_message}`)

    // Insert error log
    const { error: insertError } = await supabase
      .from('error_logs')
      .insert({
        user_id: user.id,
        error_message,
        stack_trace,
        url,
        user_agent
      })

    if (insertError) {
      console.error('Error inserting error log:', insertError)
      throw insertError
    }

    // Log activity for critical errors
    if (error_message.toLowerCase().includes('critical') || 
        error_message.toLowerCase().includes('fatal') ||
        stack_trace?.includes('TypeError') ||
        stack_trace?.includes('ReferenceError')) {
      
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'error_reported',
          title: 'Critical Error Detected',
          description: `Error: ${error_message.substring(0, 100)}...`
        })
    }

    return new Response(
      JSON.stringify({ message: 'Error logged successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in error tracking:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})