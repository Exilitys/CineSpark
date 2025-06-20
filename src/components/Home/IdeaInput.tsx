import React, { useState } from "react";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { useStoryAPI } from "../../hooks/useStoryAPI";
import { useCredits } from "../../hooks/useCredits";
import { CreditGuard } from "../Credits/CreditGuard";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface IdeaInputProps {
  isGenerating?: boolean;
}

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

export const IdeaInput: React.FC<IdeaInputProps> = ({
  isGenerating = false,
}) => {
  const [idea, setIdea] = useState("");
  const [localGenerating, setLocalGenerating] = useState(false);
  const [showCreditGuard, setShowCreditGuard] = useState(false);
  const { user } = useAuth();
  const { createProject, checkProjectLimit } = useProjects();
  const {
    generateStoryFromAPI,
    loading: apiLoading,
    error: apiError,
  } = useStoryAPI();
  const { canPerformAction, getCreditCost } = useCredits();
  const navigate = useNavigate();

  const createStoryInDatabase = async (
    projectId: string,
    story: GeneratedStory
  ) => {
    try {
      // Create story
      const { data: storyRecord, error: storyError } = await supabase
        .from("stories")
        .insert({
          project_id: projectId,
          logline: story.logline,
          synopsis: story.synopsis,
          three_act_structure: story.three_act_structure,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Create characters
      const charactersToInsert = story.characters.map((char, index) => ({
        story_id: storyRecord.id,
        name: char.name,
        description: char.description,
        motivation: char.motivation,
        arc: char.arc,
        order_index: index,
      }));

      const { error: charactersError } = await supabase
        .from("characters")
        .insert(charactersToInsert);

      if (charactersError) throw charactersError;

      // Create scenes
      const scenesToInsert = story.scenes.map((scene, index) => ({
        story_id: storyRecord.id,
        title: scene.title,
        setting: scene.setting,
        description: scene.description,
        characters: scene.characters,
        key_actions: scene.key_actions,
        order_index: index,
      }));

      const { error: scenesError } = await supabase
        .from("scenes")
        .insert(scenesToInsert);

      if (scenesError) throw scenesError;

      return storyRecord;
    } catch (error) {
      console.error("Error creating story in database:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isGenerating || localGenerating || apiLoading) return;

    if (!user) {
      toast.error("Please sign in to create a project");
      return;
    }

    // Check project limit first
    const limitCheck = checkProjectLimit();
    if (!limitCheck.canCreate) {
      toast.error(limitCheck.message || "Project limit reached.");
      // Redirect to pricing page if it's a plan limit issue
      if (limitCheck.message?.includes("limited to")) {
        setTimeout(() => {
          navigate("/pricing");
        }, 2000);
      }
      return;
    }

    // Check if user can perform the action
    const canProceed = await canPerformAction("STORY_GENERATION");
    if (!canProceed) {
      setShowCreditGuard(true);
      return;
    }

    await generateStory();
  };

  const generateStory = async () => {
    setLocalGenerating(true);

    try {
      // Check project limit again before creating
      const limitCheck = checkProjectLimit();
      if (!limitCheck.canCreate) {
        toast.error(limitCheck.message || "Project limit reached.");
        if (limitCheck.message?.includes("limited to")) {
          setTimeout(() => {
            navigate("/pricing");
          }, 2000);
        }
        return;
      }

      // Step 1: Generate story from API (credits will be deducted inside the hook)
      toast.loading("Sending your idea to AI...", { id: "generation" });

      const generatedStory = await generateStoryFromAPI(idea.trim());

      if (!generatedStory) {
        toast.error("Failed to generate story. Please try again.", {
          id: "generation",
        });
        return;
      }

      // Step 2: Create project in database with sequential naming
      toast.loading("Creating your project...", { id: "generation" });

      const project = await createProject({
        description: "AI-generated film project",
        original_idea: idea.trim(),
        // Title will be auto-generated as sequential number in createProject
      });

      // Step 3: Create the story in the database
      toast.loading("Setting up your story...", { id: "generation" });

      await createStoryInDatabase(project.id, generatedStory);

      toast.success("Story generated successfully!", { id: "generation" });

      // Step 4: Navigate to the existing story page where user can edit and continue
      navigate(`/story/${project.id}`);
    } catch (error: any) {
      console.error("Error in story generation workflow:", error);

      // Handle specific project limit errors
      if (error.message?.includes("limited to")) {
        toast.error(error.message, { id: "generation" });
        setTimeout(() => {
          navigate("/pricing");
        }, 2000);
      } else {
        toast.error("Error generating story. Please try again.", {
          id: "generation",
        });
      }
    } finally {
      setLocalGenerating(false);
    }
  };

  const exampleIdeas = [
    "A lonely lighthouse keeper discovers a mysterious creature from the deep",
    "Two rival food truck owners fall in love during a city-wide festival",
    "A time traveler gets stuck in a small town and must solve a decades-old mystery",
    "An AI assistant develops consciousness and questions its purpose",
  ];

  const isCurrentlyGenerating = isGenerating || localGenerating || apiLoading;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6"
      >
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full mb-4 sm:mb-6 shadow-xl"
          >
            <Lightbulb className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight px-4">
            Transform Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Film Idea
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto px-4">
            From a single sentence to a complete pre-production package. Let AI
            craft your story, shot list, and storyboard in minutes.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-700"
        >
          <label
            htmlFor="idea-input"
            className="block text-sm font-medium text-gray-300 mb-4"
          >
            Describe your film concept
          </label>

          <div className="relative">
            <textarea
              id="idea-input"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Enter your film idea here... A single sentence or detailed paragraph works perfectly."
              className="w-full px-4 sm:px-6 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none transition-all duration-200 text-sm sm:text-base"
              rows={4}
              disabled={isCurrentlyGenerating}
            />

            <motion.button
              type="submit"
              disabled={!idea.trim() || isCurrentlyGenerating || !user}
              className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCurrentlyGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                  <span className="sm:hidden">Gen...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Generate Story</span>
                  <span className="sm:hidden">Generate</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>

          {user && (
            <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
              <p className="text-gray-400">
                This will use {getCreditCost("STORY_GENERATION")} credits to
                generate your story.
              </p>
            </div>
          )}

          {!user && (
            <p className="text-xs sm:text-sm text-gray-400 mt-3">
              Please sign in to create and save your projects.
            </p>
          )}

          {apiError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-400 text-xs sm:text-sm">Error: {apiError}</p>
            </div>
          )}
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 sm:mt-12"
        >
          <h3 className="text-base sm:text-lg font-medium text-gray-300 mb-4 sm:mb-6 text-center">
            Need inspiration? Try one of these ideas:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {exampleIdeas.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => setIdea(example)}
                disabled={isCurrentlyGenerating}
                className="text-left p-3 sm:p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gold-500 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isCurrentlyGenerating ? 1 : 1.02 }}
                whileTap={{ scale: isCurrentlyGenerating ? 1 : 0.98 }}
              >
                <p className="text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors duration-200">
                  "{example}"
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Information about project creation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 sm:mt-8 bg-blue-900/20 border border-blue-700 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium text-sm">
                How It Works
              </h4>
              <p className="text-blue-300 text-xs sm:text-sm mt-1">
                Enter your film idea above and our AI will generate a complete
                story with characters, three-act structure, and scenes. This
                creates a new project that you can then develop into shot lists
                and storyboards.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Credit Guard Modal */}
      <CreditGuard
        action="STORY_GENERATION"
        showModal={showCreditGuard}
        onProceed={generateStory}
        onCancel={() => setShowCreditGuard(false)}
        metadata={{
          user_idea: idea.trim(),
          idea_length: idea.trim().length,
        }}
      />
    </>
  );
};