import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoryEditor } from '../components/Story/StoryEditor';
import { WorkflowTracker } from '../components/Layout/WorkflowTracker';
import { useStory } from '../hooks/useStory';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const StoryPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const { 
    story, 
    loading, 
    updateStory, 
    updateCharacter, 
    updateScene 
  } = useStory(projectId || null);

  const handleApproveStory = () => {
    toast.success('Story approved! Ready to generate shot list.');
    navigate(`/shots/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <WorkflowTracker />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-900">
        <WorkflowTracker />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No story found for this project.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </button>
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

        <StoryEditor
          story={story}
          onUpdateStory={updateStory}
          onUpdateCharacter={updateCharacter}
          onUpdateScene={updateScene}
          onSave={handleApproveStory}
        />
      </div>
    </div>
  );
};