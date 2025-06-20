import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Play, Edit3, RefreshCw, Download, Grid3X3, List, Check, Upload, X } from 'lucide-react';
import { Database } from '../../types/database';
import { useCredits } from '../../hooks/useCredits';
import { usePDFExport } from '../../hooks/usePDFExport';
import { useProjects } from '../../hooks/useProjects';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

type PhotoboardFrame = Database['public']['Tables']['photoboard_frames']['Row'];

interface PhotoboardViewProps {
  frames: PhotoboardFrame[];
  shots?: any[]; // Add shots prop to get shot details
  uploading?: string | null;
  onEditFrame?: (frame: PhotoboardFrame) => void;
  onRegenerateFrame?: (frame: PhotoboardFrame) => void;
  onUploadImage?: (frameId: string, file: File) => Promise<void>;
  onApprove?: () => void;
}

export const PhotoboardView: React.FC<PhotoboardViewProps> = ({ 
  frames, 
  shots = [],
  uploading,
  onEditFrame, 
  onRegenerateFrame,
  onUploadImage,
  onApprove 
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedScene, setSelectedScene] = useState('all');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  
  const { canPerformAction, getCreditCost, refetch: refetchCredits } = useCredits();
  const { exportPhotoboardPDF, exportingPhotoboard } = usePDFExport();
  const { projects } = useProjects();

  // Get project details for export
  const currentProject = projects.find(p => p.id === projectId);
  const projectName = currentProject?.title || 'Untitled Project';

  // Get unique scenes from shots
  const uniqueScenes = Array.from(new Set(shots.map(shot => shot.scene_number).filter(Boolean)));
  uniqueScenes.sort((a, b) => a - b);

  // Filter frames by scene only (no style filter)
  const filteredFrames = frames.filter(frame => {
    const shot = shots.find(s => s.id === frame.shot_id);
    const sceneMatch = selectedScene === 'all' || (shot && shot.scene_number === parseInt(selectedScene));
    return sceneMatch;
  });

  // Helper function to get shot details for a frame
  const getShotDetails = (frame: PhotoboardFrame) => {
    const shot = shots.find(s => s.id === frame.shot_id);
    return shot || null;
  };

  const getSceneColor = (sceneNumber: number) => {
    const colors = [
      'text-gold-400 bg-gold-900/20',
      'text-cinema-400 bg-cinema-900/20', 
      'text-green-400 bg-green-900/20',
      'text-purple-400 bg-purple-900/20',
      'text-red-400 bg-red-900/20',
    ];
    return colors[(sceneNumber - 1) % colors.length] || 'text-gray-400 bg-gray-900/20';
  };

  const handleFileUpload = async (frameId: string, file: File) => {
    if (!onUploadImage) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      await onUploadImage(frameId, file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image. Please try again.');
    }
  };

  const handleRegenerateFrame = async (frame: PhotoboardFrame) => {
    if (!onRegenerateFrame) return;

    // Check if user can perform regeneration
    const canRegenerate = await canPerformAction('PHOTOBOARD_REGENERATION');
    if (!canRegenerate) {
      toast.error(`Insufficient credits. You need ${getCreditCost('PHOTOBOARD_REGENERATION')} credits to regenerate a frame.`);
      return;
    }

    setRegenerating(frame.id);
    try {
      await onRegenerateFrame(frame);
      // Refresh credits display
      await refetchCredits();
    } catch (error) {
      console.error('Regeneration error:', error);
    } finally {
      setRegenerating(null);
    }
  };

  const handleExportPhotoboard = async () => {
    try {
      // Prepare photoboard data in the format expected by your Python API
      const photoboardData = frames.map(frame => {
        const shot = getShotDetails(frame);
        
        return {
          shot_id: frame.shot_id || frame.id,
          shot_number: shot?.shot_number || 1,
          scene_number: shot?.scene_number || 1,
          description: frame.description,
          style: frame.style,
          image_url: frame.image_url || '',
          annotations: frame.annotations || [],
          technical_specs: {
            shot_type: shot?.shot_type || 'Medium Shot',
            camera_angle: shot?.camera_angle || 'Eye-level',
            camera_movement: shot?.camera_movement || 'Static',
            lens_recommendation: shot?.lens_recommendation || '50mm standard lens'
          }
        };
      });

      console.log('📋 Exporting photoboard data:', {
        project_name: projectName,
        frames_count: photoboardData.length,
        sample_frame: photoboardData[0]
      });

      await exportPhotoboardPDF(projectName, photoboardData);
    } catch (error) {
      console.error('Error exporting photoboard PDF:', error);
      toast.error('Failed to export photoboard PDF');
    }
  };

  const handleDrop = (e: React.DragEvent, frameId: string) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(frameId, files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent, frameId: string) => {
    e.preventDefault();
    setDragOver(frameId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cinema-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Image className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white">Photoboard</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              {frames.length} frames • {uniqueScenes.length} scenes • Visual storyboard for your film
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-cinema-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-cinema-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={handleExportPhotoboard}
            disabled={exportingPhotoboard || frames.length === 0}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
          >
            {exportingPhotoboard ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Exporting...</span>
                <span className="sm:hidden">Export...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </button>
          {onApprove && (
            <button
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Approve & Continue</span>
              <span className="sm:hidden">Approve</span>
            </button>
          )}
        </div>
      </div>

      {/* Scene Filter Only */}
      {uniqueScenes.length > 1 && (
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-700 overflow-x-auto hide-scrollbar">
          <div className="flex flex-nowrap items-center gap-3 sm:gap-4 min-w-max">
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">Scene:</span>
              <div className="flex flex-nowrap gap-2">
                <button
                  onClick={() => setSelectedScene('all')}
                  className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap ${
                    selectedScene === 'all' 
                      ? 'bg-cinema-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All Scenes
                </button>
                {uniqueScenes.map(sceneNum => (
                  <button
                    key={sceneNum}
                    onClick={() => setSelectedScene(sceneNum.toString())}
                    className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap ${
                      selectedScene === sceneNum.toString() 
                        ? 'bg-cinema-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Scene {sceneNum}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photoboard Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredFrames.map((frame, index) => {
            const shot = getShotDetails(frame);
            
            return (
              <motion.div
                key={frame.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden group hover:border-gold-500 transition-colors duration-200"
              >
                <div 
                  className={`aspect-video bg-gray-700 flex items-center justify-center relative ${
                    dragOver === frame.id ? 'border-2 border-dashed border-gold-500 bg-gold-900/20' : ''
                  }`}
                  onDrop={(e) => handleDrop(e, frame.id)}
                  onDragOver={(e) => handleDragOver(e, frame.id)}
                  onDragLeave={handleDragLeave}
                >
                  {uploading === frame.id ? (
                    <div className="text-center p-4">
                      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Uploading...</p>
                    </div>
                  ) : regenerating === frame.id ? (
                    <div className="text-center p-4">
                      <div className="w-8 h-8 border-2 border-cinema-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Regenerating...</p>
                    </div>
                  ) : frame.image_url ? (
                    <img 
                      src={frame.image_url} 
                      alt={frame.description}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Image className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Generating image...</p>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center space-x-2">
                      {/* Upload Button */}
                      <label className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 cursor-pointer">
                        <Upload className="h-4 w-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(frame.id, file);
                          }}
                        />
                      </label>
                      
                      {onEditFrame && (
                        <button
                          onClick={() => onEditFrame(frame)}
                          className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200"
                        >
                          <Edit3 className="h-4 w-4 text-white" />
                        </button>
                      )}
                      {onRegenerateFrame && (
                        <button
                          onClick={() => handleRegenerateFrame(frame)}
                          disabled={regenerating === frame.id}
                          className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={`Regenerate frame (${getCreditCost('PHOTOBOARD_REGENERATION')} credits)`}
                        >
                          <RefreshCw className={`h-4 w-4 text-white ${regenerating === frame.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200">
                        <Play className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Drag overlay */}
                  {dragOver === frame.id && (
                    <div className="absolute inset-0 bg-gold-500 bg-opacity-20 flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gold-400 mx-auto mb-2" />
                        <p className="text-gold-400 font-medium">Drop image here</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center space-x-2">
                      {shot && (
                        <>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSceneColor(shot.scene_number || 1)}`}>
                            {shot.scene_number || 1}
                          </span>
                          <span className="text-xs font-medium text-gray-400">
                            Shot {shot.shot_number.toString().padStart(3, '0')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Shot Description from Shot List */}
                  {shot && (
                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs sm:text-sm text-white font-medium mb-1">
                        {shot.shot_type} • {shot.camera_angle}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                        {shot.description}
                      </p>
                      {shot.lens_recommendation && (
                        <p className="text-xs text-gold-400 mt-1 hidden sm:block">
                          {shot.lens_recommendation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFrames.map((frame, index) => {
            const shot = getShotDetails(frame);
            
            return (
              <motion.div
                key={frame.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 hover:border-gold-500 transition-colors duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:space-x-6">
                  <div 
                    className={`w-full sm:w-48 h-32 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center relative ${
                      dragOver === frame.id ? 'border-2 border-dashed border-gold-500 bg-gold-900/20' : ''
                    }`}
                    onDrop={(e) => handleDrop(e, frame.id)}
                    onDragOver={(e) => handleDragOver(e, frame.id)}
                    onDragLeave={handleDragLeave}
                  >
                    {uploading === frame.id ? (
                      <div className="text-center">
                        <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </div>
                    ) : regenerating === frame.id ? (
                      <div className="text-center">
                        <div className="w-6 h-6 border-2 border-cinema-500 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Regenerating...</p>
                      </div>
                    ) : frame.image_url ? (
                      <img 
                        src={frame.image_url} 
                        alt={frame.description}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Image className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Generating...</p>
                      </div>
                    )}

                    {/* Upload overlay for list view */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 rounded-lg">
                      <label className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 cursor-pointer">
                        <Upload className="h-4 w-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(frame.id, file);
                          }}
                        />
                      </label>
                    </div>

                    {/* Drag overlay */}
                    {dragOver === frame.id && (
                      <div className="absolute inset-0 bg-gold-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <Upload className="h-6 w-6 text-gold-400 mx-auto mb-1" />
                          <p className="text-xs text-gold-400 font-medium">Drop here</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {shot && (
                          <>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSceneColor(shot.scene_number || 1)}`}>
                              Scene {shot.scene_number || 1}
                            </span>
                            <span className="text-sm sm:text-lg font-medium text-white">
                              Shot {shot.shot_number.toString().padStart(3, '0')}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-400">
                              {shot.shot_type} • {shot.camera_angle}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {onEditFrame && (
                          <button
                            onClick={() => onEditFrame(frame)}
                            className="p-2 text-gray-400 hover:text-gold-400 transition-colors duration-200"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        {onRegenerateFrame && (
                          <button
                            onClick={() => handleRegenerateFrame(frame)}
                            disabled={regenerating === frame.id}
                            className="p-2 text-gray-400 hover:text-gold-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Regenerate frame (${getCreditCost('PHOTOBOARD_REGENERATION')} credits)`}
                          >
                            <RefreshCw className={`h-4 w-4 ${regenerating === frame.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Shot Description from Shot List */}
                    {shot && (
                      <div className="mb-2 sm:mb-3">
                        <p className="text-xs sm:text-sm text-gray-300 line-clamp-3">
                          {shot.description}
                        </p>
                        {shot.lens_recommendation && (
                          <p className="text-xs sm:text-sm text-gold-400 mt-1">
                            <span className="font-medium">Lens:</span> {shot.lens_recommendation}
                          </p>
                        )}
                        {shot.estimated_duration && (
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            <span className="font-medium">Duration:</span> {shot.estimated_duration}s
                          </p>
                        )}
                        {shot.notes && (
                          <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                            <span className="font-medium">Notes:</span> {shot.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredFrames.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No frames found for the selected scene.</p>
        </div>
      )}
    </motion.div>
  );
};