import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Play, Edit3, ArrowRight, Sparkles } from 'lucide-react';

interface GeneratedStory {
  logline: string;
  synopsis: string;
  three_act_structure: {
    act1: string;
    act2: string;
    act3: string;
  };
  characters: Array<{
    name: string;
    description: string;
    motivation: string;
    arc: string;
  }>;
  scenes: Array<{
    title: string;
    setting: string;
    description: string;
    characters: string[];
    key_actions: string[];
  }>;
}

interface StoryDisplayProps {
  story: GeneratedStory;
  onCreateProject: () => void;
  onGenerateNew: () => void;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
  story, 
  onCreateProject, 
  onGenerateNew 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-xl"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Your Story Has Been Generated!
        </h2>
        <p className="text-gray-400">
          AI has crafted a complete narrative structure for your film concept
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Story Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gold-400" />
              Logline
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed italic">
              "{story.logline}"
            </p>
          </motion.div>

          {/* Synopsis */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Synopsis</h3>
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
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Play className="h-5 w-5 mr-2 text-cinema-400" />
              Three-Act Structure
            </h3>
            <div className="space-y-6">
              <div className="border-l-4 border-gold-500 pl-4">
                <h4 className="font-semibold text-gold-400 mb-2">Act I - Setup</h4>
                <p className="text-gray-300 leading-relaxed">{story.three_act_structure.act1}</p>
              </div>
              <div className="border-l-4 border-cinema-500 pl-4">
                <h4 className="font-semibold text-cinema-400 mb-2">Act II - Confrontation</h4>
                <p className="text-gray-300 leading-relaxed">{story.three_act_structure.act2}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-400 mb-2">Act III - Resolution</h4>
                <p className="text-gray-300 leading-relaxed">{story.three_act_structure.act3}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
            <div className="space-y-3">
              <button
                onClick={onCreateProject}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Create Project</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={onGenerateNew}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate New Story</span>
              </button>
            </div>
          </motion.div>

          {/* Characters */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-400" />
              Characters
            </h3>
            <div className="space-y-4">
              {story.characters.map((character, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">{character.name}</h4>
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
            <h3 className="text-lg font-semibold text-white mb-4">Scene Breakdown</h3>
            <div className="space-y-3">
              {story.scenes.map((scene, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm mb-1">
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