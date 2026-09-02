import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_profile_stats",
  title: "Get profile stats",
  description:
    "Summarize the signed-in user's profile performance: total views and link clicks over the last N days.",
  inputSchema: {
    days: z.number().int().min(1).max(365).optional().describe("Lookback window in days (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const window = days ?? 30;
    const since = new Date(Date.now() - window * 24 * 60 * 60 * 1000).toISOString();
    const supabase = supabaseForUser(ctx);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (profileError) {
      return { content: [{ type: "text", text: profileError.message }], isError: true };
    }
    if (!profile) {
      return { content: [{ type: "text", text: "No profile found for this account yet." }] };
    }

    const [views, clicks, links] = await Promise.all([
      supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .gte("viewed_at", since),
      supabase
        .from("link_clicks")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .gte("clicked_at", since),
      supabase
        .from("links")
        .select("title, click_count")
        .eq("user_id", ctx.getUserId())
        .order("click_count", { ascending: false })
        .limit(5),
    ]);

    const summary = {
      username: profile.username,
      window_days: window,
      views: views.count ?? 0,
      link_clicks: clicks.count ?? 0,
      top_links: links.data ?? [],
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
