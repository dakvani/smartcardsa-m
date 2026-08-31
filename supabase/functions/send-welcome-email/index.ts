import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

// Sends the welcome email to the *authenticated caller only*. The recipient is
// always derived from the verified JWT — never from the request body.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user
    if (userError || !user?.email) {
      return json({ success: false, reason: 'unauthorized' }, 401)
    }

    let body: Record<string, unknown> = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const siteUrl = typeof body.siteUrl === 'string' ? body.siteUrl : undefined
    const name =
      typeof body.name === 'string' && body.name.trim().length > 0
        ? body.name.trim().slice(0, 60)
        : undefined
    const marketingUnsubscribeUrl =
      typeof body.marketingUnsubscribeUrl === 'string'
        ? body.marketingUnsubscribeUrl
        : undefined

    try {
      const result = await sendTemplateEmail('welcome', user.email, {
        idempotencyKey: `welcome-${user.id}`,
        templateData: {
          name,
          siteUrl,
          helpText: typeof body.helpText === 'string' ? body.helpText : undefined,
          supportEmail:
            typeof body.supportEmail === 'string' ? body.supportEmail : undefined,
          marketingUnsubscribeUrl,
        },
      })
      return json({ success: true, sent: result.sent, reason: result.sent ? undefined : result.reason })
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : String(sendError)
      console.error('Welcome email send failed', message)

      // Best-effort admin alert; never blocks the caller.
      try {
        await sendTemplateEmail('welcome-email-failed', '', {
          idempotencyKey: `welcome-failed-${user.id}-${Date.now()}`,
          templateData: {
            userEmail: user.email,
            username: name ?? '',
            userId: user.id,
            errorMessage: message.slice(0, 500),
            attempts: 1,
            adminUrl: siteUrl ? `${siteUrl}/admin` : undefined,
          },
        })
      } catch (alertError) {
        console.error('Admin alert failed', alertError)
      }

      return json({ success: false, reason: message }, 500)
    }
  } catch (error) {
    console.error('send-welcome-email error', error)
    return json({ success: false, reason: 'unexpected_error' }, 500)
  }
})
