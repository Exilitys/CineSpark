import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Play, Edit3, RefreshCw, Download, Grid3X3, List } from 'lucide-react';
import { PhotoboardFrame } from '../../types';

interface PhotoboardViewProps {
  frames: PhotoboardFrame[];
  onEditFrame?: (frame: PhotoboardFrame) => void;
  onRegenerateFrame?: (frame: PhotoboardFrame) => void;
}

export const PhotoboardView: React.FC<PhotoboardViewProps> = ({ 
  frames, 
  onEditFrame, 
  onRegenerateFrame 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStyle, setSelectedStyle] = useState('all');

  const styles = ['Photorealistic', 'Sketch', 'Comic Book', 'Cinematic', 'Noir'];
  const filteredFrames = selectedStyle === 'all' 
    ? frames 
    : frames.filter(frame => frame.style === selectedStyle);

  const getStyleColor = (style: string) => {
    const colors = {
      'Photorealistic': 'text-blue-400 bg-blue-900/20',
      'Sketch': 'text-green-400 bg-green-900/20',
      'Comic Book': 'text-red-400 bg-red-900/20',
      'Cinematic': 'text-gold-400 bg-gold-900/20',
      'Noir': 'text-gray-400 bg-gray-900/20',
    };
    return colors[style as keyof typeof colors] || 'text-gray-400 bg-gray-900/20';
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
            <p className="text-gray-400">Visual storyboard for your film</p>
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
        </div>
      </div>

      {/* Style Filter */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-300">Style:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStyle('all')}
              className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                selectedStyle === 'all' 
                  ? 'bg-cinema-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Styles
            </button>
            {styles.map(style => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                  selectedStyle === style 
                    ? 'bg-cinema-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Photoboard Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFrames.map((frame, index) => (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden group hover:border-gold-500 transition-colors duration-200"
            >
              <div className="aspect-video bg-gray-700 flex items-center justify-center relative">
                {frame.imageUrl ? (
                  <img 
                    src={frame.imageUrl} 
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
                        onClick={() => onRegenerateFrame(frame)}
                        className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200"
                      >
                        <RefreshCw className="h-4 w-4 text-white" />
                      </button>
                    )}
                    <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200">
                      <Play className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    Shot {frame.shotId}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStyleColor(frame.style)}`}>
                    {frame.style}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {frame.description}
                </p>
                {frame.annotations && frame.annotations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {frame.annotations.slice(0, 2).map((annotation, i) => (
                      <span key={i} className="text-xs bg-gold-900/20 text-gold-400 px-2 py-1 rounded">
                        {annotation}
                      </span>
                    ))}
                    {frame.annotations.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{frame.annotations.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFrames.map((frame, index) => (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gold-500 transition-colors duration-200"
            >
              <div className="flex items-start space-x-6">
                <div className="w-48 h-32 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {frame.imageUrl ? (
                    <img 
                      src={frame.imageUrl} 
                      alt={frame.description}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Generating...</p>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-medium text-white">
                        Shot {frame.shotId}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStyleColor(frame.style)}`}>
                        {frame.style}
                      </span>
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
                          onClick={() => onRegenerateFrame(frame)}
                          className="p-2 text-gray-400 hover:text-gold-400 transition-colors duration-200"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-3">
                    {frame.description}
                  </p>
                  
                  {frame.annotations && frame.annotations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {frame.annotations.map((annotation, i) => (
                        <span key={i} className="text-xs bg-gold-900/20 text-gold-400 px-2 py-1 rounded">
                          {annotation}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredFrames.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No frames found for the selected style.</p>
        </div>
      )}
    </motion.div>
  );
};