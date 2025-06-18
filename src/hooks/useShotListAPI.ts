import { useState } from "react";
import { useCredits } from "./useCredits";
import toast from "react-hot-toast";

interface GeneratedStory {
  logline: string;
  synopsis: string;
  three_act_structure: {
    act1: string;
    act2: string;
    act3: string;
  };
  characters: Array<{
    name: string;
    description: string;
    motivation: string;
    arc: string;
  }>;
  scenes: Array<{
    title: string;
    setting: string;
    description: string;
    characters: string[];
    key_actions: string[];
  }>;
}

interface GeneratedShotList {
  shots: Array<{
    shot_number: number;
    scene_number: number;
    shot_type: string;
    camera_angle: string;
    camera_movement: string;
    description: string;
    lens_recommendation: string;
    estimated_duration: number;
    notes: string;
  }>;
}

export const useShotListAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deductCredits, validateCredits } = useCredits();

  const generateShotListFromAPI = async (
    storyData: GeneratedStory,
    idea: string = " ",
    shotdata: GeneratedShotList | string = " "
  ): Promise<GeneratedShotList | null> => {
    setLoading(true);
    setError(null);

    try {
      // Use SHOT_LIST_GENERATION for both new shot lists and modifications
      const action = "SHOT_LIST_GENERATION";

      // Validate credits before making API call
      const validation = await validateCredits(action);
      if (!validation.isValid) {
        setError(validation.message || "Insufficient credits");
        toast.error(validation.message || "Insufficient credits");
        return null;
      }

      // Make API call
      const response = await fetch("http://127.0.0.1:8000/generate_shot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: idea,
          story: JSON.stringify(storyData),
          shot: shotdata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Shot List API Result:", result);

      if (!result || !Array.isArray(result.shot)) {
        throw new Error("Invalid response format");
      }

      // Deduct credits after successful generation
      const isModification = idea.trim() !== " " && idea.trim() !== "";
      const deductionResult = await deductCredits(action, {
        story_logline: storyData.logline,
        modification_request: idea,
        is_modification: isModification,
        shots_generated: result.shot.length,
        api_response_size: JSON.stringify(result).length,
      });

      if (!deductionResult.success) {
        console.error("Credit deduction failed:", deductionResult.error);
        toast.error(
          "Shot list generated but credit deduction failed. Please contact support."
        );
      } else {
        toast.success(
          `Shot list ${
            isModification ? "modified" : "generated"
          } successfully! ${validation.requiredCredits} credits deducted.`
        );
      }

      const generatedShotList: GeneratedShotList = {
        shots: result.shot,
      };

      return generatedShotList;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Shot list generation error:", err);
      toast.error(`Shot list generation failed: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateShotListFromAPI,
    loading,
    error,
  };
};
