import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, Mail, MapPin, CalendarCheck, ShoppingBag, ArrowUpRight } from "lucide-react";
import { LazyAnimatedBackground } from "@/components/profile/LazyAnimatedBackground";
import {
  iconMap,
  shapeClassFor,
  fontClassFor,
  linkLabel,
  linkAction,
  type TemplateLinkAction,
  type TemplateProfile,
} from "@/lib/smartlink-templates";

const ThreeDLayer = lazy(() =>
  import("@/components/smartlink/ThreeDLayer").then((module) => ({ default: module.ThreeDLayer }))
);

export interface TemplatePhoneCardProps {
  template: TemplateProfile;
  /** Optional overrides applied on top of the template (used by live preview). */
  overrides?: Partial<Pick<TemplateProfile, "name" | "bio" | "username" | "links" | "socials" | "avatarImage">>;
  /** Compact = smaller aspect for grid; full = tall preview. */
  size?: "compact" | "full";
  /** First-screen cards: load images eagerly and skip entry animations. */
  priority?: boolean;
  className?: string;
}

const actionIcon: Record<TemplateLinkAction, typeof Phone> = {
  link: ArrowUpRight,
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  map: MapPin,
  booking: CalendarCheck,
  shop: ShoppingBag,
};

export function TemplatePhoneCard({
  template,
  overrides,
  size = "compact",
  priority = false,
  className = "",
}: TemplatePhoneCardProps) {
  const t: TemplateProfile = { ...template, ...overrides };
  const aspect = size === "full" ? "aspect-[9/18]" : "aspect-[9/17]";
  const shapeClass = shapeClassFor(t.buttonShape);
  const fontClass = fontClassFor(t.font);
  const layout = t.layout ?? "classic";
  const imgLoading = priority ? "eager" : "lazy";


  const animConfig = {
    speed: t.animationSpeed ?? 1,
    intensity: t.animationIntensity ?? 1,
  };

  const buttons = (
    <div className="w-full mt-4 space-y-2.5">
      {t.links.map((l, i) => {
        const action = linkAction(l);
        const Icon = actionIcon[action];
        const isAction = action !== "link";
        return (
          <motion.div
            key={`${linkLabel(l)}-${i}`}
            whileHover={{ scale: 1.02 }}
            className={`w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold py-3 ${shapeClass} ${t.buttonBg}`}
          >
            <motion.span
              className="inline-flex"
              animate={isAction ? { scale: [1, 1.18, 1] } : undefined}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            >
              <Icon className="w-3 h-3" />
            </motion.span>
            <span className="truncate">{linkLabel(l)}</span>
          </motion.div>
        );
      })}
    </div>
  );

  const socialRow = (
    <div className="mt-auto pt-4 flex items-center gap-4">
      {t.socials.map((s) => {
        const Icon = iconMap[s];
        return <Icon key={s} className={`w-4 h-4 ${t.socialColor}`} />;
      })}
    </div>
  );

  return (
    <motion.div
      whileHover={t.threeD ? { rotateX: -6, rotateY: 6, scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={t.threeD ? { transformPerspective: 900, transformStyle: "preserve-3d" } : undefined}
      className={`relative rounded-[36px] overflow-hidden ${aspect} shadow-elevated ring-1 ring-black/10 ${className}`}
    >
      <img
        src={t.bgImage}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {t.bgTint && <div className={`absolute inset-0 ${t.bgTint}`} />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/40" />
      {t.animation && (
        <LazyAnimatedBackground animationType={t.animation} config={animConfig} />
      )}
      {t.threeD && t.threeDVariant && t.threeDVariant !== "tilt" && (
        <Suspense fallback={null}>
          <ThreeDLayer variant={t.threeDVariant} speed={animConfig.speed} />
        </Suspense>
      )}

      <div
        style={t.threeD ? { transform: "translateZ(30px)" } : undefined}
        className="relative h-full flex flex-col items-center px-5 pt-8 pb-6"
      >
        {layout === "biodata" ? (
          <div className="w-full flex items-center gap-3">
            <img
              src={t.avatarImage}
              alt={t.name}
              loading="lazy"
              decoding="async"
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/60 shadow-lg"
            />
            <div className="min-w-0">
              <h3 className={`text-base ${fontClass} ${t.nameColor} truncate`}>{t.name}</h3>
              <p className={`text-[10px] ${t.bioColor} line-clamp-2`}>{t.bio}</p>
            </div>
          </div>
        ) : (
          <>
            <img
              src={t.avatarImage}
              alt={t.name}
              loading="lazy"
              decoding="async"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-white/70 shadow-lg"
            />
            <motion.h3
              key={t.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 text-lg text-center ${fontClass} ${t.nameColor}`}
            >
              {t.name}
            </motion.h3>
            {t.username && <p className={`text-[10px] mt-0.5 ${t.bioColor}`}>@{t.username}</p>}
            <motion.p
              key={t.bio}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-[11px] text-center leading-snug mt-1 line-clamp-3 max-w-[85%] ${t.bioColor}`}
            >
              {t.bio}
            </motion.p>
          </>
        )}

        {layout === "social" && t.stats && (
          <div className="w-full mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-white/10 backdrop-blur px-2 py-2 border border-white/20">
            {t.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-[11px] font-bold ${t.nameColor}`}>{s.value}</div>
                <div className={`text-[8px] uppercase tracking-wider ${t.bioColor}`}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {layout === "biodata" && t.facts && (
          <div className="w-full mt-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur divide-y divide-white/15">
            {t.facts.map((f) => (
              <div key={f.label} className="flex items-center justify-between px-2.5 py-1.5">
                <span className={`text-[9px] uppercase tracking-wider ${t.bioColor}`}>{f.label}</span>
                <span className={`text-[10px] font-semibold ${t.nameColor} truncate max-w-[55%] text-right`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {buttons}
        {socialRow}
      </div>
    </motion.div>
  );
}
