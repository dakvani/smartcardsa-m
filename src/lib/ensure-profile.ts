import { supabase } from "@/integrations/supabase/client";

/**
 * Guarantees that a signed-in user (email or OAuth) has a profile row so they
 * can start editing immediately. Safe to call on every auth landing.
 */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
}

function baseUsername(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }): string {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidate =
    (typeof meta.username === "string" && meta.username) ||
    (typeof meta.preferred_username === "string" && meta.preferred_username) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (user.email ? user.email.split("@")[0] : "");
  const slug = slugify(String(candidate || ""));
  return slug.length >= 3 ? slug : `user${Math.random().toString(36).slice(2, 8)}`;
}

export async function ensureProfile(userId?: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (userId && user.id !== userId)) return false;

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) return true;

    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const displayName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      null;
    const avatarUrl =
      (typeof meta.avatar_url === "string" && meta.avatar_url) ||
      (typeof meta.picture === "string" && meta.picture) ||
      null;

    const base = baseUsername(user);

    for (let attempt = 0; attempt < 5; attempt++) {
      const username = attempt === 0 ? base : `${base}${Math.random().toString(36).slice(2, 6)}`;
      const { error } = await supabase.from("profiles").insert({
        user_id: user.id,
        username,
        title: displayName ? displayName : `@${username}`,
        avatar_url: avatarUrl,
      });
      if (!error) return true;
      // 23505 = unique violation on username; retry with a suffix.
      if (error.code !== "23505") {
        console.error("ensureProfile insert failed:", error.message);
        return false;
      }
      // Another tab/request may have created the profile meanwhile.
      const { data: raced } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (raced) return true;
    }
    return false;
  } catch (e) {
    console.error("ensureProfile failed:", e);
    return false;
  }
}
