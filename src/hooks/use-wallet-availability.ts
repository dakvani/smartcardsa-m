import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type WalletAvailability = "available" | "pending" | "unknown";

export interface WalletStatus {
  apple: WalletAvailability;
  google: WalletAvailability;
  loading: boolean;
}

/** Reports whether Apple / Samsung wallet passes can be issued right now. */
export function useWalletAvailability(): WalletStatus {
  const [status, setStatus] = useState<WalletStatus>({
    apple: "unknown",
    google: "unknown",
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("wallet-pass", {
          body: { action: "status" },
        });
        if (error) throw error;
        if (cancelled) return;
        setStatus({
          apple: data?.apple === "available" ? "available" : "pending",
          google: data?.google === "available" ? "available" : "pending",
          loading: false,
        });
      } catch {
        if (!cancelled) setStatus({ apple: "pending", google: "pending", loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
