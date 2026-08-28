
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS motion text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card_style jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.smartlink_template_settings (
  template_key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  tier text NOT NULL DEFAULT 'free',
  position integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.smartlink_template_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smartlink_template_settings TO authenticated;
GRANT ALL ON public.smartlink_template_settings TO service_role;
ALTER TABLE public.smartlink_template_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read template settings" ON public.smartlink_template_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage template settings" ON public.smartlink_template_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.builder_settings (
  id integer PRIMARY KEY DEFAULT 1,
  allow_animations boolean NOT NULL DEFAULT true,
  allow_3d boolean NOT NULL DEFAULT true,
  allow_link_motion boolean NOT NULL DEFAULT true,
  allow_custom_background boolean NOT NULL DEFAULT true,
  max_links_free integer NOT NULL DEFAULT 50,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT builder_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.builder_settings TO anon;
GRANT SELECT, UPDATE ON public.builder_settings TO authenticated;
GRANT ALL ON public.builder_settings TO service_role;
ALTER TABLE public.builder_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read builder settings" ON public.builder_settings FOR SELECT USING (true);
CREATE POLICY "Admins update builder settings" ON public.builder_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.builder_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
