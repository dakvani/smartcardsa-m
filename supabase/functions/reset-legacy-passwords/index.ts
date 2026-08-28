import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const secret = Deno.env.get("LOVABLE_CRON_SECRET");
  if (!secret || req.headers.get("x-admin-secret") !== secret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { password } = await req.json().catch(() => ({ password: null }));
  if (!password || String(password).length < 10) {
    return new Response(JSON.stringify({ error: "password required (min 10 chars)" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const results: Array<Record<string, unknown>> = [];
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    for (const u of data.users) {
      const { error: upErr } = await admin.auth.admin.updateUserById(u.id, {
        password: String(password),
        email_confirm: true,
      });
      results.push({ email: u.email, ok: !upErr, error: upErr?.message });
    }
    if (data.users.length < 200) break;
    page++;
  }

  return new Response(JSON.stringify({ updated: results.length, results }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
