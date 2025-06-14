import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Play, Edit3 } from 'lucide-react';
import { Story } from '../../types';

interface StoryDashboardProps {
  story: Story;
  onEdit?: () => void;
}

export const StoryDashboard: React.FC<StoryDashboardProps> = ({ story, onEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-cinema-600 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Story Development</h1>
            <p className="text-gray-400">Your narrative foundation</p>
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Story</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logline & Synopsis */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Logline</h2>
            <p className="text-gray-300 text-lg leading-relaxed italic">
              "{story.logline}"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed">
              {story.synopsis}
            </p>
          </motion.div>

          {/* Three-Act Structure */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Three-Act Structure
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-gold-500 pl-4">
                <h3 className="font-semibold text-gold-400 mb-2">Act I - Setup</h3>
                <p className="text-gray-300 leading-relaxed">{story.threeActStructure.act1}</p>
              </div>
              <div className="border-l-4 border-cinema-500 pl-4">
                <h3 className="font-semibold text-cinema-400 mb-2">Act II - Confrontation</h3>
                <p className="text-gray-300 leading-relaxed">{story.threeActStructure.act2}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-green-400 mb-2">Act III - Resolution</h3>
                <p className="text-gray-300 leading-relaxed">{story.threeActStructure.act3}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Characters */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Characters
            </h2>
            <div className="space-y-4">
              {story.characters.map((character, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">{character.name}</h3>
                  <p className="text-sm text-gray-300 mb-2">{character.description}</p>
                  <div className="text-xs text-gray-400">
                    <p><span className="font-medium">Motivation:</span> {character.motivation}</p>
                    <p><span className="font-medium">Arc:</span> {character.arc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scene Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Scene Breakdown</h2>
            <div className="space-y-3">
              {story.scenes.map((scene, index) => (
                <div key={scene.id} className="bg-gray-700 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm">
                    Scene {index + 1}: {scene.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-1">{scene.setting}</p>
                  <p className="text-xs text-gray-300">{scene.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};