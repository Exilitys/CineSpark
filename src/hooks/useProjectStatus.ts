import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProjectStatus {
  story: {
    completed: boolean;
    inProgress: boolean;
    count: number;
  };
  shots: {
    completed: boolean;
    inProgress: boolean;
    count: number;
  };
  photoboard: {
    completed: boolean;
    inProgress: boolean;
    count: number;
  };
}

export const useProjectStatus = (projectId: string) => {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectStatus();
    }
  }, [projectId]);

  const fetchProjectStatus = async () => {
    try {
      setLoading(true);

      // Check story status
      const { data: stories, error: storyError } = await supabase
        .from('stories')
        .select('id, logline, synopsis')
        .eq('project_id', projectId);

      if (storyError) throw storyError;

      // Check shots status
      const { data: shots, error: shotsError } = await supabase
        .from('shots')
        .select('id')
        .eq('project_id', projectId);

      if (shotsError) throw shotsError;

      // Check photoboard status
      const { data: frames, error: framesError } = await supabase
        .from('photoboard_frames')
        .select('id')
        .eq('project_id', projectId);

      if (framesError) throw framesError;

      // Determine status for each component
      const storyStatus = {
        completed: stories && stories.length > 0 && stories[0].logline && stories[0].synopsis,
        inProgress: stories && stories.length > 0 && (!stories[0].logline || !stories[0].synopsis),
        count: stories?.length || 0
      };

      const shotsStatus = {
        completed: shots && shots.length >= 3, // Consider completed if at least 3 shots
        inProgress: shots && shots.length > 0 && shots.length < 3,
        count: shots?.length || 0
      };

      const photoboardStatus = {
        completed: frames && frames.length >= 3, // Consider completed if at least 3 frames
        inProgress: frames && frames.length > 0 && frames.length < 3,
        count: frames?.length || 0
      };

      setStatus({
        story: storyStatus,
        shots: shotsStatus,
        photoboard: photoboardStatus
      });

    } catch (error) {
      console.error('Error fetching project status:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    refetch: fetchProjectStatus
  };
};