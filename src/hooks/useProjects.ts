import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true }); // Order by creation time for sequential numbering

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextProjectNumber = () => {
    // Find the highest project number from existing titles
    let maxNumber = 0;
    projects.forEach(project => {
      const match = project.title.match(/^Project #(\d+)/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    return maxNumber + 1;
  };

  const checkProjectLimit = (): { canCreate: boolean; message?: string } => {
    if (!profile) {
      return { canCreate: false, message: 'Profile not loaded' };
    }

    // Check plan limits
    const planLimits = {
      free: 3,
      pro: Infinity,
      enterprise: Infinity
    };

    const currentLimit = planLimits[profile.plan as keyof typeof planLimits] || planLimits.free;
    const currentCount = projects.length;

    if (currentCount >= currentLimit) {
      if (profile.plan === 'free') {
        return {
          canCreate: false,
          message: `Free plan is limited to ${currentLimit} projects. Upgrade to Pro or Enterprise for unlimited projects.`
        };
      } else {
        return {
          canCreate: false,
          message: `You have reached your plan limit of ${currentLimit} projects.`
        };
      }
    }

    return { canCreate: true };
  };

  const createProject = async (projectData: Omit<ProjectInsert, 'user_id' | 'title'> & { title?: string }) => {
    if (!user) throw new Error('User not authenticated');

    // Check project limit before creating
    const limitCheck = checkProjectLimit();
    if (!limitCheck.canCreate) {
      throw new Error(limitCheck.message);
    }

    try {
      // Generate sequential title if not provided
      const title = projectData.title || `Project #${getNextProjectNumber()}`;
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          title,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<ProjectInsert>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const updateProjectTitle = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      throw new Error('Project title cannot be empty');
    }

    // Check for duplicate titles (excluding current project)
    const duplicateExists = projects.some(p => 
      p.id !== id && p.title.toLowerCase() === newTitle.trim().toLowerCase()
    );

    if (duplicateExists) {
      throw new Error('A project with this name already exists');
    }

    return updateProject(id, { title: newTitle.trim() });
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const getProjectDisplayNumber = (project: Project) => {
    // Extract number from title or use index + 1 as fallback
    const match = project.title.match(/^Project #(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Fallback: find index in chronologically ordered list
    const sortedProjects = [...projects].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const index = sortedProjects.findIndex(p => p.id === project.id);
    return index + 1;
  };

  const getProjectLimitInfo = () => {
    if (!profile) {
      return { current: 0, limit: 0, canCreate: false, plan: 'free' };
    }

    const planLimits = {
      free: 3,
      pro: Infinity,
      enterprise: Infinity
    };

    const limit = planLimits[profile.plan as keyof typeof planLimits] || planLimits.free;
    const current = projects.length;
    const canCreate = current < limit;

    return {
      current,
      limit: limit === Infinity ? 'Unlimited' : limit,
      canCreate,
      plan: profile.plan,
      remaining: limit === Infinity ? 'Unlimited' : Math.max(0, limit - current)
    };
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    updateProjectTitle,
    deleteProject,
    getProjectById,
    getProjectDisplayNumber,
    checkProjectLimit,
    getProjectLimitInfo,
    refetch: fetchProjects,
  };
};