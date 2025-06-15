import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Edit3, Save, RefreshCw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useStoryGeneration, StoryData } from '../../hooks/useStoryGeneration';
import toast from 'react-hot-toast';

export const StoryGenerator: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [currentStory, setCurrentStory] = useState<StoryData | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  
  const { generateStory, updateStory, loading } = useStoryGeneration();

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      toast.error('Please enter your story idea');
      return;
    }

    try {
      toast.loading('Generating your story...', { id: 'generate' });
      const story = await generateStory(userInput);
      setCurrentStory(story);
      setEditedContent(story.generated_content);
      setStatus(story.status);
      toast.success('Story generated successfully!', { id: 'generate' });
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate story', { id: 'generate' });
    }
  };

  const handleSave = async () => {
    if (!currentStory) return;

    try {
      toast.loading('Saving changes...', { id: 'save' });
      const updatedStory = await updateStory(
        currentStory.story_id,
        isEditing ? editedContent : null,
        status
      );
      setCurrentStory(updatedStory);
      setIsEditing(false);
      toast.success('Story saved successfully!', { id: 'save' });
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save story', { id: 'save' });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(currentStory?.edited_content || currentStory?.generated_content || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(currentStory?.edited_content || currentStory?.generated_content || '');
  };

  const getStatusColor = (status: string) => {
    return status === 'published' ? 'text-green-400' : 'text-yellow-400';
  };

  const getStatusIcon = (status: string) => {
    return status === 'published' ? CheckCircle : AlertCircle;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 rounded-xl p-8 border border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Story Generator</h1>
            <p className="text-gray-400">Transform your ideas into compelling stories</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <label htmlFor="story-input" className="block text-sm font-medium text-gray-300 mb-3">
            Describe your story idea
          </label>
          <div className="relative">
            <textarea
              id="story-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter your story concept here... (minimum 10 characters)"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
              rows={4}
              disabled={loading}
              maxLength={1000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {userInput.length}/1000
            </div>
          </div>
          
          <motion.button
            onClick={handleGenerate}
            disabled={loading || userInput.trim().length < 10}
            className="mt-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Story</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Generated Story Section */}
        {currentStory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-700 rounded-lg p-6 border border-gray-600"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-white">Generated Story</h3>
                <div className="flex items-center space-x-2">
                  {React.createElement(getStatusIcon(status), {
                    className: `h-4 w-4 ${getStatusColor(status)}`
                  })}
                  <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="bg-gray-600 border border-gray-500 rounded px-3 py-1 text-white text-sm focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    disabled={loading}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors duration-200"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors duration-200"
                    >
                      {loading ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Story Content */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Original Input:</h4>
              <p className="text-gray-400 text-sm bg-gray-800 p-3 rounded border-l-4 border-purple-500">
                {currentStory.user_input}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                {isEditing ? 'Edit Story:' : 'Generated Content:'}
              </h4>
              {isEditing ? (
                <div className="relative">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                    rows={12}
                    maxLength={5000}
                    disabled={loading}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    {editedContent.length}/5000
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 p-4 rounded border border-gray-600">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {currentStory.edited_content || currentStory.generated_content}
                  </p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-4 pt-4 border-t border-gray-600 flex items-center justify-between text-xs text-gray-500">
              <span>Story ID: {currentStory.story_id}</span>
              <span>Generated: {new Date(currentStory.timestamp).toLocaleString()}</span>
            </div>
          </motion.div>
        )}

        {/* Error Handling Info */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium text-sm mb-2">System Features</h4>
          <ul className="text-blue-300 text-xs space-y-1">
            <li>• Automatic retry with exponential backoff for network failures</li>
            <li>• Response caching for 1 hour to improve performance</li>
            <li>• Input validation and sanitization</li>
            <li>• Optimistic UI updates with conflict resolution</li>
            <li>• Data versioning and timestamp tracking</li>
            <li>• Comprehensive error handling and user feedback</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};