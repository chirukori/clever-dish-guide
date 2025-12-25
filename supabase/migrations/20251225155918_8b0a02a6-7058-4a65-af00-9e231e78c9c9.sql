-- Fix 1: Add DELETE policy for profiles table (GDPR compliance)
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Fix 2: Update handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Extract and validate full_name from metadata
  v_full_name := COALESCE(new.raw_user_meta_data ->> 'full_name', '');
  
  -- Sanitize: remove control characters and limit length
  v_full_name := TRIM(REGEXP_REPLACE(v_full_name, '[\x00-\x1F\x7F]', '', 'g'));
  v_full_name := LEFT(v_full_name, 100);
  
  -- Insert with validated name (NULL if empty/invalid)
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id, 
    CASE WHEN LENGTH(v_full_name) > 0 THEN v_full_name ELSE NULL END
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;