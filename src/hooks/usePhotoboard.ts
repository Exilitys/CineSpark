import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type PhotoboardFrame = Database['public']['Tables']['photoboard_frames']['Row'];
type PhotoboardFrameInsert = Database['public']['Tables']['photoboard_frames']['Insert'];

export const usePhotoboard = (projectId: string | null) => {
  const [frames, setFrames] = useState<PhotoboardFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchFrames();
    } else {
      setFrames([]);
      setLoading(false);
    }
  }, [projectId]);

  const getDummyFramesData = () => [
    {
      description: 'Lighthouse at dawn with misty atmosphere and dramatic lighting',
      annotations: [], // Removed annotation tags
      image_url: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      description: 'Interior lighthouse scene with vintage equipment and warm lighting',
      annotations: [], // Removed annotation tags
      image_url: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      description: 'Close-up of weathered hands working with mechanical precision',
      annotations: [], // Removed annotation tags
      image_url: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      description: 'Rocky coastline with storm debris and dramatic sky',
      annotations: [], // Removed annotation tags
      image_url: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      description: 'Extreme close-up of surprised human eyes reflecting wonder',
      annotations: [], // Removed annotation tags
      image_url: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      description: 'Underwater perspective looking up toward surface with mysterious ambiance',
      annotations: [], // Removed annotation tags
      image_url: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      description: 'Marcus walking down rocky shore, storm debris scattered around',
      annotations: [], // Removed annotation tags
      image_url: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      description: 'Naia\'s perspective as she awakens in the makeshift pool',
      annotations: [], // Removed annotation tags
      image_url: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const fetchFrames = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('photoboard_frames')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

      if (error) throw error;
      setFrames(data || []);
    } catch (error: any) {
      console.error('Error fetching photoboard frames:', error);
      setFrames([]);
    } finally {
      setLoading(false);
    }
  };

  const generateFrames = async () => {
    if (!projectId) throw new Error('Project ID required');

    try {
      // First check if photoboard frames already exist for this project
      const { data: existingFrames, error: checkError } = await supabase
        .from('photoboard_frames')
        .select('id')
        .eq('project_id', projectId)
        .limit(1);

      if (checkError) throw checkError;

      // If frames already exist, don't generate new ones
      if (existingFrames && existingFrames.length > 0) {
        console.log('Photoboard frames already exist for this project, skipping generation');
        await fetchFrames(); // Refresh the current frames
        return frames;
      }

      // Get the shots for this project to link frames to shots
      const { data: shots, error: shotsError } = await supabase
        .from('shots')
        .select('id, shot_number, scene_number, description, shot_type, camera_angle, lens_recommendation')
        .eq('project_id', projectId)
        .order('shot_number');

      if (shotsError) throw shotsError;

      // If no shots exist, we can't generate frames
      if (!shots || shots.length === 0) {
        throw new Error('No shots found for this project. Please generate shots first.');
      }

      const dummyFrames = getDummyFramesData();
      
      // Create one frame per shot, ensuring correspondence
      const framesToInsert = shots.map((shot, index) => {
        const frameData = dummyFrames[index % dummyFrames.length]; // Cycle through dummy data if more shots than frames
        return {
          project_id: projectId,
          shot_id: shot.id, // Link each frame to its corresponding shot
          description: frameData.description, // Use frame description, shot description will be shown from shot data
          style: 'Cinematic', // Default style, no longer user-selectable
          annotations: [], // No longer using annotation tags
          image_url: frameData.image_url,
        };
      });

      const { data, error } = await supabase
        .from('photoboard_frames')
        .insert(framesToInsert)
        .select();

      if (error) throw error;
      
      setFrames(data || []);
      return data || [];
    } catch (error) {
      console.error('Error generating photoboard frames:', error);
      throw error;
    }
  };

  const uploadImage = async (frameId: string, file: File) => {
    try {
      setUploading(frameId);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${frameId}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photoboard-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photoboard-images')
        .getPublicUrl(fileName);

      // Update frame with new image URL
      const { data, error } = await supabase
        .from('photoboard_frames')
        .update({ image_url: publicUrl })
        .eq('id', frameId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setFrames(prev => prev.map(frame => 
        frame.id === frameId ? { ...frame, image_url: publicUrl } : frame
      ));

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(null);
    }
  };

  const updateFrame = async (frameId: string, updates: Partial<PhotoboardFrameInsert>) => {
    try {
      const { data, error } = await supabase
        .from('photoboard_frames')
        .update(updates)
        .eq('id', frameId)
        .select()
        .single();

      if (error) throw error;

      setFrames(prev => prev.map(frame => 
        frame.id === frameId ? { ...frame, ...data } : frame
      ));

      return data;
    } catch (error) {
      console.error('Error updating frame:', error);
      throw error;
    }
  };

  const deleteFrame = async (frameId: string) => {
    try {
      // Get frame to delete associated image
      const frame = frames.find(f => f.id === frameId);
      
      // Delete from storage if it's a user-uploaded image
      if (frame?.image_url && frame.image_url.includes('supabase')) {
        const fileName = frame.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('photoboard-images')
            .remove([`${projectId}/${frameId}/${fileName}`]);
        }
      }

      const { error } = await supabase
        .from('photoboard_frames')
        .delete()
        .eq('id', frameId);

      if (error) throw error;

      setFrames(prev => prev.filter(frame => frame.id !== frameId));
    } catch (error) {
      console.error('Error deleting frame:', error);
      throw error;
    }
  };

  const regenerateFrame = async (frameId: string) => {
    try {
      // Simulate AI regeneration by updating with a new dummy image
      const dummyImages = [
        'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
      ];
      
      const randomImage = dummyImages[Math.floor(Math.random() * dummyImages.length)];
      
      return await updateFrame(frameId, { image_url: randomImage });
    } catch (error) {
      console.error('Error regenerating frame:', error);
      throw error;
    }
  };

  return {
    frames,
    loading,
    uploading,
    generateFrames,
    uploadImage,
    updateFrame,
    deleteFrame,
    regenerateFrame,
    refetch: fetchFrames,
  };
};