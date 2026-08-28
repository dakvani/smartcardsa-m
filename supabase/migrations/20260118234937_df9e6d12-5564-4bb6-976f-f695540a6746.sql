-- Add scheduled publishing columns to links
ALTER TABLE public.links 
ADD COLUMN scheduled_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN scheduled_end TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create detailed link clicks table for analytics
CREATE TABLE public.link_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  referrer TEXT
);

-- Enable RLS on link_clicks
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks (tracking)
CREATE POLICY "Anyone can record a click"
ON public.link_clicks
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM links WHERE links.id = link_clicks.link_id
));

-- Profile owners can view their click analytics
CREATE POLICY "Profile owners can view their click analytics"
ON public.link_clicks
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = link_clicks.profile_id 
  AND profiles.user_id = auth.uid()
));

-- Create profile templates table
CREATE TABLE public.profile_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  theme_name TEXT NOT NULL,
  theme_gradient TEXT NOT NULL,
  gradient_direction TEXT DEFAULT 'to-b',
  preview_image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - templates are public read
ALTER TABLE public.profile_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by everyone"
ON public.profile_templates
FOR SELECT
USING (true);

-- Insert default templates
INSERT INTO public.profile_templates (name, description, category, theme_name, theme_gradient, gradient_direction) VALUES
('Creator Starter', 'Perfect for content creators and influencers', 'creator', 'Sunset', 'from-orange-500 via-pink-500 to-purple-600', 'to-br'),
('Dark Creator', 'Moody aesthetic for artists and musicians', 'creator', 'Midnight', 'from-slate-900 via-purple-950 to-slate-900', 'to-b'),
('Business Pro', 'Clean and professional for businesses', 'business', 'Ocean', 'from-slate-700 via-slate-800 to-slate-900', 'to-b'),
('Corporate Blue', 'Trust-building design for corporate profiles', 'business', 'Corporate', 'from-blue-900 via-blue-800 to-indigo-900', 'to-br'),
('Portfolio Minimal', 'Minimalist design for portfolios', 'portfolio', 'Minimal', 'from-gray-100 via-gray-200 to-gray-300', 'to-b'),
('Portfolio Dark', 'Elegant dark theme for creatives', 'portfolio', 'Noir', 'from-zinc-900 via-neutral-900 to-stone-900', 'to-b'),
('Nature Vibes', 'Fresh green theme for eco-conscious brands', 'creator', 'Forest', 'from-green-600 via-emerald-500 to-teal-500', 'to-br'),
('Neon Dreams', 'Vibrant neon for gaming and tech', 'creator', 'Neon', 'from-purple-600 via-pink-500 to-cyan-400', 'to-r');