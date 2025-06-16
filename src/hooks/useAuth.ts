import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📊 Initial session result:', { 
          session: session ? 'Present' : 'None', 
          user: session?.user?.email || 'None',
          error: error?.message || 'None'
        });
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setInitialized(true);
          setLoading(false);
          
          console.log('✅ Auth state initialized:', {
            user: session?.user?.email || 'None',
            initialized: true,
            loading: false
          });
        }
      } catch (error) {
        console.error('💥 Error in getInitialSession:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', {
        event,
        user: session?.user?.email || 'None',
        sessionId: session?.access_token ? 'Present' : 'None'
      });
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set initialized to true after the first auth state change
        if (!initialized) {
          setInitialized(true);
        }
        setLoading(false);
        
        console.log('🔄 Auth hook state updated:', {
          event,
          user: session?.user?.email || 'None',
          initialized: true,
          loading: false
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('📝 Attempting sign up for:', email, 'with name:', fullName);
      
      const signUpData: any = {
        email,
        password,
      };

      // Add full name to user metadata if provided
      if (fullName && fullName.trim()) {
        signUpData.options = {
          data: {
            full_name: fullName.trim()
          }
        };
      }

      const { data, error } = await supabase.auth.signUp(signUpData);
      
      console.log('📝 Sign up result:', { 
        user: data?.user?.email || 'None', 
        session: data?.session ? 'Present' : 'None',
        error: error?.message || 'None' 
      });
      return { data, error };
    } catch (error) {
      console.error('💥 Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('🔑 Sign in result:', { 
        user: data?.user?.email || 'None', 
        session: data?.session ? 'Present' : 'None',
        error: error?.message || 'None' 
      });
      return { data, error };
    } catch (error) {
      console.error('💥 Sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Attempting sign out');
      const { error } = await supabase.auth.signOut();
      console.log('🚪 Sign out result:', { error: error?.message || 'None' });
      return { error };
    } catch (error) {
      console.error('💥 Sign out error:', error);
      return { error };
    }
  };

  // Debug current state every render
  console.log('🎯 useAuth current state:', {
    user: user?.email || 'None',
    loading,
    initialized,
    sessionExists: !!session
  });

  return {
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
  };
};