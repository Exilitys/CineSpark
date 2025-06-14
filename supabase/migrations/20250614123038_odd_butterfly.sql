/*
  # Create CineSpark AI Database Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `original_idea` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `stories`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `logline` (text)
      - `synopsis` (text)
      - `three_act_structure` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `characters`
      - `id` (uuid, primary key)
      - `story_id` (uuid, references stories)
      - `name` (text)
      - `description` (text)
      - `motivation` (text)
      - `arc` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
    
    - `scenes`
      - `id` (uuid, primary key)
      - `story_id` (uuid, references stories)
      - `title` (text)
      - `setting` (text)
      - `description` (text)
      - `characters` (text[])
      - `key_actions` (text[])
      - `order_index` (integer)
      - `created_at` (timestamp)
    
    - `shots`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `scene_id` (uuid, references scenes)
      - `shot_number` (integer)
      - `shot_type` (text)
      - `camera_angle` (text)
      - `camera_movement` (text)
      - `description` (text)
      - `lens_recommendation` (text)
      - `estimated_duration` (integer)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `photoboard_frames`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `shot_id` (uuid, references shots)
      - `image_url` (text)
      - `description` (text)
      - `style` (text)
      - `annotations` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  original_idea text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  logline text NOT NULL,
  synopsis text NOT NULL,
  three_act_structure jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  motivation text NOT NULL,
  arc text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  setting text NOT NULL,
  description text NOT NULL,
  characters text[] DEFAULT '{}',
  key_actions text[] DEFAULT '{}',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create shots table
CREATE TABLE IF NOT EXISTS shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE,
  shot_number integer NOT NULL,
  shot_type text NOT NULL,
  camera_angle text NOT NULL,
  camera_movement text NOT NULL,
  description text NOT NULL,
  lens_recommendation text NOT NULL,
  estimated_duration integer DEFAULT 5,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create photoboard_frames table
CREATE TABLE IF NOT EXISTS photoboard_frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  shot_id uuid REFERENCES shots(id) ON DELETE CASCADE,
  image_url text,
  description text NOT NULL,
  style text NOT NULL DEFAULT 'Cinematic',
  annotations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE photoboard_frames ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for stories
CREATE POLICY "Users can view stories of own projects"
  ON stories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = stories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stories for own projects"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = stories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stories of own projects"
  ON stories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = stories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stories of own projects"
  ON stories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = stories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create policies for characters
CREATE POLICY "Users can manage characters of own stories"
  ON characters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      JOIN projects ON projects.id = stories.project_id
      WHERE stories.id = characters.story_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create policies for scenes
CREATE POLICY "Users can manage scenes of own stories"
  ON scenes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      JOIN projects ON projects.id = stories.project_id
      WHERE stories.id = scenes.story_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create policies for shots
CREATE POLICY "Users can manage shots of own projects"
  ON shots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = shots.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create policies for photoboard_frames
CREATE POLICY "Users can manage photoboard frames of own projects"
  ON photoboard_frames FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = photoboard_frames.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_project_id ON stories(project_id);
CREATE INDEX IF NOT EXISTS idx_characters_story_id ON characters(story_id);
CREATE INDEX IF NOT EXISTS idx_scenes_story_id ON scenes(story_id);
CREATE INDEX IF NOT EXISTS idx_shots_project_id ON shots(project_id);
CREATE INDEX IF NOT EXISTS idx_shots_scene_id ON shots(scene_id);
CREATE INDEX IF NOT EXISTS idx_photoboard_frames_project_id ON photoboard_frames(project_id);
CREATE INDEX IF NOT EXISTS idx_photoboard_frames_shot_id ON photoboard_frames(shot_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shots_updated_at BEFORE UPDATE ON shots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photoboard_frames_updated_at BEFORE UPDATE ON photoboard_frames
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();