/**
 * Admin control for the SmartLink builder: global capability toggles and
 * per-template management (show/hide, free vs pro).
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Search, Sliders, LayoutTemplate } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBuilderSettings, type BuilderSettings } from "@/hooks/use-builder-settings";
import { templates } from "@/lib/smartlink-templates";
import type { TemplateTier } from "@/lib/smartlink-handoff";

const TOGGLES: { key: keyof BuilderSettings; label: string; hint: string }[] = [
  { key: "allow_animations", label: "Animated backgrounds", hint: "Aurora, rain, matrix and friends" },
  { key: "allow_3d", label: "3D elements", hint: "Rotating cubes, prisms, orbits" },
  { key: "allow_link_motion", label: "Link movement", hint: "Pulse, bounce, slide-to-action buttons" },
  { key: "allow_custom_background", label: "Custom backgrounds", hint: "User-uploaded images and video" },
];

export function AdminBuilderSettings() {
  const { settings, overrides, loading, reload, templateEnabled, templateTier } = useBuilderSettings();
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const saveSettings = async (patch: Partial<BuilderSettings>) => {
    setSaving(true);
    const { error } = await supabase
      .from("builder_settings")
      .upsert({ id: 1, ...settings, ...patch } as never);
    setSaving(false);
    if (error) return toast.error("Could not save builder settings");
    await reload();
    toast.success("Builder settings updated");
  };

  const saveTemplate = async (key: string, patch: { enabled?: boolean; tier?: TemplateTier }) => {
    const current = overrides[key];
    const { error } = await supabase.from("smartlink_template_settings").upsert({
      template_key: key,
      enabled: patch.enabled ?? current?.enabled ?? true,
      tier: patch.tier ?? current?.tier ?? "free",
      position: current?.position ?? 0,
    } as never);
    if (error) return toast.error("Could not update template");
    await reload();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.username.toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q)
    );
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Builder capabilities</h3>
          {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <label
              key={t.key}
              className="flex items-start justify-between gap-4 rounded-xl border border-border p-3"
            >
              <span>
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="block text-xs text-muted-foreground">{t.hint}</span>
              </span>
              <Switch
                checked={Boolean(settings[t.key])}
                onCheckedChange={(v) => saveSettings({ [t.key]: v } as Partial<BuilderSettings>)}
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm">Max links on free plan</span>
          <Input
            type="number"
            min={1}
            className="w-24 h-9"
            defaultValue={settings.max_links_free}
            onBlur={(e) => {
              const v = Number(e.target.value);
              if (v > 0 && v !== settings.max_links_free) saveSettings({ max_links_free: v });
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <LayoutTemplate className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Templates</h3>
          <Badge variant="secondary">{templates.length}</Badge>
          <div className="relative ml-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates"
              className="pl-9 h-9 w-56"
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((t) => {
            const enabled = templateEnabled(t);
            const tier = templateTier(t);
            return (
              <motion.div
                key={t.username}
                layout
                className="flex flex-wrap items-center gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    @{t.username} · {t.category ?? "general"}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={tier === "pro" ? "default" : "outline"}
                  onClick={() => saveTemplate(t.username, { tier: tier === "pro" ? "free" : "pro" })}
                >
                  {tier === "pro" ? "Pro" : "Free"}
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{enabled ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(v) => saveTemplate(t.username, { enabled: v })}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
