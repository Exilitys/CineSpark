import React from 'react';
import { PhotoboardView } from '../components/Photoboard/PhotoboardView';
import { mockPhotoboardFrames } from '../utils/mockData';
import { PhotoboardFrame } from '../types';

export const PhotoboardPage: React.FC = () => {
  const handleEditFrame = (frame: PhotoboardFrame) => {
    console.log('Edit frame:', frame);
  };

  const handleRegenerateFrame = (frame: PhotoboardFrame) => {
    console.log('Regenerate frame:', frame);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <PhotoboardView 
        frames={mockPhotoboardFrames}
        onEditFrame={handleEditFrame}
        onRegenerateFrame={handleRegenerateFrame}
      />
    </div>
  );
};