import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { buildVcard, downloadVcard } from "@/lib/vcard";

interface SaveContactButtonProps {
  profile: {
    id: string;
    username: string;
    title?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    social_links?: unknown;
  };
  links: Array<{ title: string; url: string; visible?: boolean }>;
  publicUrl: string;
}

export function SaveContactButton({ profile, links, publicUrl }: SaveContactButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    try {
      const vcf = buildVcard(profile, links, publicUrl);

      // Fire-and-forget analytics event.
      supabase
        .from("profile_share_events")
        .insert({
          profile_id: profile.id,
          channel: "save_contact",
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        })
        .then(({ error }) => {
          if (error) console.warn("share event failed:", error.message);
        });

      downloadVcard(vcf, profile.username);
    } catch (err) {
      console.error("save contact failed", err);
      toast.error("Couldn't save contact. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={busy}
      className="inline-flex h-6 items-center justify-center gap-1 rounded-full border border-primary-foreground/25 bg-primary-foreground/20 px-2.5 text-[10px] font-semibold text-primary-foreground shadow-md backdrop-blur transition-all hover:bg-primary-foreground/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
      Save Contact
    </button>
  );
}
