import { supabase } from "@/integrations/supabase/client";
import { ensureProfile } from "@/lib/ensure-profile";


/**
 * Returns the route a user should land on after signing in.
 * - Admins → /admin
 * - Everyone else → /dashboard
 * Marketing landing (/) stays public for signed-out visitors.
 */
function requestedNext(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || params.get("returnTo");
    // Only allow same-origin relative paths.
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  } catch { /* noop */ }
  return null;
}

export async function getPostLoginRedirect(userId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return data ? "/admin" : requestedNext() || "/dashboard";
  } catch {
    return requestedNext() || "/dashboard";
  }
}
