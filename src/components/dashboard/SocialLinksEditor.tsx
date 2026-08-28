import { CheckCircle2, AlertCircle, ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_LOGOS } from "@/lib/brand-logos";
import { useMemo } from "react";
import { validateSocialHandle } from "@/lib/link-validation";
import { toast } from "@/hooks/use-toast";

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  email?: string;
  whatsapp?: string;
  tiktok?: string;
  twitch?: string;
  spotify?: string;
}

interface SocialLinksEditorProps {
  socialLinks: SocialLinks;
  onChange: (links: SocialLinks) => void;
  onBlur: () => void;
  order?: string[];
  onOrderChange?: (order: string[]) => void;
}

const socialPlatforms = [
  { key: "instagram", label: "Instagram", placeholder: "username" },
  { key: "twitter", label: "X", placeholder: "username" },
  { key: "youtube", label: "YouTube", placeholder: "channel" },
  { key: "facebook", label: "Facebook", placeholder: "username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "username" },
  { key: "github", label: "GitHub", placeholder: "username" },
  { key: "website", label: "Website", placeholder: "https://..." },
  { key: "email", label: "Email", placeholder: "you@example.com" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+966..." },
  { key: "tiktok", label: "TikTok", placeholder: "username" },
  { key: "twitch", label: "Twitch", placeholder: "username" },
  { key: "spotify", label: "Spotify", placeholder: "artist or profile URL" },
] as const;

export function SocialLinksEditor({ socialLinks, onChange, onBlur, order = [], onOrderChange }: SocialLinksEditorProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...socialLinks, [key]: value });
  };

  const results = useMemo(() => {
    const map: Record<string, { valid: boolean; message?: string }> = {};
    for (const { key } of socialPlatforms) {
      map[key] = validateSocialHandle(key, (socialLinks as Record<string, string>)[key] || "");
    }
    return map;
  }, [socialLinks]);

  const handleBlur = () => {
    const firstInvalid = socialPlatforms.find(({ key }) => !results[key].valid);
    if (firstInvalid) {
      toast({
        title: `Invalid ${firstInvalid.label} link`,
        description: results[firstInvalid.key].message,
        variant: "destructive",
      });
      return;
    }
    onBlur();
  };
  const orderedPlatforms = [...socialPlatforms].sort(
    (a, b) => (order.indexOf(a.key) < 0 ? 999 : order.indexOf(a.key)) - (order.indexOf(b.key) < 0 ? 999 : order.indexOf(b.key)),
  );
  const move = (key: string, direction: -1 | 1) => {
    const activeOrder = orderedPlatforms.map((platform) => platform.key);
    const index = activeOrder.indexOf(key as typeof activeOrder[number]);
    const target = index + direction;
    if (target < 0 || target >= activeOrder.length) return;
    [activeOrder[index], activeOrder[target]] = [activeOrder[target], activeOrder[index]];
    onOrderChange?.(activeOrder);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Social Media Links</label>
      <div className="space-y-2">
        {orderedPlatforms.map(({ key, label, placeholder }, index) => {
          const brandLogo = BRAND_LOGOS[key];
          const value = (socialLinks as Record<string, string>)[key] || "";
          const result = results[key];
          const hasValue = value.trim().length > 0;
          return (
            <div key={key}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2C2D31] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {brandLogo && (
                    <img src={brandLogo} alt="" aria-hidden="true" loading="lazy" className="w-6 h-6 object-contain" />
                  )}
                </div>
                <div className="relative flex-1">
                  <input
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    aria-invalid={hasValue && !result.valid}
                    aria-label={`${label} link`}
                    className={`w-full pr-9 px-3 py-2 rounded-lg border bg-background text-sm transition-colors ${
                      hasValue && !result.valid
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input"
                    }`}
                  />
                  {hasValue && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {result.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(key, -1)} disabled={index === 0} aria-label={`Move ${label} up`}><ArrowUp className="h-3.5 w-3.5" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(key, 1)} disabled={index === orderedPlatforms.length - 1} aria-label={`Move ${label} down`}><ArrowDown className="h-3.5 w-3.5" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { handleChange(key, ""); queueMicrotask(onBlur); }} disabled={!hasValue} aria-label={`Delete ${label}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {hasValue && !result.valid && result.message && (
                <p className="text-xs text-destructive mt-1 ml-13 pl-13" style={{ marginLeft: 52 }}>
                  {result.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        These icons will appear at the bottom of your profile. Invalid entries won't be saved.
      </p>
    </div>
  );
}

export { socialPlatforms };
