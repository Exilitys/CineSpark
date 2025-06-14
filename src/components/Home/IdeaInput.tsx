import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface IdeaInputProps {
  isGenerating?: boolean;
}

export const IdeaInput: React.FC<IdeaInputProps> = ({ isGenerating = false }) => {
  const [idea, setIdea] = useState('');
  const [localGenerating, setLocalGenerating] = useState(false);
  const { user } = useAuth();
  const { createProject } = useProjects();
  const navigate = useNavigate();

  const getDummyStoryData = () => ({
    logline: "A lonely lighthouse keeper discovers a mysterious sea creature that challenges everything he believes about isolation and connection.",
    synopsis: "Marcus, a reclusive lighthouse keeper on a remote island, has spent five years in solitude after a tragic accident. His monotonous routine is shattered when he discovers Naia, a wounded sea creature with intelligence beyond human understanding. As Marcus nurses Naia back to health, he learns that she comes from an ancient underwater civilization facing extinction due to ocean pollution. Together, they must overcome their fear of the outside world to save both their species, discovering that true connection transcends the boundaries of species and solitude.",
    three_act_structure: {
      act1: "Marcus maintains his isolated routine at the lighthouse, haunted by memories of the accident. During a fierce storm, he discovers Naia washed ashore, injured and unlike anything he's ever seen. Despite his fear, he decides to help her recover.",
      act2: "As Naia heals, she and Marcus develop a unique form of communication. She reveals the dire situation of her underwater civilization and the connection to human pollution. Marcus must confront his past trauma and decide whether to help Naia contact the outside world, risking exposure of both their secrets.",
      act3: "Marcus and Naia work together to establish contact with Dr. Chen and the scientific community. They face skepticism and danger as corporate interests threaten both the lighthouse and Naia's people. The climax involves Marcus overcoming his isolation to lead a mission that saves Naia's civilization and establishes a new era of interspecies cooperation."
    },
    characters: [
      {
        name: "Marcus",
        description: "A weathered 45-year-old former marine biologist turned lighthouse keeper",
        motivation: "To find redemption and purpose after losing his research team in a diving accident",
        arc: "From isolated and guilt-ridden to connected and purposeful"
      },
      {
        name: "Naia",
        description: "An intelligent sea creature from an ancient underwater civilization",
        motivation: "To save her dying people and forge understanding between species",
        arc: "From fearful and suspicious to trusting and collaborative"
      },
      {
        name: "Dr. Sarah Chen",
        description: "Marcus's former colleague and marine research director",
        motivation: "To bring Marcus back to the scientific community and continue their work",
        arc: "From professional concern to personal understanding and support"
      }
    ],
    scenes: [
      {
        title: "Morning Routine",
        setting: "Lighthouse interior at dawn",
        description: "Marcus performs his daily maintenance routine with mechanical precision",
        characters: ["Marcus"],
        key_actions: ["Checking lighthouse equipment", "Making coffee", "Looking out at empty ocean"]
      },
      {
        title: "The Discovery",
        setting: "Rocky shore after storm",
        description: "Marcus finds Naia unconscious on the beach, making the choice to help",
        characters: ["Marcus", "Naia"],
        key_actions: ["Discovering Naia", "Initial fear and curiosity", "Decision to help"]
      },
      {
        title: "First Contact",
        setting: "Lighthouse basement pool",
        description: "Naia awakens and first attempts at communication begin",
        characters: ["Marcus", "Naia"],
        key_actions: ["Naia's awakening", "Establishing basic communication", "Building trust"]
      }
    ]
  });

  const createStoryInDatabase = async (projectId: string) => {
    const storyData = getDummyStoryData();
    
    try {
      // Create story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          project_id: projectId,
          logline: storyData.logline,
          synopsis: storyData.synopsis,
          three_act_structure: storyData.three_act_structure,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Create characters
      const charactersToInsert = storyData.characters.map((char, index) => ({
        story_id: story.id,
        name: char.name,
        description: char.description,
        motivation: char.motivation,
        arc: char.arc,
        order_index: index,
      }));

      const { error: charactersError } = await supabase
        .from('characters')
        .insert(charactersToInsert);

      if (charactersError) throw charactersError;

      // Create scenes
      const scenesToInsert = storyData.scenes.map((scene, index) => ({
        story_id: story.id,
        title: scene.title,
        setting: scene.setting,
        description: scene.description,
        characters: scene.characters,
        key_actions: scene.key_actions,
        order_index: index,
      }));

      const { error: scenesError } = await supabase
        .from('scenes')
        .insert(scenesToInsert);

      if (scenesError) throw scenesError;

      return story;
    } catch (error) {
      console.error('Error creating story in database:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isGenerating || localGenerating) return;

    if (!user) {
      toast.error('Please sign in to create a project');
      return;
    }

    setLocalGenerating(true);
    
    try {
      // Show generation progress
      toast.loading('Analyzing your concept...', { id: 'generation' });
      
      // Create project in database
      const project = await createProject({
        title: `Project: ${idea.substring(0, 50)}${idea.length > 50 ? '...' : ''}`,
        description: 'AI-generated film project',
        original_idea: idea.trim(),
      });

      // Simulate AI generation process with realistic timing
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.loading('Creating story structure...', { id: 'generation' });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.loading('Generating characters and scenes...', { id: 'generation' });
      
      // Create the story in the database
      await createStoryInDatabase(project.id);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Story generated successfully!', { id: 'generation' });
      
      // Navigate to story page with project ID
      navigate(`/story/${project.id}`);
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error creating project. Please try again.');
    } finally {
      setLocalGenerating(false);
    }
  };

  const exampleIdeas = [
    "A lonely lighthouse keeper discovers a mysterious creature from the deep",
    "Two rival food truck owners fall in love during a city-wide festival",
    "A time traveler gets stuck in a small town and must solve a decades-old mystery",
    "An AI assistant develops consciousness and questions its purpose"
  ];

  const isCurrentlyGenerating = isGenerating || localGenerating;

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
            disabled={isCurrentlyGenerating}
          />
          
          <motion.button
            type="submit"
            disabled={!idea.trim() || isCurrentlyGenerating || !user}
            className="absolute bottom-4 right-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCurrentlyGenerating ? (
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
              disabled={isCurrentlyGenerating}
              className="text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gold-500 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isCurrentlyGenerating ? 1 : 1.02 }}
              whileTap={{ scale: isCurrentlyGenerating ? 1 : 0.98 }}
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