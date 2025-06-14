export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  story?: Story;
  shotList?: Shot[];
  photoboard?: PhotoboardFrame[];
}

export interface Story {
  logline: string;
  synopsis: string;
  characters: Character[];
  threeActStructure: {
    act1: string;
    act2: string;
    act3: string;
  };
  scenes: Scene[];
}

export interface Character {
  name: string;
  description: string;
  motivation: string;
  arc: string;
}

export interface Scene {
  id: string;
  title: string;
  setting: string;
  description: string;
  characters: string[];
  keyActions: string[];
}

export interface Shot {
  id: string;
  sceneId: string;
  shotNumber: number;
  shotType: 'Wide Shot' | 'Medium Shot' | 'Close-up' | 'Extreme Close-up' | 'POV' | 'Over Shoulder';
  cameraAngle: 'Eye-level' | 'High Angle' | 'Low Angle' | 'Dutch Angle' | 'Bird\'s Eye' | 'Worm\'s Eye';
  cameraMovement: 'Static' | 'Pan' | 'Tilt' | 'Dolly' | 'Steadicam' | 'Handheld' | 'Crane';
  description: string;
  lensRecommendation: string;
  estimatedDuration: number;
  notes?: string;
}

export interface PhotoboardFrame {
  id: string;
  shotId: string;
  imageUrl?: string;
  description: string;
  style: 'Photorealistic' | 'Sketch' | 'Comic Book' | 'Cinematic' | 'Noir';
  annotations?: string[];
}