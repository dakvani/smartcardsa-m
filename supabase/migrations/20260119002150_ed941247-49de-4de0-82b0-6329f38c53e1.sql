-- Add animation_type column to profiles for animated themes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS animation_type text DEFAULT NULL;

-- Add animation_type column to profile_templates
ALTER TABLE public.profile_templates ADD COLUMN IF NOT EXISTS animation_type text DEFAULT NULL;

-- Insert animated theme templates
INSERT INTO public.profile_templates (name, description, category, theme_name, theme_gradient, gradient_direction, is_premium, animation_type)
VALUES 
  ('Aurora Pulse', 'Mesmerizing pulsing aurora effect', 'creator', 'Aurora Pulse', 'from-emerald-500 via-cyan-500 to-blue-600', 'to-br', false, 'pulse'),
  ('Starfield', 'Floating particles like a starry night', 'creator', 'Starfield', 'from-slate-900 via-purple-900 to-indigo-900', 'to-b', false, 'particles'),
  ('Wave Motion', 'Smooth wave animation effect', 'portfolio', 'Wave Motion', 'from-blue-600 via-indigo-600 to-violet-700', 'to-b', false, 'wave'),
  ('Gradient Shift', 'Slowly shifting gradient colors', 'business', 'Gradient Shift', 'from-rose-500 via-purple-500 to-indigo-500', 'to-r', false, 'gradient-shift'),
  ('Glow Ring', 'Glowing ring animation around avatar', 'creator', 'Glow Ring', 'from-pink-500 via-purple-600 to-violet-700', 'to-b', false, 'glow'),
  ('Floating Orbs', 'Ethereal floating orb effects', 'portfolio', 'Floating Orbs', 'from-amber-500 via-orange-500 to-red-600', 'to-br', true, 'orbs'),
  ('Shimmer', 'Elegant shimmering highlight effect', 'business', 'Shimmer', 'from-gray-900 via-slate-800 to-zinc-900', 'to-b', false, 'shimmer'),
  ('Neon Glow', 'Vibrant neon glow effects', 'creator', 'Neon Glow', 'from-fuchsia-600 via-pink-600 to-rose-600', 'to-b', true, 'neon')
ON CONFLICT DO NOTHING;