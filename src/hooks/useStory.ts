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
          // No story found, create one with dummy data
          await createInitialStory();
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

  const createInitialStory = async () => {
    if (!projectId) return;

    const dummyStoryData = {
      logline: "A lonely lighthouse keeper discovers a mysterious sea creature that challenges everything he believes about isolation and connection.",
      synopsis: "Marcus, a reclusive lighthouse keeper on a remote island, has spent five years in solitude after a tragic accident. His monotonous routine is shattered when he discovers Naia, a wounded sea creature with intelligence beyond human understanding. As Marcus nurses Naia back to health, he learns that she comes from an ancient underwater civilization facing extinction due to ocean pollution. Together, they must overcome their fear of the outside world to save both their species, discovering that true connection transcends the boundaries of species and solitude.",
      three_act_structure: {
        act1: "Marcus maintains his isolated routine at the lighthouse, haunted by memories of the accident. During a fierce storm, he discovers Naia washed ashore, injured and unlike anything he's ever seen. Despite his fear, he decides to help her recover.",
        act2: "As Naia heals, she and Marcus develop a unique form of communication. She reveals the dire situation of her underwater civilization and the connection to human pollution. Marcus must confront his past trauma and decide whether to help Naia contact the outside world, risking exposure of both their secrets.",
        act3: "Marcus and Naia work together to establish contact with Dr. Chen and the scientific community. They face skepticism and danger as corporate interests threaten both the lighthouse and Naia's people. The climax involves Marcus overcoming his isolation to lead a mission that saves Naia's civilization and establishes a new era of interspecies cooperation."
      },
      characters: [
        {
          name: "Marcus",
          description: "A weathered 45-year-old former marine biologist turned lighthouse keeper",
          motivation: "To find redemption and purpose after losing his research team in a diving accident",
          arc: "From isolated and guilt-ridden to connected and purposeful"
        },
        {
          name: "Naia",
          description: "An intelligent sea creature from an ancient underwater civilization",
          motivation: "To save her dying people and forge understanding between species",
          arc: "From fearful and suspicious to trusting and collaborative"
        },
        {
          name: "Dr. Sarah Chen",
          description: "Marcus's former colleague and marine research director",
          motivation: "To bring Marcus back to the scientific community and continue their work",
          arc: "From professional concern to personal understanding and support"
        }
      ],
      scenes: [
        {
          title: "Morning Routine",
          setting: "Lighthouse interior at dawn",
          description: "Marcus performs his daily maintenance routine with mechanical precision",
          characters: ["Marcus"],
          key_actions: ["Checking lighthouse equipment", "Making coffee", "Looking out at empty ocean"]
        },
        {
          title: "The Discovery",
          setting: "Rocky shore after storm",
          description: "Marcus finds Naia unconscious on the beach, making the choice to help",
          characters: ["Marcus", "Naia"],
          key_actions: ["Discovering Naia", "Initial fear and curiosity", "Decision to help"]
        },
        {
          title: "First Contact",
          setting: "Lighthouse basement pool",
          description: "Naia awakens and first attempts at communication begin",
          characters: ["Marcus", "Naia"],
          key_actions: ["Naia's awakening", "Establishing basic communication", "Building trust"]
        }
      ]
    };

    await createStory(dummyStoryData);
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

  const updateStory = async (updates: {
    logline?: string;
    synopsis?: string;
    three_act_structure?: { act1: string; act2: string; act3: string };
  }) => {
    if (!story) return;

    try {
      const { data, error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', story.id)
        .select()
        .single();

      if (error) throw error;

      setStory(prev => prev ? { ...prev, ...data } : null);
      return data;
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  };

  const updateCharacter = async (characterId: string, updates: {
    name?: string;
    description?: string;
    motivation?: string;
    arc?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', characterId)
        .select()
        .single();

      if (error) throw error;

      setStory(prev => {
        if (!prev) return null;
        return {
          ...prev,
          characters: prev.characters.map(char => 
            char.id === characterId ? { ...char, ...data } : char
          )
        };
      });

      return data;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  };

  const updateScene = async (sceneId: string, updates: {
    title?: string;
    setting?: string;
    description?: string;
    characters?: string[];
    key_actions?: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('scenes')
        .update(updates)
        .eq('id', sceneId)
        .select()
        .single();

      if (error) throw error;

      setStory(prev => {
        if (!prev) return null;
        return {
          ...prev,
          scenes: prev.scenes.map(scene => 
            scene.id === sceneId ? { ...scene, ...data } : scene
          )
        };
      });

      return data;
    } catch (error) {
      console.error('Error updating scene:', error);
      throw error;
    }
  };

  return {
    story,
    loading,
    createStory,
    updateStory,
    updateCharacter,
    updateScene,
    refetch: fetchStory,
  };
};