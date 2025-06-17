import { useState } from 'react';
import toast from 'react-hot-toast';

interface StoryData {
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

interface ShotData {
  shot_number: number;
  scene_number: number;
  shot_type: string;
  camera_angle: string;
  camera_movement: string;
  description: string;
  lens_recommendation: string;
  estimated_duration: number;
  notes: string;
}

export const usePDFExport = () => {
  const [exportingStory, setExportingStory] = useState(false);
  const [exportingShots, setExportingShots] = useState(false);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportStoryPDF = async (projectName: string, storyData: StoryData) => {
    setExportingStory(true);
    
    try {
      toast.loading('Generating story PDF...', { id: 'export-story' });
      
      const response = await fetch('http://localhost:8000/generate-pdf-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: projectName,
          story: storyData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_story.pdf`;
      
      downloadFile(blob, filename);
      toast.success('Story PDF exported successfully!', { id: 'export-story' });
      
    } catch (error) {
      console.error('Error exporting story PDF:', error);
      toast.error('Failed to export story PDF. Please try again.', { id: 'export-story' });
    } finally {
      setExportingStory(false);
    }
  };

  const exportShotsPDF = async (projectName: string, shotsData: ShotData[]) => {
    setExportingShots(true);
    
    try {
      toast.loading('Generating shot list PDF...', { id: 'export-shots' });
      
      const response = await fetch('http://localhost:8000/generate-pdf-shot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: projectName,
          shot: shotsData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_shot_list.pdf`;
      
      downloadFile(blob, filename);
      toast.success('Shot list PDF exported successfully!', { id: 'export-shots' });
      
    } catch (error) {
      console.error('Error exporting shots PDF:', error);
      toast.error('Failed to export shot list PDF. Please try again.', { id: 'export-shots' });
    } finally {
      setExportingShots(false);
    }
  };

  return {
    exportStoryPDF,
    exportShotsPDF,
    exportingStory,
    exportingShots,
  };
};