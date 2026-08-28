/**
 * Public profile URLs.
 *
 * Public profiles live at the root (`/username`), so a handle that collides
 * with an app route (e.g. `admin`, `pricing`) would open that page instead —
 * which is why an `admin` handle used to land on the admin login screen.
 * Those handles are served from the always-public `/u/:username` route.
 */
export const RESERVED_USERNAMES = new Set<string>([
  "admin", "admin-login", "auth", "login", "signup", "dashboard", "settings",
  "pricing", "products", "nfc", "nfc-products", "marketplace", "learn",
  "contact", "templates", "smartlink", "smart-link-bio", "invoice", "orders",
  "order-history", "reset-password", "qr", "u", "unsubscribe",
  "marketing-unsubscribe", "checkout", "cart", "api", "assets", "static",
]);

export const isReservedUsername = (username: string): boolean =>
  RESERVED_USERNAMES.has(username.trim().toLowerCase());

/** Router path that always renders the public profile for this handle. */
export const profilePath = (username: string): string =>
  isReservedUsername(username) ? `/u/${username}` : `/${username}`;

/** Absolute, shareable public profile URL. */
export const profileUrl = (username: string, base?: string): string => {
  const origin = (base ?? (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/+$/, "");
  return `${origin}${profilePath(username)}`;
};
