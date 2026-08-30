// Generates wallet passes for a public profile.
//
// Apple Wallet (.pkpass) requires an Apple Pass Type ID certificate.
// Google/Samsung Wallet requires a Google Wallet issuer ID + service account key.
//
// Until those credentials are supplied as secrets, the function replies
// { configured: false } so the client can fall back to a contact card.
//
// Secrets used when available:
//   APPLE_PASS_TYPE_ID, APPLE_TEAM_ID, APPLE_PASS_CERT_P12_BASE64, APPLE_PASS_CERT_PASSWORD
//   GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SERVICE_ACCOUNT (full JSON key)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface WalletConfig {
  apple_enabled: boolean;
  apple_pass_type_id: string;
  apple_team_id: string;
  apple_cert_p12_base64: string | null;
  google_enabled: boolean;
  google_issuer_id: string;
  google_service_account: string | null;
}

async function loadConfig(): Promise<WalletConfig | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/wallet_settings?id=eq.1&select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return (rows?.[0] as WalletConfig) ?? null;
  } catch {
    return null;
  }
}

function appleReady(cfg: WalletConfig | null): boolean {
  if (cfg) {
    return !!(cfg.apple_enabled && cfg.apple_pass_type_id && cfg.apple_team_id && cfg.apple_cert_p12_base64);
  }
  return (
    !!Deno.env.get("APPLE_PASS_TYPE_ID") &&
    !!Deno.env.get("APPLE_TEAM_ID") &&
    !!Deno.env.get("APPLE_PASS_CERT_P12_BASE64")
  );
}

interface PassRequest {
  platform: "apple" | "google";
  profile: {
    id: string;
    username: string;
    displayName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  publicUrl: string;
}

function b64url(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const raw = atob(body);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

async function signRs256(payload: Record<string, unknown>, privateKeyPem: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput)),
  );
  return `${signingInput}.${b64url(sig)}`;
}

function googleCreds(cfg: WalletConfig | null): { issuerId: string; saJson: string } | null {
  if (cfg && cfg.google_enabled && cfg.google_issuer_id && cfg.google_service_account) {
    return { issuerId: cfg.google_issuer_id, saJson: cfg.google_service_account };
  }
  const issuerId = Deno.env.get("GOOGLE_WALLET_ISSUER_ID");
  const saJson = Deno.env.get("GOOGLE_WALLET_SERVICE_ACCOUNT");
  if (issuerId && saJson) return { issuerId, saJson };
  return null;
}

async function buildGoogleSaveUrl(req: PassRequest, cfg: WalletConfig | null): Promise<string | null> {
  const creds = googleCreds(cfg);
  if (!creds) return null;
  const { issuerId, saJson } = creds;

  let sa: { client_email: string; private_key: string };
  try {
    sa = JSON.parse(saJson);
  } catch {
    return null;
  }
  if (!sa.client_email || !sa.private_key) return null;

  const classId = `${issuerId}.smartcard_profile`;
  const objectId = `${issuerId}.${req.profile.id.replace(/[^\w.-]/g, "")}`;

  const genericObject: Record<string, unknown> = {
    id: objectId,
    classId,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: "#0f172a",
    cardTitle: { defaultValue: { language: "en", value: "SmartCard" } },
    header: { defaultValue: { language: "en", value: req.profile.displayName } },
    subheader: { defaultValue: { language: "en", value: `@${req.profile.username}` } },
    barcode: { type: "QR_CODE", value: req.publicUrl, alternateText: `@${req.profile.username}` },
    linksModuleData: {
      uris: [{ uri: req.publicUrl, description: "Open profile", id: "profile" }],
    },
  };
  if (req.profile.avatarUrl) {
    genericObject.logo = {
      sourceUri: { uri: req.profile.avatarUrl },
      contentDescription: { defaultValue: { language: "en", value: "Profile photo" } },
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const jwt = await signRs256(
    {
      iss: sa.client_email,
      aud: "google",
      typ: "savetowallet",
      iat: now,
      payload: { genericObjects: [genericObject] },
    },
    sa.private_key,
  );

  return `https://pay.google.com/gp/v/save/${jwt}`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const raw = request.method === "GET" ? {} : await request.json().catch(() => ({}));
    const cfg = await loadConfig();

    if (request.method === "GET" || (raw as { action?: string })?.action === "status") {
      return new Response(
        JSON.stringify({
          apple: appleReady(cfg) ? "available" : "pending",
          google: googleCreds(cfg) ? "available" : "pending",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = raw as PassRequest;
    if (!body?.platform || !body?.profile?.id) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.platform === "google") {
      const saveUrl = await buildGoogleSaveUrl(body, cfg);
      if (!saveUrl) {
        return new Response(
          JSON.stringify({
            configured: false,
            reason:
              "Google/Samsung Wallet isn't set up yet. Add the Google Wallet issuer ID and service account key to enable it.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ configured: true, saveUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Apple Wallet — needs a signed .pkpass bundle.
    return new Response(
      JSON.stringify({
        configured: false,
        reason: appleReady(cfg)
          ? "Apple Wallet pass signing is still being finalised."
          : "Apple Wallet isn't set up yet. Add your Apple Pass Type ID certificate to enable it.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("wallet-pass error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
