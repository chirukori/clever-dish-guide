-- Fix profiles table: require authentication to read profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;

CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);