import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Play, Edit3, RefreshCw, Download, Grid3X3, List, Check, Upload, X } from 'lucide-react';
import { Database } from '../../types/database';
import { useCredits } from '../../hooks/useCredits';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedScene, setSelectedScene] = useState('all');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  
  const { canPerformAction, getCreditCost, refetch: refetchCredits } = useCredits();

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
      className="max-w-7xl mx-auto p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-cinema-600 rounded-lg flex items-center justify-center">
            <Image className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Photoboard</h1>
            <p className="text-gray-400">
              {frames.length} frames • {uniqueScenes.length} scenes • Visual storyboard for your film
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
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
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Export Board</span>
          </button>
          {onApprove && (
            <button
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Check className="h-4 w-4" />
              <span>Approve & Continue</span>
            </button>
          )}
        </div>
      </div>

      {/* Scene Filter Only */}
      {uniqueScenes.length > 1 && (
        <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-300">Scene:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedScene('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
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
                    className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {shot && (
                        <>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSceneColor(shot.scene_number || 1)}`}>
                            Scene {shot.scene_number || 1}
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
                    <div className="mb-3">
                      <p className="text-sm text-white font-medium mb-1">
                        {shot.shot_type} • {shot.camera_angle}
                      </p>
                      <p className="text-sm text-gray-300 line-clamp-3">
                        {shot.description}
                      </p>
                      {shot.lens_recommendation && (
                        <p className="text-xs text-gold-400 mt-1">
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
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gold-500 transition-colors duration-200"
              >
                <div className="flex items-start space-x-6">
                  <div 
                    className={`w-48 h-32 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center relative ${
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {shot && (
                          <>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSceneColor(shot.scene_number || 1)}`}>
                              Scene {shot.scene_number || 1}
                            </span>
                            <span className="text-lg font-medium text-white">
                              Shot {shot.shot_number.toString().padStart(3, '0')}
                            </span>
                            <span className="text-sm text-gray-400">
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
                      <div className="mb-3">
                        <p className="text-gray-300 mb-2">
                          {shot.description}
                        </p>
                        {shot.lens_recommendation && (
                          <p className="text-sm text-gold-400">
                            <span className="font-medium">Lens:</span> {shot.lens_recommendation}
                          </p>
                        )}
                        {shot.estimated_duration && (
                          <p className="text-sm text-gray-400">
                            <span className="font-medium">Duration:</span> {shot.estimated_duration}s
                          </p>
                        )}
                        {shot.notes && (
                          <p className="text-sm text-gray-500 mt-1">
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