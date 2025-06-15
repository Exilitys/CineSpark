import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhotoboardView } from '../components/Photoboard/PhotoboardView';
import { WorkflowTracker } from '../components/Layout/WorkflowTracker';
import { usePhotoboard } from '../hooks/usePhotoboard';
import { useShots } from '../hooks/useShots';
import { usePhotoboardAPI } from '../hooks/usePhotoboardAPI';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const PhotoboardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { 
    frames, 
    loading: framesLoading, 
    uploading,
    uploadImage, 
    updateFrame, 
    regenerateFrame 
  } = usePhotoboard(projectId || null);

  const { 
    shots, 
    loading: shotsLoading 
  } = useShots(projectId || null);

  const { generatePhotoboardFromAPI, loading: apiLoading } = usePhotoboardAPI();

  const loading = framesLoading || shotsLoading;

  const handleEditFrame = (frame: any) => {
    console.log('Edit frame:', frame);
    // TODO: Implement frame editing modal
  };

  const handleRegenerateFrame = async (frame: any) => {
    try {
      toast.loading('Regenerating frame...', { id: 'regenerate' });
      await regenerateFrame(frame.id);
      toast.success('Frame regenerated successfully!', { id: 'regenerate' });
    } catch (error) {
      toast.error('Error regenerating frame', { id: 'regenerate' });
    }
  };

  const handleUploadImage = async (frameId: string, file: File) => {
    try {
      toast.loading('Uploading image...', { id: 'upload' });
      await uploadImage(frameId, file);
      toast.success('Image uploaded successfully!', { id: 'upload' });
    } catch (error) {
      toast.error('Error uploading image', { id: 'upload' });
    }
  };

  const handleApproveStoryboard = () => {
    toast.success('Storyboard approved! Ready for export.');
    navigate(`/export/${projectId}`);
  };

  const createPhotoboardInDatabase = async (photoboardData: any) => {
    try {
      const framesToInsert = photoboardData.frames.map((frame: any) => {
        // Find the corresponding shot in our database
        const correspondingShot = shots.find(shot => shot.shot_number === frame.shot_number);
        
        return {
          project_id: projectId,
          shot_id: correspondingShot?.id || null,
          description: frame.description,
          style: frame.style,
          annotations: frame.annotations,
          image_url: frame.image_url,
        };
      });

      const { data, error } = await supabase
        .from('photoboard_frames')
        .insert(framesToInsert)
        .select();

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error creating photoboard in database:', error);
      throw error;
    }
  };

  const handleGenerateFrames = async () => {
    try {
      toast.loading('Sending shot list to AI for storyboard generation...', { id: 'generate-frames' });
      
      const shotListData = {
        shots: shots.map(shot => ({
          id: shot.id,
          shot_number: shot.shot_number,
          scene_number: shot.scene_number,
          shot_type: shot.shot_type,
          camera_angle: shot.camera_angle,
          camera_movement: shot.camera_movement,
          description: shot.description,
          lens_recommendation: shot.lens_recommendation,
          estimated_duration: shot.estimated_duration,
          notes: shot.notes
        }))
      };

      const generatedPhotoboard = await generatePhotoboardFromAPI(shotListData);
      
      if (!generatedPhotoboard) {
        toast.error('Failed to generate storyboard. Please try again.', { id: 'generate-frames' });
        return;
      }

      toast.loading('Creating storyboard frames in your project...', { id: 'generate-frames' });
      
      await createPhotoboardInDatabase(generatedPhotoboard);
      
      toast.success('Storyboard frames generated successfully!', { id: 'generate-frames' });
      
      // Refresh the page to show new frames
      window.location.reload();
      
    } catch (error) {
      toast.error('Error generating frames', { id: 'generate-frames' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <WorkflowTracker />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading photoboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <WorkflowTracker />
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </button>
        </motion.div>

        {frames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-cinema-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Generate Storyboard</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Ready to visualize your shots? We'll generate a professional storyboard with AI-created images based on your shot list.
            </p>
            <button
              onClick={handleGenerateFrames}
              disabled={apiLoading}
              className="bg-gradient-to-r from-cinema-500 to-cinema-600 hover:from-cinema-600 hover:to-cinema-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              {apiLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5" />
                  <span>Generate Storyboard</span>
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <PhotoboardView 
            frames={frames}
            shots={shots}
            uploading={uploading}
            onEditFrame={handleEditFrame}
            onRegenerateFrame={handleRegenerateFrame}
            onUploadImage={handleUploadImage}
            onApprove={handleApproveStoryboard}
          />
        )}
      </div>
    </div>
  );
};