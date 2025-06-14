import React from 'react';
import { StoryDashboard } from '../components/Story/StoryDashboard';
import { mockStory } from '../utils/mockData';

export const StoryPage: React.FC = () => {
  const handleEditStory = () => {
    console.log('Edit story functionality');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <StoryDashboard story={mockStory} onEdit={handleEditStory} />
    </div>
  );
};