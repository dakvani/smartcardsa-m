import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Apple, CheckCircle2, Clock, Loader2, Upload, Wallet } from "lucide-react";

interface WalletSettings {
  apple_enabled: boolean;
  apple_pass_type_id: string;
  apple_team_id: string;
  apple_cert_p12_base64: string | null;
  apple_cert_password: string | null;
  apple_cert_filename: string | null;
  google_enabled: boolean;
  google_issuer_id: string;
  google_service_account: string | null;
}

const EMPTY: WalletSettings = {
  apple_enabled: false,
  apple_pass_type_id: "",
  apple_team_id: "",
  apple_cert_p12_base64: null,
  apple_cert_password: "",
  apple_cert_filename: null,
  google_enabled: false,
  google_issuer_id: "",
  google_service_account: "",
};

function StatusBadge({ ready }: { ready: boolean }) {
  return ready ? (
    <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30">
      <CheckCircle2 className="h-3 w-3" /> Available
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Clock className="h-3 w-3" /> Pending setup
    </Badge>
  );
}

export function AdminWalletSetup() {
  const [settings, setSettings] = useState<WalletSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wallet_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) toast.error("Couldn't load wallet settings");
      if (data) setSettings({ ...EMPTY, ...(data as unknown as WalletSettings) });
      setLoading(false);
    })();
  }, []);

  const update = <K extends keyof WalletSettings>(key: K, value: WalletSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleCertFile = async (file: File) => {
    if (file.size > 512 * 1024) {
      toast.error("Certificate too large", { description: "Expected a .p12 file under 512 KB." });
      return;
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    let bin = "";
    buf.forEach((b) => (bin += String.fromCharCode(b)));
    update("apple_cert_p12_base64", btoa(bin));
    update("apple_cert_filename", file.name);
    toast.success("Certificate ready", { description: "Click Save to store it." });
  };

  const save = async () => {
    if (settings.google_service_account) {
      try {
        JSON.parse(settings.google_service_account);
      } catch {
        toast.error("Service account key must be valid JSON");
        return;
      }
    }
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("wallet_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
        updated_by: userRes.user?.id ?? null,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save", { description: error.message });
      return;
    }
    toast.success("Wallet settings saved");
  };

  const appleReady =
    settings.apple_enabled &&
    !!settings.apple_pass_type_id &&
    !!settings.apple_team_id &&
    !!settings.apple_cert_p12_base64;
  const googleReady =
    settings.google_enabled && !!settings.google_issuer_id && !!settings.google_service_account;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading wallet settings…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4" /> Wallet passes
        </CardTitle>
        <CardDescription>
          Upload the Apple pass certificate and configure the Samsung/Google issuer keys used to generate
          wallet passes from public profiles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Apple */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Apple className="h-4 w-4" /> Apple Wallet
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge ready={appleReady} />
              <Switch
                checked={settings.apple_enabled}
                onCheckedChange={(v) => update("apple_enabled", v)}
                aria-label="Enable Apple Wallet"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="apple-pass-type">Pass Type ID</Label>
              <Input
                id="apple-pass-type"
                placeholder="pass.com.smartcardsa.profile"
                value={settings.apple_pass_type_id}
                onChange={(e) => update("apple_pass_type_id", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apple-team">Team ID</Label>
              <Input
                id="apple-team"
                placeholder="ABCDE12345"
                value={settings.apple_team_id}
                onChange={(e) => update("apple_team_id", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pass certificate (.p12)</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
                </Button>
                <span className="truncate text-xs text-muted-foreground">
                  {settings.apple_cert_filename ??
                    (settings.apple_cert_p12_base64 ? "Certificate stored" : "No certificate")}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".p12,.pfx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleCertFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apple-pass-pw">Certificate password</Label>
              <Input
                id="apple-pass-pw"
                type="password"
                placeholder="••••••••"
                value={settings.apple_cert_password ?? ""}
                onChange={(e) => update("apple_cert_password", e.target.value)}
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Google / Samsung */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wallet className="h-4 w-4" /> Samsung / Google Wallet
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge ready={googleReady} />
              <Switch
                checked={settings.google_enabled}
                onCheckedChange={(v) => update("google_enabled", v)}
                aria-label="Enable Samsung Wallet"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="issuer">Issuer ID</Label>
              <Input
                id="issuer"
                placeholder="3388000000012345678"
                value={settings.google_issuer_id}
                onChange={(e) => update("google_issuer_id", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa">Service account key (JSON)</Label>
              <Textarea
                id="sa"
                rows={5}
                className="font-mono text-xs"
                placeholder='{"client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----..."}'
                value={settings.google_service_account ?? ""}
                onChange={(e) => update("google_service_account", e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save wallet settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
