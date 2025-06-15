import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface StoryData {
  story_id: string;
  user_input: string;
  generated_content: string;
  edited_content: string | null;
  timestamp: string;
  status: 'draft' | 'published';
}

interface ApiResponse {
  success: boolean;
  data: StoryData | null;
  error: string | null;
  timestamp: string;
}

interface RequestCache {
  [key: string]: {
    data: ApiResponse;
    timestamp: number;
  };
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export const useStoryGeneration = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<RequestCache>({});

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const makeApiRequest = useCallback(async (
    endpoint: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<ApiResponse> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${supabaseUrl}/functions/v1/story-generate${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error(`API request failed (attempt ${retryCount + 1}):`, error);

      // Retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && 
          (error instanceof Error && 
           (error.name === 'AbortError' || 
            error.message.includes('fetch') || 
            error.message.includes('network')))) {
        
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
        return makeApiRequest(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }, [session]);

  const generateStory = useCallback(async (userInput: string): Promise<StoryData> => {
    if (!session) {
      throw new Error('User not authenticated');
    }

    if (!userInput || userInput.trim().length < 10) {
      throw new Error('User input must be at least 10 characters long');
    }

    if (userInput.length > 1000) {
      throw new Error('User input must be less than 1000 characters');
    }

    // Check cache first
    const cacheKey = `generate_${userInput.trim()}`;
    const cachedResult = cache[cacheKey];
    
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      console.log('Returning cached result');
      if (cachedResult.data.success && cachedResult.data.data) {
        return cachedResult.data.data;
      }
    }

    setLoading(true);

    try {
      const response = await makeApiRequest('/generate', {
        method: 'POST',
        body: JSON.stringify({ user_input: userInput.trim() }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate story');
      }

      // Cache successful response
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: response,
          timestamp: Date.now()
        }
      }));

      return response.data;
    } catch (error) {
      console.error('Story generation error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, cache, makeApiRequest]);

  const getStory = useCallback(async (storyId: string): Promise<StoryData> => {
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Check cache first
    const cacheKey = `get_${storyId}`;
    const cachedResult = cache[cacheKey];
    
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      console.log('Returning cached story');
      if (cachedResult.data.success && cachedResult.data.data) {
        return cachedResult.data.data;
      }
    }

    setLoading(true);

    try {
      const response = await makeApiRequest(`/${storyId}`, {
        method: 'GET',
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Story not found');
      }

      // Cache successful response
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: response,
          timestamp: Date.now()
        }
      }));

      return response.data;
    } catch (error) {
      console.error('Get story error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, cache, makeApiRequest]);

  const updateStory = useCallback(async (
    storyId: string, 
    editedContent: string | null, 
    status?: 'draft' | 'published'
  ): Promise<StoryData> => {
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Validation
    if (editedContent !== null) {
      if (typeof editedContent !== 'string') {
        throw new Error('Edited content must be a string');
      }
      if (editedContent.length < 10) {
        throw new Error('Edited content must be at least 10 characters long');
      }
      if (editedContent.length > 5000) {
        throw new Error('Edited content must be less than 5000 characters');
      }
    }

    setLoading(true);

    try {
      const updateData: any = {};
      if (editedContent !== undefined) {
        updateData.edited_content = editedContent;
      }
      if (status) {
        updateData.status = status;
      }

      const response = await makeApiRequest(`/${storyId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update story');
      }

      // Invalidate cache for this story
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[`get_${storyId}`];
        return newCache;
      });

      return response.data;
    } catch (error) {
      console.error('Update story error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session, makeApiRequest]);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  return {
    generateStory,
    getStory,
    updateStory,
    loading,
    clearCache,
  };
};