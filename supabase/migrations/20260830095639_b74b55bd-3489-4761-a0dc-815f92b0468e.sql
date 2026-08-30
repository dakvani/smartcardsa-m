CREATE TABLE public.wallet_settings (
  id integer PRIMARY KEY DEFAULT 1,
  apple_enabled boolean NOT NULL DEFAULT false,
  apple_pass_type_id text NOT NULL DEFAULT '',
  apple_team_id text NOT NULL DEFAULT '',
  apple_cert_p12_base64 text,
  apple_cert_password text,
  apple_cert_filename text,
  google_enabled boolean NOT NULL DEFAULT false,
  google_issuer_id text NOT NULL DEFAULT '',
  google_service_account text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT wallet_settings_singleton CHECK (id = 1)
);

GRANT SELECT, INSERT, UPDATE ON public.wallet_settings TO authenticated;
GRANT ALL ON public.wallet_settings TO service_role;

ALTER TABLE public.wallet_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view wallet settings" ON public.wallet_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert wallet settings" ON public.wallet_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update wallet settings" ON public.wallet_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.wallet_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;