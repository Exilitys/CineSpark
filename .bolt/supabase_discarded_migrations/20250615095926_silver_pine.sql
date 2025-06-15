/*
  # Create AI Stories table for story generation system

  1. New Tables
    - `ai_stories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `user_input` (text)
      - `generated_content` (text)
      - `edited_content` (text, nullable)
      - `status` (text, check constraint)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `version` (integer, for conflict resolution)

  2. Security
    - Enable RLS on `ai_stories` table
    - Add policies for users to manage their own stories

  3. Indexes
    - Add indexes for performance optimization
*/

-- Create ai_stories table
CREATE TABLE IF NOT EXISTS ai_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_input text NOT NULL,
  generated_content text NOT NULL,
  edited_content text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1
);

-- Enable RLS
ALTER TABLE ai_stories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own stories"
  ON ai_stories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stories"
  ON ai_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
  ON ai_stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON ai_stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_stories_user_id ON ai_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_stories_status ON ai_stories(status);
CREATE INDEX IF NOT EXISTS idx_ai_stories_created_at ON ai_stories(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_stories_updated_at
  BEFORE UPDATE ON ai_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for version increment on updates
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_ai_stories_version
  BEFORE UPDATE ON ai_stories
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();