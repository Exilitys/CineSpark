import { useState } from 'react';

interface StoryAPIResponse {
  success: boolean;
  data?: {
    story_id: string;
    user_input: string;
    generated_content: string;
    timestamp: string;
    status: 'draft' | 'published';
  };
  error?: string;
  timestamp: string;
}

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

  const generateStoryFromAPI = async (userIdea: string): Promise<GeneratedStory | null> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock API response - in production, this would be a real API call
      const mockResponse: StoryAPIResponse = {
        success: true,
        data: {
          story_id: `story_${Date.now()}`,
          user_input: userIdea,
          generated_content: JSON.stringify(generateMockStory(userIdea)),
          timestamp: new Date().toISOString(),
          status: 'draft'
        },
        timestamp: new Date().toISOString()
      };

      if (!mockResponse.success || !mockResponse.data) {
        throw new Error(mockResponse.error || 'Failed to generate story');
      }

      const generatedStory = JSON.parse(mockResponse.data.generated_content) as GeneratedStory;
      return generatedStory;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Story generation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateMockStory = (userIdea: string): GeneratedStory => {
    // Generate contextual story based on user input
    const isLighthouseStory = userIdea.toLowerCase().includes('lighthouse') || 
                             userIdea.toLowerCase().includes('keeper') ||
                             userIdea.toLowerCase().includes('sea');

    if (isLighthouseStory) {
      return {
        logline: "A lonely lighthouse keeper discovers a mysterious sea creature that challenges everything he believes about isolation and connection.",
        synopsis: "Marcus, a reclusive lighthouse keeper on a remote island, has spent five years in solitude after a tragic accident. His monotonous routine is shattered when he discovers Naia, a wounded sea creature with intelligence beyond human understanding. As Marcus nurses Naia back to health, he learns that she comes from an ancient underwater civilization facing extinction due to ocean pollution. Together, they must overcome their fear of the outside world to save both their species, discovering that true connection transcends the boundaries of species and solitude.",
        three_act_structure: {
          act1: "Marcus maintains his isolated routine at the lighthouse, haunted by memories of the accident. During a fierce storm, he discovers Naia washed ashore, injured and unlike anything he's ever seen. Despite his fear, he decides to help her recover.",
          act2: "As Naia heals, she and Marcus develop a unique form of communication. She reveals the dire situation of her underwater civilization and the connection to human pollution. Marcus must confront his past trauma and decide whether to help Naia contact the outside world, risking exposure of both their secrets.",
          act3: "Marcus and Naia work together to establish contact with Dr. Chen and the scientific community. They face skepticism and danger as corporate interests threaten both the lighthouse and Naia's people. The climax involves Marcus overcoming his isolation to lead a mission that saves Naia's civilization and establishes a new era of interspecies cooperation."
        },
        characters: [
          {
            name: "Marcus",
            description: "A weathered 45-year-old former marine biologist turned lighthouse keeper",
            motivation: "To find redemption and purpose after losing his research team in a diving accident",
            arc: "From isolated and guilt-ridden to connected and purposeful"
          },
          {
            name: "Naia",
            description: "An intelligent sea creature from an ancient underwater civilization",
            motivation: "To save her dying people and forge understanding between species",
            arc: "From fearful and suspicious to trusting and collaborative"
          },
          {
            name: "Dr. Sarah Chen",
            description: "Marcus's former colleague and marine research director",
            motivation: "To bring Marcus back to the scientific community and continue their work",
            arc: "From professional concern to personal understanding and support"
          }
        ],
        scenes: [
          {
            title: "Morning Routine",
            setting: "Lighthouse interior at dawn",
            description: "Marcus performs his daily maintenance routine with mechanical precision",
            characters: ["Marcus"],
            key_actions: ["Checking lighthouse equipment", "Making coffee", "Looking out at empty ocean"]
          },
          {
            title: "The Discovery",
            setting: "Rocky shore after storm",
            description: "Marcus finds Naia unconscious on the beach, making the choice to help",
            characters: ["Marcus", "Naia"],
            key_actions: ["Discovering Naia", "Initial fear and curiosity", "Decision to help"]
          },
          {
            title: "First Contact",
            setting: "Lighthouse basement pool",
            description: "Naia awakens and first attempts at communication begin",
            characters: ["Marcus", "Naia"],
            key_actions: ["Naia's awakening", "Establishing basic communication", "Building trust"]
          }
        ]
      };
    }

    // Default story template for other ideas
    return {
      logline: `A compelling story about ${userIdea.toLowerCase()} that explores themes of growth, challenge, and transformation.`,
      synopsis: `This is an engaging narrative that takes the concept of "${userIdea}" and develops it into a full story with rich characters, meaningful conflict, and satisfying resolution. The story explores deep themes while maintaining entertainment value and emotional resonance.`,
      three_act_structure: {
        act1: `The story begins by establishing the world and introducing our protagonist in their ordinary life. The concept of "${userIdea}" is introduced, setting up the central premise and the character's initial relationship to this concept.`,
        act2: `The protagonist faces escalating challenges related to "${userIdea}". They must confront obstacles, make difficult choices, and grow as a person. The stakes are raised and the true nature of the conflict becomes clear.`,
        act3: `The climax brings together all the story elements as the protagonist faces their greatest challenge. Through their journey with "${userIdea}", they achieve transformation and resolution, leading to a satisfying conclusion.`
      },
      characters: [
        {
          name: "Alex",
          description: "The determined protagonist who drives the story forward",
          motivation: `To understand and master the challenges presented by ${userIdea}`,
          arc: "From uncertainty to confidence and mastery"
        },
        {
          name: "Jordan",
          description: "A supportive ally who provides wisdom and assistance",
          motivation: "To help the protagonist succeed in their journey",
          arc: "From mentor to trusted friend and equal"
        },
        {
          name: "Casey",
          description: "The antagonist who represents the obstacles to overcome",
          motivation: `To prevent the protagonist from achieving their goals related to ${userIdea}`,
          arc: "From opposition to understanding or defeat"
        }
      ],
      scenes: [
        {
          title: "The Beginning",
          setting: "The protagonist's familiar environment",
          description: `Introduction to the world and the protagonist's relationship with ${userIdea}`,
          characters: ["Alex"],
          key_actions: ["Character introduction", "World establishment", "Inciting incident"]
        },
        {
          title: "The Challenge",
          setting: "A place of conflict and growth",
          description: `The protagonist faces their first major obstacle related to ${userIdea}`,
          characters: ["Alex", "Jordan"],
          key_actions: ["Obstacle introduction", "Character development", "Stakes raising"]
        },
        {
          title: "The Resolution",
          setting: "The climactic location",
          description: `The final confrontation and resolution of the story's central conflict`,
          characters: ["Alex", "Jordan", "Casey"],
          key_actions: ["Climactic confrontation", "Character transformation", "Story resolution"]
        }
      ]
    };
  };

  return {
    generateStoryFromAPI,
    loading,
    error
  };
};