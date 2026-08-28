import { Instagram, Twitter, Youtube, Facebook, Linkedin, Github, Globe, Mail, MessageCircle, Twitch, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import { getBrandLogo } from "@/lib/brand-logos";

interface SocialLinks {
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

interface SocialIconsProps {
  socialLinks: SocialLinks;
  className?: string;
  order?: string[];
}

const socialConfig = [
  { key: "instagram", label: "Instagram", icon: Instagram, getUrl: (v: string) => `https://instagram.com/${v}` },
  { key: "twitter", label: "X", icon: Twitter, getUrl: (v: string) => `https://twitter.com/${v}` },
  { key: "youtube", label: "YouTube", icon: Youtube, getUrl: (v: string) => `https://youtube.com/@${v}` },
  { key: "facebook", label: "Facebook", icon: Facebook, getUrl: (v: string) => `https://facebook.com/${v}` },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, getUrl: (v: string) => `https://linkedin.com/in/${v}` },
  { key: "github", label: "GitHub", icon: Github, getUrl: (v: string) => `https://github.com/${v}` },
  { key: "website", label: "Website", icon: Globe, getUrl: (v: string) => (v.startsWith("http") ? v : `https://${v}`) },
  { key: "email", label: "Email", icon: Mail, getUrl: (v: string) => (v.startsWith("mailto:") ? v : `mailto:${v}`) },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, getUrl: (v: string) => v.startsWith("http") ? v : `https://wa.me/${v.replace(/\D/g, "")}` },
  { key: "tiktok", label: "TikTok", icon: Music2, getUrl: (v: string) => v.startsWith("http") ? v : `https://tiktok.com/@${v.replace(/^@/, "")}` },
  { key: "twitch", label: "Twitch", icon: Twitch, getUrl: (v: string) => v.startsWith("http") ? v : `https://twitch.tv/${v}` },
  { key: "spotify", label: "Spotify", icon: Music2, getUrl: (v: string) => v.startsWith("http") ? v : `https://open.spotify.com/${v}` },
] as const;

export function SocialIcons({ socialLinks, className = "text-primary-foreground", order = [] }: SocialIconsProps) {
  const rank = new Map(order.map((key, index) => [key === "x" ? "twitter" : key, index]));
  const activeLinks = socialConfig.filter(
    ({ key }) => (socialLinks as Record<string, string>)[key]
  ).sort((a, b) => (rank.get(a.key) ?? 999) - (rank.get(b.key) ?? 999));

  if (activeLinks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap items-center justify-center gap-3 mt-6"
    >
      {activeLinks.map(({ key, label, icon: Icon, getUrl }) => {
        const value = (socialLinks as Record<string, string>)[key];
        const brandLogo = getBrandLogo(key);

        return (
          <a
            key={key}
            href={getUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={`w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg ${className}`}
          >
            {brandLogo ? (
              <img
                src={brandLogo}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="w-[22px] h-[22px] object-contain drop-shadow-sm"
              />
            ) : (
              <Icon className="w-5 h-5" aria-hidden="true" />
            )}
          </a>
        );
      })}
    </motion.div>
  );
}
