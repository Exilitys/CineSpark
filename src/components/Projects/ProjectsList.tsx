import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Film,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  CheckCircle,
  Circle,
  Clock,
  Check,
  X,
  Save,
  Crown,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useProjects } from "../../hooks/useProjects";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useProjectStatus } from "../../hooks/useProjectStatus";
import { useProfile } from "../../hooks/useProfile";
import { toast } from "react-toastify";

export const ProjectsList: React.FC = () => {
  const {
    projects,
    loading,
    deleteProject,
    updateProjectTitle,
    getProjectLimitInfo,
  } = useProjects();
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const limitInfo = getProjectLimitInfo();

  const handleDeleteProject = async (id: string, title: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteProject(id);
        toast.success("Project deleted successfully");
      } catch (error) {
        toast.error("Error deleting project");
      }
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/story/${projectId}`);
  };

  const handleStartEdit = (project: any) => {
    setEditingProject(project.id);
    setEditingTitle(project.title);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditingTitle("");
  };

  const handleSaveEdit = async (projectId: string) => {
    if (!editingTitle.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await updateProjectTitle(projectId, editingTitle);
      setEditingProject(null);
      setEditingTitle("");
      toast.success("Project name updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating project name");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(projectId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleCreateNewProject = () => {
    // Check if user can create more projects
    if (!limitInfo.canCreate) {
      if (profile?.plan === "free") {
        toast.error(
          "Free plan is limited to 3 projects. Upgrade to Pro or Enterprise for unlimited projects."
        );
        // Redirect to pricing page for upgrade
        setTimeout(() => {
          navigate("/pricing");
        }, 2000);
      } else {
        toast.error("You have reached your project limit");
      }
      return;
    }

    // Always redirect to home page for project creation
    toast.info("Redirecting to create your new project...");
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case "pro":
        return "bg-gradient-to-r from-gold-500 to-gold-600 text-white";
      case "enterprise":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case "pro":
        return "Pro";
      case "enterprise":
        return "Enterprise";
      default:
        return "Free";
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Film className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Sign in to view your projects</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Projects</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-400">
              {projects.length} of {limitInfo.limit} project
              {projects.length !== 1 ? "s" : ""}
            </p>
            {profile && (
              <div
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPlanBadgeStyle(
                  profile.plan
                )}`}
              >
                <Crown className="h-3 w-3 mr-1" />
                {getPlanDisplayName(profile.plan)} Plan
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Project Limit Info */}
          {profile?.plan === "free" && (
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {limitInfo.remaining} of {limitInfo.limit} remaining
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-gradient-to-r from-gold-500 to-gold-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (limitInfo.current / (limitInfo.limit as number)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Create Project Button */}
          <div className="relative group">
            <button
              onClick={handleCreateNewProject}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                limitInfo.canCreate
                  ? "bg-gold-600 hover:bg-gold-700 text-white"
                  : "bg-gray-600 hover:bg-gray-500 text-white"
              }`}
            >
              {limitInfo.canCreate ? (
                <>
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  <span>Upgrade to Create More</span>
                </>
              )}
            </button>

            {/* Tooltip for create button */}
            {limitInfo.canCreate && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="flex items-start space-x-2">
                  <Plus className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gold-400 font-medium text-sm">
                      Create New Project
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      You'll be taken to the home page where you can enter your
                      film idea to generate a new project.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Limit Warning Tooltip */}
            {!limitInfo.canCreate && profile?.plan === "free" && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-400 font-medium text-sm">
                      Project Limit Reached
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      Free plan is limited to 3 projects. Upgrade to Pro or
                      Enterprise for unlimited projects.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Limit Warning */}
      {profile?.plan === "free" && projects.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-900/20 border border-orange-700 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-orange-400 font-medium">
                Approaching Project Limit
              </h4>
              <p className="text-orange-300 text-sm mt-1">
                You're using {projects.length} of 3 free projects.
                {projects.length === 3
                  ? " Upgrade to create more projects."
                  : ` You have ${3 - projects.length} project${
                      3 - projects.length !== 1 ? "s" : ""
                    } remaining.`}
              </p>
              <button
                onClick={() => navigate("/pricing")}
                className="mt-2 text-orange-400 hover:text-orange-300 text-sm font-medium underline"
              >
                View Upgrade Options →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Film className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            No projects yet. Create your first film project!
          </p>
          <button
            onClick={handleCreateNewProject}
            className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </button>
          <p className="text-gray-500 text-sm mt-3">
            You'll be taken to the home page to enter your film idea
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isEditing={editingProject === project.id}
              editingTitle={editingTitle}
              saving={saving}
              onOpen={() => handleOpenProject(project.id)}
              onDelete={() => handleDeleteProject(project.id, project.title)}
              onStartEdit={() => handleStartEdit(project)}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={() => handleSaveEdit(project.id)}
              onTitleChange={setEditingTitle}
              onKeyPress={(e) => handleKeyPress(e, project.id)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ProjectCardProps {
  project: any;
  index: number;
  isEditing: boolean;
  editingTitle: string;
  saving: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onTitleChange: (title: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  formatDate: (date: string) => string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isEditing,
  editingTitle,
  saving,
  onOpen,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onTitleChange,
  onKeyPress,
  formatDate,
}) => {
  const { status, loading } = useProjectStatus(project.id);

  const getStatusIcon = (completed: boolean, inProgress: boolean) => {
    if (completed) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    } else if (inProgress) {
      return <Clock className="h-4 w-4 text-gold-400" />;
    } else {
      return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (completed: boolean, inProgress: boolean) => {
    if (completed) return "text-green-400";
    if (inProgress) return "text-gold-400";
    return "text-gray-500";
  };

  const getProgressPercentage = () => {
    if (!status) return 0;

    let completed = 0;
    if (status.story.completed) completed++;
    if (status.shots.completed) completed++;
    if (status.photoboard.completed) completed++;

    return Math.round((completed / 3) * 100);
  };

  const getNextStep = () => {
    if (!status) return "Start with story development";

    if (!status.story.completed) return "Complete story development";
    if (!status.shots.completed) return "Generate shot list";
    if (!status.photoboard.completed) return "Create storyboard";
    return "Ready for export";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gold-500 transition-all duration-200 group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-cinema-600 rounded-lg flex items-center justify-center">
            <Film className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {!isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit();
                }}
                className="p-2 text-gray-400 hover:text-gold-400 transition-colors duration-200"
                title="Edit project name"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Project Title - Editable */}
        <div className="mb-4">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                onKeyDown={onKeyPress}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent text-lg font-semibold"
                placeholder="Enter project name"
                autoFocus
                maxLength={100}
                disabled={saving}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onSaveEdit}
                    disabled={saving || !editingTitle.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={onCancelEdit}
                    disabled={saving}
                    className="text-gray-400 hover:text-white disabled:opacity-50 px-2 py-1 text-sm transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
                <span
                  className={`text-xs ${
                    editingTitle.length > 80
                      ? "text-orange-400"
                      : "text-gray-500"
                  }`}
                >
                  {editingTitle.length}/100
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Press Enter to save, Escape to cancel
              </p>
            </div>
          ) : (
            <h3
              className="text-lg font-semibold text-white line-clamp-2 group-hover:text-gold-400 transition-colors duration-200 cursor-pointer"
              onClick={onOpen}
              title="Click to open project"
            >
              {project.title}
            </h3>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {project.original_idea}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs text-gray-400">
              {getProgressPercentage()}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cinema-500 to-gold-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Next Step */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Next step:</p>
          <p className="text-sm text-gold-400 font-medium">{getNextStep()}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
          <span>Updated {formatDate(project.updated_at)}</span>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-700/50 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            {loading ? (
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400">Loading status...</span>
              </div>
            ) : status ? (
              <>
                {/* Story Status */}
                <div className="flex items-center space-x-1">
                  {getStatusIcon(
                    status.story.completed,
                    status.story.inProgress
                  )}
                  <span
                    className={getStatusColor(
                      status.story.completed,
                      status.story.inProgress
                    )}
                  >
                    Story
                  </span>
                </div>

                {/* Shots Status */}
                <div className="flex items-center space-x-1">
                  {getStatusIcon(
                    status.shots.completed,
                    status.shots.inProgress
                  )}
                  <span
                    className={getStatusColor(
                      status.shots.completed,
                      status.shots.inProgress
                    )}
                  >
                    Shots
                  </span>
                </div>

                {/* Photoboard Status */}
                <div className="flex items-center space-x-1">
                  {getStatusIcon(
                    status.photoboard.completed,
                    status.photoboard.inProgress
                  )}
                  <span
                    className={getStatusColor(
                      status.photoboard.completed,
                      status.photoboard.inProgress
                    )}
                  >
                    Board
                  </span>
                </div>
              </>
            ) : (
              <span className="text-gray-500">Status unavailable</span>
            )}
          </div>
          {!isEditing && (
            <div
              className="flex items-center space-x-1 text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors duration-200 cursor-pointer"
              onClick={onOpen}
            >
              <span>Open</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
