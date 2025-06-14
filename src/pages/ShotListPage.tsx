import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShotListView } from '../components/ShotList/ShotListView';
import { ShotEditor } from '../components/ShotList/ShotEditor';
import { WorkflowTracker } from '../components/Layout/WorkflowTracker';
import { useShots } from '../hooks/useShots';
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

  const { 
    shots, 
    loading, 
    updateShot, 
    createShot, 
    deleteShot,
    generateShots 
  } = useShots(projectId || null);

  const handleEditShot = (shot: Shot) => {
    setEditingShot(shot);
    setShowEditor(true);
  };

  const handleSaveShot = async (shotId: string, updates: any) => {
    await updateShot(shotId, updates);
  };

  const handleAddShot = async () => {
    try {
      const newShotNumber = Math.max(...shots.map(s => s.shot_number), 0) + 1;
      await createShot({
        shot_number: newShotNumber,
        shot_type: 'Wide Shot',
        camera_angle: 'Eye-level',
        camera_movement: 'Static',
        description: 'New shot description',
        lens_recommendation: '50mm standard lens',
        estimated_duration: 5,
        notes: '',
      });
      toast.success('New shot added successfully!');
    } catch (error) {
      toast.error('Error adding new shot');
    }
  };

  const handleApproveShots = async () => {
    try {
      // If no shots exist, generate them first
      if (shots.length === 0) {
        toast.loading('Generating shot list...', { id: 'generate-shots' });
        await generateShots();
        toast.success('Shot list generated successfully!', { id: 'generate-shots' });
      }
      
      toast.success('Shot list approved! Ready to create storyboard.');
      navigate(`/photoboard/${projectId}`);
    } catch (error) {
      toast.error('Error generating shots');
    }
  };

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
              onClick={handleApproveShots}
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
            onAddShot={handleAddShot}
            onApprove={handleApproveShots}
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
      </div>
    </div>
  );
};