import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { SmartCardLogo } from "@/components/brand/SmartCardLogo";

const footerLinks = {
  Product: [
    { name: "Features", href: "/products" },
    { name: "Templates", href: "/templates" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Pricing", href: "/pricing" },
  ],
  Resources: [
    { name: "Help Center", href: "/learn" },
    { name: "Blog", href: "/learn" },
    { name: "Community", href: "#" },
    { name: "Creators", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Contact", href: "/contact" },
  ],
  Legal: [
    { name: "Terms", href: "#" },
    { name: "Privacy", href: "#" },
    { name: "Cookies", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#0a0a1a] text-white"
      role="contentinfo"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4f46e5]/60 to-transparent" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-[#4f46e5]/10 blur-[140px]" />

      <div className="container relative z-10 mx-auto px-4 pb-20 pt-10 sm:pb-16 sm:pt-20">
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-10 md:grid-cols-5">
          {/* Brand + contact */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="group inline-flex items-center gap-2" aria-label="SmartCard — homepage">
              <SmartCardLogo className="h-6 w-6 text-[#a5b4fc] transition-transform group-hover:scale-110 group-hover:-rotate-3 sm:h-7 sm:w-7" />
              <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
                Smart<span className="text-[#a5b4fc]">Card</span>
              </span>
            </Link>
            <p className="mt-2 max-w-xs font-body-alt text-[13px] text-white/55 sm:mt-4 sm:text-sm">
              Everything you are. In one simple tap.
            </p>
            <ul className="mt-3 space-y-2 font-body-alt text-[13px] sm:mt-5 sm:space-y-3 sm:text-sm">
              <li className="flex items-start gap-2 text-white/70 hover:text-white sm:gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a5b4fc] sm:h-4 sm:w-4" />
                <a href="mailto:info@smartcardsa.shop" className="break-all">info@smartcardsa.shop</a>
              </li>
              <li className="flex items-start gap-2 text-white/70 hover:text-white sm:gap-2.5">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a5b4fc] sm:h-4 sm:w-4" />
                <a href="tel:+966502900193" dir="ltr">+966 50 290 0193</a>
              </li>
              <li className="flex items-start gap-2 text-white/70 sm:gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a5b4fc] sm:h-4 sm:w-4" />
                <span className="leading-snug">Jeddah 23435, KSA</span>
              </li>
            </ul>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-labelledby={`footer-${category.toLowerCase()}`}>
              <h4
                id={`footer-${category.toLowerCase()}`}
                className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 sm:mb-4 sm:text-[11px] sm:tracking-[0.2em]"
              >
                {category}
              </h4>
              <ul className="space-y-1.5 font-body-alt text-[13px] sm:space-y-2.5 sm:text-sm" role="list">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="group inline-flex items-center gap-1 text-white/70 transition-colors hover:text-[#a5b4fc]"
                    >
                      {link.name}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-center sm:mt-16 sm:gap-4 sm:pt-8 md:flex-row md:text-left">
          <p className="font-body-alt text-[11px] text-white/40 sm:text-xs">
            © {new Date().getFullYear()} SmartCard. All rights reserved.
          </p>
          <nav aria-label="Social media">
            <ul className="flex items-center gap-3 sm:gap-4" role="list">
              {[
                { label: "X", key: "twitter" },
                { label: "Instagram", key: "instagram" },
                { label: "YouTube", key: "youtube" },
                { label: "LinkedIn", key: "linkedin" },
                { label: "TikTok", key: "tiktok" },
              ].map((s) => (
                <li key={s.label}>
                  <a
                    href="#"
                    aria-label={s.label}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition-all hover:border-[#4f46e5]/50 hover:bg-[#4f46e5]/10 hover:scale-110 sm:h-9 sm:w-9"
                  >
                    <img
                      src={BRAND_LOGOS[s.key]}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-4 w-4 object-contain sm:h-[18px] sm:w-[18px]"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

        </div>
      </div>
    </footer>
  );
}
