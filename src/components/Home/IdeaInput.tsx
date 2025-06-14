import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import toast from 'react-hot-toast';

interface IdeaInputProps {
  onGenerate: (idea: string) => void;
  isGenerating?: boolean;
}

export const IdeaInput: React.FC<IdeaInputProps> = ({ onGenerate, isGenerating = false }) => {
  const [idea, setIdea] = useState('');
  const { user } = useAuth();
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isGenerating) return;

    if (!user) {
      toast.error('Please sign in to create a project');
      return;
    }

    try {
      onGenerate(idea.trim());
      
      // Create project in database
      const project = await createProject({
        title: `Project: ${idea.substring(0, 50)}${idea.length > 50 ? '...' : ''}`,
        description: 'AI-generated film project',
        original_idea: idea.trim(),
      });

      // Show generation progress
      toast.loading('Analyzing your concept...', { id: 'generation' });
      
      setTimeout(() => {
        toast.loading('Creating story structure...', { id: 'generation' });
      }, 1000);
      
      setTimeout(() => {
        toast.loading('Generating characters and scenes...', { id: 'generation' });
      }, 2000);
      
      setTimeout(() => {
        toast.success('Story generated! Review and edit as needed.', { id: 'generation' });
        // Navigate to story page with project ID as route parameter
        navigate(`/story/${project.id}`);
      }, 3000);

    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error creating project. Please try again.');
    }
  };

  const exampleIdeas = [
    "A lonely lighthouse keeper discovers a mysterious creature from the deep",
    "Two rival food truck owners fall in love during a city-wide festival",
    "A time traveler gets stuck in a small town and must solve a decades-old mystery",
    "An AI assistant develops consciousness and questions its purpose"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full mb-6 shadow-xl"
        >
          <Lightbulb className="h-10 w-10 text-white" />
        </motion.div>
        
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">Film Idea</span>
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
          From a single sentence to a complete pre-production package. 
          Let AI craft your story, shot list, and storyboard in minutes.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700"
      >
        <label htmlFor="idea-input" className="block text-sm font-medium text-gray-300 mb-4">
          Describe your film concept
        </label>
        
        <div className="relative">
          <textarea
            id="idea-input"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Enter your film idea here... A single sentence or detailed paragraph works perfectly."
            className="w-full px-6 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none transition-all duration-200"
            rows={4}
            disabled={isGenerating}
          />
          
          <motion.button
            type="submit"
            disabled={!idea.trim() || isGenerating || !user}
            className="absolute bottom-4 right-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate Story</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>

        {!user && (
          <p className="text-sm text-gray-400 mt-3">
            Please sign in to create and save your projects.
          </p>
        )}
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12"
      >
        <h3 className="text-lg font-medium text-gray-300 mb-6 text-center">
          Need inspiration? Try one of these ideas:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleIdeas.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => setIdea(example)}
              className="text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gold-500 rounded-lg transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-gray-300 group-hover:text-white transition-colors duration-200">
                "{example}"
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};