import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShotListView } from '../components/ShotList/ShotListView';
import { WorkflowTracker } from '../components/Layout/WorkflowTracker';
import { mockShots } from '../utils/mockData';
import { Shot } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export const ShotListPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const handleEditShot = (shot: Shot) => {
    console.log('Edit shot:', shot);
  };

  const handleAddShot = () => {
    console.log('Add new shot');
  };

  const handleApproveShots = () => {
    navigate(`/photoboard/${projectId}`);
  };

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

        <ShotListView 
          shots={mockShots} 
          onEditShot={handleEditShot}
          onAddShot={handleAddShot}
          onApprove={handleApproveShots}
        />
      </div>
    </div>
  );
};