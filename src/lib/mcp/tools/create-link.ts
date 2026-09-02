import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_link",
  title: "Create link",
  description: "Add a new link button to the signed-in user's SmartCard profile.",
  inputSchema: {
    title: z.string().trim().min(1).max(120).describe("Button label."),
    url: z.string().trim().min(1).describe("Destination URL (https://, tel:, mailto:, etc.)."),
    visible: z.boolean().optional().describe("Whether the link is shown publicly. Defaults to true."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, url, visible }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const { data: last } = await supabase
      .from("links")
      .select("position")
      .eq("user_id", userId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("links")
      .insert({
        user_id: userId,
        title,
        url,
        visible: visible ?? true,
        position: (last?.position ?? -1) + 1,
      })
      .select("id, title, url, visible, position")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { link: data },
    };
  },
});
