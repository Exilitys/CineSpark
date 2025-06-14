import React from 'react';
import { ShotListView } from '../components/ShotList/ShotListView';
import { mockShots } from '../utils/mockData';
import { Shot } from '../types';

export const ShotListPage: React.FC = () => {
  const handleEditShot = (shot: Shot) => {
    console.log('Edit shot:', shot);
  };

  const handleAddShot = () => {
    console.log('Add new shot');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <ShotListView 
        shots={mockShots} 
        onEditShot={handleEditShot}
        onAddShot={handleAddShot}
      />
    </div>
  );
};