import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Camera, Image, Download, Check, ChevronRight } from 'lucide-react';

export const WorkflowTracker: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  // Don't show on home page or export page
  if (location.pathname === '/' || location.pathname.includes('/export/')) return null;

  const steps = [
    { 
      path: `/story/${projectId}`, 
      icon: FileText, 
      label: 'Story Development', 
      shortLabel: 'Story',
      step: 1 
    },
    { 
      path: `/shots/${projectId}`, 
      icon: Camera, 
      label: 'Shot List Planning', 
      shortLabel: 'Shots',
      step: 2 
    },
    { 
      path: `/photoboard/${projectId}`, 
      icon: Image, 
      label: 'Visual Storyboard', 
      shortLabel: 'Storyboard',
      step: 3 
    },
  ];

  const getCurrentStep = () => {
    const currentStep = steps.find(step => location.pathname === step.path);
    return currentStep?.step || 1;
  };

  const currentStep = getCurrentStep();

  if (!projectId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Desktop Progress Tracker */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            {steps.map((step, index) => {
              const isActive = step.step === currentStep;
              const isCompleted = step.step < currentStep;
              const isAccessible = step.step <= currentStep + 1;

              return (
                <React.Fragment key={step.path}>
                  <Link
                    to={step.path}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-cinema-600 text-white shadow-xl scale-105'
                        : isCompleted
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 hover:scale-105'
                        : isAccessible
                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white hover:scale-105'
                        : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!isAccessible) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-white/20'
                        : isCompleted
                        ? 'bg-green-500'
                        : isAccessible
                        ? 'bg-gray-600 group-hover:bg-gray-500'
                        : 'bg-gray-700'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                      
                      {/* Step number indicator */}
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-gold-500 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {step.step}
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className={`font-semibold transition-all duration-300 ${
                        isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-300'
                      }`}>
                        {step.label}
                      </span>
                      <span className={`text-sm transition-all duration-300 ${
                        isActive ? 'text-blue-200' : isCompleted ? 'text-green-300' : 'text-gray-500'
                      }`}>
                        Step {step.step} of 3
                      </span>
                    </div>
                  </Link>
                  
                  {index < steps.length - 1 && (
                    <div className="flex items-center">
                      <ChevronRight className={`h-6 w-6 transition-colors duration-300 ${
                        step.step < currentStep ? 'text-green-400' : 'text-gray-500'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Progress Tracker */}
          <div className="md:hidden">
            {/* Current Step Display */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 1 ? 'bg-cinema-600' : 
                  currentStep === 2 ? 'bg-cinema-600' : 'bg-cinema-600'
                }`}>
                  {steps.find(s => s.step === currentStep)?.icon && 
                    React.createElement(steps.find(s => s.step === currentStep)!.icon, { 
                      className: "h-5 w-5 text-white" 
                    })
                  }
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {steps.find(s => s.step === currentStep)?.label}
                  </h3>
                  <p className="text-gray-400 text-sm">Step {currentStep} of 3</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Progress</div>
                <div className="text-lg font-bold text-cinema-400">
                  {Math.round((currentStep / 3) * 100)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <motion.div
                className="bg-gradient-to-r from-cinema-500 to-gold-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Step Navigation */}
            <div className="flex justify-between">
              {steps.map((step) => {
                const isActive = step.step === currentStep;
                const isCompleted = step.step < currentStep;
                const isAccessible = step.step <= currentStep + 1;

                return (
                  <Link
                    key={step.path}
                    to={step.path}
                    className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-cinema-600/20 text-cinema-400'
                        : isCompleted
                        ? 'text-green-400'
                        : isAccessible
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!isAccessible) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-cinema-600'
                        : isCompleted
                        ? 'bg-green-600'
                        : isAccessible
                        ? 'bg-gray-600'
                        : 'bg-gray-700'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <step.icon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{step.shortLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};