import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, Smartphone, Maximize2, icons as LucideIcons } from "lucide-react";
import { detectLinkType, getLinkTypeDef } from "@/lib/link-types";
import { SmartCardLogo } from "@/components/brand/SmartCardLogo";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { SocialIcons } from "@/components/profile/SocialIcons";
import { EmailSignup } from "@/components/profile/EmailSignup";
import { SaveContactButton } from "@/components/profile/SaveContactButton";
import { ProfileLinkButton } from "@/components/profile/ProfileLinkButton";
import { parseCardStyle, headingClassFor, bioClassFor } from "@/lib/template-card-style";
import { getBrandLogo } from "@/lib/brand-logos";

import { LazyAnimatedBackground } from "@/components/profile/LazyAnimatedBackground";
import { ClaimSmartCardDialog } from "@/components/profile/ClaimSmartCardDialog";
import { DeferredProfileMedia } from "@/components/profile/DeferredProfileMedia";
import { parseUserAgent } from "@/lib/userAgentParser";
import {
  ACCESSIBILITY_SCOPE_ATTR,
  applyAccessibilityPreferencesToScope,
  loadAccessibilityPreferences,
} from "@/lib/accessibility";

const ThreeDLayer = lazy(() =>
  import("@/components/smartlink/ThreeDLayer").then((module) => ({ default: module.ThreeDLayer }))
);

interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface Profile {
  id: string;
  user_id: string;
  username: string;
  title: string;
  bio: string;
  avatar_url: string | null;
  theme_gradient: string;
  social_links: SocialLinks;
  custom_bg_color: string | null;
  custom_accent_color: string | null;
  gradient_direction: string;
  email_collection_enabled: boolean;
  animation_type: string | null;
  animation_speed: number;
  animation_intensity: number;
  motion_enabled?: boolean | null;
  custom_background_url?: string | null;
  custom_background_type?: "image" | "video" | null;
  plan?: string;
  card_style?: unknown;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  visible: boolean;
  thumbnail_url: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  group_id: string | null;
  is_featured: boolean;
  motion?: string | null;
}

interface LinkGroup {
  id: string;
  name: string;
  position: number;
}

// Check if link is currently active based on schedule
const isLinkActive = (link: LinkItem): boolean => {
  const now = new Date();
  if (link.scheduled_start && new Date(link.scheduled_start) > now) return false;
  if (link.scheduled_end && new Date(link.scheduled_end) <= now) return false;
  return true;
};

