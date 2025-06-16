import React from 'react';
import { ProjectsList } from '../components/Projects/ProjectsList';

export const ProjectsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <ProjectsList />
    </div>
  );
};