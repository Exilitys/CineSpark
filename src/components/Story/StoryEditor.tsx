import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  Play,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Camera,
  Download,
} from "lucide-react";
import { StoryWithDetails } from "../../hooks/useStory";
import { useShotListAPI } from "../../hooks/useShotListAPI";
import { useStoryAPI } from "../../hooks/useStoryAPI";
import { useCredits } from "../../hooks/useCredits";
import { usePDFExport } from "../../hooks/usePDFExport";
import { AIChatbox } from "../AI/AIChatbox";
import { CreditGuard } from "../Credits/CreditGuard";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import toast from "react-hot-toast";
import { useStory } from "../../hooks/useStory";

interface StoryEditorProps {
  story: StoryWithDetails;
  onUpdateStory: (updates: any) => Promise<void>;
  onUpdateCharacter: (characterId: string, updates: any) => Promise<void>;
  onUpdateScene: (sceneId: string, updates: any) => Promise<void>;
  onSave?: () => void;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({
  story,
  onUpdateStory,
  onUpdateCharacter,
  onUpdateScene,
  onSave,
}) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingShots, setGeneratingShots] = useState(false);
  const [showCreditGuard, setShowCreditGuard] = useState(false);

  const navigate = useNavigate();
  const { projects } = useProjects();
  const {
    generateShotListFromAPI,
    loading: apiLoading,
    error: apiError,
  } = useShotListAPI();
  const {
    generateStoryFromAPI,
    loading: storyApiLoading,
    error: storyApiError,
  } = useStoryAPI();
  const { canPerformAction, refetch: refetchCredits } = useCredits();
  const { exportStoryPDF, exportingStory } = usePDFExport();

  // Get project ID from story
  const projectId = story.project_id;

  // Get project details for export
  const currentProject = projects.find((p) => p.id === projectId);
  const projectName = currentProject?.title || "Untitled Project";

  // Local state for editing
  const [logline, setLogline] = useState(story.logline);
  const [synopsis, setSynopsis] = useState(story.synopsis);
  const [threeActStructure, setThreeActStructure] = useState(
    story.three_act_structure
  );
  const [characters, setCharacters] = useState(story.characters);
  const [scenes, setScenes] = useState(story.scenes);

  const { addCharacter, addScene } = useStory(story.project_id);

  const [creatingCharacter, setCreatingCharacter] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    motivation: "",
    arc: "",
  });

  const [creatingScene, setCreatingScene] = useState(false);
  const [newScene, setNewScene] = useState({
    title: "",
    setting: "",
    description: "",
    characters: [] as string[],
    key_actions: [] as string[],
  });

  const handleAddCharacter = async () => {
    try {
      const added = await addCharacter({
        ...newCharacter,
        story_id: story.id,
      });
      setCharacters((prev) => [...prev, added]);
      setNewCharacter({ name: "", description: "", motivation: "", arc: "" });
      setCreatingCharacter(false);
      toast.success("Character added!");
    } catch (err) {
      toast.error("Failed to add character.");
    }
  };

  const handleAddScene = async () => {
    try {
      const added = await addScene({
        ...newScene,
        story_id: story.id,
      });
      setScenes((prev) => [...prev, added]);
      setNewScene({
        title: "",
        setting: "",
        description: "",
        characters: [],
        key_actions: [],
      });
      setCreatingScene(false);
      toast.success("Scene added!");
    } catch (err) {
      toast.error("Failed to add scene.");
    }
  };

  const handleExportStoryPDF = async () => {
    try {
      const storyData = {
        logline,
        synopsis,
        three_act_structure: threeActStructure,
        characters: characters.map((char) => ({
          name: char.name,
          description: char.description,
          motivation: char.motivation,
          arc: char.arc,
        })),
        scenes: scenes.map((scene) => ({
          title: scene.title,
          setting: scene.setting,
          description: scene.description,
          characters: scene.characters,
          key_actions: scene.key_actions,
        })),
      };

      await exportStoryPDF(projectName, storyData);
    } catch (error) {
      console.error("Error exporting story PDF:", error);
      toast.error("Failed to export story PDF");
    }
  };

  const handleSaveStory = async () => {
    setSaving(true);
    try {
      await onUpdateStory({
        logline,
        synopsis,
        three_act_structure: threeActStructure,
      });
      setEditingSection(null);
      toast.success("Story updated successfully!");
    } catch (error) {
      toast.error("Error updating story");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCharacter = async (characterId: string) => {
    const character = characters.find((c) => c.id === characterId);
    if (!character) return;

    setSaving(true);
    try {
      await onUpdateCharacter(characterId, {
        name: character.name,
        description: character.description,
        motivation: character.motivation,
        arc: character.arc,
      });
      setEditingCharacter(null);
      toast.success("Character updated successfully!");
    } catch (error) {
      toast.error("Error updating character");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveScene = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    setSaving(true);
    try {
      await onUpdateScene(sceneId, {
        title: scene.title,
        setting: scene.setting,
        description: scene.description,
        characters: scene.characters,
        key_actions: scene.key_actions,
      });
      setEditingScene(null);
      toast.success("Scene updated successfully!");
    } catch (error) {
      toast.error("Error updating scene");
    } finally {
      setSaving(false);
    }
  };

  const createShotListInDatabase = async (shotListData: any) => {
    try {
      const shotsToInsert = shotListData.shots.map((shot: any) => ({
        project_id: projectId,
        scene_id: null, // We'll link to scenes later if needed
        shot_number: shot.shot_number,
        scene_number: shot.scene_number,
        shot_type: shot.shot_type,
        camera_angle: shot.camera_angle,
        camera_movement: shot.camera_movement,
        description: shot.description,
        lens_recommendation: shot.lens_recommendation,
        estimated_duration: shot.estimated_duration,
        notes: shot.notes,
      }));

      const { data, error } = await supabase
        .from("shots")
        .insert(shotsToInsert)
        .select();

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error creating shot list in database:", error);
      throw error;
    }
  };

  const handleApproveStory = async () => {
    // Check if user can perform the action
    const canProceed = await canPerformAction("SHOT_LIST_GENERATION");
    if (!canProceed) {
      setShowCreditGuard(true);
      return;
    }

    await generateShotList();
  };

  const generateShotList = async () => {
    setGeneratingShots(true);
    try {
      // Step 1: Send story data to API for shot list generation (credits will be deducted inside the hook)
      toast.loading("Sending story to AI for shot list generation...", {
        id: "generate-shots",
      });

      const storyData = {
        logline,
        synopsis,
        three_act_structure: threeActStructure,
        characters: characters.map((char) => ({
          name: char.name,
          description: char.description,
          motivation: char.motivation,
          arc: char.arc,
        })),
        scenes: scenes.map((scene) => ({
          title: scene.title,
          setting: scene.setting,
          description: scene.description,
          characters: scene.characters,
          key_actions: scene.key_actions,
        })),
      };

      const generatedShotList = await generateShotListFromAPI(storyData);

      if (!generatedShotList) {
        toast.error("Failed to generate shot list. Please try again.", {
          id: "generate-shots",
        });
        return;
      }

      // Step 2: Save shot list to database
      toast.loading("Creating shot list in your project...", {
        id: "generate-shots",
      });

      await createShotListInDatabase(generatedShotList);

      toast.success("Shot list generated successfully!", {
        id: "generate-shots",
      });

      // Refresh credits display
      await refetchCredits();

      // Step 3: Navigate to shot list page
      navigate(`/shots/${projectId}`);
    } catch (error) {
      console.error("Error generating shots:", error);
      toast.error("Error generating shot list. Please try again.", {
        id: "generate-shots",
      });
    } finally {
      setGeneratingShots(false);
    }
  };

  const handleAISuggestion = async (suggestion: string) => {
    try {
      toast.loading("AI is processing your suggestion...", {
        id: "ai-suggestion",
      });

      // Prepare current story data
      const currentStoryData = {
        logline,
        synopsis,
        three_act_structure: threeActStructure,
        characters: characters.map((char) => ({
          name: char.name,
          description: char.description,
          motivation: char.motivation,
          arc: char.arc,
        })),
        scenes: scenes.map((scene) => ({
          title: scene.title,
          setting: scene.setting,
          description: scene.description,
          characters: scene.characters,
          key_actions: scene.key_actions,
        })),
      };

      // Call API with suggestion and current story (credits will be deducted inside the hook)
      const updatedStory = await generateStoryFromAPI(
        suggestion,
        currentStoryData
      );

      if (!updatedStory) {
        toast.error("Failed to process suggestion. Please try again.", {
          id: "ai-suggestion",
        });
        return;
      }

      // Update local state with new story data
      setLogline(updatedStory.logline);
      setSynopsis(updatedStory.synopsis);
      setThreeActStructure(updatedStory.three_act_structure);

      // Update characters
      const updatedCharacters = characters.map((char, index) => ({
        ...char,
        ...(updatedStory.characters[index] || {}),
      }));
      setCharacters(updatedCharacters);

      // Update scenes
      const updatedScenes = scenes.map((scene, index) => ({
        ...scene,
        ...(updatedStory.scenes[index] || {}),
      }));
      setScenes(updatedScenes);

      // Save changes to database
      await onUpdateStory({
        logline: updatedStory.logline,
        synopsis: updatedStory.synopsis,
        three_act_structure: updatedStory.three_act_structure,
      });

      // Update characters in database
      for (let i = 0; i < updatedCharacters.length; i++) {
        const char = updatedCharacters[i];
        if (updatedStory.characters[i]) {
          await onUpdateCharacter(char.id, {
            name: updatedStory.characters[i].name,
            description: updatedStory.characters[i].description,
            motivation: updatedStory.characters[i].motivation,
            arc: updatedStory.characters[i].arc,
          });
        }
      }

      // Update scenes in database
      for (let i = 0; i < updatedScenes.length; i++) {
        const scene = updatedScenes[i];
        if (updatedStory.scenes[i]) {
          await onUpdateScene(scene.id, {
            title: updatedStory.scenes[i].title,
            setting: updatedStory.scenes[i].setting,
            description: updatedStory.scenes[i].description,
            characters: updatedStory.scenes[i].characters,
            key_actions: updatedStory.scenes[i].key_actions,
          });
        }
      }

      toast.success("Story updated based on your suggestion!", {
        id: "ai-suggestion",
      });

      // Refresh credits display
      await refetchCredits();
    } catch (error) {
      console.error("Error processing AI suggestion:", error);
      toast.error("Error processing suggestion. Please try again.", {
        id: "ai-suggestion",
      });
    }
  };

  const updateCharacter = (
    characterId: string,
    field: string,
    value: string
  ) => {
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === characterId ? { ...char, [field]: value } : char
      )
    );
  };

  const updateScene = (sceneId: string, field: string, value: any) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, [field]: value } : scene
      )
    );
  };

  const isCurrentlyGenerating = generatingShots || apiLoading;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cinema-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">
                Story Editor
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Review and refine your AI-generated story
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={handleExportStoryPDF}
              disabled={exportingStory}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              {exportingStory ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                  <span className="sm:hidden">Export...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handleApproveStory}
              disabled={isCurrentlyGenerating}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              {isCurrentlyGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Generating Shots...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Approve & Generate Shots
                  </span>
                  <span className="sm:hidden">Generate Shots</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* API Error Display */}
        {(apiError || storyApiError) && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">
              Error: {apiError || storyApiError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Logline & Synopsis */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Logline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Logline
                </h2>
                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === "logline" ? null : "logline"
                    )
                  }
                  className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                >
                  {editingSection === "logline" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit3 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {editingSection === "logline" ? (
                <div className="space-y-3 sm:space-y-4">
                  <textarea
                    value={logline}
                    onChange={(e) => setLogline(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={3}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSaveStory}
                      disabled={saving}
                      className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? "Saving..." : "Save"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setLogline(story.logline);
                        setEditingSection(null);
                      }}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm sm:text-lg text-gray-300 leading-relaxed italic">
                  "{logline}"
                </p>
              )}
            </motion.div>

            {/* Synopsis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Synopsis
                </h2>
                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === "synopsis" ? null : "synopsis"
                    )
                  }
                  className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                >
                  {editingSection === "synopsis" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit3 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {editingSection === "synopsis" ? (
                <div className="space-y-3 sm:space-y-4">
                  <textarea
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={6}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSaveStory}
                      disabled={saving}
                      className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? "Saving..." : "Save"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSynopsis(story.synopsis);
                        setEditingSection(null);
                      }}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {synopsis}
                </p>
              )}
            </motion.div>

            {/* Three-Act Structure */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Three-Act Structure
                </h2>
                <button
                  onClick={() =>
                    setEditingSection(
                      editingSection === "structure" ? null : "structure"
                    )
                  }
                  className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                >
                  {editingSection === "structure" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit3 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {editingSection === "structure" ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="border-l-4 border-gold-500 pl-3 sm:pl-4">
                    <h3 className="font-semibold text-gold-400 mb-2 text-sm sm:text-base">
                      Act I - Setup
                    </h3>
                    <textarea
                      value={threeActStructure.act1}
                      onChange={(e) =>
                        setThreeActStructure((prev) => ({
                          ...prev,
                          act1: e.target.value,
                        }))
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none text-xs sm:text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="border-l-4 border-cinema-500 pl-3 sm:pl-4">
                    <h3 className="font-semibold text-cinema-400 mb-2 text-sm sm:text-base">
                      Act II - Confrontation
                    </h3>
                    <textarea
                      value={threeActStructure.act2}
                      onChange={(e) =>
                        setThreeActStructure((prev) => ({
                          ...prev,
                          act2: e.target.value,
                        }))
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cinema-500 focus:border-transparent resize-none text-xs sm:text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                    <h3 className="font-semibold text-green-400 mb-2 text-sm sm:text-base">
                      Act III - Resolution
                    </h3>
                    <textarea
                      value={threeActStructure.act3}
                      onChange={(e) =>
                        setThreeActStructure((prev) => ({
                          ...prev,
                          act3: e.target.value,
                        }))
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-xs sm:text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSaveStory}
                      disabled={saving}
                      className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? "Saving..." : "Save"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setThreeActStructure(story.three_act_structure);
                        setEditingSection(null);
                      }}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="border-l-4 border-gold-500 pl-3 sm:pl-4">
                    <h3 className="font-semibold text-gold-400 mb-2 text-sm sm:text-base">
                      Act I - Setup
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {threeActStructure.act1}
                    </p>
                  </div>
                  <div className="border-l-4 border-cinema-500 pl-3 sm:pl-4">
                    <h3 className="font-semibold text-cinema-400 mb-2 text-sm sm:text-base">
                      Act II - Confrontation
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {threeActStructure.act2}
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                    <h3 className="font-semibold text-green-400 mb-2 text-sm sm:text-base">
                      Act III - Resolution
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {threeActStructure.act3}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Characters & Scenes */}
          <div className="space-y-6 sm:space-y-8">
            {/* Characters */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Characters
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="bg-gray-700 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm sm:text-base">
                        {character.name}
                      </h3>
                      <button
                        onClick={() =>
                          setEditingCharacter(
                            editingCharacter === character.id
                              ? null
                              : character.id
                          )
                        }
                        className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                      >
                        {editingCharacter === character.id ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Edit3 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {editingCharacter === character.id ? (
                      <div className="space-y-2 sm:space-y-3">
                        <input
                          value={character.name}
                          onChange={(e) =>
                            updateCharacter(
                              character.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-600 border border-gray-500 rounded text-white text-xs sm:text-sm"
                          placeholder="Character name"
                        />
                        <textarea
                          value={character.description}
                          onChange={(e) =>
                            updateCharacter(
                              character.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-600 border border-gray-500 rounded text-white text-xs sm:text-sm resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                        <textarea
                          value={character.motivation}
                          onChange={(e) =>
                            updateCharacter(
                              character.id,
                              "motivation",
                              e.target.value
                            )
                          }
                          className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-600 border border-gray-500 rounded text-white text-xs sm:text-sm resize-none"
                          rows={2}
                          placeholder="Motivation"
                        />
                        <textarea
                          value={character.arc}
                          onChange={(e) =>
                            updateCharacter(character.id, "arc", e.target.value)
                          }
                          className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-600 border border-gray-500 rounded text-white text-xs sm:text-sm resize-none"
                          rows={2}
                          placeholder="Character arc"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleSaveCharacter(character.id)}
                            disabled={saving}
                            className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex items-center space-x-1"
                          >
                            <Save className="h-3 w-3" />
                            <span>{saving ? "Saving..." : "Save"}</span>
                          </button>
                          <button
                            onClick={() => {
                              setCharacters(story.characters);
                              setEditingCharacter(null);
                            }}
                            className="text-gray-400 hover:text-white text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm text-gray-300 mb-2">
                          {character.description}
                        </p>
                        <div className="text-xs text-gray-400">
                          <p>
                            <span className="font-medium">Motivation:</span>{" "}
                            {character.motivation}
                          </p>
                          <p>
                            <span className="font-medium">Arc:</span>{" "}
                            {character.arc}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {/* Create Character */}
                {creatingCharacter ? (
                  <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                    <input
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      placeholder="Name"
                      value={newCharacter.name}
                      onChange={(e) =>
                        setNewCharacter((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <textarea
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      placeholder="Description"
                      value={newCharacter.description}
                      onChange={(e) =>
                        setNewCharacter((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                    <textarea
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      placeholder="Motivation"
                      value={newCharacter.motivation}
                      onChange={(e) =>
                        setNewCharacter((prev) => ({
                          ...prev,
                          motivation: e.target.value,
                        }))
                      }
                    />
                    <textarea
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      placeholder="Character Arc"
                      value={newCharacter.arc}
                      onChange={(e) =>
                        setNewCharacter((prev) => ({
                          ...prev,
                          arc: e.target.value,
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddCharacter}
                        className="bg-gold-600 text-white px-3 py-1 text-xs rounded"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setCreatingCharacter(false)}
                        className="text-gray-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCreatingCharacter(true)}
                    className="text-gold-400 text-xs hover:text-gold-300 flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add Character
                  </button>
                )}
              </div>
            </motion.div>

            {/* Scene Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                Scene Breakdown
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {scenes.map((scene, index) => (
                  <div key={scene.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-xs sm:text-sm">
                        Scene {index + 1}: {scene.title}
                      </h4>
                      <button
                        onClick={() =>
                          setEditingScene(
                            editingScene === scene.id ? null : scene.id
                          )
                        }
                        className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                      >
                        {editingScene === scene.id ? (
                          <X className="h-3 w-3" />
                        ) : (
                          <Edit3 className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {editingScene === scene.id ? (
                      <div className="space-y-2">
                        <input
                          value={scene.title}
                          onChange={(e) =>
                            updateScene(scene.id, "title", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                          placeholder="Scene title"
                        />
                        <input
                          value={scene.setting}
                          onChange={(e) =>
                            updateScene(scene.id, "setting", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                          placeholder="Setting"
                        />
                        <textarea
                          value={scene.description}
                          onChange={(e) =>
                            updateScene(scene.id, "description", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleSaveScene(scene.id)}
                            disabled={saving}
                            className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            <Save className="h-3 w-3" />
                            <span>{saving ? "Saving..." : "Save"}</span>
                          </button>
                          <button
                            onClick={() => {
                              setScenes(story.scenes);
                              setEditingScene(null);
                            }}
                            className="text-gray-400 hover:text-white text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400 mb-1">
                          {scene.setting}
                        </p>
                        <p className="text-xs text-gray-300">
                          {scene.description}
                        </p>
                      </>
                    )}
                  </div>
                ))}
                {/* Create Scene */}
                {creatingScene ? (
                  <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                    <input
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      placeholder="Title"
                      value={newScene.title}
                      onChange={(e) =>
                        setNewScene((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      placeholder="Setting"
                      value={newScene.setting}
                      onChange={(e) =>
                        setNewScene((prev) => ({
                          ...prev,
                          setting: e.target.value,
                        }))
                      }
                    />
                    <textarea
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      placeholder="Description"
                      value={newScene.description}
                      onChange={(e) =>
                        setNewScene((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddScene}
                        className="bg-gold-600 text-white px-3 py-1 text-xs rounded"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setCreatingScene(false)}
                        className="text-gray-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCreatingScene(true)}
                    className="text-gold-400 text-xs hover:text-gold-300 flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add Scene
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* AI Chatbox */}
      <AIChatbox
        onSendSuggestion={handleAISuggestion}
        loading={storyApiLoading}
        placeholder="Ask AI to modify the story, characters, or scenes..."
        title="Story AI Assistant"
        creditAction="STORY_GENERATION"
      />

      {/* Credit Guard Modal */}
      <CreditGuard
        action="SHOT_LIST_GENERATION"
        showModal={showCreditGuard}
        onProceed={generateShotList}
        onCancel={() => setShowCreditGuard(false)}
        metadata={{
          story_logline: logline,
          characters_count: characters.length,
          scenes_count: scenes.length,
        }}
      />
    </>
  );
};