// ---- Color helpers for QR contrast ----
const hexToRgb = (hex: string): [number, number, number] | null => {
  const m = hex.replace("#", "").match(/^([\da-f]{3}|[\da-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const relLuminance = (rgb: [number, number, number]) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/**
 * Derive QR fg/bg from theme while guaranteeing WCAG-safe contrast for scanners.
 * Strategy: keep bg pure white (best scan reliability across devices),
 * tint the fg with the user's accent color only if it's dark enough.
 */
const getQrColors = (accent: string | null | undefined) => {
  const bg = "#FFFFFF";
  if (accent) {
    const rgb = hexToRgb(accent);
    if (rgb && relLuminance(rgb) < 0.35) {
      return { fg: accent, bg };
    }
  }
  return { fg: "#0F172A", bg };
};

type PreviewMode = "phone" | "compact";

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [groups, setGroups] = useState<LinkGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchParams] = useSearchParams();
  const forceMobile = searchParams.get("mobile") === "1" || searchParams.get("m") === "1";
  const [previewMode, setPreviewMode] = useState<PreviewMode>("phone");
  const [claimOpen, setClaimOpen] = useState(false);
  const accessibilityScopeRef = useRef<HTMLDivElement | null>(null);

  // Apply the saved accessibility preferences within the public bio profile
  // scope. This applies for every viewer (including the owner previewing
  // their own page), so the live public view always reflects the settings
  // chosen on the dashboard. Styles stay scoped to this container and do
  // NOT leak into the dashboard or any other internal page.
  useEffect(() => {
    if (!profile?.user_id) return;
    applyAccessibilityPreferencesToScope(
      accessibilityScopeRef.current,
      loadAccessibilityPreferences(),
    );
  }, [profile?.id, profile?.user_id]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id,user_id,username,title,bio,avatar_url,theme_name,theme_gradient,gradient_direction,social_links,custom_bg_color,custom_accent_color,animation_type,animation_speed,animation_intensity,motion_enabled,card_style,custom_background_url,custom_background_type,email_collection_enabled,plan,created_at,updated_at")
          .eq("username", username.toLowerCase())
          .maybeSingle();


        if (profileError) throw profileError;
        if (!profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile({
          ...profileData,
          social_links: (profileData.social_links as SocialLinks) || {},
        } as Profile);

        await supabase.from("profile_views").insert({
          profile_id: profileData.id,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });

        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", profileData.user_id)
          .eq("visible", true)
          .order("position", { ascending: true });

        if (linksError) throw linksError;
        const activeLinks = (linksData || []).filter(isLinkActive);
        setLinks(activeLinks);

        const groupIds = [...new Set(activeLinks.filter((l) => l.group_id).map((l) => l.group_id))];
        if (groupIds.length > 0) {
          const { data: groupsData } = await supabase
            .from("link_groups")
            .select("id, name, position")
            .in("id", groupIds)
            .order("position", { ascending: true });
          setGroups(groupsData || []);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  // QR value: always points to the dedicated tracked redirect for this username.
  // Recomputes whenever the username changes, so the QR stays correct after username updates.
  const qrValue = useMemo(() => {
    if (typeof window === "undefined" || !profile?.username) return "";
    return `${window.location.origin}/qr/${profile.username}`;
  }, [profile?.username]);

  const qrColors = useMemo(
    () => getQrColors(profile?.custom_accent_color),
    [profile?.custom_accent_color]
  );

  const handleLinkClick = async (linkId: string, url: string) => {
    if (/^(tel|mailto|sms):/i.test(url)) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    if (!profile) return;
    const ua = parseUserAgent(navigator.userAgent);
    void supabase.rpc("increment_link_click", { link_uuid: linkId }).then(({ error }) => {
      if (error) console.warn("increment_link_click failed:", error.message);
    });
    void supabase
      .from("link_clicks")
      .insert({
        link_id: linkId,
        profile_id: profile.id,
        device_type: ua.device_type,
        browser: ua.browser,
        os: ua.os,
        referrer: document.referrer || null,
      })
      .then(({ error }) => {
        if (error) console.warn("link_clicks insert failed:", error.message);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black">
        {/* Soft ambient glow so the wait feels like part of the card, not a spinner */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-pulse" aria-hidden />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse [animation-delay:600ms]" aria-hidden />

        {/* Skeleton of the profile card being loaded */}
        <div className="relative w-full max-w-sm px-6 flex flex-col items-center gap-4" role="status" aria-label="Loading profile">
          <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
          <div className="h-5 w-40 rounded-md bg-white/10 animate-pulse" />
          <div className="h-3 w-56 rounded-md bg-white/[0.07] animate-pulse" />
          <div className="mt-2 w-full space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-full rounded-xl bg-white/[0.07] animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
            <SmartCardLogo className="h-4 w-auto opacity-70" />
            <span>Loading @{username}…</span>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">This SmartCard doesn't exist yet.</p>
          <Link
            to={`/auth?signup=true&username=${username}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold"
          >
            Claim @{username}
          </Link>
        </div>
        <Link to="/" className="mt-8 text-sm text-muted-foreground hover:text-foreground">
          ← Back to SmartCard
        </Link>
      </div>
    );
  }

  const bgStyle = profile.custom_bg_color
    ? {
        background: profile.custom_accent_color
          ? `linear-gradient(to bottom, ${profile.custom_bg_color}, ${profile.custom_accent_color})`
          : profile.custom_bg_color,
      }
    : undefined;

  const bgClass = !profile.custom_bg_color
    ? `bg-gradient-${profile.gradient_direction || "to-b"} ${profile.theme_gradient}`
    : "";

  const isCompact = previewMode === "compact";
  // Any paid tier (pro, pro_plus, business, enterprise, lifetime) removes the SmartCard badge
  const isPro = !!profile.plan && profile.plan !== "free";

  // Reusable QR block (inline in footer for compact mode and small screens)
  const InlineQR = (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div className="rounded-lg p-2" style={{ background: qrColors.bg }}>
        <QRCodeSVG value={qrValue} size={104} level="M" fgColor={qrColors.fg} bgColor={qrColors.bg} />
      </div>
      <p className="text-[11px] font-medium text-primary-foreground/80">View on mobile</p>
      <p className="text-[10px] text-primary-foreground/50 leading-tight text-center max-w-[180px]">
        Scan to open on your phone
      </p>
    </div>
  );

  // Auto-icon for every link based on the detected type. Custom/website links
  // fall back to a generic icon so every button has a visual anchor.
  const cardStyle = parseCardStyle(profile?.card_style);
  const reduceLinkMotion = profile?.motion_enabled === false;

  const renderAutoIcon = (url: string, size = "w-5 h-5", title?: string) => {
    const t = detectLinkType(url, title);
    const brandLogo = getBrandLogo(t);

    if (brandLogo) {
      return (
        <img
          src={brandLogo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={`${size} object-contain shrink-0 drop-shadow-sm`}
        />
      );
    }

    const def = getLinkTypeDef(t);
    const iconName = def.icon || (t === "website" ? "Globe" : "Link2");
    const Ico =
      (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName] ||
      LucideIcons.Link2;
    return <Ico className={`${size} text-primary-foreground shrink-0`} />;
  };



  return (
    <div
      ref={accessibilityScopeRef}
      {...{ [ACCESSIBILITY_SCOPE_ATTR]: "" }}
      className="min-h-screen w-full bg-[#0F172A] sm:py-10 sm:px-4 flex items-start sm:items-center justify-center"
    >
      {/* Preview-mode toggle (tablet/desktop only — hidden when ?mobile=1 forces mobile layout) */}
      {!forceMobile && (
        <div className="hidden sm:flex fixed top-4 right-4 z-40 items-center gap-1 rounded-full border border-white/10 bg-slate-900/80 backdrop-blur p-1 shadow-lg">
          <button
            onClick={() => setPreviewMode("phone")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              previewMode === "phone"
                ? "bg-white text-slate-900"
                : "text-white/70 hover:text-white"
            }`}
            aria-pressed={previewMode === "phone"}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Phone
          </button>
          <button
            onClick={() => setPreviewMode("compact")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              previewMode === "compact"
                ? "bg-white text-slate-900"
                : "text-white/70 hover:text-white"
            }`}
            aria-pressed={previewMode === "compact"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Compact
          </button>
        </div>
      )}

      <div className={forceMobile ? "w-full" : "w-full sm:w-auto"}>
        <div
          className={
            forceMobile
              ? "relative w-full min-h-screen overflow-hidden"
              : isCompact
              ? "relative w-full sm:w-[480px] min-h-screen sm:min-h-0 overflow-hidden sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl"
              : "relative w-full min-h-screen overflow-hidden sm:min-h-0 sm:w-[390px] sm:h-[820px] sm:rounded-[3rem] sm:border-[10px] sm:border-slate-800 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_0_2px_rgba(255,255,255,0.04)_inset] sm:ring-1 sm:ring-white/5"
          }
        >
          {/* Notch (phone mode, desktop only) */}
          {!isCompact && (
            <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />
          )}

          <div
            className={`relative h-full overflow-y-auto pt-8 pb-10 px-4 ${
              isCompact ? "" : "sm:pt-12"
            } ${bgClass}`}
            style={bgStyle}
          >
            {profile.custom_background_url && (
              <DeferredProfileMedia
                url={profile.custom_background_url}
                type={profile.custom_background_type}
                speed={profile.animation_speed || 1}
                motionEnabled={profile.motion_enabled !== false}
                tintClass={cardStyle.bgTint}
              />
            )}
            {profile.motion_enabled !== false && (
              <LazyAnimatedBackground
                animationType={profile.animation_type}
                config={{ speed: profile.animation_speed || 1, intensity: profile.animation_intensity || 1 }}
              />
            )}
            {profile.motion_enabled !== false && cardStyle.threeD && cardStyle.threeDVariant && cardStyle.threeDVariant !== "tilt" && (
              <Suspense fallback={null}>
                <ThreeDLayer variant={cardStyle.threeDVariant} speed={profile.animation_speed || 1} />
              </Suspense>
            )}


            <div className="max-w-md mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5 sm:mb-6"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-primary-foreground/20 backdrop-blur mb-3 flex items-center justify-center overflow-hidden ring-2 ring-primary-foreground/20">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-primary-foreground">
                      {profile.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className={`text-xl sm:text-2xl leading-tight ${headingClassFor(cardStyle)}`}>{profile.title}</h1>
                {profile.bio && (
                  <p className={`text-sm mt-1.5 max-w-xs mx-auto leading-snug ${bioClassFor(cardStyle)}`}>{profile.bio}</p>
                )}
                <SocialIcons socialLinks={profile.social_links || {}} className={cardStyle.socialColor} order={cardStyle.socialOrder} />
              </motion.div>

              {cardStyle.layout === "social" && cardStyle.stats && cardStyle.stats.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-1 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-2 py-2 backdrop-blur">
                  {cardStyle.stats.map((stat, index) => (
                    <div key={`${stat.label}-${index}`} className="text-center">
                      <div className={`text-sm font-bold ${headingClassFor(cardStyle)}`}>{stat.value}</div>
                      <div className={`text-[9px] uppercase ${bioClassFor(cardStyle)}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {cardStyle.layout === "biodata" && cardStyle.facts && cardStyle.facts.length > 0 && (
                <div className="mb-4 divide-y divide-primary-foreground/15 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur">
                  {cardStyle.facts.map((fact, index) => (
                    <div key={`${fact.label}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className={`text-[10px] uppercase ${bioClassFor(cardStyle)}`}>{fact.label}</span>
                      <span className={`text-xs text-right ${headingClassFor(cardStyle)}`}>{fact.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2.5">
                {links.filter((l) => l.is_featured).length > 0 && (
                  <div className="space-y-3">
                    <p className="text-primary-foreground/60 text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </p>
                    {links.filter((l) => l.is_featured).map((link, index) => (
                      <ProfileLinkButton
                        key={link.id}
                        title={link.title}
                        url={link.url}
                        motionStyle={link.motion}
                        featured
                        cardStyle={cardStyle}
                        reducedMotion={reduceLinkMotion}
                        index={index}
                        icon={
                          link.thumbnail_url ? (
                            <img src={link.thumbnail_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 ring-2 ring-primary-foreground/30" />
                          ) : (
                            renderAutoIcon(link.url, "w-6 h-6", link.title)
                          )
                        }
                        onActivate={() => handleLinkClick(link.id, link.url)}
                      />
                    ))}
                  </div>
                )}

                {links.filter((l) => !l.group_id && !l.is_featured).length > 0 && (
                  <div className="space-y-2.5">
                    {links.filter((l) => !l.group_id && !l.is_featured).map((link, index) => (
                      <ProfileLinkButton
                        key={link.id}
                        title={link.title}
                        url={link.url}
                        motionStyle={link.motion}
                        cardStyle={cardStyle}
                        reducedMotion={reduceLinkMotion}
                        index={index}
                        icon={
                          link.thumbnail_url ? (
                            <img src={link.thumbnail_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            renderAutoIcon(link.url, "w-5 h-5", link.title)
                          )
                        }
                        onActivate={() => handleLinkClick(link.id, link.url)}
                      />
                    ))}
                  </div>
                )}

                {groups.map((group, groupIndex) => {
                  const groupLinks = links.filter((l) => l.group_id === group.id);
                  if (groupLinks.length === 0) return null;
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + groupIndex * 0.1 }}
                    >
                      <p className="text-primary-foreground/60 text-sm font-medium mb-3 text-center">{group.name}</p>
                      <div className="space-y-3">
                        {groupLinks.map((link, index) => (
                          <ProfileLinkButton
                            key={link.id}
                            title={link.title}
                            url={link.url}
                            motionStyle={link.motion}
                            cardStyle={cardStyle}
                            reducedMotion={reduceLinkMotion}
                            index={index}
                            icon={
                              link.thumbnail_url ? (
                                <img src={link.thumbnail_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                              ) : (
                                renderAutoIcon(link.url, "w-5 h-5", link.title)
                              )
                            }
                            onActivate={() => handleLinkClick(link.id, link.url)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Save contact + Subscribe — compact side-by-side pill row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-4 flex flex-row items-center justify-center gap-2 flex-wrap"
              >
                <SaveContactButton
                  profile={profile}
                  links={links}
                  publicUrl={typeof window !== "undefined" ? window.location.href : ""}
                />
                {profile.email_collection_enabled && (
                  <EmailSignup profileId={profile.id} />
                )}
              </motion.div>

              {/* Inline QR — always on mobile, and on sm+ when in Compact mode */}
              <div className={isCompact ? "block" : "block sm:hidden"}>{InlineQR}</div>


              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 sm:mt-12 text-center"
              >
                {!isPro && (
                  <div className="inline-flex items-center gap-2 flex-wrap justify-center">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors text-xs sm:text-sm"
                    >
                      <SmartCardLogo className="w-4 h-4" />
                      Made with SmartCard
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setClaimOpen(true)}
                      className="h-7 px-2.5 text-[11px] rounded-full bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      Join free
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Side QR badge — only phone mode on sm+ */}
          {!isCompact && (
            <div className="hidden sm:flex absolute -right-44 top-6 w-40 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur p-3 shadow-xl">
              <div className="rounded-lg p-2" style={{ background: qrColors.bg }}>
                <QRCodeSVG value={qrValue} size={120} level="M" fgColor={qrColors.fg} bgColor={qrColors.bg} />
              </div>
              <p className="text-[11px] font-medium text-primary-foreground/80 text-center leading-tight">
                View on mobile
              </p>
              <p className="text-[10px] text-primary-foreground/50 text-center leading-tight">
                Scan to open on your phone
              </p>
            </div>
          )}
        </div>
      </div>
      <ClaimSmartCardDialog open={claimOpen} onOpenChange={setClaimOpen} />
    </div>
  );
}
