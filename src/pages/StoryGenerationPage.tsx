import React from 'react';
import { StoryGenerator } from '../components/StoryGeneration/StoryGenerator';

export const StoryGenerationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <StoryGenerator />
    </div>
  );
};