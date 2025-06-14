export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          original_idea: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          original_idea: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          original_idea?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          project_id: string;
          logline: string;
          synopsis: string;
          three_act_structure: {
            act1: string;
            act2: string;
            act3: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          logline: string;
          synopsis: string;
          three_act_structure: {
            act1: string;
            act2: string;
            act3: string;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          logline?: string;
          synopsis?: string;
          three_act_structure?: {
            act1: string;
            act2: string;
            act3: string;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          story_id: string;
          name: string;
          description: string;
          motivation: string;
          arc: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          name: string;
          description: string;
          motivation: string;
          arc: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          name?: string;
          description?: string;
          motivation?: string;
          arc?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      scenes: {
        Row: {
          id: string;
          story_id: string;
          title: string;
          setting: string;
          description: string;
          characters: string[];
          key_actions: string[];
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          title: string;
          setting: string;
          description: string;
          characters?: string[];
          key_actions?: string[];
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          title?: string;
          setting?: string;
          description?: string;
          characters?: string[];
          key_actions?: string[];
          order_index?: number;
          created_at?: string;
        };
      };
      shots: {
        Row: {
          id: string;
          project_id: string;
          scene_id: string | null;
          shot_number: number;
          scene_number: number;
          shot_type: string;
          camera_angle: string;
          camera_movement: string;
          description: string;
          lens_recommendation: string;
          estimated_duration: number;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          scene_id?: string | null;
          shot_number: number;
          scene_number?: number;
          shot_type: string;
          camera_angle: string;
          camera_movement: string;
          description: string;
          lens_recommendation: string;
          estimated_duration?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          scene_id?: string | null;
          shot_number?: number;
          scene_number?: number;
          shot_type?: string;
          camera_angle?: string;
          camera_movement?: string;
          description?: string;
          lens_recommendation?: string;
          estimated_duration?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      photoboard_frames: {
        Row: {
          id: string;
          project_id: string;
          shot_id: string | null;
          image_url: string | null;
          description: string;
          style: string;
          annotations: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          shot_id?: string | null;
          image_url?: string | null;
          description: string;
          style?: string;
          annotations?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          shot_id?: string | null;
          image_url?: string | null;
          description?: string;
          style?: string;
          annotations?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}