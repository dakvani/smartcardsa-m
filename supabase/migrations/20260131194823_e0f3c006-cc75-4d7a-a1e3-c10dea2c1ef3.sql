-- Add admin SELECT policies for all tables that admins need to access

-- Profiles: Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Profiles: Allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Product Reviews: Allow admins to manage all reviews
CREATE POLICY "Admins can view all reviews" 
ON public.product_reviews 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any review" 
ON public.product_reviews 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any review" 
ON public.product_reviews 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Product Wishlist: Allow admins to view and manage
CREATE POLICY "Admins can view all wishlists" 
ON public.product_wishlist 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any wishlist item" 
ON public.product_wishlist 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Profile Views: Allow admins to view all analytics
CREATE POLICY "Admins can view all profile views" 
ON public.profile_views 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any profile view" 
ON public.profile_views 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Email Subscribers: Allow admins to manage all subscribers
CREATE POLICY "Admins can view all subscribers" 
ON public.email_subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create subscribers" 
ON public.email_subscribers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any subscriber" 
ON public.email_subscribers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any subscriber" 
ON public.email_subscribers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Links: Allow admins to manage all links
CREATE POLICY "Admins can view all links" 
ON public.links 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create any link" 
ON public.links 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any link" 
ON public.links 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any link" 
ON public.links 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Link Groups: Allow admins to manage all groups
CREATE POLICY "Admins can view all link groups" 
ON public.link_groups 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create any link group" 
ON public.link_groups 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any link group" 
ON public.link_groups 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any link group" 
ON public.link_groups 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Link Clicks: Allow admins to view and manage all click data
CREATE POLICY "Admins can view all link clicks" 
ON public.link_clicks 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any link click" 
ON public.link_clicks 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Profile Templates: Allow admins full control
CREATE POLICY "Admins can create templates" 
ON public.profile_templates 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any template" 
ON public.profile_templates 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any template" 
ON public.profile_templates 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- User Theme Presets: Allow admins to manage all presets
CREATE POLICY "Admins can view all theme presets" 
ON public.user_theme_presets 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create any theme preset" 
ON public.user_theme_presets 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any theme preset" 
ON public.user_theme_presets 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any theme preset" 
ON public.user_theme_presets 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- NFC Product Drafts: Allow admins to manage all drafts
CREATE POLICY "Admins can view all product drafts" 
ON public.nfc_product_drafts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any product draft" 
ON public.nfc_product_drafts 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any product draft" 
ON public.nfc_product_drafts 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit Logs: Allow admins to view all audit logs (already has SELECT but adding for completeness)
-- Already exists: Admins can view audit logs