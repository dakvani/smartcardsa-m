/**
 * Admin panel showing where each social sign-in consent screen / app
 * verification stands (Google, Apple, Microsoft), which steps are done,
 * and what is still pending.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Check,
  Clock,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PublishingStatus = "testing" | "in_production";
type VerificationStatus = "not_submitted" | "submitted" | "verified" | "rejected";
type ProviderKey = "google" | "apple" | "microsoft";

interface OAuthStatus {
  id: number;
  provider: ProviderKey;
  app_name: string;
  consent_screen_configured: boolean;
  scopes_configured: boolean;
  authorized_domains_added: boolean;
  credentials_created: boolean;
  credentials_saved_in_cloud: boolean;
  publishing_status: PublishingStatus;
  verification_status: VerificationStatus;
  notes: string | null;
  updated_at: string | null;
}

interface StepDef {
  key: keyof OAuthStatus;
  label: string;
  hint: string;
}

interface ProviderDef {
  key: ProviderKey;
  id: number;
  label: string;
  consoleName: string;
  steps: StepDef[];
  publishingLabels: { testing: string; in_production: string };
  pendingPublishText: string;
  pendingSubmitText: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    key: "google",
    id: 1,
    label: "Google",
    consoleName: "Google Cloud",
    publishingLabels: { testing: "Testing", in_production: "In production" },
    pendingPublishText: "Publish the app in Google Cloud (still in Testing mode)",
    pendingSubmitText: "Submit the consent screen for Google verification",
    steps: [
      {
        key: "consent_screen_configured",
        label: "Consent screen configured",
        hint: "App name, support email and logo set in Google Cloud",
      },
      {
        key: "scopes_configured",
        label: "Scopes added",
        hint: "openid, userinfo.email, userinfo.profile",
      },
      {
        key: "authorized_domains_added",
        label: "Authorised domains added",
        hint: "smartcardsa.shop and the Lovable preview domain",
      },
      {
        key: "credentials_created",
        label: "OAuth client created",
        hint: "Web application client with the Cloud redirect URL",
      },
      {
        key: "credentials_saved_in_cloud",
        label: "Client ID & secret saved",
        hint: "Pasted into Cloud → Users → Authentication Settings → Google",
      },
    ],
  },
  {
    key: "apple",
    id: 2,
    label: "Apple",
    consoleName: "Apple Developer",
    publishingLabels: { testing: "Sandbox / testing", in_production: "Live" },
    pendingPublishText: "Move the Sign in with Apple setup out of testing to live",
    pendingSubmitText: "Submit the app details to Apple for review",
    steps: [
      {
        key: "consent_screen_configured",
        label: "App ID & Services ID configured",
        hint: "Sign in with Apple enabled on the App ID and Services ID",
      },
      {
        key: "scopes_configured",
        label: "Scopes added",
        hint: "name and email requested on the Services ID",
      },
      {
        key: "authorized_domains_added",
        label: "Domains & return URLs added",
        hint: "smartcardsa.shop plus the Cloud callback return URL",
      },
      {
        key: "credentials_created",
        label: "Sign-in key created",
        hint: "Private key (.p8) generated with Team ID and Key ID noted",
      },
      {
        key: "credentials_saved_in_cloud",
        label: "Credentials saved",
        hint: "Services ID, Team ID, Key ID and key pasted into Cloud → Authentication → Apple",
      },
    ],
  },
  {
    key: "microsoft",
    id: 3,
    label: "Microsoft",
    consoleName: "Microsoft Entra ID",
    publishingLabels: { testing: "Single tenant / testing", in_production: "Multi-tenant / live" },
    pendingPublishText: "Switch the app registration to the intended tenant audience",
    pendingSubmitText: "Complete Microsoft publisher verification for the app",
    steps: [
      {
        key: "consent_screen_configured",
        label: "App registration configured",
        hint: "App name, logo and publisher domain set in Entra ID",
      },
      {
        key: "scopes_configured",
        label: "API permissions added",
        hint: "openid, email, profile, User.Read",
      },
      {
        key: "authorized_domains_added",
        label: "Redirect URIs added",
        hint: "Cloud callback URL plus smartcardsa.shop origins",
      },
      {
        key: "credentials_created",
        label: "Client secret created",
        hint: "Secret generated with an expiry date recorded",
      },
      {
        key: "credentials_saved_in_cloud",
        label: "Client ID & secret saved",
        hint: "Pasted into Cloud → Users → Authentication Settings → Microsoft",
      },
    ],
  },
];

const defaultsFor = (p: ProviderDef): OAuthStatus => ({
  id: p.id,
  provider: p.key,
  app_name: "SmartCardSA",
  consent_screen_configured: false,
  scopes_configured: false,
  authorized_domains_added: false,
  credentials_created: false,
  credentials_saved_in_cloud: false,
  publishing_status: "testing",
  verification_status: "not_submitted",
  notes: null,
  updated_at: null,
});

const VERIFICATION_META: Record<
  VerificationStatus,
  { label: string; tone: string; icon: typeof ShieldCheck }
> = {
  not_submitted: {
    label: "Not submitted",
    tone: "bg-muted text-muted-foreground",
    icon: ShieldAlert,
  },
  submitted: {
    label: "In review",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    icon: Clock,
  },
  verified: {
    label: "Verified",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    icon: BadgeCheck,
  },
  rejected: {
    label: "Rejected — action needed",
    tone: "bg-destructive/15 text-destructive",
    icon: X,
  },
};

function ProviderPanel({
  provider,
  status,
  onChange,
  onSave,
  onReload,
  saving,
}: {
  provider: ProviderDef;
  status: OAuthStatus;
  onChange: (next: OAuthStatus) => void;
  onSave: (patch: Partial<OAuthStatus>) => void;
  onReload: () => void;
  saving: boolean;
}) {
  const steps = provider.steps;
  const done = steps.filter((s) => status[s.key] === true).length;
  const percent = Math.round((done / steps.length) * 100);

  const pending = useMemo(() => {
    const items = steps.filter((s) => status[s.key] !== true).map((s) => s.label);
    if (status.publishing_status !== "in_production") items.push(provider.pendingPublishText);
    if (status.verification_status === "not_submitted") items.push(provider.pendingSubmitText);
    if (status.verification_status === "submitted")
      items.push(`Waiting on ${provider.label}'s review decision`);
    if (status.verification_status === "rejected")
      items.push(`Address ${provider.label}'s rejection feedback and resubmit`);
    return items;
  }, [status, steps, provider]);

  const meta = VERIFICATION_META[status.verification_status];
  const StatusIcon = meta.icon;
  const fullyVerified = pending.length === 0 && status.verification_status === "verified";

  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 justify-between p-4 sm:p-5 border-b border-border/50">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              fullyVerified
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            {fullyVerified ? <ShieldCheck className="w-5 h-5" /> : <StatusIcon className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {provider.label} sign-in verification
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              Consent screen shows “to continue to {status.app_name || "…"}”
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${meta.tone} border-0 text-[11px] font-medium`}>{meta.label}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onReload}
            aria-label={`Refresh ${provider.label} status`}
          >
            <RefreshCw className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <div className="p-4 sm:p-5 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Setup progress in {provider.consoleName}</span>
            <span className="font-medium">
              {done}/{steps.length} steps
            </span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>

        <ul className="space-y-2">
          {steps.map((step) => {
            const checked = status[step.key] === true;
            return (
              <li
                key={step.key as string}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 p-3"
              >
                <span
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    checked
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {checked ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{step.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.hint}</p>
                </div>
                <Switch
                  checked={checked}
                  onCheckedChange={(v) => onSave({ [step.key]: v } as Partial<OAuthStatus>)}
                  aria-label={step.label}
                />
              </li>
            );
          })}
        </ul>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">App name shown to users</Label>
            <Input
              value={status.app_name}
              onChange={(e) => onChange({ ...status, app_name: e.target.value })}
              onBlur={() => onSave({ app_name: status.app_name })}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Publishing status</Label>
            <Select
              value={status.publishing_status}
              onValueChange={(v) => onSave({ publishing_status: v as PublishingStatus })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testing">{provider.publishingLabels.testing}</SelectItem>
                <SelectItem value="in_production">
                  {provider.publishingLabels.in_production}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Verification status</Label>
            <Select
              value={status.verification_status}
              onValueChange={(v) => onSave({ verification_status: v as VerificationStatus })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_submitted">Not submitted</SelectItem>
                <SelectItem value="submitted">Submitted / in review</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-semibold mb-2">
            {pending.length === 0 ? "Nothing pending" : `Still pending (${pending.length})`}
          </p>
          {pending.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {provider.label} sign-in is fully set up and verified for {status.app_name}.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {pending.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Notes</Label>
          <Textarea
            value={status.notes ?? ""}
            placeholder="Review reference, feedback received, next follow-up date…"
            onChange={(e) => onChange({ ...status, notes: e.target.value })}
            onBlur={() => onSave({ notes: status.notes })}
            className="text-sm min-h-[72px]"
          />
        </div>

        {status.updated_at && (
          <p className="text-[11px] text-muted-foreground">
            Last updated {new Date(status.updated_at).toLocaleString()}
          </p>
        )}
      </div>
    </section>
  );
}

export function AdminGoogleOAuthStatus() {
  const [statuses, setStatuses] = useState<Record<ProviderKey, OAuthStatus>>(() => ({
    google: defaultsFor(PROVIDERS[0]),
    apple: defaultsFor(PROVIDERS[1]),
    microsoft: defaultsFor(PROVIDERS[2]),
  }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<ProviderKey>("google");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("oauth_verification_status" as never)
      .select("*");
    setLoading(false);
    if (error) {
      toast.error("Could not load social sign-in status");
      return;
    }
    const rows = (data ?? []) as unknown as OAuthStatus[];
    setStatuses({
      google: { ...defaultsFor(PROVIDERS[0]), ...(rows.find((r) => r.provider === "google") ?? {}) },
      apple: { ...defaultsFor(PROVIDERS[1]), ...(rows.find((r) => r.provider === "apple") ?? {}) },
      microsoft: {
        ...defaultsFor(PROVIDERS[2]),
        ...(rows.find((r) => r.provider === "microsoft") ?? {}),
      },
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (key: ProviderKey, patch: Partial<OAuthStatus>) => {
    const next = { ...statuses[key], ...patch };
    setStatuses((prev) => ({ ...prev, [key]: next }));
    setSaving(true);
    const { error } = await supabase
      .from("oauth_verification_status" as never)
      .upsert({ ...next, updated_at: new Date().toISOString() } as never);
    setSaving(false);
    if (error) {
      toast.error("Could not save status");
      void load();
      return;
    }
    toast.success("Status updated");
  };

  const summary = (p: ProviderDef) => {
    const s = statuses[p.key];
    const done = p.steps.filter((step) => s[step.key] === true).length;
    return `${done}/${p.steps.length}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as ProviderKey)} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        {PROVIDERS.map((p) => (
          <TabsTrigger key={p.key} value={p.key} className="text-xs sm:text-sm">
            {p.label}
            <span className="ml-1.5 text-[10px] text-muted-foreground">{summary(p)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {PROVIDERS.map((p) => (
        <TabsContent key={p.key} value={p.key} className="mt-0">
          <ProviderPanel
            provider={p}
            status={statuses[p.key]}
            saving={saving}
            onChange={(next) => setStatuses((prev) => ({ ...prev, [p.key]: next }))}
            onSave={(patch) => void save(p.key, patch)}
            onReload={() => void load()}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
