import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Edit3,
  Plus,
  Filter,
  Download,
  Check,
  Trash2,
  Image,
} from "lucide-react";
import { Database } from "../../types/database";
import { AIChatbox } from "../AI/AIChatbox";
import { CreditGuard } from "../Credits/CreditGuard";
import { useShotListAPI } from "../../hooks/useShotListAPI";
import { useStory } from "../../hooks/useStory";
import { useCredits } from "../../hooks/useCredits";
import { usePDFExport } from "../../hooks/usePDFExport";
import { useProjects } from "../../hooks/useProjects";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

type Shot = Database["public"]["Tables"]["shots"]["Row"];

interface ShotListViewProps {
  shots: Shot[];
  onEditShot?: (shot: Shot) => void;
  onDeleteShot?: (shotId: string) => void;
  onAddShot?: () => void;
  onApprove?: () => void;
  onUpdateShots?: (updatedShots: Shot[]) => void;
}

export const ShotListView: React.FC<ShotListViewProps> = ({
  shots,
  onEditShot,
  onDeleteShot,
  onAddShot,
  onApprove,
  onUpdateShots,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedScene, setSelectedScene] = useState("all");
  const [deletingShot, setDeletingShot] = useState<string | null>(null);
  const [showCreditGuard, setShowCreditGuard] = useState(false);
  const [pendingAISuggestion, setPendingAISuggestion] = useState<string | null>(
    null
  );

  const {
    generateShotListFromAPI,
    loading: shotApiLoading,
    error: shotApiError,
  } = useShotListAPI();
  const { story } = useStory(projectId || null);
  const { canPerformAction, getCreditCost } = useCredits();
  const { exportShotsPDF, exportingShots } = usePDFExport();
  const { projects } = useProjects();

  // Get project details for export
  const currentProject = projects.find((p) => p.id === projectId);
  const projectName = currentProject?.title || "Untitled Project";

  const uniqueScenes = Array.from(
    new Set(shots.map((shot) => shot.scene_number).filter(Boolean))
  );
  uniqueScenes.sort((a, b) => a - b);

  const filteredShots = shots.filter((shot) => {
    if (selectedScene === "all") return true;
    return shot.scene_number === parseInt(selectedScene);
  });

  const handleExportShotsPDF = async () => {
    try {
      const shotsData = shots.map((shot) => ({
        shot_number: shot.shot_number,
        scene_number: shot.scene_number,
        shot_type: shot.shot_type,
        camera_angle: shot.camera_angle,
        camera_movement: shot.camera_movement,
        description: shot.description,
        lens_recommendation: shot.lens_recommendation,
        estimated_duration: shot.estimated_duration || 5,
        notes: shot.notes || "",
      }));

      await exportShotsPDF(projectName, shotsData);
    } catch (error) {
      console.error("Error exporting shots PDF:", error);
      toast.error("Failed to export shot list PDF");
    }
  };

  const getShotTypeColor = (shotType: string) => {
    const colors = {
      "Wide Shot": "text-blue-400 bg-blue-900/20",
      "Medium Shot": "text-green-400 bg-green-900/20",
      "Close-Up": "text-yellow-400 bg-yellow-900/20",
      "Extreme Close-up": "text-red-400 bg-red-900/20",
      "Over Shoulder": "text-orange-400 bg-orange-900/20",
      "Establishing Shot": "text-purple-400 bg-orange-900/20",
    };
    return (
      colors[shotType as keyof typeof colors] || "text-gray-400 bg-gray-900/20"
    );
  };

  const getSceneColor = (sceneNumber: number) => {
    const colors = [
      "text-gold-400 bg-gold-900/20",
      "text-cinema-400 bg-cinema-900/20",
      "text-green-400 bg-green-900/20",
      "text-purple-400 bg-purple-900/20",
      "text-red-400 bg-red-900/20",
    ];
    return (
      colors[(sceneNumber - 1) % colors.length] ||
      "text-gray-400 bg-gray-900/20"
    );
  };

  const totalDuration = filteredShots.reduce(
    (sum, shot) => sum + (shot.estimated_duration || 0),
    0
  );

  // Group shots by scene for better organization
  const shotsByScene = filteredShots.reduce((acc, shot) => {
    const sceneNum = shot.scene_number || 1;
    if (!acc[sceneNum]) acc[sceneNum] = [];
    acc[sceneNum].push(shot);
    return acc;
  }, {} as Record<number, Shot[]>);

  const handleDeleteShot = async (shot: Shot) => {
    if (!onDeleteShot) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete Shot ${shot.shot_number
        .toString()
        .padStart(3, "0")}?\n\n"${
        shot.description
      }"\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      setDeletingShot(shot.id);
      try {
        await onDeleteShot(shot.id);
      } catch (error) {
        console.error("Error deleting shot:", error);
      } finally {
        setDeletingShot(null);
      }
    }
  };

  const handleAISuggestion = async (suggestion: string) => {
    if (!story || !onUpdateShots) {
      toast.error("Story data not available for shot modifications");
      return;
    }

    // Check if user can perform the action
    const canProceed = await canPerformAction("SHOT_LIST_GENERATION");
    if (!canProceed) {
      setPendingAISuggestion(suggestion);
      setShowCreditGuard(true);
      return;
    }

    await processAISuggestion(suggestion);
  };

  const processAISuggestion = async (suggestion: string) => {
    if (!story || !onUpdateShots) return;

    try {
      toast.loading("AI is processing your suggestion...", {
        id: "ai-suggestion",
      });

      // Prepare current story data
      const storyData = {
        logline: story.logline,
        synopsis: story.synopsis,
        three_act_structure: story.three_act_structure,
        characters: story.characters.map((char) => ({
          name: char.name,
          description: char.description,
          motivation: char.motivation,
          arc: char.arc,
        })),
        scenes: story.scenes.map((scene) => ({
          title: scene.title,
          setting: scene.setting,
          description: scene.description,
          characters: scene.characters,
          key_actions: scene.key_actions,
        })),
      };

      // Prepare current shot data for API
      const currentShotsData = shots.map((shot) => ({
        shot_number: shot.shot_number,
        scene_number: shot.scene_number,
        shot_type: shot.shot_type,
        camera_angle: shot.camera_angle,
        camera_movement: shot.camera_movement,
        description: shot.description,
        lens_recommendation: shot.lens_recommendation,
        estimated_duration: shot.estimated_duration || 5,
        notes: shot.notes || "",
      }));

      console.log("🎬 Sending current shots to API:", {
        shotsCount: currentShotsData.length,
        suggestion,
        firstShot: currentShotsData[0],
      });

      // Call API with suggestion, current story, and current shots (credits will be deducted inside the hook)
      const updatedShotList = await generateShotListFromAPI(
        storyData,
        suggestion,
        currentShotsData // Pass current shots to API
      );

      if (!updatedShotList) {
        toast.error("Failed to process suggestion. Please try again.", {
          id: "ai-suggestion",
        });
        return;
      }

      // Convert API response to database format
      const updatedShots = updatedShotList.shots.map(
        (apiShot: any, index: number) => {
          const existingShot = shots[index];
          return {
            ...existingShot,
            shot_number: apiShot.shot_number,
            scene_number: apiShot.scene_number,
            shot_type: apiShot.shot_type,
            camera_angle: apiShot.camera_angle,
            camera_movement: apiShot.camera_movement,
            description: apiShot.description,
            lens_recommendation: apiShot.lens_recommendation,
            estimated_duration: apiShot.estimated_duration,
            notes: apiShot.notes,
          };
        }
      );

      // Update shots through parent component
      onUpdateShots(updatedShots);

      toast.success("Shot list updated based on your suggestion!", {
        id: "ai-suggestion",
      });
    } catch (error) {
      console.error("Error processing AI suggestion:", error);
      toast.error("Error processing suggestion. Please try again.", {
        id: "ai-suggestion",
      });
    }
  };

  const handleCreditGuardProceed = () => {
    if (pendingAISuggestion) {
      processAISuggestion(pendingAISuggestion);
      setPendingAISuggestion(null);
    }
  };

  const handleCreditGuardCancel = () => {
    setShowCreditGuard(false);
    setPendingAISuggestion(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cinema-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">Shot List</h1>
              <p className="text-xs sm:text-sm text-gray-400">
                {shots.length} shots • {uniqueScenes.length} scenes •{" "}
                {Math.floor(totalDuration / 60)}m {totalDuration % 60}s total
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={handleExportShotsPDF}
              disabled={exportingShots}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              {exportingShots ? (
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
            {onAddShot && (
              <button
                onClick={onAddShot}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Shot</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
            {onApprove && (
              <button
                onClick={onApprove}
                className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
              >
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Generate Storyboard</span>
                <span className="sm:hidden">Storyboard</span>
              </button>
            )}
          </div>
        </div>

        {/* API Error Display */}
        {shotApiError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">Error: {shotApiError}</p>
          </div>
        )}

        {/* Filters */}
        {uniqueScenes.length > 1 && (
          <div className="bg-gray-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-700 overflow-x-auto hide-scrollbar">
            <div className="flex flex-nowrap items-center gap-3 sm:gap-4 min-w-max">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">
                  Filter by scene:
                </span>
              </div>
              <div className="flex flex-nowrap gap-2">
                <button
                  onClick={() => setSelectedScene("all")}
                  className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap ${
                    selectedScene === "all"
                      ? "bg-cinema-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  All Scenes
                </button>
                {uniqueScenes.map((sceneNum) => (
                  <button
                    key={sceneNum}
                    onClick={() => setSelectedScene(sceneNum.toString())}
                    className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors duration-200 whitespace-nowrap ${
                      selectedScene === sceneNum.toString()
                        ? "bg-cinema-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Scene {sceneNum}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shot List Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Shot #
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Scene
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Shot Type
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Camera
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Duration
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredShots.map((shot, index) => (
                  <motion.tr
                    key={shot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-gray-700/50 transition-colors duration-200 ${
                      deletingShot === shot.id ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-white">
                        {shot.shot_number.toString().padStart(3, "0")}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSceneColor(
                          shot.scene_number || 1
                        )}`}
                      >
                        {shot.scene_number || 1}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShotTypeColor(
                          shot.shot_type
                        )}`}
                      >
                        {shot.shot_type}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-300">
                        <div>{shot.camera_angle}</div>
                        <div className="text-xs text-gray-500">
                          {shot.camera_movement}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm text-gray-300 max-w-[150px] sm:max-w-xs">
                        <div className="line-clamp-2">{shot.description}</div>
                        <div className="text-xs text-gold-400 mt-1 hidden sm:block">
                          {shot.lens_recommendation}
                        </div>
                        {shot.notes && (
                          <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                            {shot.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-300">
                        {shot.estimated_duration}s
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {onEditShot && (
                          <button
                            onClick={() => onEditShot(shot)}
                            disabled={deletingShot === shot.id}
                            className="text-gold-400 hover:text-gold-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Edit shot"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        {onDeleteShot && (
                          <button
                            onClick={() => handleDeleteShot(shot)}
                            disabled={deletingShot === shot.id}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Delete shot"
                          >
                            {deletingShot === shot.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scene Summary */}
        {selectedScene === "all" && uniqueScenes.length > 1 && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {uniqueScenes.map((sceneNum) => {
              const sceneShots = shotsByScene[sceneNum] || [];
              const sceneDuration = sceneShots.reduce(
                (sum, shot) => sum + (shot.estimated_duration || 0),
                0
              );

              return (
                <motion.div
                  key={sceneNum}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: sceneNum * 0.1 }}
                  className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSceneColor(
                        sceneNum
                      )}`}
                    >
                      Scene {sceneNum}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.floor(sceneDuration / 60)}m {sceneDuration % 60}s
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    {sceneShots.length} shots
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Shots {sceneShots[0]?.shot_number} -{" "}
                    {sceneShots[sceneShots.length - 1]?.shot_number}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredShots.length === 0 && shots.length > 0 && (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              No shots found for the selected scene.
            </p>
          </div>
        )}
      </motion.div>

      {/* AI Chatbox */}
      <AIChatbox
        onSendSuggestion={handleAISuggestion}
        loading={shotApiLoading}
        placeholder={`Ask AI to modify shots, add new ones, or change cinematography... (${getCreditCost(
          "SHOT_LIST_GENERATION"
        )} credits)`}
        title="Shot List AI Assistant"
        creditAction="SHOT_LIST_GENERATION"
      />

      {/* Credit Guard Modal */}
      <CreditGuard
        action="SHOT_LIST_GENERATION"
        showModal={showCreditGuard}
        onProceed={handleCreditGuardProceed}
        onCancel={handleCreditGuardCancel}
        title="AI Shot List Modification"
        description="Use AI to modify your shot list based on your suggestions."
        metadata={{
          suggestion: pendingAISuggestion,
          shots_count: shots.length,
        }}
      />
    </>
  );
};