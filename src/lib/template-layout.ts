/**
 * Layout = how the profile data is *arranged* (header alignment, avatar
 * treatment, and how the buttons flow). Every layout is responsive and is
 * rendered identically by the public profile and the builder live preview,
 * just at a different scale.
 */
import type { TemplateLayout } from "@/lib/smartlink-templates";

export type LayoutScale = "full" | "mini";

export interface LayoutClasses {
  /** Wrapper around the whole card body. */
  wrapper: string;
  /** Header block (avatar + name + bio + socials). */
  header: string;
  /** Column that holds name/bio/socials inside the header. */
  headerText: string;
  /** Avatar frame. */
  avatar: string;
  /** Name/heading size. */
  name: string;
  /** Bio size. */
  bio: string;
  /** Container for the link buttons. */
  links: string;
  /** Optional panel wrapper (glass card layouts). */
  panel: string;
}

export const LAYOUT_LABELS: Record<TemplateLayout, string> = {
  classic: "Classic links",
  social: "Social profile",
  biodata: "Biodata",
  grid: "Grid tiles",
  hero: "Hero banner",
  card: "Glass card",
  minimal: "Minimal list",
  magazine: "Magazine split",
};

export const LAYOUT_HINTS: Record<TemplateLayout, string> = {
  classic: "Centred avatar with a stacked button list.",
  social: "Follower stats above the links.",
  biodata: "Label/value fact sheet above the links.",
  grid: "Two-column tiles — great for many short links.",
  hero: "Big avatar banner, left-aligned name and wide buttons.",
  card: "Everything inside one floating glass card.",
  minimal: "Compact left-aligned rows, no decoration.",
  magazine: "Avatar beside the name, editorial spacing.",
};

const base = (scale: LayoutScale) => scale === "mini";

export function layoutClasses(
  layout: TemplateLayout | undefined,
  scale: LayoutScale = "full",
): LayoutClasses {
  const m = base(scale);
  const common: LayoutClasses = {
    wrapper: m ? "relative z-10" : "max-w-md mx-auto relative z-10",
    header: m ? "text-center mb-4 relative z-10" : "text-center mb-5 sm:mb-6",
    headerText: "",
    avatar: m
      ? "w-16 h-16 mx-auto rounded-full mb-2 ring-2 ring-primary-foreground/20"
      : "w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full mb-3 ring-2 ring-primary-foreground/20",
    name: m ? "text-sm" : "text-xl sm:text-2xl leading-tight",
    bio: m ? "text-[11px] mt-1 px-2" : "text-sm mt-1.5 max-w-xs mx-auto leading-snug",
    links: m ? "space-y-2 relative z-10" : "space-y-2.5",
    panel: "",
  };

  switch (layout) {
    case "grid":
      return {
        ...common,
        links: m
          ? "grid grid-cols-2 gap-2 relative z-10"
          : "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5",
      };
    case "hero":
      return {
        ...common,
        header: m ? "text-left mb-4 relative z-10" : "text-left mb-5 sm:mb-6",
        avatar: m
          ? "w-full h-20 rounded-2xl mb-2 ring-1 ring-primary-foreground/20"
          : "w-full h-28 sm:h-36 rounded-3xl mb-3 ring-1 ring-primary-foreground/20",
        name: m ? "text-base" : "text-2xl sm:text-3xl leading-tight",
        bio: m ? "text-[11px] mt-1" : "text-sm mt-1.5 leading-snug",
      };
    case "card":
      return {
        ...common,
        panel: m
          ? "rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur p-3"
          : "rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur p-4 sm:p-5 shadow-xl",
      };
    case "minimal":
      return {
        ...common,
        header: m ? "text-left mb-3 relative z-10" : "text-left mb-4 sm:mb-5",
        avatar: m
          ? "w-10 h-10 rounded-full mb-2"
          : "w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-2",
        name: m ? "text-xs" : "text-lg sm:text-xl leading-tight",
        bio: m ? "text-[10px] mt-0.5" : "text-xs sm:text-sm mt-1 leading-snug",
        links: m ? "space-y-1.5 relative z-10" : "space-y-1.5 sm:space-y-2",
      };
    case "magazine":
      return {
        ...common,
        header: m
          ? "flex items-center gap-2.5 text-left mb-3 relative z-10"
          : "flex items-center gap-4 text-left mb-5 sm:mb-6",
        headerText: "min-w-0 flex-1",
        avatar: m
          ? "w-12 h-12 shrink-0 rounded-2xl ring-2 ring-primary-foreground/20"
          : "w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl ring-2 ring-primary-foreground/20",
        name: m ? "text-sm" : "text-xl sm:text-2xl leading-tight",
        bio: m ? "text-[10px] mt-0.5" : "text-sm mt-1 leading-snug",
      };
    default:
      return common;
  }
}
