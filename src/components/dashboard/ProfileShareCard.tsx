import * as React from "react";
import { useState } from "react";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Copy, Check, ExternalLink, QrCode, Globe, Link2 } from "lucide-react";
import { toast } from "sonner";
import { profilePath } from "@/lib/profile-url";

interface ProfileShareCardProps {
  username: string;
  /** Optional stats row rendered inside the card, aligned under the link block. */
  stats?: React.ReactNode;
}


const CUSTOM_DOMAIN_KEY = "smartcard_custom_domain";

function getStoredDomain(): string {
  return localStorage.getItem(CUSTOM_DOMAIN_KEY) || "";
}

function getProfileUrl(username: string, customDomain?: string): string {
  const base = customDomain?.trim() || window.location.origin;
  // Remove trailing slash
  const cleanBase = base.replace(/\/+$/, "");
  return `${cleanBase}${profilePath(username)}`;
}

function getQrUrl(username: string, customDomain?: string): string {
  const base = customDomain?.trim() || window.location.origin;
  const cleanBase = base.replace(/\/+$/, "");
  // Route via /qr/ so mobile devices get forced mobile layout (?mobile=1)
  return `${cleanBase}/qr/${username}`;
}

export function ProfileShareCard({ username, stats }: ProfileShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [customDomain, setCustomDomain] = useState(getStoredDomain);
  const [editingDomain, setEditingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState(customDomain);

  const profileUrl = getProfileUrl(username, customDomain);
  const qrUrl = getQrUrl(username, customDomain);

  const copyUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Profile URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const saveDomain = () => {
    const cleaned = domainInput.trim().replace(/\/+$/, "");
    // Add https:// if missing
    const withProtocol = cleaned && !cleaned.startsWith("http") ? `https://${cleaned}` : cleaned;
    setCustomDomain(withProtocol);
    localStorage.setItem(CUSTOM_DOMAIN_KEY, withProtocol);
    setEditingDomain(false);
    toast.success(withProtocol ? "Custom domain saved!" : "Using default domain");
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("share-card-qr");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${username}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-background rounded-xl border border-border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-primary" />
          Your Profile Link
        </h3>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          Open
        </a>
      </div>

      <div className="flex items-center gap-4">
        {/* QR Code */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white p-1.5 rounded-lg shadow-sm">
            <QRCodeSVG
              id="share-card-qr"
              value={qrUrl}
              size={72}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <Button variant="outline" size="icon" onClick={downloadQRCode} title="Download QR" className="h-8 w-8">
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* URL & domain config */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 min-w-0 bg-muted rounded-md px-2.5 py-1.5 font-mono text-xs truncate border border-border">
              {profileUrl}
            </div>
            <Button variant="gradient" size="sm" onClick={copyUrl} className="shrink-0 gap-1 h-7 px-2.5 text-xs">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          {/* Custom domain config */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1 min-w-0 truncate">
              <Globe className="w-3 h-3 shrink-0" />
              {customDomain ? <span className="font-mono truncate">{customDomain}</span> : "Using default domain"}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setEditingDomain(!editingDomain); setDomainInput(customDomain); }}
              className="text-xs h-6 px-2 shrink-0"
            >
              {editingDomain ? "Cancel" : customDomain ? "Change" : "Set domain"}
            </Button>
          </div>
          {editingDomain && (
            <div className="flex gap-1.5">
              <Input
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="https://yourdomain.com"
                className="text-xs h-7"
              />
              <Button size="sm" onClick={saveDomain} className="h-7 px-2.5 text-xs">
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {stats && <div className="mt-3 border-t border-border pt-3">{stats}</div>}
    </div>

  );
}
