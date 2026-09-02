import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "delete_link",
  title: "Delete link",
  description: "Permanently delete one of the signed-in user's profile links.",
  inputSchema: { id: z.string().uuid().describe("ID of the link to delete.") },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("links")
      .delete()
      .eq("id", id)
      .eq("user_id", ctx.getUserId())
      .select("id, title")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "Link not found for this account." }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Deleted link "${data.title}".` }],
      structuredContent: { deleted: data },
    };
  },
});
