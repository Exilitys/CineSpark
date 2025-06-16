import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShotListView } from '../components/ShotList/ShotListView';
import { ShotEditor } from '../components/ShotList/ShotEditor';
import { ShotCreator } from '../components/ShotList/ShotCreator';
import { WorkflowTracker } from '../components/Layout/WorkflowTracker';
import { useShots } from '../hooks/useShots';
import { usePhotoboardAPI } from '../hooks/usePhotoboardAPI';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

type Shot = Database['public']['Tables']['shots']['Row'];

export const ShotListPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [generatingPhotoboard, setGeneratingPhotoboard] = useState(false);

  const { 
    shots, 
    loading, 
    updateShot, 
    createShot, 
    deleteShot,
    generateShots,
    refetch
  } = useShots(projectId || null);

  const { generatePhotoboardFromAPI, loading: apiLoading, error: apiError } = usePhotoboardAPI();

  const handleEditShot = (shot: Shot) => {
    setEditingShot(shot);
    setShowEditor(true);
  };

  const handleDeleteShot = async (shotId: string) => {
    try {
      await deleteShot(shotId);
      toast.success('Shot and photoboard frame deleted successfully!');
    } catch (error) {
      toast.error('Error deleting shot');
      throw error; // Re-throw to handle loading state in component
    }
  };

  const handleSaveShot = async (shotId: string, updates: any) => {
    await updateShot(shotId, updates);
  };

  const handleCreateShot = async (shotData: any) => {
    await createShot(shotData);
  };

  const handleAddShot = () => {
    setShowCreator(true);
  };

  const handleUpdateShots = async (updatedShots: Shot[]) => {
    try {
      // Update each shot in the database
      for (const shot of updatedShots) {
        await updateShot(shot.id, {
          shot_number: shot.shot_number,
          scene_number: shot.scene_number,
          shot_type: shot.shot_type,
          camera_angle: shot.camera_angle,
          camera_movement: shot.camera_movement,
          description: shot.description,
          lens_recommendation: shot.lens_recommendation,
          estimated_duration: shot.estimated_duration,
          notes: shot.notes,
        });
      }
      
      // Refresh the shots data
      await refetch();
    } catch (error) {
      console.error('Error updating shots:', error);
      throw error;
    }
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

  const handleApproveShots = async () => {
    setGeneratingPhotoboard(true);
    
    try {
      // If no shots exist, generate them first
      if (shots.length === 0) {
        toast.loading('Generating shot list...', { id: 'generate-shots' });
        await generateShots();
        toast.success('Shot list generated successfully!', { id: 'generate-shots' });
      }
      
      // Step 1: Send shot list data to API for photoboard generation
      toast.loading('Sending shot list to AI for storyboard generation...', { id: 'generate-photoboard' });
      
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
        toast.error('Failed to generate storyboard. Please try again.', { id: 'generate-photoboard' });
        return;
      }

      // Step 2: Save photoboard to database
      toast.loading('Creating storyboard frames in your project...', { id: 'generate-photoboard' });
      
      await createPhotoboardInDatabase(generatedPhotoboard);
      
      toast.success('Storyboard generated successfully!', { id: 'generate-photoboard' });
      
      // Step 3: Navigate to photoboard page
      navigate(`/photoboard/${projectId}`);
      
    } catch (error) {
      console.error('Error in photoboard generation process:', error);
      toast.error('Error generating storyboard. Please try again.', { id: 'generate-photoboard' });
    } finally {
      setGeneratingPhotoboard(false);
    }
  };

  const handleGenerateShots = async () => {
    try {
      toast.loading('Generating shot list...', { id: 'generate-shots' });
      await generateShots();
      toast.success('Shot list generated successfully!', { id: 'generate-shots' });
    } catch (error) {
      console.error('Error generating shots:', error);
      toast.error('Error generating shots. Please try again.', { id: 'generate-shots' });
    }
  };

  const isCurrentlyGenerating = generatingPhotoboard || apiLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <WorkflowTracker />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading shot list...</p>
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

        {shots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-cinema-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Generate Shot List</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Ready to create your cinematography breakdown? We'll generate a professional shot list based on your story.
            </p>
            <button
              onClick={handleGenerateShots}
              className="bg-gradient-to-r from-cinema-500 to-cinema-600 hover:from-cinema-600 hover:to-cinema-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Camera className="h-5 w-5" />
              <span>Generate Shot List</span>
            </button>
          </motion.div>
        ) : (
          <ShotListView 
            shots={shots} 
            onEditShot={handleEditShot}
            onDeleteShot={handleDeleteShot}
            onAddShot={handleAddShot}
            onApprove={handleApproveShots}
            onUpdateShots={handleUpdateShots}
          />
        )}

        <ShotEditor
          shot={editingShot}
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingShot(null);
          }}
          onSave={handleSaveShot}
        />

        <ShotCreator
          isOpen={showCreator}
          onClose={() => setShowCreator(false)}
          onCreateShot={handleCreateShot}
          existingShots={shots}
        />
      </div>
    </div>
  );
};