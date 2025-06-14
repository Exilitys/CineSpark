import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, FileText, Camera, Image, Check, Package, ArrowLeft } from 'lucide-react';

export const ExportPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['pdf']);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Package',
      description: 'Complete production package in PDF format',
      icon: FileText,
      includes: ['Story outline', 'Character profiles', 'Shot list', 'Storyboard']
    },
    {
      id: 'final-draft',
      name: 'Final Draft',
      description: 'Screenplay formatted for Final Draft',
      icon: FileText,
      includes: ['Formatted screenplay', 'Character list', 'Scene breakdown']
    },
    {
      id: 'shot-list-csv',
      name: 'Shot List CSV',
      description: 'Detailed shot list for production software',
      icon: Camera,
      includes: ['Shot specifications', 'Equipment needs', 'Timing data']
    },
    {
      id: 'storyboard-images',
      name: 'Storyboard Images',
      description: 'High-resolution storyboard frames',
      icon: Image,
      includes: ['Individual frame images', 'Annotations', 'Multiple formats']
    }
  ];

  const handleFormatToggle = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
    }, 3000);
  };

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
            <p className="text-gray-400">Download your pre-production package</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Export Options */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-6">Select Export Formats</h2>
          <div className="space-y-4">
            {exportOptions.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                  selectedFormats.includes(option.id)
                    ? 'border-gold-500 bg-gold-900/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
                onClick={() => handleFormatToggle(option.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedFormats.includes(option.id)
                      ? 'bg-gold-600'
                      : 'bg-gray-700'
                  }`}>
                    <option.icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-white">{option.name}</h3>
                      {selectedFormats.includes(option.id) && (
                        <Check className="h-5 w-5 text-gold-400" />
                      )}
                    </div>
                    <p className="text-gray-400 mb-3">{option.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {option.includes.map((item, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
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
                <span className="text-gray-400">Selected formats:</span>
                <span className="text-white">{selectedFormats.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated size:</span>
                <span className="text-white">~15 MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Format:</span>
                <span className="text-white">ZIP archive</span>
              </div>
            </div>

            {selectedFormats.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Selected formats:</h4>
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
              disabled={selectedFormats.length === 0 || isExporting}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: selectedFormats.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: selectedFormats.length > 0 ? 0.98 : 1 }}
            >
              {isExporting ? (
                <>
                  <Download className="h-4 w-4 animate-bounce" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export Project</span>
                </>
              )}
            </motion.button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Your project will be downloaded as a ZIP file containing all selected formats.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};