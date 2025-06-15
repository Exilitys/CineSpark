import { useState } from 'react';

interface PhotoboardAPIResponse {
  success: boolean;
  data?: {
    photoboard_id: string;
    shot_list_input: string;
    generated_content: string;
    timestamp: string;
    status: 'draft' | 'published';
  };
  error?: string;
  timestamp: string;
}

interface GeneratedPhotoboard {
  frames: Array<{
    shot_id: string;
    shot_number: number;
    scene_number: number;
    description: string;
    style: string;
    image_url: string;
    annotations: string[];
    technical_specs: {
      shot_type: string;
      camera_angle: string;
      camera_movement: string;
      lens_recommendation: string;
    };
  }>;
}

export const usePhotoboardAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePhotoboardFromAPI = async (shotListData: any): Promise<GeneratedPhotoboard | null> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Mock API response - in production, this would be a real API call
      const mockResponse: PhotoboardAPIResponse = {
        success: true,
        data: {
          photoboard_id: `photoboard_${Date.now()}`,
          shot_list_input: JSON.stringify(shotListData),
          generated_content: JSON.stringify(generateMockPhotoboard(shotListData)),
          timestamp: new Date().toISOString(),
          status: 'draft'
        },
        timestamp: new Date().toISOString()
      };

      if (!mockResponse.success || !mockResponse.data) {
        throw new Error(mockResponse.error || 'Failed to generate photoboard');
      }

      const generatedPhotoboard = JSON.parse(mockResponse.data.generated_content) as GeneratedPhotoboard;
      return generatedPhotoboard;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Photoboard generation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateMockPhotoboard = (shotListData: any): GeneratedPhotoboard => {
    const shots = shotListData.shots || [];
    
    // Curated high-quality images for different shot types and scenes
    const imageLibrary = {
      lighthouse: [
        'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      wide_shots: [
        'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      medium_shots: [
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      close_ups: [
        'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pov_shots: [
        'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    };

    const getImageForShot = (shot: any, index: number): string => {
      const shotType = shot.shot_type?.toLowerCase().replace(/\s+/g, '_') || 'medium_shot';
      
      // Check if it's a lighthouse story
      if (shot.description?.toLowerCase().includes('lighthouse') || 
          shot.description?.toLowerCase().includes('marcus') ||
          shot.description?.toLowerCase().includes('naia')) {
        return imageLibrary.lighthouse[index % imageLibrary.lighthouse.length];
      }

      // Select based on shot type
      if (shotType.includes('wide')) {
        return imageLibrary.wide_shots[index % imageLibrary.wide_shots.length];
      } else if (shotType.includes('close')) {
        return imageLibrary.close_ups[index % imageLibrary.close_ups.length];
      } else if (shotType.includes('pov')) {
        return imageLibrary.pov_shots[index % imageLibrary.pov_shots.length];
      } else {
        return imageLibrary.medium_shots[index % imageLibrary.medium_shots.length];
      }
    };

    const generateFrameDescription = (shot: any): string => {
      const style = shot.shot_type === 'POV' ? 'First-person perspective' : 
                   shot.camera_angle === 'High Angle' ? 'Elevated viewpoint' :
                   shot.camera_angle === 'Low Angle' ? 'Dramatic low angle' : 'Standard composition';
      
      return `${shot.shot_type} - ${style} - ${shot.description}`;
    };

    const generateAnnotations = (shot: any): string[] => {
      const baseAnnotations = [
        `Shot ${shot.shot_number.toString().padStart(3, '0')}`,
        `Scene ${shot.scene_number}`,
        shot.shot_type,
        shot.camera_angle,
        shot.camera_movement
      ];

      // Add technical annotations
      if (shot.lens_recommendation) {
        baseAnnotations.push(shot.lens_recommendation);
      }

      if (shot.estimated_duration) {
        baseAnnotations.push(`${shot.estimated_duration}s duration`);
      }

      // Add contextual annotations based on shot content
      if (shot.description?.toLowerCase().includes('emotional')) {
        baseAnnotations.push('Emotional moment');
      }
      if (shot.description?.toLowerCase().includes('action')) {
        baseAnnotations.push('Action sequence');
      }
      if (shot.camera_movement !== 'Static') {
        baseAnnotations.push(`${shot.camera_movement} movement`);
      }

      return baseAnnotations;
    };

    const frames = shots.map((shot: any, index: number) => ({
      shot_id: shot.id || `shot_${shot.shot_number}`,
      shot_number: shot.shot_number,
      scene_number: shot.scene_number,
      description: generateFrameDescription(shot),
      style: 'Cinematic',
      image_url: getImageForShot(shot, index),
      annotations: generateAnnotations(shot),
      technical_specs: {
        shot_type: shot.shot_type,
        camera_angle: shot.camera_angle,
        camera_movement: shot.camera_movement,
        lens_recommendation: shot.lens_recommendation
      }
    }));

    return { frames };
  };

  return {
    generatePhotoboardFromAPI,
    loading,
    error
  };
};