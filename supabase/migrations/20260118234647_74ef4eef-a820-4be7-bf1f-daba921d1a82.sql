-- Create email subscribers table
CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, email)
);

-- Enable RLS
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to a profile"
ON public.email_subscribers
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = email_subscribers.profile_id
));

-- Profile owners can view their subscribers
CREATE POLICY "Profile owners can view their subscribers"
ON public.email_subscribers
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = email_subscribers.profile_id 
  AND profiles.user_id = auth.uid()
));

-- Profile owners can delete subscribers
CREATE POLICY "Profile owners can delete subscribers"
ON public.email_subscribers
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = email_subscribers.profile_id 
  AND profiles.user_id = auth.uid()
));

-- Add email_collection_enabled to profiles
ALTER TABLE public.profiles ADD COLUMN email_collection_enabled BOOLEAN DEFAULT false;