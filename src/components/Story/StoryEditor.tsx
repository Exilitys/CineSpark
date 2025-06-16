import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Play, Edit3, Save, X, Plus, Trash2, Camera } from 'lucide-react';
import { StoryWithDetails } from '../../hooks/useStory';
import { useShotListAPI } from '../../hooks/useShotListAPI';
import { useStoryAPI } from '../../hooks/useStoryAPI';
import { useCredits } from '../../hooks/useCredits';
import { AIChatbox } from '../AI/AIChatbox';
import { CreditGuard } from '../Credits/CreditGuard';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  onSave 
}) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingShots, setGeneratingShots] = useState(false);
  const [showCreditGuard, setShowCreditGuard] = useState(false);

  const navigate = useNavigate();
  const { generateShotListFromAPI, loading: apiLoading, error: apiError } = useShotListAPI();
  const { generateStoryFromAPI, loading: storyApiLoading, error: storyApiError } = useStoryAPI();
  const { canPerformAction, refetch: refetchCredits } = useCredits();

  // Get project ID from story
  const projectId = story.project_id;

  // Local state for editing
  const [logline, setLogline] = useState(story.logline);
  const [synopsis, setSynopsis] = useState(story.synopsis);
  const [threeActStructure, setThreeActStructure] = useState(story.three_act_structure);
  const [characters, setCharacters] = useState(story.characters);
  const [scenes, setScenes] = useState(story.scenes);

  const handleSaveStory = async () => {
    setSaving(true);
    try {
      await onUpdateStory({
        logline,
        synopsis,
        three_act_structure: threeActStructure,
      });
      setEditingSection(null);
      toast.success('Story updated successfully!');
    } catch (error) {
      toast.error('Error updating story');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCharacter = async (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
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
      toast.success('Character updated successfully!');
    } catch (error) {
      toast.error('Error updating character');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveScene = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
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
      toast.success('Scene updated successfully!');
    } catch (error) {
      toast.error('Error updating scene');
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
        .from('shots')
        .insert(shotsToInsert)
        .select();

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error creating shot list in database:', error);
      throw error;
    }
  };

  const handleApproveStory = async () => {
    // Check if user can perform the action
    const canProceed = await canPerformAction('SHOT_LIST_GENERATION');
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
      toast.loading('Sending story to AI for shot list generation...', { id: 'generate-shots' });
      
      const storyData = {
        logline,
        synopsis,
        three_act_structure: threeActStructure,
        characters: characters.map(char => ({
          name: char.name,
          description: char.description,
          motivation: char.motivation,
          arc: char.arc
        })),
        scenes: scenes.map(scene => ({
          title: scene.title,
          setting: scene.setting,
          description: scene.description,
          characters: scene.characters,
          key_actions: scene.key_actions
        }))
      };

      const generatedShotList = await generateShotListFromAPI(storyData);
      
      if (!generatedShotList) {
        toast.error('Failed to generate shot list. Please try again.', { id: 'generate-shots' });
        return;
      }

      // Step 2: Save shot list to database
      toast.loading('Creating shot list in your project...', { id: 'generate-shots' });
      
      await createShotListInDatabase(generatedShotList);
      
      toast.success('Shot list generated successfully!', { id: 'generate-shots' });
      
      // Refresh credits display
      await refetchCredits();
      
      // Step 3: Navigate to shot list page
      navigate(`/shots/${projectId}`);
      
    } catch (error) {
      console.error('Error generating shots:', error);
      toast.error('Error generating shot list. Please try again.', { id: 'generate-shots' });
    } finally {
      setGeneratingShots(false);
    }
  };

  const handleAISuggestion = async (suggestion: string) => {
    try {
      toast.loading('AI is processing your suggestion...', { id: 'ai-suggestion' });
      
      // Prepare current story data
      const currentStoryData = {
        logline,
        synopsis,
        three_act_structure: threeActStructure,
        characters: characters.map(char => ({
          name: char.name,
          description: char.description,
          motivation: char.motivation,
          arc: char.arc
        })),
        scenes: scenes.map(scene => ({
          title: scene.title,
          setting: scene.setting,
          description: scene.description,
          characters: scene.characters,
          key_actions: scene.key_actions
        }))
      };

      // Call API with suggestion and current story (credits will be deducted inside the hook)
      const updatedStory = await generateStoryFromAPI(suggestion, currentStoryData);
      
      if (!updatedStory) {
        toast.error('Failed to process suggestion. Please try again.', { id: 'ai-suggestion' });
        return;
      }

      // Update local state with new story data
      setLogline(updatedStory.logline);
      setSynopsis(updatedStory.synopsis);
      setThreeActStructure(updatedStory.three_act_structure);
      
      // Update characters
      const updatedCharacters = characters.map((char, index) => ({
        ...char,
        ...(updatedStory.characters[index] || {})
      }));
      setCharacters(updatedCharacters);
      
      // Update scenes
      const updatedScenes = scenes.map((scene, index) => ({
        ...scene,
        ...(updatedStory.scenes[index] || {})
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

      toast.success('Story updated based on your suggestion!', { id: 'ai-suggestion' });
      
      // Refresh credits display
      await refetchCredits();
      
    } catch (error) {
      console.error('Error processing AI suggestion:', error);
      toast.error('Error processing suggestion. Please try again.', { id: 'ai-suggestion' });
    }
  };

  const updateCharacter = (characterId: string, field: string, value: string) => {
    setCharacters(prev => prev.map(char => 
      char.id === characterId ? { ...char, [field]: value } : char
    ));
  };

  const updateScene = (sceneId: string, field: string, value: any) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId ? { ...scene, [field]: value } : scene
    ));
  };

  const isCurrentlyGenerating = generatingShots || apiLoading;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cinema-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Story Editor</h1>
              <p className="text-gray-400">Review and refine your AI-generated story</p>
            </div>
          </div>
          <button
            onClick={handleApproveStory}
            disabled={isCurrentlyGenerating}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            {isCurrentlyGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Shots...</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                <span>Approve & Generate Shots</span>
              </>
            )}
          </button>
        </div>

        {/* API Error Display */}
        {(apiError || storyApiError) && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400">
              Error: {apiError || storyApiError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logline & Synopsis */}
          <div className="lg:col-span-2 space-y-8">
            {/* Logline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Logline</h2>
                <button
                  onClick={() => setEditingSection(editingSection === 'logline' ? null : 'logline')}
                  className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                >
                  {editingSection === 'logline' ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                </button>
              </div>
              
              {editingSection === 'logline' ? (
                <div className="space-y-4">
                  <textarea
                    value={logline}
                    onChange={(e) => setLogline(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveStory}
                      disabled={saving}
                      className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setLogline(story.logline);
                        setEditingSection(null);
                      }}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 text-lg leading-relaxed italic">
                  "{logline}"
                </p>
              )}
            </motion.div>

            {/* Synopsis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Synopsis</h2>
                <button
                  onClick={() => setEditingSection(editingSection === 'synopsis' ? null : 'synopsis')}
                  className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                >
                  {editingSection === 'synopsis' ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                </button>
              </div>
              
              {editingSection === 'synopsis' ? (
                <div className="space-y-4">
                  <textarea
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveStory}
                      disabled={saving}
                      className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSynopsis(story.synopsis);
                        setEditingSection(null);
                      }}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  {synopsis}
                </p>
              )}
            </motion.div>

            {/* Three-Act Structure */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Three-Act Structure
                </h2>
                <button
                  onClick={() => setEditingSection(editingSection === 'structure' ? null : 'structure')}
                  className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                >
                  {editingSection === 'structure' ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                </button>
              </div>
              
              {editingSection === 'structure' ? (
                <div className="space-y-6">
                  <div className="border-l-4 border-gold-500 pl-4">
                    <h3 className="font-semibold text-gold-400 mb-2">Act I - Setup</h3>
                    <textarea
                      value={threeActStructure.act1}
                      onChange={(e) => setThreeActStructure(prev => ({ ...prev, act1: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="border-l-4 border-cinema-500 pl-4">
                    <h3 className="font-semibold text-cinema-400 mb-2">Act II - Confrontation</h3>
                    <textarea
                      value={threeActStructure.act2}
                      onChange={(e) => setThreeActStructure(prev => ({ ...prev, act2: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cinema-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-green-400 mb-2">Act III - Resolution</h3>
                    <textarea
                      value={threeActStructure.act3}
                      onChange={(e) => setThreeActStructure(prev => ({ ...prev, act3: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveStory}
                      disabled={saving}
                      className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setThreeActStructure(story.three_act_structure);
                        setEditingSection(null);
                      }}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border-l-4 border-gold-500 pl-4">
                    <h3 className="font-semibold text-gold-400 mb-2">Act I - Setup</h3>
                    <p className="text-gray-300 leading-relaxed">{threeActStructure.act1}</p>
                  </div>
                  <div className="border-l-4 border-cinema-500 pl-4">
                    <h3 className="font-semibold text-cinema-400 mb-2">Act II - Confrontation</h3>
                    <p className="text-gray-300 leading-relaxed">{threeActStructure.act2}</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-green-400 mb-2">Act III - Resolution</h3>
                    <p className="text-gray-300 leading-relaxed">{threeActStructure.act3}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Characters & Scenes */}
          <div className="space-y-8">
            {/* Characters */}
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
                {characters.map((character) => (
                  <div key={character.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{character.name}</h3>
                      <button
                        onClick={() => setEditingCharacter(editingCharacter === character.id ? null : character.id)}
                        className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                      >
                        {editingCharacter === character.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {editingCharacter === character.id ? (
                      <div className="space-y-3">
                        <input
                          value={character.name}
                          onChange={(e) => updateCharacter(character.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                          placeholder="Character name"
                        />
                        <textarea
                          value={character.description}
                          onChange={(e) => updateCharacter(character.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                        <textarea
                          value={character.motivation}
                          onChange={(e) => updateCharacter(character.id, 'motivation', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm resize-none"
                          rows={2}
                          placeholder="Motivation"
                        />
                        <textarea
                          value={character.arc}
                          onChange={(e) => updateCharacter(character.id, 'arc', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm resize-none"
                          rows={2}
                          placeholder="Character arc"
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSaveCharacter(character.id)}
                            disabled={saving}
                            className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                          >
                            <Save className="h-3 w-3" />
                            <span>{saving ? 'Saving...' : 'Save'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setCharacters(story.characters);
                              setEditingCharacter(null);
                            }}
                            className="text-gray-400 hover:text-white text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300 mb-2">{character.description}</p>
                        <div className="text-xs text-gray-400">
                          <p><span className="font-medium">Motivation:</span> {character.motivation}</p>
                          <p><span className="font-medium">Arc:</span> {character.arc}</p>
                        </div>
                      </>
                    )}
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
                {scenes.map((scene, index) => (
                  <div key={scene.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">
                        Scene {index + 1}: {scene.title}
                      </h4>
                      <button
                        onClick={() => setEditingScene(editingScene === scene.id ? null : scene.id)}
                        className="text-gold-400 hover:text-gold-300 transition-colors duration-200"
                      >
                        {editingScene === scene.id ? <X className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
                      </button>
                    </div>
                    
                    {editingScene === scene.id ? (
                      <div className="space-y-2">
                        <input
                          value={scene.title}
                          onChange={(e) => updateScene(scene.id, 'title', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                          placeholder="Scene title"
                        />
                        <input
                          value={scene.setting}
                          onChange={(e) => updateScene(scene.id, 'setting', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                          placeholder="Setting"
                        />
                        <textarea
                          value={scene.description}
                          onChange={(e) => updateScene(scene.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSaveScene(scene.id)}
                            disabled={saving}
                            className="bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            <Save className="h-3 w-3" />
                            <span>{saving ? 'Saving...' : 'Save'}</span>
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
                        <p className="text-xs text-gray-400 mb-1">{scene.setting}</p>
                        <p className="text-xs text-gray-300">{scene.description}</p>
                      </>
                    )}
                  </div>
                ))}
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
          scenes_count: scenes.length
        }}
      />
    </>
  );
};