CREATE POLICY "Public can read base profiles (signed in)"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

GRANT SELECT ON public.profiles TO anon, authenticated;