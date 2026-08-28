
-- Drop all RESTRICTIVE admin policies and recreate as PERMISSIVE

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- nfc_orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.nfc_orders;
DROP POLICY IF EXISTS "Admins can update any order" ON public.nfc_orders;
CREATE POLICY "Admins can view all orders" ON public.nfc_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any order" ON public.nfc_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any order" ON public.nfc_orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- product_reviews
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can update any review" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can delete any review" ON public.product_reviews;
CREATE POLICY "Admins can view all reviews" ON public.product_reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any review" ON public.product_reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any review" ON public.product_reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- product_wishlist
DROP POLICY IF EXISTS "Admins can view all wishlists" ON public.product_wishlist;
DROP POLICY IF EXISTS "Admins can delete any wishlist item" ON public.product_wishlist;
CREATE POLICY "Admins can view all wishlists" ON public.product_wishlist FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any wishlist item" ON public.product_wishlist FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profile_views
DROP POLICY IF EXISTS "Admins can view all profile views" ON public.profile_views;
DROP POLICY IF EXISTS "Admins can delete any profile view" ON public.profile_views;
CREATE POLICY "Admins can view all profile views" ON public.profile_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any profile view" ON public.profile_views FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- email_subscribers
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.email_subscribers;
DROP POLICY IF EXISTS "Admins can update any subscriber" ON public.email_subscribers;
DROP POLICY IF EXISTS "Admins can delete any subscriber" ON public.email_subscribers;
DROP POLICY IF EXISTS "Admins can create subscribers" ON public.email_subscribers;
CREATE POLICY "Admins can view all subscribers" ON public.email_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any subscriber" ON public.email_subscribers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any subscriber" ON public.email_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create subscribers" ON public.email_subscribers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- links
DROP POLICY IF EXISTS "Admins can view all links" ON public.links;
DROP POLICY IF EXISTS "Admins can update any link" ON public.links;
DROP POLICY IF EXISTS "Admins can delete any link" ON public.links;
DROP POLICY IF EXISTS "Admins can create any link" ON public.links;
CREATE POLICY "Admins can view all links" ON public.links FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any link" ON public.links FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any link" ON public.links FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create any link" ON public.links FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- link_groups
DROP POLICY IF EXISTS "Admins can view all link groups" ON public.link_groups;
DROP POLICY IF EXISTS "Admins can update any link group" ON public.link_groups;
DROP POLICY IF EXISTS "Admins can delete any link group" ON public.link_groups;
DROP POLICY IF EXISTS "Admins can create any link group" ON public.link_groups;
CREATE POLICY "Admins can view all link groups" ON public.link_groups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any link group" ON public.link_groups FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any link group" ON public.link_groups FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create any link group" ON public.link_groups FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- link_clicks
DROP POLICY IF EXISTS "Admins can view all link clicks" ON public.link_clicks;
DROP POLICY IF EXISTS "Admins can delete any link click" ON public.link_clicks;
CREATE POLICY "Admins can view all link clicks" ON public.link_clicks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any link click" ON public.link_clicks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profile_templates
DROP POLICY IF EXISTS "Admins can update any template" ON public.profile_templates;
DROP POLICY IF EXISTS "Admins can delete any template" ON public.profile_templates;
DROP POLICY IF EXISTS "Admins can create templates" ON public.profile_templates;
CREATE POLICY "Admins can update any template" ON public.profile_templates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any template" ON public.profile_templates FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create templates" ON public.profile_templates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_theme_presets
DROP POLICY IF EXISTS "Admins can view all theme presets" ON public.user_theme_presets;
DROP POLICY IF EXISTS "Admins can update any theme preset" ON public.user_theme_presets;
DROP POLICY IF EXISTS "Admins can delete any theme preset" ON public.user_theme_presets;
DROP POLICY IF EXISTS "Admins can create any theme preset" ON public.user_theme_presets;
CREATE POLICY "Admins can view all theme presets" ON public.user_theme_presets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any theme preset" ON public.user_theme_presets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any theme preset" ON public.user_theme_presets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create any theme preset" ON public.user_theme_presets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- nfc_product_drafts
DROP POLICY IF EXISTS "Admins can view all product drafts" ON public.nfc_product_drafts;
DROP POLICY IF EXISTS "Admins can update any product draft" ON public.nfc_product_drafts;
DROP POLICY IF EXISTS "Admins can delete any product draft" ON public.nfc_product_drafts;
CREATE POLICY "Admins can view all product drafts" ON public.nfc_product_drafts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any product draft" ON public.nfc_product_drafts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any product draft" ON public.nfc_product_drafts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can create audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
