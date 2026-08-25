## Goal

Stabilize the existing SmartCard / SmartLink Bio app for production without a broad redesign. First priority is fixing the real social-media brand icons so they render reliably in both the Lovable dev preview and published production builds.

## Scope

1. **Brand icon reliability**
   - Replace fragile direct `.asset.json` image usage with a robust helper/component strategy.
   - Keep real platform brand icons for social/contact platforms.
   - Add an automatic fallback when CDN asset URLs fail in dev preview, so users never see broken image icons.
   - Update all current icon surfaces consistently: public profile buttons, social icon row, dashboard link editor, add-link dialog, social links editor, and footer.

2. **Production-readiness pass for core flows**
   - Authentication routes and redirects.
   - Dashboard/profile editor user-facing helper copy.
   - SmartLink Bio templates → live builder → publish/signup path.
   - Public profile rendering and link/social icon display.
   - NFC products → design customizer availability for eligible products.
   - Mobile/iPhone bottom navigation and install prompt overlap.
   - Cart/checkout line-item customization, quantity, edit/remove behavior, and invoice route sanity.
   - Responsive layout checks for common mobile and desktop widths.

3. **Clean user-facing UI**
   - Search for and remove accidental internal prompt/QA text, including old literal command text or developer-only notes that leaked into UI.
   - Keep copy professional and end-user appropriate.

## Technical approach

- Add a small reusable brand icon resolver/component that:
  - Uses the current CDN URL when it works.
  - Falls back to real bundled/generated brand SVG/inline marks or lucide only as a last resort.
  - Avoids broken `<img>` states via `onError` handling.
- Refactor existing `BRAND_LOGOS` call sites to use the resilient icon component or helper rather than raw image URLs where appropriate.
- Patch focused correctness issues found during the audit only; no large visual redesign.
- Keep existing design language, routes, and database integration intact.

## Verification

- Run production build.
- Run targeted tests that are practical in this environment.
- Use browser checks on localhost for:
  - Footer/social icon rendering.
  - Public profile icon rendering.
  - SmartLink Bio mobile tabs and install prompt spacing.
  - NFC product customizer entry points.
  - Cart/checkout layout sanity.
- Summarize concrete fixes and only list blockers that truly require external credentials or a user decision.
