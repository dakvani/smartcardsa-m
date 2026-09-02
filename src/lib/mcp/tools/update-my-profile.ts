import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_my_profile",
  title: "Update my profile",
  description: "Update the signed-in user's profile fields (title, bio, username, avatar URL).",
  inputSchema: {
    title: z.string().trim().max(120).optional().describe("Display name / headline."),
    bio: z.string().trim().max(1000).optional().describe("Short bio shown on the public profile."),
    username: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9_-]{3,30}$/)
      .optional()
      .describe("Public handle used in the profile URL."),
    avatar_url: z.string().url().optional().describe("Public URL of the avatar image."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const patch = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "No fields provided to update." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("user_id", ctx.getUserId())
      .select("id, username, title, bio, avatar_url")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "No profile found to update." }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { profile: data },
    };
  },
});
