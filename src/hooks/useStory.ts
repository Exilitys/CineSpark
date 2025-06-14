import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Story = Database['public']['Tables']['stories']['Row'];
type Character = Database['public']['Tables']['characters']['Row'];
type Scene = Database['public']['Tables']['scenes']['Row'];

export interface StoryWithDetails extends Story {
  characters: Character[];
  scenes: Scene[];
}

export const useStory = (projectId: string | null) => {
  const [story, setStory] = useState<StoryWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchStory();
    } else {
      setStory(null);
      setLoading(false);
    }
  }, [projectId]);

  const fetchStory = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      
      // Fetch story
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (storyError) {
        if (storyError.code === 'PGRST116') {
          // No story found
          setStory(null);
          return;
        }
        throw storyError;
      }

      // Fetch characters
      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .eq('story_id', storyData.id)
        .order('order_index');

      if (charactersError) throw charactersError;

      // Fetch scenes
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes')
        .select('*')
        .eq('story_id', storyData.id)
        .order('order_index');

      if (scenesError) throw scenesError;

      setStory({
        ...storyData,
        characters: charactersData || [],
        scenes: scenesData || [],
      });
    } catch (error) {
      console.error('Error fetching story:', error);
      setStory(null);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (storyData: {
    logline: string;
    synopsis: string;
    three_act_structure: { act1: string; act2: string; act3: string };
    characters: Array<{
      name: string;
      description: string;
      motivation: string;
      arc: string;
    }>;
    scenes: Array<{
      title: string;
      setting: string;
      description: string;
      characters: string[];
      key_actions: string[];
    }>;
  }) => {
    if (!projectId) throw new Error('Project ID required');

    try {
      // Create story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          project_id: projectId,
          logline: storyData.logline,
          synopsis: storyData.synopsis,
          three_act_structure: storyData.three_act_structure,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Create characters
      const charactersToInsert = storyData.characters.map((char, index) => ({
        story_id: story.id,
        name: char.name,
        description: char.description,
        motivation: char.motivation,
        arc: char.arc,
        order_index: index,
      }));

      const { data: characters, error: charactersError } = await supabase
        .from('characters')
        .insert(charactersToInsert)
        .select();

      if (charactersError) throw charactersError;

      // Create scenes
      const scenesToInsert = storyData.scenes.map((scene, index) => ({
        story_id: story.id,
        title: scene.title,
        setting: scene.setting,
        description: scene.description,
        characters: scene.characters,
        key_actions: scene.key_actions,
        order_index: index,
      }));

      const { data: scenes, error: scenesError } = await supabase
        .from('scenes')
        .insert(scenesToInsert)
        .select();

      if (scenesError) throw scenesError;

      const newStory: StoryWithDetails = {
        ...story,
        characters: characters || [],
        scenes: scenes || [],
      };

      setStory(newStory);
      return newStory;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  };

  return {
    story,
    loading,
    createStory,
    refetch: fetchStory,
  };
};