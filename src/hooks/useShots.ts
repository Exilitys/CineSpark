import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Shot = Database['public']['Tables']['shots']['Row'];
type ShotInsert = Database['public']['Tables']['shots']['Insert'];

export const useShots = (projectId: string | null) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchShots();
    } else {
      setShots([]);
      setLoading(false);
    }
  }, [projectId]);

  const getDummyShotsData = () => [
    {
      shot_number: 1,
      shot_type: 'Wide Shot',
      camera_angle: 'High Angle',
      camera_movement: 'Static',
      description: 'Establishing shot of the lighthouse at dawn, surrounded by mist and crashing waves',
      lens_recommendation: '24mm wide-angle lens',
      estimated_duration: 8,
      notes: 'Golden hour lighting, emphasize isolation'
    },
    {
      shot_number: 2,
      shot_type: 'Medium Shot',
      camera_angle: 'Eye-level',
      camera_movement: 'Pan',
      description: 'Marcus moving through lighthouse interior, checking equipment methodically',
      lens_recommendation: '50mm standard lens',
      estimated_duration: 12,
      notes: 'Handheld for intimate feel'
    },
    {
      shot_number: 3,
      shot_type: 'Close-up',
      camera_angle: 'Eye-level',
      camera_movement: 'Static',
      description: 'Close-up of Marcus\'s weathered hands adjusting lighthouse mechanism',
      lens_recommendation: '85mm portrait lens',
      estimated_duration: 4,
      notes: 'Focus on texture and routine'
    },
    {
      shot_number: 4,
      shot_type: 'Wide Shot',
      camera_angle: 'Low Angle',
      camera_movement: 'Dolly',
      description: 'Marcus walking down rocky shore, storm debris scattered around',
      lens_recommendation: '35mm lens',
      estimated_duration: 10,
      notes: 'Steadicam for smooth movement'
    },
    {
      shot_number: 5,
      shot_type: 'Extreme Close-up',
      camera_angle: 'High Angle',
      camera_movement: 'Static',
      description: 'Marcus\'s eyes widening as he first sees Naia',
      lens_recommendation: '100mm macro lens',
      estimated_duration: 3,
      notes: 'Capture moment of discovery'
    },
    {
      shot_number: 6,
      shot_type: 'POV',
      camera_angle: 'Eye-level',
      camera_movement: 'Handheld',
      description: 'Naia\'s perspective as she awakens in the makeshift pool',
      lens_recommendation: '28mm wide lens',
      estimated_duration: 6,
      notes: 'Underwater housing for partial submersion'
    },
    {
      shot_number: 7,
      shot_type: 'Over Shoulder',
      camera_angle: 'Eye-level',
      camera_movement: 'Static',
      description: 'Over Marcus\'s shoulder as he first communicates with Naia',
      lens_recommendation: '85mm portrait lens',
      estimated_duration: 8,
      notes: 'Shallow depth of field to isolate subjects'
    },
    {
      shot_number: 8,
      shot_type: 'Medium Shot',
      camera_angle: 'Low Angle',
      camera_movement: 'Crane',
      description: 'Marcus and Naia working together to establish communication',
      lens_recommendation: '50mm standard lens',
      estimated_duration: 15,
      notes: 'Crane movement to show collaboration'
    }
  ];

  const fetchShots = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('shots')
        .select('*')
        .eq('project_id', projectId)
        .order('shot_number');

      if (error) throw error;
      setShots(data || []);
    } catch (error: any) {
      console.error('Error fetching shots:', error);
      
      // Check if no shots exist, create dummy data
      if (error?.code === 'PGRST116' || (error?.body && JSON.parse(error.body)?.code === 'PGRST116')) {
        try {
          const newShots = await generateShots();
          setShots(newShots);
        } catch (createError) {
          console.error('Error creating initial shots:', createError);
          setShots([]);
        }
      } else {
        setShots([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateShots = async () => {
    if (!projectId) throw new Error('Project ID required');

    try {
      const dummyShots = getDummyShotsData();
      
      const shotsToInsert = dummyShots.map((shot) => ({
        project_id: projectId,
        scene_id: null, // We'll link to scenes later
        shot_number: shot.shot_number,
        shot_type: shot.shot_type,
        camera_angle: shot.camera_angle,
        camera_movement: shot.camera_movement,
        description: shot.description,
        lens_recommendation: shot.lens_recommendation,
        estimated_duration: shot.estimated_duration,
        notes: shot.notes,
      }));

      const { data, error } = await supabase
        .from('shots')
        .insert(shotsToInsert)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error generating shots:', error);
      throw error;
    }
  };

  const updateShot = async (shotId: string, updates: Partial<ShotInsert>) => {
    try {
      const { data, error } = await supabase
        .from('shots')
        .update(updates)
        .eq('id', shotId)
        .select()
        .single();

      if (error) throw error;

      setShots(prev => prev.map(shot => 
        shot.id === shotId ? { ...shot, ...data } : shot
      ));

      return data;
    } catch (error) {
      console.error('Error updating shot:', error);
      throw error;
    }
  };

  const createShot = async (shotData: Omit<ShotInsert, 'project_id'>) => {
    if (!projectId) throw new Error('Project ID required');

    try {
      const { data, error } = await supabase
        .from('shots')
        .insert({
          ...shotData,
          project_id: projectId,
        })
        .select()
        .single();

      if (error) throw error;

      setShots(prev => [...prev, data].sort((a, b) => a.shot_number - b.shot_number));
      return data;
    } catch (error) {
      console.error('Error creating shot:', error);
      throw error;
    }
  };

  const deleteShot = async (shotId: string) => {
    try {
      const { error } = await supabase
        .from('shots')
        .delete()
        .eq('id', shotId);

      if (error) throw error;

      setShots(prev => prev.filter(shot => shot.id !== shotId));
    } catch (error) {
      console.error('Error deleting shot:', error);
      throw error;
    }
  };

  return {
    shots,
    loading,
    generateShots,
    updateShot,
    createShot,
    deleteShot,
    refetch: fetchShots,
  };
};