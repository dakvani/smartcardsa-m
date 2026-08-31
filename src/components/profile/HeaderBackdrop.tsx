/**
 * Pro templates can put an image behind the *header block only* — the avatar,
 * name, bio and socials — leaving the rest of the page on the template theme.
 */
import type { ReactNode } from "react";
import type { CardStyle } from "@/lib/template-card-style";

interface Props {
  style: CardStyle;
  children: ReactNode;
  /** Tighter padding/rounding for the builder mini preview. */
  scale?: "full" | "mini";
}

export function HeaderBackdrop({ style, children, scale = "full" }: Props) {
  if (!style.headerBg) return <>{children}</>;
  const mini = scale === "mini";
  const overlay = Math.min(90, Math.max(0, style.headerOverlay ?? 35)) / 100;

  return (
    <div
      className={`relative z-10 overflow-hidden ${
        mini ? "mb-3 rounded-2xl p-3" : "mb-5 sm:mb-6 rounded-3xl p-4 sm:p-5"
      } ring-1 ring-primary-foreground/15 shadow-lg`}
    >
      <img
        src={style.headerBg}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} aria-hidden="true" />
      <div className="relative">{children}</div>
    </div>
  );
}
