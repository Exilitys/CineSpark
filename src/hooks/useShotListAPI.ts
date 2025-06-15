import { useState } from 'react';

interface ShotListAPIResponse {
  success: boolean;
  data?: {
    shot_list_id: string;
    story_input: string;
    generated_content: string;
    timestamp: string;
    status: 'draft' | 'published';
  };
  error?: string;
  timestamp: string;
}

interface GeneratedShotList {
  shots: Array<{
    shot_number: number;
    scene_number: number;
    shot_type: string;
    camera_angle: string;
    camera_movement: string;
    description: string;
    lens_recommendation: string;
    estimated_duration: number;
    notes: string;
  }>;
}

export const useShotListAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateShotListFromAPI = async (storyData: any): Promise<GeneratedShotList | null> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock API response - in production, this would be a real API call
      const mockResponse: ShotListAPIResponse = {
        success: true,
        data: {
          shot_list_id: `shotlist_${Date.now()}`,
          story_input: JSON.stringify(storyData),
          generated_content: JSON.stringify(generateMockShotList(storyData)),
          timestamp: new Date().toISOString(),
          status: 'draft'
        },
        timestamp: new Date().toISOString()
      };

      if (!mockResponse.success || !mockResponse.data) {
        throw new Error(mockResponse.error || 'Failed to generate shot list');
      }

      const generatedShotList = JSON.parse(mockResponse.data.generated_content) as GeneratedShotList;
      return generatedShotList;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Shot list generation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateMockShotList = (storyData: any): GeneratedShotList => {
    // Generate contextual shot list based on story content
    const sceneCount = storyData.scenes?.length || 3;
    const isLighthouseStory = storyData.logline?.toLowerCase().includes('lighthouse') || 
                             storyData.synopsis?.toLowerCase().includes('lighthouse');

    if (isLighthouseStory) {
      return {
        shots: [
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
        ]
      };
    }

    // Generate generic shot list based on story structure
    const shots = [];
    let shotNumber = 1;

    for (let sceneIndex = 0; sceneIndex < sceneCount; sceneIndex++) {
      const sceneNumber = sceneIndex + 1;
      const scene = storyData.scenes?.[sceneIndex];
      
      // Establishing shot for each scene
      shots.push({
        shot_number: shotNumber++,
        scene_number: sceneNumber,
        shot_type: 'Wide Shot',
        camera_angle: 'Eye-level',
        camera_movement: 'Static',
        description: `Establishing shot of ${scene?.setting || 'the scene location'}`,
        lens_recommendation: '24mm wide-angle lens',
        estimated_duration: 6,
        notes: 'Set the scene and location'
      });

      // Character introduction/action shot
      shots.push({
        shot_number: shotNumber++,
        scene_number: sceneNumber,
        shot_type: 'Medium Shot',
        camera_angle: 'Eye-level',
        camera_movement: 'Pan',
        description: scene?.description || `Characters interact in scene ${sceneNumber}`,
        lens_recommendation: '50mm standard lens',
        estimated_duration: 10,
        notes: 'Focus on character interaction'
      });

      // Close-up for emotional moments
      if (sceneIndex === Math.floor(sceneCount / 2) || sceneIndex === sceneCount - 1) {
        shots.push({
          shot_number: shotNumber++,
          scene_number: sceneNumber,
          shot_type: 'Close-up',
          camera_angle: 'Eye-level',
          camera_movement: 'Static',
          description: `Close-up reaction shot capturing emotional moment in scene ${sceneNumber}`,
          lens_recommendation: '85mm portrait lens',
          estimated_duration: 4,
          notes: 'Capture emotional intensity'
        });
      }
    }

    return { shots };
  };

  return {
    generateShotListFromAPI,
    loading,
    error
  };
};