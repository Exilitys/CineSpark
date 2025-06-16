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

export const useStoryAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deductCredits, validateCredits } = useCredits();

  const generateStoryFromAPI = async (
    userIdea: string,
    story: GeneratedStory | string = " "
  ): Promise<GeneratedStory | null> => {
    setLoading(true);
    setError(null);

    try {
      // Use STORY_GENERATION for both new stories and modifications
      const action = "STORY_GENERATION";

      // Validate credits before making API call
      const validation = await validateCredits(action);
      if (!validation.isValid) {
        setError(validation.message || "Insufficient credits");
        toast.error(validation.message || "Insufficient credits");
        return null;
      }

      // Make API call
      const response = await fetch("http://127.0.0.1:8000/generate_story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: userIdea,
          story: story,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Story API Result:", result);

      if (!result || !result.story) {
        throw new Error("Invalid response format");
      }

      // Deduct credits after successful generation
      const isModification = typeof story === "object" && story.logline;
      const deductionResult = await deductCredits(action, {
        user_idea: userIdea,
        is_modification: isModification,
        api_response_size: JSON.stringify(result).length,
      });

      if (!deductionResult.success) {
        console.error("Credit deduction failed:", deductionResult.error);
        toast.error(
          "Story generated but credit deduction failed. Please contact support."
        );
      } else {
        toast.success(
          `Story ${isModification ? "modified" : "generated"} successfully! ${
            validation.requiredCredits
          } credits deducted.`
        );
      }

      const generatedStory = result.story as GeneratedStory;
      return generatedStory;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Story generation error:", err);
      toast.error(`Story generation failed: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateStoryFromAPI,
    loading,
    error,
  };
};
