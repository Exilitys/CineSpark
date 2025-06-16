import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useCredits } from './useCredits';
import toast from 'react-hot-toast';

type Shot = Database['public']['Tables']['shots']['Row'];
type ShotInsert = Database['public']['Tables']['shots']['Insert'];

export const useShots = (projectId: string | null) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);
  const { deductCredits, validateCredits, refetch: refetchCredits } = useCredits();

  useEffect(() => {
    if (projectId) {
      fetchShots();
    } else {
      setShots([]);
      setLoading(false);
    }
  }, [projectId]);

  const getDummyShotsData = async () => {
    // Get the number of scenes from the story
    let sceneCount = 3; // Default to 3 scenes
    
    if (projectId) {
      try {
        const { data: story } = await supabase
          .from('stories')
          .select('id')
          .eq('project_id', projectId)
          .single();

        if (story) {
          const { data: scenes } = await supabase
            .from('scenes')
            .select('id')
            .eq('story_id', story.id);
          
          if (scenes && scenes.length > 0) {
            sceneCount = scenes.length;
          }
        }
      } catch (error) {
        console.log('Could not fetch scene count, using default');
      }
    }

    return [
      {
        shot_number: 1,
        scene_number: 1,
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
        scene_number: 1,
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
        scene_number: 1,
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
        scene_number: 2,
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
        scene_number: 2,
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
        scene_number: 2,
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
        scene_number: 3,
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
        scene_number: 3,
        shot_type: 'Medium Shot',
        camera_angle: 'Low Angle',
        camera_movement: 'Crane',
        description: 'Marcus and Naia working together to establish communication',
        lens_recommendation: '50mm standard lens',
        estimated_duration: 15,
        notes: 'Crane movement to show collaboration'
      }
    ];
  };

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
      setShots([]);
    } finally {
      setLoading(false);
    }
  };

  const generateShots = async () => {
    if (!projectId) throw new Error('Project ID required');

    try {
      // Check credits before generation
      const validation = await validateCredits('SHOT_LIST_GENERATION');
      if (!validation.isValid) {
        toast.error(validation.message || 'Insufficient credits');
        throw new Error(validation.message || 'Insufficient credits');
      }

      // First check if shots already exist for this project
      const { data: existingShots, error: checkError } = await supabase
        .from('shots')
        .select('id')
        .eq('project_id', projectId)
        .limit(1);

      if (checkError) throw checkError;

      // If shots already exist, don't generate new ones
      if (existingShots && existingShots.length > 0) {
        console.log('Shots already exist for this project, skipping generation');
        await fetchShots(); // Refresh the current shots
        return shots;
      }

      const dummyShots = await getDummyShotsData();
      
      const shotsToInsert = dummyShots.map((shot) => ({
        project_id: projectId,
        scene_id: null, // We'll link to scenes later if needed
        shot_number: shot.shot_number,
        scene_number: shot.scene_number,
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

      // Deduct credits after successful generation
      const deductionResult = await deductCredits('SHOT_LIST_GENERATION', {
        project_id: projectId,
        shots_generated: shotsToInsert.length
      });

      if (!deductionResult.success) {
        console.error('Credit deduction failed:', deductionResult.error);
        toast.error('Shot list generated but credit deduction failed. Please contact support.');
      } else {
        toast.success(`Shot list generated successfully! ${validation.requiredCredits} credits deducted.`);
        // Refresh credits display
        await refetchCredits();
      }
      
      setShots(data || []);
      return data || [];
    } catch (error) {
      console.error('Error generating shots:', error);
      throw error;
    }
  };

  const createPhotoboardFrame = async (shot: Shot) => {
    try {
      console.log('📸 Creating photoboard frame for shot:', shot.shot_number);
      
      // Generate frame description based on shot details
      const frameDescription = `${shot.shot_type} - ${shot.camera_angle} - ${shot.description}`;
      
      // Select appropriate placeholder image based on shot type
      const getPlaceholderImage = (shotType: string, cameraAngle: string) => {
        const imageMap = {
          'Wide Shot': 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Medium Shot': 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Close-up': 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Extreme Close-up': 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=800',
          'POV': 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Over Shoulder': 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800'
        };
        
        return imageMap[shotType as keyof typeof imageMap] || imageMap['Wide Shot'];
      };

      const frameData = {
        project_id: projectId,
        shot_id: shot.id,
        description: frameDescription,
        style: 'Cinematic',
        annotations: [
          `Shot ${shot.shot_number.toString().padStart(3, '0')}`,
          `Scene ${shot.scene_number}`,
          shot.shot_type,
          shot.camera_angle,
          shot.camera_movement,
          shot.lens_recommendation
        ],
        image_url: getPlaceholderImage(shot.shot_type, shot.camera_angle)
      };

      const { data: frame, error } = await supabase
        .from('photoboard_frames')
        .insert(frameData)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Photoboard frame created successfully:', frame.id);
      return frame;
    } catch (error) {
      console.error('❌ Error creating photoboard frame:', error);
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

      // Update corresponding photoboard frame if it exists
      await updateCorrespondingPhotoboardFrame(data);

      return data;
    } catch (error) {
      console.error('Error updating shot:', error);
      throw error;
    }
  };

  const updateCorrespondingPhotoboardFrame = async (shot: Shot) => {
    try {
      // Check if photoboard frame exists for this shot
      const { data: existingFrame } = await supabase
        .from('photoboard_frames')
        .select('id')
        .eq('shot_id', shot.id)
        .single();

      if (existingFrame) {
        // Update frame description and annotations
        const frameDescription = `${shot.shot_type} - ${shot.camera_angle} - ${shot.description}`;
        const updatedAnnotations = [
          `Shot ${shot.shot_number.toString().padStart(3, '0')}`,
          `Scene ${shot.scene_number}`,
          shot.shot_type,
          shot.camera_angle,
          shot.camera_movement,
          shot.lens_recommendation
        ];

        await supabase
          .from('photoboard_frames')
          .update({
            description: frameDescription,
            annotations: updatedAnnotations
          })
          .eq('id', existingFrame.id);

        console.log('📸 Updated corresponding photoboard frame');
      }
    } catch (error) {
      console.error('Error updating photoboard frame:', error);
      // Don't throw error as this is a secondary operation
    }
  };

  const createShot = async (shotData: Omit<ShotInsert, 'project_id'>) => {
    if (!projectId) throw new Error('Project ID required');

    try {
      console.log('🎬 Creating new shot with data:', shotData);
      
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
      
      // Automatically create corresponding photoboard frame
      try {
        await createPhotoboardFrame(data);
        console.log('✅ Shot and photoboard frame created successfully');
      } catch (frameError) {
        console.error('⚠️ Shot created but photoboard frame creation failed:', frameError);
        // Don't throw error as the shot was created successfully
      }
      
      return data;
    } catch (error) {
      console.error('Error creating shot:', error);
      throw error;
    }
  };

  const deleteShot = async (shotId: string) => {
    try {
      // First delete corresponding photoboard frame
      await supabase
        .from('photoboard_frames')
        .delete()
        .eq('shot_id', shotId);

      // Then delete the shot
      const { error } = await supabase
        .from('shots')
        .delete()
        .eq('id', shotId);

      if (error) throw error;

      setShots(prev => prev.filter(shot => shot.id !== shotId));
      console.log('🗑️ Shot and corresponding photoboard frame deleted');
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