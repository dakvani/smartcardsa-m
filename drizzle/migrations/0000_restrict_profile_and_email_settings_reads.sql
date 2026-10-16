CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, user_id, username, title, bio, avatar_url, theme_name, theme_gradient, gradient_direction,
       social_links, custom_bg_color, custom_accent_color, animation_type, animation_speed, animation_intensity,
       motion_enabled, card_style, custom_background_url, custom_background_type, email_collection_enabled,
       plan, wallpaper_style, wallpaper_value, qr_settings, created_at, updated_at
FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT ALL ON public.public_profiles TO service_role;
DROP POLICY IF EXISTS "Public can read base profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can read base profiles (signed in)" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read email settings" ON public.email_settings;
CREATE POLICY "Admins can read email settings" ON public.email_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));