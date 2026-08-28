/**
 * Admin-controlled builder configuration: global toggles (animations, 3D,
 * link movement, custom backgrounds) plus per-template overrides
 * (enabled / free vs pro).
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { smartlinkTemplateTier, type TemplateTier } from "@/lib/smartlink-handoff";
import type { TemplateProfile } from "@/lib/smartlink-templates";

export interface BuilderSettings {
  allow_animations: boolean;
  allow_3d: boolean;
  allow_link_motion: boolean;
  allow_custom_background: boolean;
  max_links_free: number;
}

export interface TemplateOverride {
  template_key: string;
  enabled: boolean;
  tier: TemplateTier;
  position: number;
}

export const DEFAULT_BUILDER_SETTINGS: BuilderSettings = {
  allow_animations: true,
  allow_3d: true,
  allow_link_motion: true,
  allow_custom_background: true,
  max_links_free: 50,
};

export function useBuilderSettings() {
  const [settings, setSettings] = useState<BuilderSettings>(DEFAULT_BUILDER_SETTINGS);
  const [overrides, setOverrides] = useState<Record<string, TemplateOverride>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [s, o] = await Promise.all([
      supabase.from("builder_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("smartlink_template_settings").select("*"),
    ]);
    if (s.data) {
      const d = s.data as Partial<BuilderSettings>;
      setSettings({ ...DEFAULT_BUILDER_SETTINGS, ...d });
    }
    const map: Record<string, TemplateOverride> = {};
    for (const row of (o.data as TemplateOverride[]) || []) map[row.template_key] = row;
    setOverrides(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Is this template visible in the galleries? */
  const templateEnabled = useCallback(
    (t: TemplateProfile) => overrides[t.username]?.enabled ?? true,
    [overrides]
  );

  /** Effective tier: admin override wins over the code default. */
  const templateTier = useCallback(
    (t: TemplateProfile): TemplateTier => overrides[t.username]?.tier ?? smartlinkTemplateTier(t),
    [overrides]
  );

  return { settings, overrides, loading, reload: load, templateEnabled, templateTier, setSettings };
}
