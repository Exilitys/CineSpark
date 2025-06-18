import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, FileText, Camera, Image, Download, ChevronRight, Home } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';

export const ProjectIndicator: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const { projects } = useProjects();

  // Don't show on home page
  if (location.pathname === '/') return null;

  const currentProject = projects.find(p => p.id === projectId);
  
  const steps = [
    { 
      path: `/story/${projectId}`, 
      icon: FileText, 
      label: 'Story', 
      description: 'Develop narrative structure',
      step: 1 
    },
    { 
      path: `/shots/${projectId}`, 
      icon: Camera, 
      label: 'Shot List', 
      description: 'Plan cinematography',
      step: 2 
    },
    { 
      path: `/photoboard/${projectId}`, 
      icon: Image, 
      label: 'Photoboard', 
      description: 'Visual storyboard',
      step: 3 
    },
    { 
      path: `/export/${projectId}`, 
      icon: Download, 
      label: 'Export', 
      description: 'Finalize project',
      step: 4 
    },
  ];

  const getCurrentStep = () => {
    const currentStep = steps.find(step => location.pathname === step.path);
    return currentStep?.step || 1;
  };

  const currentStep = getCurrentStep();
  const currentStepInfo = steps.find(step => step.step === currentStep);

  if (!projectId || !currentProject) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 border-b border-gray-700 sticky top-16 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Project Info & Breadcrumb */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {/* Project Info */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cinema-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Film className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-lg font-semibold text-white truncate">
                  {currentProject.title}
                </h2>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Step {currentStep} of 4 • {currentStepInfo?.description}
                </p>
                <p className="text-xs text-gray-400 sm:hidden">
                  {currentStep}/4 • {currentStepInfo?.label}
                </p>
              </div>
            </div>

            {/* Breadcrumb - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <Link
                to="/"
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-500" />
              <span className="text-gold-400 font-medium">
                {currentStepInfo?.label}
              </span>
            </div>
          </div>

          {/* Progress Steps - Desktop */}
          <div className="hidden xl:flex items-center space-x-1">
            {steps.map((step, index) => {
              const isActive = step.step === currentStep;
              const isCompleted = step.step < currentStep;
              const isAccessible = step.step <= currentStep + 1; // Allow access to next step

              return (
                <React.Fragment key={step.path}>
                  <Link
                    to={step.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-cinema-600 text-white shadow-lg'
                        : isCompleted
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        : isAccessible
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!isAccessible) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <step.icon className="h-4 w-4" />
                    <span>{step.label}</span>
                    {isCompleted && (
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    )}
                  </Link>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress Steps - Tablet */}
          <div className="hidden lg:flex xl:hidden items-center space-x-1">
            {steps.map((step, index) => {
              const isActive = step.step === currentStep;
              const isCompleted = step.step < currentStep;
              const isAccessible = step.step <= currentStep + 1;

              return (
                <React.Fragment key={step.path}>
                  <Link
                    to={step.path}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-cinema-600 text-white shadow-lg'
                        : isCompleted
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        : isAccessible
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!isAccessible) {
                        e.preventDefault();
                      }
                    }}
                    title={step.label}
                  >
                    <step.icon className="h-4 w-4" />
                  </Link>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-gray-500" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Progress Indicator */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="text-sm text-gray-400">
              {currentStep}/4
            </div>
            <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cinema-500 to-gold-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};