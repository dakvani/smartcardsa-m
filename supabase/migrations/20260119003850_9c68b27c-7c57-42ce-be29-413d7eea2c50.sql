-- Create user theme presets table
CREATE TABLE public.user_theme_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  theme_name TEXT NOT NULL,
  theme_gradient TEXT NOT NULL,
  custom_bg_color TEXT,
  custom_accent_color TEXT,
  gradient_direction TEXT DEFAULT 'to-b',
  animation_type TEXT,
  animation_speed REAL DEFAULT 1,
  animation_intensity REAL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_theme_presets ENABLE ROW LEVEL SECURITY;

-- Users can view their own presets
CREATE POLICY "Users can view their own presets"
ON public.user_theme_presets
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own presets
CREATE POLICY "Users can create their own presets"
ON public.user_theme_presets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own presets
CREATE POLICY "Users can update their own presets"
ON public.user_theme_presets
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own presets
CREATE POLICY "Users can delete their own presets"
ON public.user_theme_presets
FOR DELETE
USING (auth.uid() = user_id);