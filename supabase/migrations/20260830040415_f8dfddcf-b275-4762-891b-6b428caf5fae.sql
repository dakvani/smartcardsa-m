ALTER TABLE public.oauth_verification_status DROP CONSTRAINT IF EXISTS oauth_verification_status_singleton;
CREATE UNIQUE INDEX IF NOT EXISTS oauth_verification_status_provider_key ON public.oauth_verification_status (provider);
INSERT INTO public.oauth_verification_status (id, provider, app_name) VALUES (2,'apple','SmartCardSA'),(3,'microsoft','SmartCardSA') ON CONFLICT (id) DO NOTHING;