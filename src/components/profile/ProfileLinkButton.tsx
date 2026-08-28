import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronsRight } from "lucide-react";
import { linkMotionProps, normalizeMotion, slideActionLabel } from "@/lib/link-motion";
import { buttonClassFor, type CardStyle } from "@/lib/template-card-style";
import { linkStyleCss, parseLinkStyle, type LinkStyle } from "@/lib/link-style";

interface Props {
  title: string;
  url: string;
  motionStyle?: string | null;
  featured?: boolean;
  cardStyle?: CardStyle;
  /** Per-button colour / shadow overrides (links.style). */
  linkStyle?: LinkStyle | unknown;
  /** Disable movement (reduced motion / profile setting). */
  reducedMotion?: boolean;
  icon?: React.ReactNode;
  index?: number;
  onActivate: () => void;
}


/**
 * A public-profile link button. Renders the template's element design
 * (shape / colour from `card_style`) and the per-link movement chosen in the
 * builder, including a slide-to-action control for "slide to call" style
 * buttons.
 */
export function ProfileLinkButton({
  title,
  url,
  motionStyle,
  featured = false,
  cardStyle = {},
  reducedMotion = false,
  icon,
  index = 0,
  onActivate,
}: Props) {
  const style = normalizeMotion(motionStyle);
  const cls = buttonClassFor(cardStyle, featured);
  const pad = featured ? "py-3.5 px-5" : "py-3 px-5";

  if (style === "slide-action") {
    return (
      <SlideToAction
        label={slideActionLabel(url, title)}
        title={title}
        className={`${cls} ${pad}`}
        icon={icon}
        onActivate={onActivate}
      />
    );
  }

  const move = linkMotionProps(style, reducedMotion);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onActivate}
      className={`w-full flex items-center gap-3 ${pad} ${cls} hover:brightness-110 active:scale-[0.98] transition-all ${featured ? "shadow-lg" : ""}`}
    >
      <motion.span className="contents" {...(move ?? {})}>
        {icon}
        <span
          className={`flex-1 text-center ${featured ? "font-bold text-lg" : "font-semibold"}`}
        >
          {title}
        </span>
        {icon && <div className={featured ? "w-12" : "w-10"} />}
      </motion.span>
    </motion.button>
  );
}

/** Drag the handle to the right to trigger the link (slide to call/chat/open). */
function SlideToAction({
  label,
  title,
  className,
  icon,
  onActivate,
}: {
  label: string;
  title: string;
  className: string;
  icon?: React.ReactNode;
  onActivate: () => void;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = React.useState(220);
  const opacity = useTransform(x, [0, max * 0.7], [1, 0]);

  React.useEffect(() => {
    const measure = () => {
      const w = trackRef.current?.offsetWidth ?? 260;
      setMax(Math.max(80, w - 56));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={trackRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`${title} — ${label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      <motion.span
        style={{ opacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-primary-foreground/90 font-semibold text-sm"
      >
        {label}
      </motion.span>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0.02}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => {
          if (x.get() > max * 0.75) {
            onActivate();
          }
          animate(x, 0, { type: "spring", stiffness: 400, damping: 32 });
        }}
        className="relative z-10 w-11 h-11 rounded-full bg-primary-foreground/90 text-slate-900 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
      >
        {icon ?? <ChevronsRight className="w-5 h-5" />}
      </motion.div>
    </div>
  );
}
