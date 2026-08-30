import { useState } from "react";
import { Wallet, Loader2, Apple, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWalletAvailability } from "@/hooks/use-wallet-availability";
import { buildVcard, downloadVcard, extractContactDetails, type VcardLink, type VcardProfile } from "@/lib/vcard";

interface AddToWalletButtonsProps {
  profile: VcardProfile & { id: string; avatar_url?: string | null };
  links: VcardLink[];
  publicUrl: string;
}

type Platform = "apple" | "google";

export function AddToWalletButtons({ profile, links, publicUrl }: AddToWalletButtonsProps) {
  const [busy, setBusy] = useState<Platform | null>(null);
  const availability = useWalletAvailability();

  const handleAdd = async (platform: Platform) => {
    setBusy(platform);
    try {
      const details = extractContactDetails(profile, links);
      const { data, error } = await supabase.functions.invoke("wallet-pass", {
        body: {
          platform,
          publicUrl,
          profile: {
            id: profile.id,
            username: profile.username,
            displayName: details.displayName,
            bio: profile.bio ?? null,
            avatarUrl: profile.avatar_url ?? null,
            phone: details.phones[0] ?? details.whatsapps[0] ?? null,
            email: details.emails[0] ?? null,
          },
        },
      });

      if (error) throw error;

      if (data?.configured && data?.saveUrl) {
        window.location.href = data.saveUrl as string;
        return;
      }

      // Not configured yet — fall back to saving the contact card.
      toast.info(
        platform === "apple" ? "Apple Wallet is coming soon" : "Samsung/Google Wallet is coming soon",
        { description: "Saving the contact card to your phone instead." },
      );
      downloadVcard(buildVcard(profile, links, publicUrl), profile.username);
    } catch (err) {
      console.error("wallet pass failed", err);
      toast.error("Couldn't add to wallet", { description: "Saved the contact card instead." });
      downloadVcard(buildVcard(profile, links, publicUrl), profile.username);
    } finally {
      setBusy(null);
    }
  };

  const base =
    "inline-flex h-8 flex-1 min-w-[132px] items-center justify-center gap-1.5 rounded-full border border-primary-foreground/25 bg-primary-foreground/15 px-3 text-[11px] font-semibold text-primary-foreground shadow-md backdrop-blur transition-all hover:bg-primary-foreground/25 active:scale-[0.98] disabled:opacity-70";

  const statusPill = (state: typeof availability.apple) => {
    if (availability.loading || state === "unknown") return null;
    const ready = state === "available";
    return (
      <span
        className={`ml-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-medium ${
          ready
            ? "bg-emerald-400/20 text-primary-foreground"
            : "bg-primary-foreground/10 text-primary-foreground/70"
        }`}
      >
        {ready ? <Check className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
        {ready ? "Ready" : "Soon"}
      </span>
    );
  };

  return (
    <div className="sm:hidden mt-2.5 w-full">
      <div className="flex w-full items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => handleAdd("apple")}
          disabled={busy !== null}
          className={base}
          aria-label={
            availability.apple === "available" ? "Add to Apple Wallet" : "Apple Wallet pending setup"
          }
        >
          {busy === "apple" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Apple className="h-3.5 w-3.5" />}
          Apple Wallet
          {statusPill(availability.apple)}
        </button>
        <button
          type="button"
          onClick={() => handleAdd("google")}
          disabled={busy !== null}
          className={base}
          aria-label={
            availability.google === "available" ? "Add to Samsung Wallet" : "Samsung Wallet pending setup"
          }
        >
          {busy === "google" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
          Samsung Wallet
          {statusPill(availability.google)}
        </button>
      </div>
      {!availability.loading &&
        availability.apple !== "available" &&
        availability.google !== "available" && (
          <p className="mt-1.5 text-center text-[10px] text-primary-foreground/70">
            Wallet passes are pending setup — you&apos;ll get a contact card instead.
          </p>
        )}
    </div>
  );
}
