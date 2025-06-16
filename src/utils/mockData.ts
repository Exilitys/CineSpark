import { Story, Shot, PhotoboardFrame } from '../types';

export const mockStory: Story = {
  logline: "A lonely lighthouse keeper discovers a mysterious sea creature that challenges everything he believes about isolation and connection.",
  synopsis: "Marcus, a reclusive lighthouse keeper on a remote island, has spent five years in solitude after a tragic accident. His monotonous routine is shattered when he discovers Naia, a wounded sea creature with intelligence beyond human understanding. As Marcus nurses Naia back to health, he learns that she comes from an ancient underwater civilization facing extinction due to ocean pollution. Together, they must overcome their fear of the outside world to save both their species, discovering that true connection transcends the boundaries of species and solitude.",
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
  threeActStructure: {
    act1: "Marcus maintains his isolated routine at the lighthouse, haunted by memories of the accident. During a fierce storm, he discovers Naia washed ashore, injured and unlike anything he's ever seen. Despite his fear, he decides to help her recover.",
    act2: "As Naia heals, she and Marcus develop a unique form of communication. She reveals the dire situation of her underwater civilization and the connection to human pollution. Marcus must confront his past trauma and decide whether to help Naia contact the outside world, risking exposure of both their secrets.",
    act3: "Marcus and Naia work together to establish contact with Dr. Chen and the scientific community. They face skepticism and danger as corporate interests threaten both the lighthouse and Naia's people. The climax involves Marcus overcoming his isolation to lead a mission that saves Naia's civilization and establishes a new era of interspecies cooperation."
  },
  scenes: [
    {
      id: "1",
      title: "Morning Routine",
      setting: "Lighthouse interior at dawn",
      description: "Marcus performs his daily maintenance routine with mechanical precision",
      characters: ["Marcus"],
      keyActions: ["Checking lighthouse equipment", "Making coffee", "Looking out at empty ocean"]
    },
    {
      id: "2", 
      title: "The Discovery",
      setting: "Rocky shore after storm",
      description: "Marcus finds Naia unconscious on the beach, making the choice to help",
      characters: ["Marcus", "Naia"],
      keyActions: ["Discovering Naia", "Initial fear and curiosity", "Decision to help"]
    },
    {
      id: "3",
      title: "First Contact",
      setting: "Lighthouse basement pool",
      description: "Naia awakens and first attempts at communication begin",
      characters: ["Marcus", "Naia"],
      keyActions: ["Naia's awakening", "Establishing basic communication", "Building trust"]
    }
  ]
};

export const mockShots: Shot[] = [
  {
    id: "shot_001",
    sceneId: "1",
    shotNumber: 1,
    shotType: "Wide Shot",
    cameraAngle: "High Angle",
    cameraMovement: "Static",
    description: "Establishing shot of the lighthouse at dawn, surrounded by mist and crashing waves",
    lensRecommendation: "24mm wide-angle lens",
    estimatedDuration: 8,
    notes: "Golden hour lighting, emphasize isolation"
  },
  {
    id: "shot_002", 
    sceneId: "1",
    shotNumber: 2,
    shotType: "Medium Shot",
    cameraAngle: "Eye-level",
    cameraMovement: "Pan",
    description: "Marcus moving through lighthouse interior, checking equipment methodically",
    lensRecommendation: "50mm standard lens",
    estimatedDuration: 12,
    notes: "Handheld for intimate feel"
  },
  {
    id: "shot_003",
    sceneId: "1", 
    shotNumber: 3,
    shotType: "Close-up",
    cameraAngle: "Eye-level",
    cameraMovement: "Static",
    description: "Close-up of Marcus's weathered hands adjusting lighthouse mechanism",
    lensRecommendation: "85mm portrait lens",
    estimatedDuration: 4,
    notes: "Focus on texture and routine"
  },
  {
    id: "shot_004",
    sceneId: "2",
    shotNumber: 4,
    shotType: "Wide Shot", 
    cameraAngle: "Low Angle",
    cameraMovement: "Dolly",
    description: "Marcus walking down rocky shore, storm debris scattered around",
    lensRecommendation: "35mm lens",
    estimatedDuration: 10,
    notes: "Steadicam for smooth movement"
  },
  {
    id: "shot_005",
    sceneId: "2",
    shotNumber: 5,
    shotType: "Extreme Close-up",
    cameraAngle: "High Angle", 
    cameraMovement: "Static",
    description: "Marcus's eyes widening as he first sees Naia",
    lensRecommendation: "100mm macro lens",
    estimatedDuration: 3,
    notes: "Capture moment of discovery"
  },
  {
    id: "shot_006",
    sceneId: "3",
    shotNumber: 6,
    shotType: "POV",
    cameraAngle: "Eye-level",
    cameraMovement: "Handheld",
    description: "Naia's perspective as she awakens in the makeshift pool",
    lensRecommendation: "28mm wide lens",
    estimatedDuration: 6,
    notes: "Underwater housing for partial submersion"
  }
];

export const mockPhotoboardFrames: PhotoboardFrame[] = [
  {
    id: "frame_001",
    shotId: "shot_001",
    imageUrl: "https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Lighthouse at dawn with misty atmosphere and dramatic lighting",
    style: "Cinematic",
    annotations: ["Golden hour", "Atmospheric mist", "Isolation theme"]
  },
  {
    id: "frame_002",
    shotId: "shot_002", 
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Interior lighthouse scene with vintage equipment and warm lighting",
    style: "Cinematic",
    annotations: ["Warm interior", "Routine work", "Character establishment"]
  },
  {
    id: "frame_003",
    shotId: "shot_003",
    imageUrl: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Close-up of weathered hands working with mechanical precision",
    style: "Photorealistic",
    annotations: ["Texture focus", "Character detail", "Mechanical precision"]
  },
  {
    id: "frame_004",
    shotId: "shot_004",
    imageUrl: "https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Rocky coastline with storm debris and dramatic sky",
    style: "Cinematic", 
    annotations: ["Post-storm", "Rocky terrain", "Discovery setup"]
  },
  {
    id: "frame_005",
    shotId: "shot_005",
    imageUrl: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Extreme close-up of surprised human eyes reflecting wonder",
    style: "Photorealistic",
    annotations: ["Emotional moment", "Discovery reaction", "Character depth"]
  },
  {
    id: "frame_006",
    shotId: "shot_006",
    imageUrl: "https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Underwater perspective looking up toward surface with mysterious ambiance",
    style: "Cinematic",
    annotations: ["POV shot", "Underwater", "Mystery element"]
  }
];