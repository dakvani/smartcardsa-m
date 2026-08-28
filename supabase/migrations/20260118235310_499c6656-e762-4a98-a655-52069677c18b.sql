-- Create link_groups table
CREATE TABLE public.link_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.link_groups ENABLE ROW LEVEL SECURITY;

-- Users can view their own groups
CREATE POLICY "Users can view their own groups"
ON public.link_groups
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own groups
CREATE POLICY "Users can create their own groups"
ON public.link_groups
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own groups
CREATE POLICY "Users can update their own groups"
ON public.link_groups
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own groups
CREATE POLICY "Users can delete their own groups"
ON public.link_groups
FOR DELETE
USING (auth.uid() = user_id);

-- Add group_id to links table
ALTER TABLE public.links ADD COLUMN group_id UUID REFERENCES public.link_groups(id) ON DELETE SET NULL;

-- Create policy for public access to groups (for public profile display)
CREATE POLICY "Public can view groups for visible links"
ON public.link_groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM links 
    WHERE links.group_id = link_groups.id 
    AND links.visible = true
  )
);