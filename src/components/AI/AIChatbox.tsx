import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, Sparkles, Loader } from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';
import { CreditGuard } from '../Credits/CreditGuard';

interface AIChatboxProps {
  onSendSuggestion: (suggestion: string) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
  title?: string;
  creditAction?: 'STORY_GENERATION' | 'SHOT_LIST_GENERATION';
}

export const AIChatbox: React.FC<AIChatboxProps> = ({
  onSendSuggestion,
  loading = false,
  placeholder = "Ask AI to make changes or improvements...",
  title = "AI Assistant",
  creditAction = 'STORY_GENERATION'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [sending, setSending] = useState(false);
  const [showCreditGuard, setShowCreditGuard] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);

  const { canPerformAction, getCreditCost } = useCredits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim() || sending || loading) return;

    // Check if user can perform the action
    const canProceed = await canPerformAction(creditAction);
    if (!canProceed) {
      setPendingSuggestion(suggestion.trim());
      setShowCreditGuard(true);
      return;
    }

    await processSuggestion(suggestion.trim());
  };

  const processSuggestion = async (suggestionText: string) => {
    setSending(true);
    try {
      await onSendSuggestion(suggestionText);
      setSuggestion('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending suggestion:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCreditGuardProceed = () => {
    if (pendingSuggestion) {
      processSuggestion(pendingSuggestion);
      setPendingSuggestion(null);
    }
  };

  const handleCreditGuardCancel = () => {
    setShowCreditGuard(false);
    setPendingSuggestion(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const getActionDisplayName = () => {
    switch (creditAction) {
      case 'STORY_GENERATION':
        return 'Story Modification';
      case 'SHOT_LIST_GENERATION':
        return 'Shot List Modification';
      default:
        return 'AI Modification';
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
      >
        {loading ? (
          <Loader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
        ) : (
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
                    <p className="text-xs text-gray-400">Ask for changes or improvements</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="suggestion" className="block text-sm font-medium text-gray-300 mb-2">
                      What would you like to change?
                    </label>
                    <textarea
                      id="suggestion"
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholder}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none transition-all duration-200 text-sm sm:text-base"
                      rows={4}
                      disabled={sending || loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Press Cmd/Ctrl + Enter to send quickly
                    </p>
                  </div>

                  {/* Credit Cost Display */}
                  <div className="bg-gold-900/20 border border-gold-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gold-400 text-xs sm:text-sm font-medium">Credit Cost:</span>
                      <span className="text-gold-300 text-xs sm:text-sm">{getCreditCost(creditAction)} credits</span>
                    </div>
                    <p className="text-gold-300 text-xs mt-1">
                      This modification will use the same credits as generation
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {suggestion.length}/500 characters
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-3 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="submit"
                        disabled={!suggestion.trim() || sending || loading || suggestion.length > 500}
                        className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {sending ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Send ({getCreditCost(creditAction)} credits)</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Example Suggestions */}
              <div className="px-4 pb-4">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-300 mb-2">Example suggestions:</h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    {creditAction === 'STORY_GENERATION' ? (
                      <>
                        <p>• "Make the story more dramatic"</p>
                        <p>• "Add more character development"</p>
                        <p>• "Include more action sequences"</p>
                        <p>• "Change the setting to modern day"</p>
                      </>
                    ) : (
                      <>
                        <p>• "Add more close-up shots"</p>
                        <p>• "Include more camera movement"</p>
                        <p>• "Focus on emotional moments"</p>
                        <p>• "Add establishing shots for each scene"</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credit Guard Modal */}
      <CreditGuard
        action={creditAction}
        showModal={showCreditGuard}
        onProceed={handleCreditGuardProceed}
        onCancel={handleCreditGuardCancel}
        title={getActionDisplayName()}
        description="Use AI to modify your content based on your suggestions."
        metadata={{
          suggestion: pendingSuggestion,
          action_type: creditAction
        }}
      />
    </>
  );
};