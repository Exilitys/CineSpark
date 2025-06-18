/*
  # Fix user signup database error

  1. Check and fix user profile creation
    - Ensure proper trigger function for user profile creation
    - Fix any issues with user_profiles table constraints
    - Add proper error handling

  2. Security
    - Verify RLS policies are correct
    - Ensure proper permissions for user creation
*/

-- Drop existing trigger to recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the user profile creation function with better error handling
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with proper error handling
  INSERT INTO public.user_profiles (
    user_id, 
    full_name, 
    credits, 
    plan,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    100,
    'free',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Ensure the user_profiles table has proper constraints
ALTER TABLE user_profiles 
  ALTER COLUMN full_name SET DEFAULT 'User',
  ALTER COLUMN credits SET DEFAULT 100,
  ALTER COLUMN plan SET DEFAULT 'free';

-- Make sure the unique constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add a policy for the trigger function to insert profiles
DROP POLICY IF EXISTS "System can create user profiles" ON user_profiles;
CREATE POLICY "System can create user profiles"
  ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);