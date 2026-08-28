import {
  Instagram, Youtube, Twitter, Linkedin, Github, Music2,
  Facebook, Globe, Mail, MessageCircle, Twitch, Camera,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";

/* ---------------- Zod schemas ---------------- */

/** Schema for the user-editable bio content in the live editor. */
export const bioInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Display name is required" })
    .max(40, { message: "Keep it under 40 characters" }),
  username: z
    .string()
    .trim()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(30, { message: "Username must be under 30 characters" })
    .regex(/^[a-zA-Z0-9._-]+$/, {
      message: "Only letters, numbers, dots, dashes and underscores",
    }),
  bio: z
    .string()
    .trim()
    .max(160, { message: "Bio must be 160 characters or fewer" }),
});
export type BioInput = z.infer<typeof bioInputSchema>;

/* ---------------- Type-safe schema ---------------- */

export const SOCIAL_ICONS = [
  "instagram", "youtube", "x", "tiktok", "linkedin", "github",
  "facebook", "website", "email", "whatsapp", "twitch", "spotify",
] as const;
export type SocialIcon = (typeof SOCIAL_ICONS)[number];

export const BUTTON_SHAPES = ["pill", "square", "torn", "outline", "shadow-hard"] as const;
export type ButtonShape = (typeof BUTTON_SHAPES)[number];

export const FONT_FAMILIES = ["sans", "serif", "mono", "display"] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

export const TEXT_TONE = ["light", "dark"] as const;
export type TextTone = (typeof TEXT_TONE)[number];

export type TemplateProfile = {
  name: string;
  username: string;
  category: string;
  bio: string;
  bgImage: string;
  bgTint?: string;
  avatarImage: string;
  font: FontFamily;
  /** Semantic hint used by consumers that need to know if surface is light or dark. */
  textOnDark: TextTone;
  nameColor: string;
  bioColor: string;
  buttonShape: ButtonShape;
  buttonBg: string;
  socialColor: string;
  links: string[];
  socials: SocialIcon[];
  /**
   * Optional animated background layer (matches AnimatedBackground types:
   * aurora, matrix, sparkle, bokeh, particles, orbs, neon, snow, bubbles…).
   */
  animation?: string;
  animationSpeed?: number;
  animationIntensity?: number;
  /** Enables the 3D depth/parallax treatment on the phone card. */
  threeD?: boolean;
};


export const iconMap: Record<SocialIcon, LucideIcon> = {
  instagram: Instagram,
  youtube: Youtube,
  x: Twitter,
  tiktok: Music2,
  linkedin: Linkedin,
  github: Github,
  facebook: Facebook,
  website: Globe,
  email: Mail,
  whatsapp: MessageCircle,
  twitch: Twitch,
  spotify: Camera,
};

/**
 * Dev-time runtime validator so a bad template shape fails loudly instead of
 * showing up as a silent visual glitch or a broken build later.
 */
export function assertTemplate(t: TemplateProfile, ctx = "template"): void {
  const req: (keyof TemplateProfile)[] = [
    "name", "username", "category", "bio",
    "bgImage", "avatarImage", "font", "textOnDark",
    "nameColor", "bioColor", "buttonShape", "buttonBg",
    "socialColor", "links", "socials",
  ];
  for (const k of req) {
    if (t[k] === undefined || t[k] === null || t[k] === "") {
      throw new Error(`[${ctx}:${t.username ?? "?"}] missing field "${String(k)}"`);
    }
  }
  if (!FONT_FAMILIES.includes(t.font)) throw new Error(`bad font: ${t.font}`);
  if (!BUTTON_SHAPES.includes(t.buttonShape)) throw new Error(`bad buttonShape: ${t.buttonShape}`);
  if (!TEXT_TONE.includes(t.textOnDark)) throw new Error(`bad textOnDark: ${t.textOnDark}`);
  if (!Array.isArray(t.links) || t.links.length === 0) throw new Error("links must be non-empty");
  for (const s of t.socials) {
    if (!SOCIAL_ICONS.includes(s)) throw new Error(`bad social icon: ${s}`);
  }
}

