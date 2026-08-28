-- Add is_featured column to links table
ALTER TABLE public.links ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for faster featured link queries
CREATE INDEX idx_links_featured ON public.links(is_featured) WHERE is_featured = true;