-- Add animation speed and intensity columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS animation_speed REAL DEFAULT 1,
ADD COLUMN IF NOT EXISTS animation_intensity REAL DEFAULT 1;

-- Add animation speed and intensity columns to profile_templates
ALTER TABLE public.profile_templates 
ADD COLUMN IF NOT EXISTS animation_speed REAL DEFAULT 1,
ADD COLUMN IF NOT EXISTS animation_intensity REAL DEFAULT 1;