/** Helper: build a template with full type-checking via `satisfies`. */
export const defineTemplate = <T extends TemplateProfile>(t: T): T => {
  if (import.meta.env.DEV) assertTemplate(t);
  return t;
};

/* ---------------- Style helpers ---------------- */

export const shapeClassFor = (s: ButtonShape): string => {
  switch (s) {
    case "pill": return "rounded-full";
    case "square": return "rounded-none";
    case "outline": return "rounded-full";
    case "shadow-hard": return "rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,0.9)]";
    case "torn": return "rounded-2xl [clip-path:polygon(2%_10%,98%_4%,100%_88%,4%_96%)]";
  }
};

export const fontClassFor = (f: FontFamily): string => {
  switch (f) {
    case "serif": return "font-serif tracking-tight";
    case "mono": return "font-mono tracking-tighter";
    case "display": return "font-black uppercase tracking-wide";
    case "sans": return "font-semibold";
  }
};

/* ---------------- Templates ---------------- */

export const templates: TemplateProfile[] = [
  defineTemplate({
    name: "Matthew Hugh", username: "matthew.skates", category: "Social Media",
    bio: "Aspiring skater with a taste for cooking.",
    bgImage: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/90",
    buttonShape: "torn", buttonBg: "bg-orange-200/95 text-neutral-900",
    socialColor: "text-white",
    links: ["Youtube Channel", "Tiktok Account", "Instagram"],
    socials: ["tiktok", "youtube", "x", "instagram"],
  }),
  defineTemplate({
    name: "Timothy Teodor", username: "timothy.teo", category: "Music",
    bio: "Online most people know me as Teodor, so that's what I prefer to go by.",
    bgImage: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=70",
    font: "mono", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "pill", buttonBg: "bg-orange-500 text-white",
    socialColor: "text-white",
    links: ["Twitch Account", "Merch Store", "Contact"],
    socials: ["tiktok", "youtube", "x", "instagram"],
  }),
  defineTemplate({
    name: "Gabrielle Lacey", username: "gabby.hoops", category: "Health & Fitness",
    bio: "Basketball today, tomorrow and forever.",
    bgImage: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=70",
    font: "sans", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/90",
    buttonShape: "pill", buttonBg: "bg-white text-neutral-900",
    socialColor: "text-white",
    links: ["Favourite Courts", "Donate to our team", "Team store"],
    socials: ["tiktok", "youtube", "x", "instagram"],
  }),
  defineTemplate({
    name: "Sara Al-Otaibi", username: "sara.designs", category: "Creator",
    bio: "Brand & visual identity designer — Riyadh",
    bgImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=70",
    font: "display", textOnDark: "dark",
    nameColor: "text-neutral-900", bioColor: "text-neutral-800/80",
    buttonShape: "shadow-hard", buttonBg: "bg-white text-neutral-900 border-2 border-neutral-900",
    socialColor: "text-neutral-900",
    links: ["Portfolio", "Book a Project", "Case Studies", "Shop Prints"],
    socials: ["instagram", "youtube", "x", "website"],
  }),
  defineTemplate({
    name: "Omar Khaled", username: "omar.dev", category: "Tech",
    bio: "Full-stack engineer • React, Node, Postgres",
    bgImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=70",
    font: "mono", textOnDark: "light",
    nameColor: "text-emerald-300", bioColor: "text-emerald-100/80",
    buttonShape: "outline", buttonBg: "bg-transparent text-emerald-200 border border-emerald-300/60",
    socialColor: "text-emerald-200",
    links: ["GitHub", "Hire Me", "Open Source", "Read Blog"],
    socials: ["github", "linkedin", "x", "website"],
  }),
  defineTemplate({
    name: "Layla Hassan", username: "layla.sings", category: "Music",
    bio: "Indie pop • New single 'Golden Hour' out now",
    bgImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=70",
    font: "display", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "pill", buttonBg: "bg-fuchsia-500 text-white",
    socialColor: "text-white",
    links: ["Listen on Spotify", "New Music Video", "Tour Tickets", "Merch Store"],
    socials: ["spotify", "youtube", "instagram", "tiktok"],
  }),
  defineTemplate({
    name: "Faisal Aziz", username: "faisal.fit", category: "Health & Fitness",
    bio: "Certified coach • Strength & nutrition",
    bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&q=70",
    font: "sans", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/90",
    buttonShape: "square", buttonBg: "bg-neutral-900 text-white",
    socialColor: "text-white",
    links: ["8-Week Program", "Book 1:1 Session", "Free Workout PDF", "Supplements"],
    socials: ["instagram", "youtube", "tiktok", "whatsapp"],
  }),
  defineTemplate({
    name: "Noura Salem", username: "noura.style", category: "Fashion",
    bio: "Editorial & personal styling — Dubai",
    bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "outline", buttonBg: "bg-transparent text-white border border-white/70",
    socialColor: "text-white",
    links: ["Shop My Looks", "Lookbook 2026", "Book Styling", "Newsletter"],
    socials: ["instagram", "tiktok", "youtube", "website"],
  }),
  defineTemplate({
    name: "Yousef Rahman", username: "chef.yousef", category: "Food",
    bio: "Modern Middle Eastern kitchen",
    bgImage: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-amber-50", bioColor: "text-amber-50/80",
    buttonShape: "torn", buttonBg: "bg-amber-100 text-neutral-900",
    socialColor: "text-amber-50",
    links: ["Reserve a Table", "Order Catering", "Recipe Book", "Cooking Classes"],
    socials: ["instagram", "youtube", "tiktok", "website"],
  }),
  defineTemplate({
    name: "Reem Al-Fahad", username: "reem.consults", category: "Business",
    bio: "GTM strategy for early-stage founders",
    bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=70",
    font: "sans", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "square", buttonBg: "bg-white text-neutral-900",
    socialColor: "text-white",
    links: ["Book a Call", "Case Studies", "Newsletter", "Podcast"],
    socials: ["linkedin", "x", "youtube", "email"],
  }),
  defineTemplate({
    name: "Ustadha Hana", username: "hana.tutor", category: "Education",
    bio: "IELTS, Arabic & English tutoring",
    bgImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "pill", buttonBg: "bg-white text-neutral-900",
    socialColor: "text-white",
    links: ["Book a Lesson", "Free Worksheet", "Group Classes", "YouTube Lessons"],
    socials: ["youtube", "instagram", "tiktok", "email"],
  }),
  defineTemplate({
    name: "Khalid Majed", username: "khalid.realty", category: "Real Estate",
    bio: "Residential & investment listings — KSA",
    bgImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=70",
    font: "sans", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "shadow-hard", buttonBg: "bg-amber-400 text-neutral-900 border-2 border-neutral-900",
    socialColor: "text-white",
    links: ["View Listings", "Schedule Viewing", "Market Report", "Sell Your Home"],
    socials: ["whatsapp", "linkedin", "instagram", "website"],
  }),

  /* ---------- New designs (static) ---------- */

  defineTemplate({
    name: "Dana Mansour", username: "dana.atelier", category: "Fashion",
    bio: "Atelier pieces, made to order — Jeddah",
    bgImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "square", buttonBg: "bg-white/95 text-neutral-900",
    socialColor: "text-white",
    links: ["Shop Atelier", "Made-to-Measure", "Lookbook", "Press"],
    socials: ["instagram", "tiktok", "website", "email"],
  }),
  defineTemplate({
    name: "Zain Idris", username: "zain.creates", category: "Creator",
    bio: "Film, photo and everything in between.",
    bgImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=70",
    font: "display", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/80",
    buttonShape: "shadow-hard", buttonBg: "bg-lime-300 text-neutral-900 border-2 border-neutral-900",
    socialColor: "text-white",
    links: ["Latest Film", "Presets Pack", "Work With Me", "Behind the Scenes"],
    socials: ["youtube", "instagram", "tiktok", "website"],
  }),
  defineTemplate({
    name: "Tariq Nasser", username: "tariq.ventures", category: "Business",
    bio: "Early-stage investing & operator advice",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=70",
    font: "sans", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/80",
    buttonShape: "square", buttonBg: "bg-sky-500 text-white",
    socialColor: "text-white",
    links: ["Pitch Me", "Portfolio", "Office Hours", "Newsletter"],
    socials: ["linkedin", "x", "email", "website"],
  }),
  defineTemplate({
    name: "Mira Sultan", username: "mira.daily", category: "Social Media",
    bio: "Daily vlogs, small joys, big plans.",
    bgImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=70",
    font: "sans", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "pill", buttonBg: "bg-rose-400 text-white",
    socialColor: "text-white",
    links: ["Today's Vlog", "My Camera Gear", "Ask Me Anything", "Collabs"],
    socials: ["tiktok", "instagram", "youtube", "x"],
  }),
  defineTemplate({
    name: "Huda Bakr", username: "huda.ai", category: "Tech",
    bio: "ML engineer • building useful AI tools",
    bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=70",
    font: "mono", textOnDark: "light",
    nameColor: "text-cyan-200", bioColor: "text-cyan-100/80",
    buttonShape: "outline", buttonBg: "bg-transparent text-cyan-100 border border-cyan-300/60",
    socialColor: "text-cyan-200",
    links: ["Open Source", "Talks & Slides", "AI Newsletter", "Consulting"],
    socials: ["github", "x", "linkedin", "website"],
  }),
  defineTemplate({
    name: "Salem Otaibi", username: "salem.estates", category: "Real Estate",
    bio: "Luxury villas & waterfront homes",
    bgImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/80",
    buttonShape: "square", buttonBg: "bg-white text-neutral-900",
    socialColor: "text-white",
    links: ["Featured Villas", "Book a Tour", "Investment Guide", "Contact Me"],
    socials: ["whatsapp", "instagram", "linkedin", "website"],
  }),
  defineTemplate({
    name: "Adam Ziyad", username: "adam.learns", category: "Education",
    bio: "Maths made simple — school to university",
    bgImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&q=70",
    font: "sans", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "pill", buttonBg: "bg-indigo-500 text-white",
    socialColor: "text-white",
    links: ["Book Tutoring", "Free Past Papers", "Crash Course", "Student Reviews"],
    socials: ["youtube", "instagram", "email", "website"],
  }),
  defineTemplate({
    name: "Lina Haddad", username: "lina.bakes", category: "Food",
    bio: "Small-batch bakes & pastry classes",
    bgImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-amber-50", bioColor: "text-amber-50/85",
    buttonShape: "torn", buttonBg: "bg-rose-100 text-neutral-900",
    socialColor: "text-amber-50",
    links: ["Order Cakes", "Pastry Classes", "Weekly Menu", "Wholesale"],
    socials: ["instagram", "whatsapp", "tiktok", "website"],
  }),
  defineTemplate({
    name: "Basil Nour", username: "basil.beats", category: "Music",
    bio: "Producer • beats, mixing, mastering",
    bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=70",
    font: "mono", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/80",
    buttonShape: "square", buttonBg: "bg-violet-500 text-white",
    socialColor: "text-white",
    links: ["Beat Store", "Book Studio Time", "Mixing Rates", "Latest Release"],
    socials: ["spotify", "youtube", "instagram", "email"],
  }),
  defineTemplate({
    name: "Rania Fahd", username: "rania.moves", category: "Health & Fitness",
    bio: "Pilates & mobility — train anywhere",
    bgImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=70",
    avatarImage: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=200&q=70",
    font: "sans", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "pill", buttonBg: "bg-emerald-400 text-neutral-900",
    socialColor: "text-white",
    links: ["Join the App", "Free Mobility Flow", "1:1 Coaching", "Class Schedule"],
    socials: ["instagram", "youtube", "tiktok", "website"],
  }),

  /* ---------- Animated / 3D templates ---------- */

  defineTemplate({
    name: "Nova Studio", username: "nova.motion", category: "Creator",
    bio: "Motion design studio • aurora reels",
    bgImage: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=70",
    bgTint: "bg-indigo-900/40",
    avatarImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=70",
    font: "display", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/80",
    buttonShape: "pill", buttonBg: "bg-white/15 text-white backdrop-blur border border-white/30",
    socialColor: "text-white",
    links: ["Showreel", "Animation Packs", "Start a Project", "Studio Blog"],
    socials: ["instagram", "youtube", "x", "website"],
    animation: "aurora", animationSpeed: 1, animationIntensity: 1.1, threeD: true,
  }),
  defineTemplate({
    name: "Kian Zayd", username: "kian.cyber", category: "Tech",
    bio: "Security engineer • breaking & fixing things",
    bgImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=70",
    bgTint: "bg-black/50",
    avatarImage: "https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=200&q=70",
    font: "mono", textOnDark: "light",
    nameColor: "text-green-300", bioColor: "text-green-100/75",
    buttonShape: "outline", buttonBg: "bg-black/40 text-green-200 border border-green-400/60",
    socialColor: "text-green-300",
    links: ["Security Audits", "CTF Writeups", "Tooling", "Hire Me"],
    socials: ["github", "x", "linkedin", "website"],
    animation: "matrix", animationSpeed: 1.2, animationIntensity: 1, threeD: true,
  }),
  defineTemplate({
    name: "Elle Rayan", username: "elle.runway", category: "Fashion",
    bio: "Runway diaries • couture & campaigns",
    bgImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=70",
    bgTint: "bg-fuchsia-900/25",
    avatarImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/85",
    buttonShape: "pill", buttonBg: "bg-white/20 text-white backdrop-blur border border-white/40",
    socialColor: "text-white",
    links: ["Runway Reel", "Campaigns", "Booking", "Newsletter"],
    socials: ["instagram", "tiktok", "youtube", "email"],
    animation: "sparkle", animationSpeed: 1, animationIntensity: 1.2, threeD: true,
  }),
  defineTemplate({
    name: "Marwan Brew", username: "marwan.brew", category: "Food",
    bio: "Specialty coffee bar • slow mornings",
    bgImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=70",
    bgTint: "bg-amber-950/35",
    avatarImage: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&q=70",
    font: "serif", textOnDark: "light",
    nameColor: "text-amber-50", bioColor: "text-amber-50/80",
    buttonShape: "torn", buttonBg: "bg-amber-100/95 text-neutral-900",
    socialColor: "text-amber-50",
    links: ["Today's Menu", "Order Beans", "Barista Course", "Find Us"],
    socials: ["instagram", "whatsapp", "tiktok", "website"],
    animation: "bokeh", animationSpeed: 0.9, animationIntensity: 1.1, threeD: true,
  }),
  defineTemplate({
    name: "Skyline Living", username: "skyline.living", category: "Real Estate",
    bio: "Penthouse listings with night-skyline tours",
    bgImage: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&q=70",
    bgTint: "bg-slate-950/45",
    avatarImage: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200&q=70",
    font: "display", textOnDark: "light",
    nameColor: "text-white", bioColor: "text-white/80",
    buttonShape: "square", buttonBg: "bg-white/15 text-white backdrop-blur border border-white/30",
    socialColor: "text-white",
    links: ["3D Tours", "Penthouse Listings", "Book a Viewing", "Investor Deck"],
    socials: ["whatsapp", "instagram", "linkedin", "website"],
    animation: "particles", animationSpeed: 1, animationIntensity: 1.2, threeD: true,
  }),
];


export const templateCategories = [
  "All templates",
  "Fashion",
  "Health & Fitness",
  "Creator",
  "Business",
  "Music",
  "Social Media",
  "Tech",
  "Food",
  "Education",
  "Real Estate",
] as const;
