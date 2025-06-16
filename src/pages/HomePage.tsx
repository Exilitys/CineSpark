import React from 'react';
import { motion } from 'framer-motion';
import { IdeaInput } from '../components/Home/IdeaInput';
import { Film, Sparkles, Lightbulb, Camera, Image as ImageIcon, FileText } from 'lucide-react';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'AI Story Generation',
      description: 'Transform your concept into a complete narrative with characters, structure, and scenes.',
      color: 'text-blue-400'
    },
    {
      icon: Camera,
      title: 'Professional Shot Lists', 
      description: 'Automatically generate detailed cinematography breakdowns with technical specifications.',
      color: 'text-green-400'
    },
    {
      icon: ImageIcon,
      title: 'Visual Storyboards',
      description: 'Create stunning photoboards with AI-generated imagery in multiple artistic styles.',
      color: 'text-purple-400'
    },
    {
      icon: Sparkles,
      title: 'Collaborative Workflow',
      description: 'Edit, refine, and export your pre-production package for seamless team collaboration.',
      color: 'text-gold-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-900/20 to-gold-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <IdeaInput />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Complete Pre-Production Automation
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From concept to camera-ready, CineSpark AI handles every aspect of pre-production 
            so you can focus on bringing your vision to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gold-500 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${feature.color} bg-opacity-20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-gray-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              How CineSpark AI Works
            </h2>
            <p className="text-xl text-gray-400">
              Transform your idea into a production-ready package in four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Input Concept', description: 'Share your film idea or concept' },
              { step: 2, title: 'AI Generation', description: 'Advanced AI creates your story structure' },
              { step: 3, title: 'Shot Planning', description: 'Automatic shot list and storyboard creation' },
              { step: 4, title: 'Export & Collaborate', description: 'Share with your team and start production' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};