import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

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
        console.log("🔍 Getting initial session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("📊 Initial session result:", {
          session: session ? "Present" : "None",
          user: session?.user?.email || "None",
          error: error?.message || "None",
        });

        if (error) {
          console.error("❌ Error getting session:", error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setInitialized(true);
          setLoading(false);

          console.log("✅ Auth state initialized:", {
            user: session?.user?.email || "None",
            initialized: true,
            loading: false,
          });
        }
      } catch (error) {
        console.error("💥 Error in getInitialSession:", error);
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
      console.log("🔄 Auth state changed:", {
        event,
        user: session?.user?.email || "None",
        sessionId: session?.access_token ? "Present" : "None",
      });

      if (mounted) {
        // Prevent flash by only updating if we're already initialized
        // or if this is the first auth state change
        if (initialized || event === "INITIAL_SESSION") {
          setSession(session);
          setUser(session?.user ?? null);
        }

        // Always mark as initialized after first auth state change
        if (!initialized) {
          setInitialized(true);
        }
        setLoading(false);

        console.log("🔄 Auth hook state updated:", {
          event,
          user: session?.user?.email || "None",
          initialized: true,
          loading: false,
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
      console.log("📝 Attempting sign up for:", email, "with name:", fullName);

      const signUpData: any = {
        email,
        password,
      };

      // Add full name to user metadata if provided
      if (fullName && fullName.trim()) {
        signUpData.options = {
          data: {
            full_name: fullName.trim(),
          },
        };
      }

      const { data, error } = await supabase.auth.signUp(signUpData);

      console.log("📝 Sign up result:", {
        user: data?.user?.email || "None",
        session: data?.session ? "Present" : "None",
        error: error?.message || "None",
      });

      // If signup was successful but there's no session (email confirmation required)
      if (data?.user && !data?.session && !error) {
        console.log('📧 Email confirmation required for:', email);
        return { 
          data, 
          error: null,
          needsConfirmation: true 
        };
      }

      // If there's an error, return it
      if (error) {
        console.error('❌ Sign up error:', error);
        return { data, error };
      }

      // If signup was successful and we have a session, wait a bit for the profile to be created
      if (data?.session) {
        console.log('✅ Sign up successful with immediate session');
        
        // Wait a moment for the database trigger to create the user profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the profile was created
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', data.user.id)
            .single();
          
          if (profileError || !profile) {
            console.warn('⚠️ Profile not found after signup, creating manually...');
            
            // Manually create the profile if the trigger failed
            const { error: createError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: data.user.id,
                full_name: fullName?.trim() || data.user.email?.split('@')[0] || 'User',
                credits: 100,
                plan: 'free'
              });
            
            if (createError) {
              console.error('❌ Failed to create profile manually:', createError);
              // Don't fail the signup, just log the error
            } else {
              console.log('✅ Profile created manually');
            }
          } else {
            console.log('✅ Profile found after signup');
          }
        } catch (profileCheckError) {
          console.error('❌ Error checking/creating profile:', profileCheckError);
          // Don't fail the signup
        }
      }

      return { data, error };
    } catch (error) {
      console.error("💥 Sign up error:", error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔑 Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("🔑 Sign in result:", {
        user: data?.user?.email || "None",
        session: data?.session ? "Present" : "None",
        error: error?.message || "None",
      });
      return { data, error };
    } catch (error) {
      console.error("💥 Sign in error:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Attempting sign out");
      const { error } = await supabase.auth.signOut();
      console.log("🚪 Sign out result:", { error: error?.message || "None" });
      return { error };
    } catch (error) {
      console.error("💥 Sign out error:", error);
      return { error };
    }
  };

  // Debug current state every render
  console.log("🎯 useAuth current state:", {
    user: user?.email || "None",
    loading,
    initialized,
    sessionExists: !!session,
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
