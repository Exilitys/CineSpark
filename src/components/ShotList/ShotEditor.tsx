import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Camera, Edit3, Image, Info } from 'lucide-react';
import { Database } from '../../types/database';
import toast from 'react-hot-toast';

type Shot = Database['public']['Tables']['shots']['Row'];

interface ShotEditorProps {
  shot: Shot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (shotId: string, updates: any) => Promise<void>;
}

export const ShotEditor: React.FC<ShotEditorProps> = ({
  shot,
  isOpen,
  onClose,
  onSave
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shot_number: shot?.shot_number || 1,
    scene_number: shot?.scene_number || 1,
    shot_type: shot?.shot_type || 'Wide Shot',
    camera_angle: shot?.camera_angle || 'Eye-level',
    camera_movement: shot?.camera_movement || 'Static',
    description: shot?.description || '',
    lens_recommendation: shot?.lens_recommendation || '',
    estimated_duration: shot?.estimated_duration || 5,
    notes: shot?.notes || '',
  });

  React.useEffect(() => {
    if (shot) {
      setFormData({
        shot_number: shot.shot_number,
        scene_number: shot.scene_number || 1,
        shot_type: shot.shot_type,
        camera_angle: shot.camera_angle,
        camera_movement: shot.camera_movement,
        description: shot.description,
        lens_recommendation: shot.lens_recommendation,
        estimated_duration: shot.estimated_duration || 5,
        notes: shot.notes || '',
      });
    }
  }, [shot]);

  const handleSave = async () => {
    if (!shot) return;

    setSaving(true);
    try {
      await onSave(shot.id, formData);
      toast.success('Shot updated successfully! Photoboard frame will be updated automatically.');
      onClose();
    } catch (error) {
      toast.error('Error updating shot');
    } finally {
      setSaving(false);
    }
  };

  const shotTypes = [
    'Wide Shot',
    'Medium Shot', 
    'Close-up',
    'Extreme Close-up',
    'POV',
    'Over Shoulder'
  ];

  const cameraAngles = [
    'Eye-level',
    'High Angle',
    'Low Angle',
    'Dutch Angle',
    'Bird\'s Eye',
    'Worm\'s Eye'
  ];

  const cameraMovements = [
    'Static',
    'Pan',
    'Tilt',
    'Dolly',
    'Steadicam',
    'Handheld',
    'Crane'
  ];

  return (
    <AnimatePresence>
      {isOpen && shot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-800 rounded-2xl p-6 w-full max-w-4xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cinema-600 rounded-lg flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Shot</h2>
                  <p className="text-gray-400">Shot #{shot.shot_number.toString().padStart(3, '0')} • Scene {shot.scene_number || 1}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photoboard Integration Notice */}
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Image className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium text-sm">Photoboard Integration</h4>
                  <p className="text-blue-300 text-xs mt-1">
                    Changes to this shot will automatically update the corresponding photoboard frame with new technical specifications and annotations.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Edit3 className="h-5 w-5 mr-2" />
                  Shot Details
                </h3>

                {/* Shot Number and Scene Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Shot Number
                    </label>
                    <input
                      type="number"
                      value={formData.shot_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, shot_number: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cinema-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scene Number
                    </label>
                    <input
                      type="number"
                      value={formData.scene_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, scene_number: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cinema-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>

                {/* Shot Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shot Type
                  </label>
                  <select
                    value={formData.shot_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, shot_type: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cinema-500 focus:border-transparent"
                  >
                    {shotTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Camera Angle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Camera Angle
                  </label>
                  <select
                    value={formData.camera_angle}
                    onChange={(e) => setFormData(prev => ({ ...prev, camera_angle: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cinema-500 focus:border-transparent"
                  >
                    {cameraAngles.map(angle => (
                      <option key={angle} value={angle}>{angle}</option>
                    ))}
                  </select>
                </div>

                {/* Camera Movement */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Camera Movement
                  </label>
                  <select
                    value={formData.camera_movement}
                    onChange={(e) => setFormData(prev => ({ ...prev, camera_movement: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cinema-500 focus:border-transparent"
                  >
                    {cameraMovements.map(movement => (
                      <option key={movement} value={movement}>{movement}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column - Technical Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Technical Specifications
                </h3>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shot Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cinema-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Describe the shot composition and action..."
                  />
                </div>

                {/* Lens Recommendation */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lens Recommendation
                  </label>
                  <input
                    type="text"
                    value={formData.lens_recommendation}
                    onChange={(e) => setFormData(prev => ({ ...prev, lens_recommendation: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cinema-500 focus:border-transparent"
                    placeholder="e.g., 50mm standard lens, 24mm wide-angle"
                  />
                </div>

                {/* Estimated Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 5 }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cinema-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Production Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cinema-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Special requirements, lighting notes, props, effects..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-cinema-500 to-cinema-600 hover:from-cinema-600 hover:to-cinema-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};