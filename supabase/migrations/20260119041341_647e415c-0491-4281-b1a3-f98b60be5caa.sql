-- Add theme_preference column to profiles table
ALTER TABLE public.profiles
ADD COLUMN theme_preference text DEFAULT 'system';

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.theme_preference IS 'User theme preference: light, dark, system, high-contrast, protanopia, deuteranopia, tritanopia';