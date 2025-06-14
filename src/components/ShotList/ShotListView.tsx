import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit3, Plus, Filter, Download, Check, Trash2 } from 'lucide-react';
import { Database } from '../../types/database';

type Shot = Database['public']['Tables']['shots']['Row'];

interface ShotListViewProps {
  shots: Shot[];
  onEditShot?: (shot: Shot) => void;
  onAddShot?: () => void;
  onApprove?: () => void;
}

export const ShotListView: React.FC<ShotListViewProps> = ({ 
  shots, 
  onEditShot, 
  onAddShot,
  onApprove 
}) => {
  const [filter, setFilter] = useState('all');
  const [selectedScene, setSelectedScene] = useState('all');

  const uniqueScenes = Array.from(new Set(shots.map(shot => shot.scene_id).filter(Boolean)));

  const filteredShots = shots.filter(shot => {
    if (selectedScene === 'all') return true;
    return shot.scene_id === selectedScene;
  });

  const getShotTypeColor = (shotType: string) => {
    const colors = {
      'Wide Shot': 'text-blue-400 bg-blue-900/20',
      'Medium Shot': 'text-green-400 bg-green-900/20',
      'Close-up': 'text-yellow-400 bg-yellow-900/20',
      'Extreme Close-up': 'text-red-400 bg-red-900/20',
      'POV': 'text-purple-400 bg-purple-900/20',
      'Over Shoulder': 'text-orange-400 bg-orange-900/20',
    };
    return colors[shotType as keyof typeof colors] || 'text-gray-400 bg-gray-900/20';
  };

  const totalDuration = filteredShots.reduce((sum, shot) => sum + (shot.estimated_duration || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-cinema-600 rounded-lg flex items-center justify-center">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Shot List</h1>
            <p className="text-gray-400">
              {shots.length} shots • {Math.floor(totalDuration / 60)}m {totalDuration % 60}s total
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          {onAddShot && (
            <button
              onClick={onAddShot}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Shot</span>
            </button>
          )}
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

      {/* Filters */}
      {uniqueScenes.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Filter by scene:</span>
            </div>
            <select
              value={selectedScene}
              onChange={(e) => setSelectedScene(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-1"
            >
              <option value="all">All Scenes</option>
              {uniqueScenes.map(sceneId => (
                <option key={sceneId} value={sceneId}>Scene {sceneId}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Shot List Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Shot #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Shot Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Camera
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredShots.map((shot, index) => (
                <motion.tr
                  key={shot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {shot.shot_number.toString().padStart(3, '0')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShotTypeColor(shot.shot_type)}`}>
                      {shot.shot_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      <div>{shot.camera_angle}</div>
                      <div className="text-xs text-gray-500">{shot.camera_movement}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 max-w-xs">
                      {shot.description}
                    </div>
                    <div className="text-xs text-gold-400 mt-1">
                      {shot.lens_recommendation}
                    </div>
                    {shot.notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        {shot.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{shot.estimated_duration}s</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {onEditShot && (
                        <button
                          onClick={() => onEditShot(shot)}
                          className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                          title="Edit shot"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredShots.length === 0 && shots.length > 0 && (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No shots found for the selected filters.</p>
        </div>
      )}
    </motion.div>
  );
};