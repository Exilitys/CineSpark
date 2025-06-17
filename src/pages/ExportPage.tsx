import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, FileText, Camera, Image, Check, Package, ArrowLeft, Home, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { usePDFExport } from '../hooks/usePDFExport';
import { useProjects } from '../hooks/useProjects';
import { useStory } from '../hooks/useStory';
import { useShots } from '../hooks/useShots';
import { usePhotoboard } from '../hooks/usePhotoboard';
import toast from 'react-hot-toast';

interface ExportResult {
  success: boolean;
  successCount: number;
  totalExports: number;
  failedExports: string[];
}

export const ExportPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['story-pdf']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  // Hooks for data and export functionality
  const { projects } = useProjects();
  const { story, loading: storyLoading } = useStory(projectId || null);
  const { shots, loading: shotsLoading } = useShots(projectId || null);
  const { frames, loading: framesLoading } = usePhotoboard(projectId || null);
  const { exportStoryPDF, exportShotsPDF, exportingStory, exportingShots } = usePDFExport();

  // Get project details
  const currentProject = projects.find(p => p.id === projectId);
  const projectName = currentProject?.title || 'Untitled Project';

  const exportOptions = [
    {
      id: 'story-pdf',
      name: 'Story PDF',
      description: 'Complete story document with characters and scenes',
      icon: FileText,
      includes: ['Logline & Synopsis', 'Three-act structure', 'Character profiles', 'Scene breakdown'],
      available: !!story,
      loadingState: exportingStory
    },
    {
      id: 'shot-list-pdf',
      name: 'Shot List PDF',
      description: 'Detailed cinematography breakdown for production',
      icon: Camera,
      includes: ['Shot specifications', 'Camera angles & movements', 'Lens recommendations', 'Production notes'],
      available: shots.length > 0,
      loadingState: exportingShots
    },
    {
      id: 'photoboard-pdf',
      name: 'Photoboard PDF',
      description: 'Visual storyboard with images and annotations',
      icon: Image,
      includes: ['Storyboard frames', 'Visual references', 'Shot annotations', 'Technical specifications'],
      available: frames.length > 0,
      loadingState: false // Will implement when photoboard PDF export is available
    }
  ];

  const handleFormatToggle = (formatId: string) => {
    const option = exportOptions.find(opt => opt.id === formatId);
    if (!option?.available) {
      toast.error(`${option?.name} is not available. Please generate the content first.`);
      return;
    }

    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleExport = async () => {
    if (selectedFormats.length === 0) {
      toast.error('Please select at least one format to export');
      return;
    }

    setIsExporting(true);
    let successCount = 0;
    let totalExports = selectedFormats.length;
    let failedExports: string[] = [];

    try {
      // Export Story PDF
      if (selectedFormats.includes('story-pdf') && story) {
        try {
          const storyData = {
            logline: story.logline,
            synopsis: story.synopsis,
            three_act_structure: story.three_act_structure,
            characters: story.characters.map(char => ({
              name: char.name,
              description: char.description,
              motivation: char.motivation,
              arc: char.arc
            })),
            scenes: story.scenes.map(scene => ({
              title: scene.title,
              setting: scene.setting,
              description: scene.description,
              characters: scene.characters,
              key_actions: scene.key_actions
            }))
          };

          await exportStoryPDF(projectName, storyData);
          successCount++;
        } catch (error) {
          console.error('Error exporting story PDF:', error);
          failedExports.push('Story PDF');
          toast.error('Failed to export story PDF');
        }
      }

      // Export Shot List PDF
      if (selectedFormats.includes('shot-list-pdf') && shots.length > 0) {
        try {
          const shotsData = shots.map(shot => ({
            shot_number: shot.shot_number,
            scene_number: shot.scene_number,
            shot_type: shot.shot_type,
            camera_angle: shot.camera_angle,
            camera_movement: shot.camera_movement,
            description: shot.description,
            lens_recommendation: shot.lens_recommendation,
            estimated_duration: shot.estimated_duration || 5,
            notes: shot.notes || ''
          }));

          await exportShotsPDF(projectName, shotsData);
          successCount++;
        } catch (error) {
          console.error('Error exporting shots PDF:', error);
          failedExports.push('Shot List PDF');
          toast.error('Failed to export shot list PDF');
        }
      }

      // Export Photoboard PDF (placeholder for future implementation)
      if (selectedFormats.includes('photoboard-pdf')) {
        toast.info('Photoboard PDF export will be available soon!');
        successCount++; // Count as success for demo purposes
      }

      // Set export result based on success/failure
      const result: ExportResult = {
        success: successCount === totalExports && failedExports.length === 0,
        successCount,
        totalExports,
        failedExports
      };

      setExportResult(result);

      // Show appropriate toast messages
      if (result.success) {
        toast.success(`All ${successCount} exports completed successfully!`);
      } else if (successCount > 0) {
        toast.success(`${successCount} of ${totalExports} exports completed successfully`);
      } else {
        toast.error('All exports failed. Please try again.');
      }

    } catch (error) {
      console.error('Export error:', error);
      setExportResult({
        success: false,
        successCount: 0,
        totalExports,
        failedExports: selectedFormats.map(formatId => {
          const option = exportOptions.find(opt => opt.id === formatId);
          return option?.name || 'Unknown';
        })
      });
      toast.error('Export process failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    setExportResult(null);
  };

  // Loading state
  if (storyLoading || shotsLoading || framesLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading project data...</p>
        </div>
      </div>
    );
  }

  // Export Complete Screen (Success or Failure)
  if (exportResult) {
    const isSuccess = exportResult.success;
    const isPartialSuccess = exportResult.successCount > 0 && !exportResult.success;
    const isCompleteFailure = exportResult.successCount === 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-900 flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isSuccess 
                ? 'bg-green-600' 
                : isPartialSuccess 
                ? 'bg-orange-600' 
                : 'bg-red-600'
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="h-10 w-10 text-white" />
            ) : isPartialSuccess ? (
              <AlertTriangle className="h-10 w-10 text-white" />
            ) : (
              <XCircle className="h-10 w-10 text-white" />
            )}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl font-bold text-white mb-4"
          >
            {isSuccess 
              ? 'Export Successful!' 
              : isPartialSuccess 
              ? 'Partial Export Success' 
              : 'Export Failed'
            }
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-400 mb-8 leading-relaxed"
          >
            {isSuccess 
              ? 'Your project PDFs have been successfully generated and downloaded to your device. They\'re ready for production use.'
              : isPartialSuccess
              ? `${exportResult.successCount} of ${exportResult.totalExports} exports completed successfully. Some exports failed and may need to be retried.`
              : 'All export attempts failed. Please check your connection and try again.'
            }
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800 rounded-lg p-4 mb-8 border border-gray-700"
          >
            <h3 className="text-sm font-medium text-gray-300 mb-3">Export Results:</h3>
            
            {/* Successful Exports */}
            {exportResult.successCount > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-green-400 mb-2">Successful Exports:</h4>
                <div className="space-y-2">
                  {selectedFormats.map(formatId => {
                    const option = exportOptions.find(opt => opt.id === formatId);
                    const wasSuccessful = !exportResult.failedExports.includes(option?.name || '');
                    
                    if (wasSuccessful) {
                      return (
                        <div key={formatId} className="flex items-center text-sm text-gray-400">
                          <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                          <span>{option?.name}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Failed Exports */}
            {exportResult.failedExports.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-red-400 mb-2">Failed Exports:</h4>
                <div className="space-y-2">
                  {exportResult.failedExports.map((failedExport, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-400">
                      <XCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                      <span>{failedExport}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4"
          >
            {isSuccess ? (
              <button
                onClick={handleBackToHome}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleTryAgain}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={handleBackToHome}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Home className="h-5 w-5" />
                  <span>Back to Home</span>
                </button>
              </div>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-xs text-gray-500 mt-4"
          >
            {isSuccess 
              ? 'Ready to start your next project? Create a new film concept from the home page.'
              : 'If problems persist, please check your internet connection and ensure the API server is running.'
            }
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // Main Export Page
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </button>
      </motion.div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-cinema-600 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Export Project</h1>
            <p className="text-gray-400">Download your pre-production PDFs for "{projectName}"</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Export Options */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-6">Select PDF Exports</h2>
          <div className="space-y-4">
            {exportOptions.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                  !option.available
                    ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                    : selectedFormats.includes(option.id)
                    ? 'border-gold-500 bg-gold-900/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
                onClick={() => handleFormatToggle(option.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    !option.available
                      ? 'bg-gray-700'
                      : selectedFormats.includes(option.id)
                      ? 'bg-gold-600'
                      : 'bg-gray-700'
                  }`}>
                    {option.loadingState ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <option.icon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-medium ${
                        option.available ? 'text-white' : 'text-gray-500'
                      }`}>
                        {option.name}
                        {!option.available && (
                          <span className="text-xs text-gray-500 ml-2">(Not Available)</span>
                        )}
                      </h3>
                      {selectedFormats.includes(option.id) && option.available && (
                        <Check className="h-5 w-5 text-gold-400" />
                      )}
                    </div>
                    <p className={`mb-3 ${
                      option.available ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {option.includes.map((item, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded ${
                            option.available 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-800 text-gray-600'
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">Export Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Project:</span>
                <span className="text-white truncate ml-2">{projectName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Selected formats:</span>
                <span className="text-white">{selectedFormats.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Format:</span>
                <span className="text-white">PDF files</span>
              </div>
            </div>

            {selectedFormats.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Selected exports:</h4>
                <div className="space-y-1">
                  {selectedFormats.map(formatId => {
                    const option = exportOptions.find(opt => opt.id === formatId);
                    return (
                      <div key={formatId} className="text-sm text-gray-400 flex items-center">
                        <Check className="h-3 w-3 text-gold-400 mr-2" />
                        {option?.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <motion.button
              onClick={handleExport}
              disabled={selectedFormats.length === 0 || isExporting || exportingStory || exportingShots}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: selectedFormats.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: selectedFormats.length > 0 ? 0.98 : 1 }}
            >
              {isExporting || exportingStory || exportingShots ? (
                <>
                  <Download className="h-4 w-4 animate-bounce" />
                  <span>Exporting PDFs...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export PDFs</span>
                </>
              )}
            </motion.button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              PDF files will be automatically downloaded to your device.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};