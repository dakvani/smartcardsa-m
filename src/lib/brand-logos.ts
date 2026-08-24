// Official brand marks, served from the CDN as transparent PNGs.
// Keys line up with LinkType values (see src/lib/link-types.ts) and the
// social-link keys used by profiles, so every platform renders its real
// brand icon instead of a generic outline glyph.
import discord from "@/assets/social/discord.png.asset.json";
import email from "@/assets/social/email.png.asset.json";
import facebook from "@/assets/social/facebook.png.asset.json";
import github from "@/assets/social/github.png.asset.json";
import globe from "@/assets/social/globe.png.asset.json";
import instagram from "@/assets/social/instagram.png.asset.json";
import link from "@/assets/social/link.png.asset.json";
import linkedin from "@/assets/social/linkedin.png.asset.json";
import messenger from "@/assets/social/messenger.png.asset.json";
import phone from "@/assets/social/phone.png.asset.json";
import pinterest from "@/assets/social/pinterest.png.asset.json";
import reddit from "@/assets/social/reddit.png.asset.json";
import snapchat from "@/assets/social/snapchat.png.asset.json";
import spotify from "@/assets/social/spotify.png.asset.json";
import telegram from "@/assets/social/telegram.png.asset.json";
import tiktok from "@/assets/social/tiktok.png.asset.json";
import twitch from "@/assets/social/twitch.png.asset.json";
import whatsapp from "@/assets/social/whatsapp.png.asset.json";
import x from "@/assets/social/x.png.asset.json";
import youtube from "@/assets/social/youtube.png.asset.json";

export const BRAND_LOGOS: Record<string, string> = {
  // Social platforms
  instagram: instagram.url,
  facebook: facebook.url,
  messenger: messenger.url,
  whatsapp: whatsapp.url,
  snapchat: snapchat.url,
  twitter: x.url,
  x: x.url,
  linkedin: linkedin.url,
  youtube: youtube.url,
  tiktok: tiktok.url,
  github: github.url,
  telegram: telegram.url,
  discord: discord.url,
  pinterest: pinterest.url,
  reddit: reddit.url,
  twitch: twitch.url,
  spotify: spotify.url,

  // Contact + generic
  email: email.url,
  mail: email.url,
  phone: phone.url,
  website: globe.url,
  globe: globe.url,
  custom: link.url,
  link: link.url,
};

/** Resolve a brand logo for a platform/link-type key (case-insensitive). */
export function getBrandLogo(key?: string | null): string | undefined {
  if (!key) return undefined;
  return BRAND_LOGOS[key.toLowerCase().trim()];
}
