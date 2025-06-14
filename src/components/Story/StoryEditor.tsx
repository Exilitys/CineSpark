import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Play, Edit3, Save, X, Plus, Trash2, Camera } from 'lucide-react';
import { StoryWithDetails } from '../../hooks/useStory';
import { useShots } from '../../hooks/useShots';
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

  // Get project ID from story
  const projectId = story.project_id;
  const { generateShots } = useShots(projectId);

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

  const handleApproveStory = async () => {
    setGeneratingShots(true);
    try {
      toast.loading('Generating shot list from your story...', { id: 'generate-shots' });
      
      // Generate shots based on the story
      await generateShots();
      
      toast.success('Shot list generated successfully!', { id: 'generate-shots' });
      
      // Call the onSave callback to navigate to shots page
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error generating shots:', error);
      toast.error('Error generating shots. Please try again.', { id: 'generate-shots' });
    } finally {
      setGeneratingShots(false);
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

  return (
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
          disabled={generatingShots}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          {generatingShots ? (
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
  );
};