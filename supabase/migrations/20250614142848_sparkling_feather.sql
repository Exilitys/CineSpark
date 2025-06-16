/*
  # Add scene number to shots table

  1. Changes
    - Add scene_number column to shots table
    - Update existing shots with scene numbers based on story scenes
    - Add index for better performance

  2. Security
    - No changes to RLS policies needed
*/

-- Add scene_number column to shots table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shots' AND column_name = 'scene_number'
  ) THEN
    ALTER TABLE shots ADD COLUMN scene_number integer DEFAULT 1;
  END IF;
END $$;

-- Add index for scene_number
CREATE INDEX IF NOT EXISTS idx_shots_scene_number ON shots(scene_number);

-- Update existing shots with scene numbers (distribute evenly across scenes)
UPDATE shots 
SET scene_number = CASE 
  WHEN shot_number <= 3 THEN 1
  WHEN shot_number <= 6 THEN 2
  ELSE 3
END
WHERE scene_number IS NULL OR scene_number = 1;