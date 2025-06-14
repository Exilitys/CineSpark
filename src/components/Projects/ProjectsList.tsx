import React from 'react';
import { motion } from 'framer-motion';
import { Film, Calendar, Edit3, Trash2, Plus } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const ProjectsList: React.FC = () => {
  const { projects, loading, deleteProject } = useProjects();
  const { user } = useAuth();

  const handleDeleteProject = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await deleteProject(id);
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error('Error deleting project');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Film className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Sign in to view your projects</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading your projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">No projects yet. Create your first film project!</p>
        <button className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
          <Plus className="h-4 w-4" />
          <span>Create Project</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Projects</h1>
          <p className="text-gray-400">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gold-500 transition-all duration-200 group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-cinema-600 rounded-lg flex items-center justify-center">
                  <Film className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="p-2 text-gray-400 hover:text-gold-400 transition-colors duration-200">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id, project.title)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                {project.title}
              </h3>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {project.original_idea}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDate(project.created_at)}</span>
                </div>
                <span>Updated {formatDate(project.updated_at)}</span>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-700/50 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>Story ✓</span>
                  <span>Shots ✓</span>
                  <span>Board ✓</span>
                </div>
                <button className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors duration-200">
                  Open →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};